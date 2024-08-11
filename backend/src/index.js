// Multer + Vision API implementation adapted from https://github.com/eliasdouglas/node-google-vision/blob/main/index.js
const multer = require('multer');
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/public/files/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const vision = require('@google-cloud/vision');
require('dotenv').config({ path: '../.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const https = require('https');
const path = require('path');
const { generateToken, verifyToken, hashPassword, comparePassword, authMiddleware } = require('./auth');



const pool = new Pool({
  max: 5,
  idleTimeoutMillis: 50000,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));


  const allowedOrigins = ['http://localhost:3000', 'https://smart-grocery-housekeeping-1ab20f715e60.herokuapp.com'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const upload = multer({
  storage: multerStorage,
}); 

app.use(express.json());
app.use(express.static('express'));
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({

extended:true
}));

app.use(bodyParser.json());

app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    console.log('Received registration request for email:', email);

    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');
    
    const result = await pool.query(
      'INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING userid, firstname, lastname, email',
      [firstname, lastname, email, hashedPassword]
    );
    console.log('User inserted into database');
    const user = result.rows[0];
    const token = generateToken(user);
    console.log('Token generated successfully');
    res.json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user', details: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ user: { userid: user.userid, firstname: user.firstname, lastname: user.lastname, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

//----------------------------------------------------------------------------
//                Add Item Page requests
//----------------------------------------------------------------------------

// add item to DB
app.post('/api/add-item', authMiddleware, async (req, res) => {
  const { itemName, unit, quantity, ripeRating, barcode, itemDescription, recipeId, expirationDate } = req.body; 
  const userId = req.user.id; // Get the user ID from the authenticated token

  try {
    const itemResult = await pool.query(
      'SELECT itemId FROM Items WHERE itemName = $1',
      [itemName]
    );

    let itemId;

    if (itemResult.rows.length > 0) {
      // Item exists
      itemId = itemResult.rows[0].itemid;
    } else {
      // Insert new item
      const insertItemResult = await pool.query(
        'INSERT INTO Items (itemName, itemDescription) VALUES ($1, $2) RETURNING itemId',
        [itemName, itemDescription] 
      );

      itemId = insertItemResult.rows[0].itemid;
    }

    const updateUsersItems = await pool.query(
      `INSERT INTO usersitems (fk_items_itemid, fk_users_userid, quantitypurchased, quantityremaining, dateadded, spoilagedate)
      VALUES ($1, $2, $3, $3, CURRENT_DATE, $4)`,
      [itemId, userId, quantity, expirationDate]
    );

    res.status(200).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error); 
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
});

// get all units
app.get('/units', async(req, res) => {
  
  try{
    const getUnits = await pool.query(
      `SELECT 
        units.unitid,
        units.unitname,
        units.unitabbreviation
      FROM units
      ORDER BY units.unitname;`);

    res.json(getUnits.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

app.post('/api/check-and-add-item', authMiddleware, async (req, res) => {
  const { itemName, itemDescription } = req.body;
  const userId = req.user.id;

  try {
    // Check if the item exists
    const itemResult = await pool.query(
      'SELECT itemId FROM Items WHERE itemName = $1',
      [itemName]
    );

    if (itemResult.rows.length > 0) {
      // Item exists
      res.json({ exists: true, itemId: itemResult.rows[0].itemid });
    } else {
      // Item doesn't exist, so add it
      const insertItemResult = await pool.query(
        'INSERT INTO Items (itemName, itemDescription) VALUES ($1, $2) RETURNING itemId',
        [itemName, itemDescription]
      );
      res.json({ exists: false, itemId: insertItemResult.rows[0].itemid });
    }
  } catch (error) {
    console.error('Error checking/adding item:', error);
    res.status(500).json({ message: 'Error checking/adding item', error: error.message });
  }
});

app.post('/api/add-to-my-items', authMiddleware, async (req, res) => {
  const { itemId, quantity, expirationDate } = req.body;
  const userId = req.user.id;

  try {
    // First, check if the user already has this item
    const existingItemResult = await pool.query(
      `SELECT usersitemsid, quantityremaining 
       FROM usersitems 
       WHERE fk_users_userid = $1 AND fk_items_itemid = $2`,
      [userId, itemId]
    );

    if (existingItemResult.rows.length > 0) {
      // Item exists, update the quantity
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantityremaining + parseInt(quantity);
      
      const updateResult = await pool.query(
        `UPDATE usersitems 
         SET quantityremaining = $1, quantitypurchased = quantitypurchased + $2, 
             spoilagedate = COALESCE($3, spoilagedate)
         WHERE usersitemsid = $4 
         RETURNING *`,
        [newQuantity, quantity, expirationDate, existingItem.usersitemsid]
      );

      res.json({ message: 'Item quantity updated in your inventory', item: updateResult.rows[0] });
    } else {
      // Item doesn't exist for this user, add new entry
      const insertResult = await pool.query(
        `INSERT INTO usersitems 
         (fk_items_itemid, fk_users_userid, quantitypurchased, quantityremaining, dateadded, spoilagedate)
         VALUES ($1, $2, $3, $3, CURRENT_DATE, $4)
         RETURNING *`,
        [itemId, userId, quantity, expirationDate]
      );

      res.json({ message: 'Item added to your inventory successfully', item: insertResult.rows[0] });
    }
  } catch (error) {
    console.error('Error adding item to user items:', error);
    res.status(500).json({ message: 'Error adding item to user items', error: error.message });
  }
});

//----------------------------------------------------------------------------
//                Edit Item Page requests
//----------------------------------------------------------------------------

// get item info to display
app.get('/useritem/:itemId', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token

  try{
    const getItemDetails = await pool.query(
      `SELECT
        users.userid,
        items.itemid,
        items.itemname,
        usersitems.usersitemsid,
        usersitems.quantitypurchased,
        usersitems.quantityremaining,
        usersitems.dateadded,
        TO_CHAR(usersitems.spoilagedate, 'mm/dd/yyyy') as formatspoilagedate,
        usersitems.userspoilagedate,
        usersitems.finished,
        usersitems.spoiled,
        usersitems.purchaseagain,
        usersitems.finishedtotal,
        usersitems.spoiledtotal,
        images.imagefilepath,
        units.unitabbreviation
      FROM usersitems
      INNER JOIN users ON usersitems.fk_users_userid = users.userid
      INNER JOIN items ON usersitems.fk_items_itemid = items.itemid
      LEFT JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid
      LEFT JOIN images ON images.imageid = itemsimages.fk_images_imageid
      INNER JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      INNER JOIN units ON itemsunits.fk_units_unitid = units.unitid
      WHERE users.userid = $1 AND items.itemid = $2`,
      [userId, req.params.itemId]
    );

    res.json(getItemDetails.rows);
    
  } catch (err){
    console.error(err);
    res.status(500).send('Server error')
  }

});

// get item tags to display
app.get('/useritem/:itemId/tags', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const getItemTags = await pool.query(
      `SELECT
        tags.tagname
      FROM tags
      INNER JOIN itemstags ON tags.tagid = itemstags.fk_tags_tagid
      INNER JOIN items ON itemstags.fk_items_itemid = items.itemid
      INNER JOIN usersitems ON items.itemid = usersitems.fk_items_itemid
      WHERE items.itemid = $1 AND usersitems.fk_users_userid = $2
      ORDER BY tags.tagname`,
      [req.params.itemId, userId]
    );

    res.json(getItemTags.rows);

  } catch (err){
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
});

// update item quantity 
app.put('/api/edit_item/:usersItemsId', authMiddleware, async (req, res) => {
  const { newlySpoiled, newlyFinished, newlyAdded } = req.body;
  const userId = req.user.id; // Ge======t the user ID from the authenticated token
  
  try {
    const markUpdated = await pool.query(
      `UPDATE usersitems
      SET spoiled = true,
        spoiledtotal = spoiledtotal + $1,
        finishedtotal = finishedtotal + $2,
        quantitypurchased = quantitypurchased + $3,
        quantityremaining = quantityremaining + $3 - $2 - $1
      WHERE usersitems.usersitemsid = $4 AND fk_users_userid = $5
      RETURNING *`, 
      [newlySpoiled, newlyFinished, newlyAdded, req.params.usersItemsId, userId]
    );
    
    if (markUpdated.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or you do not have permission to edit this item' });
    }

    res.json(markUpdated.rows[0]);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// update item quantity - spoil all in stock
app.put('/api/spoil_item/:usersItemsId', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token
  
  try {
    const markSpoiled = await pool.query(
      `UPDATE usersitems
      SET spoiled = true,
        spoiledtotal = spoiledtotal + quantityremaining,
        quantityremaining = 0
      WHERE usersitems.usersitemsid = $1 AND fk_users_userid = $2
      RETURNING *`,
      [req.params.usersItemsId, userId]
    );
    
    if (markSpoiled.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or you do not have permission to edit this item' });
    }

    res.json(markSpoiled.rows[0]);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// update item quantity - finish all in stock
app.put('/api/finish_item/:usersItemsId', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token

  try {
    const markFinished = await pool.query(
      `UPDATE usersitems
      SET finished = true, 
        finishedtotal = finishedtotal + quantityremaining,
        quantityremaining = 0
      WHERE usersitems.usersitemsid = $1 AND fk_users_userid = $2
      RETURNING *`,
      [req.params.usersItemsId, userId]
    );

    if (markFinished.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found or you do not have permission to edit this item' });
    }

    res.json(markFinished.rows[0]);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//----------------------------------------------------------------------------
//                Dashboard Page requests
//----------------------------------------------------------------------------

// get items spoiling soon
app.get('/dashboard/spoilingsoon', authMiddleware, async(req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token
  
  try{
    const getUserSpoilingSoon = await pool.query(
      `SELECT 
        users.userid as "userId",
        items.itemid as "itemId",
        items.itemname as "itemName",
        usersitems.usersitemsid as "usersItemsId",
        usersitems.quantityremaining as "itemQuantity",
        TO_CHAR(usersitems.spoilagedate, 'mm/dd') as formatspoilagedate,
        current_date as "today",
        images.imagefilepath as "imagePath",
        units.unitabbreviation as "itemUnit",
        usersitems.spoiled as "isSpoiled"
      FROM users
      INNER JOIN usersitems ON users.userid = usersitems.fk_users_userid
      INNER JOIN items ON usersitems.fk_items_itemid = items.itemid
      INNER JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid
      INNER JOIN images ON itemsimages.fk_images_imageid = images.imageid
      INNER JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      INNER JOIN units ON itemsunits.fk_units_unitid = units.unitid
      WHERE users.userid = $1
      AND usersitems.spoilagedate <= (current_date + 5)
      AND usersitems.spoiled = False
      AND usersitems.finished = False
      AND usersitems.quantityremaining >= 0
      ORDER BY formatspoilagedate`,
      [userId]
    );

    res.json(getUserSpoilingSoon.rows);

  } catch (err){
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
})

// get items recently purchased
app.get('/dashboard/recentitems', authMiddleware, async(req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token
  
  try{
    const getUserRecentItems = await pool.query(
      `SELECT 
        users.userid as "userId",
        items.itemid as "itemId",
        items.itemname as "itemName",
        usersitems.usersitemsid as "usersItemsId",
        usersitems.quantityremaining as "itemQuantity",
        current_date as "today",
        TO_CHAR(usersitems.dateadded, 'mm/dd') as formatdateadded,
        images.imagefilepath as "imagePath",
        units.unitabbreviation as "itemUnit"
      FROM users
      INNER JOIN usersitems ON users.userid = usersitems.fk_users_userid
      INNER JOIN items ON usersitems.fk_items_itemid = items.itemid
      INNER JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid
      INNER JOIN images ON itemsimages.fk_images_imageid = images.imageid
      INNER JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      INNER JOIN units ON itemsunits.fk_units_unitid = units.unitid
      WHERE users.userid = $1
      AND usersitems.dateadded >= (current_date - 5)
      AND usersitems.spoiled = False
      AND usersitems.finished = False
      AND usersitems.quantityremaining >= 0
      ORDER BY usersitems.dateadded DESC`,
      [userId]
    );

    res.json(getUserRecentItems.rows);
  } catch (err){
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// get all items
app.get('/dashboard/allitems', authMiddleware, async(req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token
  
  try{
    const getAllUserItems = await pool.query(
      `SELECT 
    users.userid as "userId",
    items.itemid as "itemId",
    items.itemname as "itemName", 
    usersitems.usersitemsid as "usersItemsId",
    usersitems.quantityremaining as "itemQuantity", 
    images.imagefilepath as "imagePath", 
    units.unitabbreviation as "itemUnit" 
    FROM users
    INNER JOIN usersitems ON users.userid = usersitems.fk_users_userid 
    INNER JOIN items ON usersitems.fk_items_itemid = items.itemid 
    INNER JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid 
    INNER JOIN images ON itemsimages.fk_images_imageid = images.imageid 
    INNER JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid 
    INNER JOIN units ON itemsunits.fk_units_unitid = units.unitid 
    WHERE users.userid = $1
    AND usersitems.spoiled = False
    AND usersitems.finished = False
    AND usersitems.quantityremaining >= 0
    ORDER BY items.itemname`,
      [userId]
    );
    res.json(getAllUserItems.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

//----------------------------------------------------------------------------
//                View Recipe Page requests
//----------------------------------------------------------------------------

//Get recipe name and description From recipeid
app.get('/api/recipes/:recipeId/namedescription', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getRecipeInfoData = await pool.query(
      `SELECT
        recipeName,
        recipeDescription
      FROM recipes AS R
      INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
      INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE recipeId = $1	
        AND U.userId = $2`,
      [req.params.recipeId, userId]
    );
    if (getRecipeInfoData.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found or you do not have access to this recipe' });
    }
    res.json(getRecipeInfoData.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message })
  }
});

//Get recipe ingredients from recipeid
app.get('/api/recipes/:recipeId/ingredients', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getRecipeIngredientData = await pool.query(
      `SELECT DISTINCT
        I.itemName, 
        IR.quantity,
        IR.quantityunit
      FROM Items AS I
      INNER JOIN ItemsRecipes AS IR ON IR.FK_items_itemId = I.itemId
      INNER JOIN Recipes AS R ON IR.FK_recipes_recipeId = R.recipeId
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE R.recipeId = $1 AND U.userId = $2`,
      [req.params.recipeId, userId]
    );
    res.json(getRecipeIngredientData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//verify recipeid exists
app.get('/api/recipes/:recipeId/verify', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getRecipeVerify = await pool.query(
    `SELECT 
      recipeId 
    FROM recipes AS R
    INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
    INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
    INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
    INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
    WHERE recipeid = $1 AND U.userid = $2`,
    [req.params.recipeId, userId]
    );
    if (getRecipeVerify.rows.length === 0) {
      res.status(404).json({ message: "Recipe doesn't exist or you don't have access to it" });
    } else {
      res.status(200).json({ message: "Recipe exists" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//get recipe steps from recipeid
app.get('/api/recipes/:recipeId/steps', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getRecipeStepData = await pool.query(
    `SELECT
      S.StepNumber,
      S.stepDescription
    FROM Recipes AS R
    INNER JOIN RecipesSteps AS RS ON RS.FK_recipes_recipeId = R.recipeId
    INNER JOIN Steps AS S ON RS.FK_steps_stepId = S.stepId
    INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
    INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
    INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
    INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
    WHERE R.recipeId = $1 AND U.userId = $2
    ORDER BY S.stepNumber ASC`,
    [req.params.recipeId, userId]
    );
    res.json(getRecipeStepData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//----------------------------------------------------------------------------
//                Recipes Page requests
//----------------------------------------------------------------------------

//Get all ingredients spoiling in the next 5 days
app.get('/api/ingredients/spoilsoon', authMiddleware, async(req, res) => {
  try{
    const getSpoilSoonIngredientsData = await pool.query(
      `SELECT DISTINCT
        I.itemName,
        UI.spoilageDate
      FROM Items AS I
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      INNER JOIN ItemsUnits AS IU ON I.itemId = IU.FK_items_itemId
      INNER JOIN Units ON IU.FK_units_unitId = Units.unitId
      WHERE U.userId = $1
        AND UI.spoilageDate <= (SELECT CURRENT_DATE+5)
        AND UI.finished = false
      ORDER BY UI.spoilageDate`,
      [req.user.id] // Use the user ID from the authenticated token
    );
    res.json(getSpoilSoonIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all ingredients in fridge
app.get('/api/ingredients/infridge', authMiddleware, async(req, res) => {
  try{
    const getInFridgeIngredientsData = await pool.query(
      `SELECT DISTINCT
        I.itemName,
        UI.spoilageDate
      FROM Items AS I
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      INNER JOIN ItemsUnits AS IU ON I.itemId = IU.FK_items_itemId
      INNER JOIN Units ON IU.FK_units_unitId = Units.unitId
      WHERE U.userId = $1
        AND UI.finished = false
      ORDER BY UI.spoilageDate`,
      [req.user.id] // Use the user ID from the authenticated token
    );
    res.json(getInFridgeIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all recipes that use these ingredients that are in fride
app.get('/api/ingredients/:ingredients/infridge/recipes', authMiddleware, async(req, res) => {
  try{
    const getRecipeInFridgeIngredientsData = await pool.query(
      `SELECT distinct
        R.recipeId,
        R.recipeName,
        count(*) over(partition by r.recipeId) AS ingredientsUsed,
          (SELECT COUNT(itemsrecipesId)
          FROM ItemsRecipes where FK_recipes_recipeId = R.recipeId ) AS ingredientsTot
        FROM Recipes AS R
      INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
      INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE I.itemName IN (${req.params.ingredients})
        AND U.userId = $1
      ORDER BY ingredientsUsed DESC, ingredientsTot ASC
      limit 16`,
      [req.user.id] // Use the user ID from the authenticated token
    );
    res.json(getRecipeInFridgeIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all recipes that use these ingredients that spoil soon
app.get('/api/ingredients/:ingredients/spoilsoon/recipes', authMiddleware, async(req, res) => {
  try{
    const getRecipeSpoilSoonIngredientsData = await pool.query(
      `SELECT distinct
        R.recipeId,
        R.recipeName,
        count(*) over(partition by r.recipeId) AS ingredientsUsed,
          (SELECT COUNT(itemsrecipesId)
          FROM ItemsRecipes where FK_recipes_recipeId = R.recipeId ) AS ingredientsTot
        FROM Recipes AS R
      INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
      INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE I.itemName IN (${req.params.ingredients})
        AND U.userId = $1
      ORDER BY ingredientsUsed DESC, ingredientsTot ASC
      limit 16`,
      [req.user.id] // Use the user ID from the authenticated token
    );
    res.json(getRecipeSpoilSoonIngredientsData.rows); // Fixed typo here
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// spoonacular api - fetchApiInFridgeRecipes
app.get('/api/ingredients/:ingredients/spoon/infridge', async(req,res) => {
  try {
    const url_string =  `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}&query=recipe&includeIngredients=${req.params.ingredients}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true&addRecipeInstructions=true&number=8&sort=min-missing-ingredients`;
    const apiInFridgeRes  = await fetch(url_string);
    const apiInFridgeData = await apiInFridgeRes.json();
    res.json(apiInFridgeData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
    });

// spoonacular api - fetchApiSpoilSoonRecipes
//https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}&query=recipe&includeIngredients=${spoilIngredients}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true&addRecipeInstructions=true&number=8&sort=max-used-ingredients
app.get('/api/ingredients/:ingredients/spoon/spoilsoon', async(req,res) => {
  try {
    const url_string = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}&query=recipe&includeIngredients=${req.params.ingredients}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true&addRecipeInstructions=true&number=8&sort=max-used-ingredients`;
    const apiSpoilSoonRes  = await fetch(url_string);
    const apiSpoilSoonData = await apiSpoilSoonRes.json();
    res.json(apiSpoilSoonData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
    });

app.get('/api/recipe/:recipeid/ingredientlist', authMiddleware, async(req, res) => {
  try{
    const Data = await pool.query(
      `SELECT 
        STRING_AGG(itemname, ', ') AS ingredientList
      FROM items AS I
      INNER JOIN ItemsRecipes AS IR ON IR.FK_items_itemId = I.itemId
      INNER JOIN Recipes AS R ON IR.FK_recipes_recipeId = R.recipeId
      WHERE r.recipeId = $1`,
      [req.params.recipeid]
    );
    res.json(Data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//----------------------------------------------------------------------------
//                Add Recipe Page
//----------------------------------------------------------------------------

// Get all items for selection on ingredient list
app.get('/api/items', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getAllUserItems = await pool.query(
      `SELECT DISTINCT
        I.itemid,
        I.itemName
      FROM Items AS I
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE U.userid = $1
      ORDER BY itemName`,
      [userId]
    );
    res.json(getAllUserItems.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// make recipe
app.post('/api/add-recipe/recipe', authMiddleware, async (req, res) => {
  const { recipeName, recipeDescription } = req.body;

  if (!recipeName) {
    return res.status(400).json({ 
      message: 'No recipe name was given. Please give the recipe a name.',
      error: 'bad recipeName'
    });
  }
  if (!recipeDescription) {
    return res.status(400).json({ 
      message: 'No recipe description was given. Please fill in a description.',
      error: 'bad recipeDescription'
    });
  }

  try {
    // check to see if recipe name is used
    const checkName = await pool.query('SELECT recipeName FROM recipes WHERE recipeName = $1', [recipeName]);
    if (checkName.rows.length > 0) {
      return res.status(400).json({
        message: 'Recipe with that name already exists. Please choose a different name.',
        error: 'RecipeName already used'
      });
    }
    
    // Insert new recipe name and description
    const insertRecipeRes = await pool.query(
      'INSERT INTO Recipes (recipeName, recipeDescription) VALUES ($1, $2) RETURNING recipeId',
      [recipeName, recipeDescription]
    );
    res.status(200).json(insertRecipeRes.rows[0]);
  } catch (error) {
    console.error('Error adding recipe:', error); 
    res.status(500).json({ message: 'Error adding recipe', error: error.message });
  }
});

app.post('/api/add-recipe/step', authMiddleware, async (req, res) => {
  const { stepNumber, stepDescription } = req.body;

  if (!stepNumber || stepNumber <= 0) {
    return res.status(400).json({ 
     message: 'Error adding step number.',
     error: 'bad stepNumber'
    });
  }
  if (!stepDescription) {
    return res.status(400).json({
      message: `No step description was given for step ${stepNumber}. Please fill in a description.`,
      error: 'bad stepDescription'
    });
  }

  try {
    const insertStepRes = await pool.query(
      'INSERT INTO Steps (stepNumber, stepDescription) VALUES ($1, $2) RETURNING stepId',
      [stepNumber, stepDescription]
    );
    res.status(200).json([{ stepid: insertStepRes.rows[0].stepid }]);
  } catch (error) {
    console.error('Error adding step:', error); 
    res.status(500).json({ message: 'Error adding step', error: error.message });
  }
});

app.post('/api/add-recipe/recipessteps', authMiddleware, async (req, res) => {
  const { recipeId, stepId } = req.body;

  try {
    const insertRecipesStepRes = await pool.query(
      'INSERT INTO RecipesSteps (fk_recipes_recipeid, fk_steps_stepid) VALUES ($1, $2)',
      [recipeId, stepId]
    );
    res.status(200).json({ message: `Linked stepId: ${stepId} and recipeId: ${recipeId} successfully` });
  } catch (error) {
    console.error('Error adding recipestep:', error); 
    res.status(500).json({ message: 'Error adding recipestep', error: error.message });
  }
});

app.post('/api/add-recipe/itemsrecipes', authMiddleware, async (req, res) => {
  const { recipeId, itemId, quantity, quantityUnit } = req.body;

  if (!recipeId || recipeId <= 0) {
    return res.status(400).json({ 
      message: 'Error with recipeId',
      error: 'bad recipeId'
    });
  }
  if (!itemId || itemId <= 0) {
    return res.status(400).json({ 
      message: 'No Ingredient was selected. Please select an ingredient or delete unused item.',
      error: 'bad itemId'
    });
  }
  if (!quantity) {
    return res.status(400).json({
      message: 'No quantity was given for an item. Please fill in quantity or delete unused item.',
      error: 'bad quantity'
    });
  }

  try {
    const insertItemsRecipesRes = await pool.query(
      'INSERT INTO ItemsRecipes (fk_recipes_recipeid, fk_items_itemid, quantity, quantityUnit) VALUES ($1, $2, $3, $4)',
      [recipeId, itemId, quantity, quantityUnit]
    );
    res.status(200).json({ message: `Linked itemId: ${itemId} and recipeId: ${recipeId} successfully` });
  } catch (error) {
    console.error('Error adding itemsrecipes:', error); 
    res.status(500).json({ message: 'Error adding itemsrecipes', error: error.message });
  }
});

//----------------------------------------------------------------------------
//                Cookbook Page
//----------------------------------------------------------------------------

app.get('/api/recipes/all', authMiddleware, async (req, res) => {
  try {
    const getAllRecipesRes = await pool.query(
      `SELECT
        recipeid,
        recipename,
        recipedescription
      FROM recipes
      ORDER BY recipename`
    );
    res.status(200).json(getAllRecipesRes.rows);
  }
  catch (error) {
    console.error('Error getting recipes:', error); 
    res.status(500).json({message: 'Error getting recipes', error: error.message});
  }
});
// Get all itemsrecipes ids in a list associated with recipeId
app.get('/api/delete-recipe/:recipeId/itemsrecipes', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    const getItemsRecipesIdListRes = await pool.query(
      `SELECT
        STRING_AGG(CAST(IR.itemsrecipesid AS VARCHAR), ', ') AS itemsrecipesidlist
      FROM itemsrecipes IR
      INNER JOIN recipes R ON R.recipeId = IR.fk_recipes_recipeid
      WHERE R.recipeId = $1 AND R.userId = $2`,
      [recipeId, userId]
    );
    if (getItemsRecipesIdListRes.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found or you do not have permission to access this recipe' });
    }
    res.status(200).json(getItemsRecipesIdListRes.rows[0]);
  }
  catch (error) {
    console.error('Error getting itemsrecipes id list:', error); 
    res.status(500).json({ message: 'Error getting itemsrecipes id list', error: error.message });
  }
});

// Get all step ids in a list associated with recipeId
app.get('/api/delete-recipe/:recipeId/recipessteps', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.params;

  try {
    const getStepsIdListRes = await pool.query(
      `SELECT
        STRING_AGG(CAST(RS.fk_steps_stepid AS VARCHAR), ', ') AS stepidlist
      FROM recipessteps RS
      INNER JOIN recipes R ON R.recipeId = RS.fk_recipes_recipeid
      WHERE R.recipeId = $1 AND R.userId = $2`,
      [recipeId, userId]
    );
    if (getStepsIdListRes.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found or you do not have permission to access this recipe' });
    }
    res.status(200).json(getStepsIdListRes.rows[0]);
  }
  catch (error) {
    console.error('Error getting steps id list:', error); 
    res.status(500).json({ message: 'Error getting steps id list', error: error.message });
  }
});

app.delete('/api/recipes/:recipeId', authMiddleware, async (req, res) => {
  const { recipeId } = req.params;

  try {
      // Start a transaction
      await pool.query('BEGIN');

      // Delete associated itemsrecipes
      await pool.query('DELETE FROM itemsrecipes WHERE fk_recipes_recipeid = $1', [recipeId]);

      // Delete associated steps
      await pool.query(
          'DELETE FROM steps WHERE stepid IN (SELECT fk_steps_stepid FROM recipessteps WHERE fk_recipes_recipeid = $1)',
          [recipeId]
      );

      // Delete the recipe
      const deleteRecipeRes = await pool.query(
          'DELETE FROM recipes WHERE recipeId = $1 RETURNING recipeId',
          [recipeId]
      );

      // Commit the transaction
      await pool.query('COMMIT');

      if (deleteRecipeRes.rows.length === 0) {
          return res.status(404).json({ message: 'Recipe not found' });
      }

      res.status(200).json({ message: 'Recipe and associated data deleted successfully', deletedRecipe: deleteRecipeRes.rows[0] });
  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error deleting recipe:', error);
      res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
});

//----------------------------------------------------------------------------
//                Reports Page
//----------------------------------------------------------------------------

//Get all freq spoiled items
app.get('/api/reports/freqspoiled', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getFreqSpoiled = await pool.query(
      `SELECT 
        I.itemName AS Item,
        TO_CHAR(UI.dateAdded, 'mm/dd/yyyy') AS DateAdded,
        TO_CHAR(UI.spoilageDate,'mm/dd/yyyy') AS SpoilageDate,
        UI.quantityPurchased || ' ' || U.unitabbreviation AS LastPurchasedTotal,
        (UI.quantityPurchased - UI.quantityRemaining) || ' ' || U.unitabbreviation AS CurrentQuantityConsumed,
        UI.quantityRemaining || ' ' || U.unitabbreviation AS CurrentQuantityRemaining,
        UI.finishedTotal + UI.spoiledTotal AS TimesBought,
        CASE 
          WHEN UI.spoiledTotal > 0 
            THEN CAST(CAST((UI.spoiledTotal::float / (UI.finishedTotal + UI.spoiledTotal)) * 100 AS DECIMAL(5,2)) AS TEXT) || '%'
          ELSE '0%' 
        END AS SpoiledPercent
      FROM UsersItems AS UI
      INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
      INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
      INNER JOIN Units AS U ON U.unitId = IU.FK_units_unitId
      WHERE UI.FK_users_userId = $1
        AND (UI.spoiledTotal::float / NULLIF(UI.finishedTotal + UI.spoiledTotal, 0)) >= 0.15
        AND UI.purchaseAgain = true
        AND UI.spoiledTotal > 0
      ORDER BY I.itemName`,
      [userId]
    );
    res.json(getFreqSpoiled.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/reports/freqused', authMiddleware, async(req,res) => {
  const userId = req.user.id;
  try{
    const getFreqUsed = await pool.query(
      `SELECT 
        I.itemName AS Item,
        TO_CHAR(UI.dateAdded, 'mm/dd/yyyy') AS DateAdded,
        TO_CHAR(UI.spoilageDate,'mm/dd/yyyy') AS SpoilageDate,
        UI.quantityPurchased || ' ' || U.UnitName AS LastPurchasedTotal,
        (UI.quantityPurchased - UI.quantityRemaining) || ' ' || U.UnitName AS CurrentQuantityConsumed,
        UI.quantityRemaining || ' ' || U.UnitName AS CurrentQuantityRemaining,
        CASE 
          WHEN UI.finished = true THEN 'YES'
          ELSE 'NO' 
        END AS InFridge,
        UI.finishedTotal + UI.spoiledTotal AS TimesBought,
        CASE
          WHEN UI.finishedTotal > 0
            THEN CAST(CAST((UI.finishedTotal::float / NULLIF(UI.finishedTotal + UI.spoiledTotal, 0)) * 100 AS DECIMAL(5,2)) AS TEXT) || '%'
          ELSE '0%'
        END AS FinishedPercent
      FROM UsersItems AS UI
      INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
      INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
      INNER JOIN Units AS U ON U.unitId = IU.FK_units_unitId
      WHERE UI.FK_users_userId = $1
        AND (UI.finishedTotal::float / NULLIF(UI.finishedTotal + UI.spoiledTotal, 0)) >= 0.65
        AND UI.purchaseAgain = true
        AND UI.finishedTotal > 0
      ORDER BY I.itemName`,
      [userId]
    );
    res.json(getFreqUsed.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//----------------------------------------------------------------------------
//                Google Cloud Vision API
//----------------------------------------------------------------------------

const CREDENTIALS = JSON.parse(JSON.stringify(
  {
    "type": "service_account",
    "project_id": "clever-guard-429915-v9",
    "private_key_id": process.env.VISION_API_KEY_ID,
    "private_key": process.env.VISION_API_KEY,
    "client_email": "imagerecognition@clever-guard-429915-v9.iam.gserviceaccount.com",
    "client_id": "102964667298987474008",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/imagerecognition%40clever-guard-429915-v9.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
));

const CONFIG = {
  credentials: {
      private_key: CREDENTIALS.private_key,
      client_email: CREDENTIALS.client_email
  }
};

const client = new vision.ImageAnnotatorClient(CONFIG);

app.post("/detectionObject", upload.single('imgfile'), function(req, res){

  console.log(req.file.filename);
  
  const detectObject = async (file_path) => {
      console.log(file_path);
      let [result] = await client.objectLocalization(file_path);
      const objects = result.localizedObjectAnnotations;
      console.log(objects[0].name);
      const img_str = String(objects[0].name);
      res.send(img_str);
  };

  detectObject(path.join(__dirname+'/public/files/' + req.file.filename));
  
});

//----------------------------------------------------------------------------
//                Spoilage Queries
//----------------------------------------------------------------------------

// get all categories
app.get('/spoilage/categories', async(req, res) => {
  
  try{
    const getCategoriesSubcategories = await pool.query(
      `SELECT 
	      CONCAT_WS(' - ', categories.categoryname, categories.subcategoryname) as categorySubcategory,
        categories.categoryid
      FROM categories
      ORDER BY categories.categoryname, categories.subcategoryname;`);

    res.json(getCategoriesSubcategories.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

// get all items in a specific category
app.get('/spoilage/:categoryid', async(req, res) => {
  
  try{
    const getAllItemsCategory = await pool.query(
      `SELECT
        categories.categoryid,
        products.productid,
        CONCAT_WS(' - ', products.productname, products.productsubtitle) as productname
      FROM categories
      INNER JOIN productscategories ON productscategories.fk_categories_categoryid = categories.categoryid
      INNER JOIN products ON productscategories.fk_products_productid = products.productid
      WHERE categories.categoryid = ${req.params.categoryid}
      ORDER BY productname;`);

    res.json(getAllItemsCategory.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

// get details for specific item
app.get('/spoilage/product/:productid', async(req, res) => {
  
  try{
    const getProductDetails = await pool.query(
      `SELECT
        products.productid as "id",
        products.productname as "name",
        products.productsubtitle as "subtitle",
        products.keywords as "keys",
        products.pantry_min as "p_min",
        products.pantry_max as "p_max",
        products.pantry_metric as "p_metric",
        products.pantry_tips as "p_tips",
        products.dop_pantry_min as "dop_p_min",
        products.dop_pantry_max as "dop_p_max",
        products.dop_pantry_metric as "dop_p_metric",
        products.dop_pantry_tips as "dop_p_tips",
        products.pantry_after_opening_min as "p_after_opening_min",
        products.pantry_after_opening_max as "p_after_opening_max",
        products.pantry_after_opening_metric as "p_after_opening_metric",
        products.refrigerate_min as "r_min",
        products.refrigerate_max as "r_max",
        products.refrigerate_metric as "r_metric",
        products.refrigerate_tips as "r_tips",
        products.dop_refrigerate_min as "dop_r_min",
        products.dop_refrigerate_max as "dop_r_max",
        products.dop_refrigerate_metric as "dop_r_metric",
        products.dop_refrigerate_tips as "dop_r_tips",
        products.refrigerate_after_opening_min as "r_after_opening_min",
        products.refrigerate_after_opening_max as "r_after_opening_max",
        products.refrigerate_after_opening_metric as "r_after_opening_metric",
        products.refrigerate_after_thawing_min as "r_after_thawing_min",
        products.refrigerate_after_thawing_max as "r_after_thawing_max",
        products.refrigerate_after_thawing_metric as "r_after_thawing_metric",
        products.freeze_min as "f_min",
        products.freeze_max as "f_max",
        products.freeze_metric as "f_metric",
        products.freeze_tips as "f_tips",
        products.dop_freeze_min as "dop_f_min",
        products.dop_freeze_max as "dop_f_max",
        products.dop_freeze_metric as "dop_f_metric",
        products.dop_freeze_tips as "dop_f_tips"
      FROM products
      WHERE products.productid = ${req.params.productid}
      ORDER BY products.productname, products.productsubtitle;`);

    res.json(getProductDetails.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

//----------------------------------------------------------------------------

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = pool;
