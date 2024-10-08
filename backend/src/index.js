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

//----------------------------------------------------------------------------
//                Add Item Page requests
//----------------------------------------------------------------------------

// add item to DB
app.post('/api/add-item/:userId', async (req, res) => {
  const { itemName, unit, quantity, ripeRating, barcode, itemDescription, recipeId, expirationDate, tags } = req.body; 

  try {
    const itemResult = await pool.query(
      'SELECT itemId FROM Items WHERE itemName = $1',
      [itemName]
    );

    let itemId;
    let tagId;

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

    // associate the user with the item
    const updateUsersItems = await pool.query(
      `INSERT INTO usersitems (fk_items_itemid, fk_users_userid, quantitypurchased, quantityremaining, dateadded, spoilagedate)
      VALUES (${itemId}, ${req.params.userId}, ${quantity}, ${quantity}, CURRENT_DATE, '${expirationDate}');`
    )

    console.log(updateUsersItems.rows)

    // associate tags with item
    for (let i = 0; i < tags.length; i++) {
      tagId = tags[i];

      const updateItemsTags = await pool.query(
        `INSERT INTO itemstags (fk_items_itemid, fk_tags_tagid)
        VALUES (${itemId}, ${tagId});`
      )

      console.log(updateItemsTags.rows)

    }

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

// get all tags
app.get('/tags', async(req, res) => {
  
  try{
    const getUnits = await pool.query(
      `SELECT
        tags.tagid,
        tags.tagname
      FROM tags
      ORDER BY tags.tagname;`);

    res.json(getUnits.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

//----------------------------------------------------------------------------
//                Edit Item Page requests
//----------------------------------------------------------------------------

// get item info to display
app.get('/useritem/iteminfo/:userId/:itemId/:usersItemsId', async (req, res) => {

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

      LEFT JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      LEFT JOIN units ON itemsunits.fk_units_unitid = units.unitid

      WHERE usersitems.usersitemsid =${req.params.usersItemsId}`);

    res.json(getItemDetails.rows);
    
  } catch (err){
      console.error(err);
      res.status(500).send('Server error')
  }

});

// get item tags to display
app.get('/useritem/tags/:itemId', async (req, res) => {

  try {
    const getItemTags = await pool.query(
      `SELECT
	      tags.tagname
      FROM tags
      FULL OUTER JOIN itemstags ON tags.tagid = itemstags.fk_tags_tagid
      FULL OUTER JOIN items ON itemstags.fk_items_itemid = items.itemid
      WHERE items.itemid = ${req.params.itemId}
      ORDER BY tags.tagname`);

    res.json(getItemTags.rows);
    
  } catch (err){
      console.error(err);
      res.status(500).send('Server error')
  }

});

// update item quantity 
app.put('/api/edit_item/:usersItemsId', async (req, res) => {
  const { newlySpoiled, newlyFinished, newlyAdded } = req.body;
  
  try {
    const markUpdated = await pool.query(
      `UPDATE usersitems
      SET spoiled = true,
        spoiledtotal = spoiledtotal + $1,
        finishedtotal = finishedtotal + $2,
        quantitypurchased = quantitypurchased + $3,
        quantityremaining = quantityremaining + $3 - $2 - $1
      WHERE usersitems.usersitemsid = ${req.params.usersItemsId}`, [newlySpoiled, newlyFinished, newlyAdded]);
    
    res.json(markUpdated.rows);
    
  } catch (err){
      console.error(err);
      res.status(500).send('Server error')
  }

});

// update item quantity - spoil all in stock
app.put('/api/spoil_item/:usersItemsId', async (req, res) => {
  
  try {
    const markSpoiled = await pool.query(
      `UPDATE usersitems
      SET spoiled = true,
        spoiledtotal = spoiledtotal + quantityremaining,
        quantityremaining = 0
      WHERE usersitems.usersitemsid = ${req.params.usersItemsId}`);
    
    res.json(markSpoiled.rows);
    
  } catch (err){
      console.error(err);
      res.status(500).send('Server error')
  }

});

// update item quantity - finish all in stock
app.put('/api/finish_item/:usersItemsId', async (req, res) => {

  try {
    const markFinished = await pool.query(
      `UPDATE usersitems
      SET finished = true, 
        finishedtotal = finishedtotal + quantityremaining,
        quantityremaining = 0
      WHERE usersitems.usersitemsid = ${req.params.usersItemsId}`);

    res.json(markFinished.rows);
    
  } catch (err){
      console.error(err);
      res.status(500).send('Server error')
  }

});

//----------------------------------------------------------------------------
//                Dashboard Page requests
//----------------------------------------------------------------------------

// get items spoiling soon
app.get('/dashboard/:userId/spoilingsoon', async(req, res) => {
  
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
      LEFT JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid
      LEFT JOIN images ON itemsimages.fk_images_imageid = images.imageid
      LEFT JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      LEFT JOIN units ON itemsunits.fk_units_unitid = units.unitid
      WHERE users.userid = ${req.params.userId}
      AND usersitems.spoilagedate <= (current_date + 5)
      AND usersitems.spoiled = False
      AND usersitems.finished = False
      AND usersitems.quantityremaining > 0
      ORDER BY formatspoilagedate`);

    res.json(getUserSpoilingSoon.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

// get items recently purchased
app.get('/dashboard/:userId/recentitems', async(req, res) => {
  
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
      LEFT JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid
      LEFT JOIN images ON itemsimages.fk_images_imageid = images.imageid
      LEFT JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid
      LEFT JOIN units ON itemsunits.fk_units_unitid = units.unitid
      WHERE users.userid = ${req.params.userId}
      AND usersitems.dateadded >= (current_date - 5)
      AND usersitems.spoiled = False
      AND usersitems.finished = False
      AND usersitems.quantityremaining > 0
	    ORDER BY usersitems.dateadded DESC;`);

    res.json(getUserRecentItems.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
})

// get all items
app.get('/dashboard/:userId/allitems', async(req, res) => {
  
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
      LEFT JOIN itemsimages ON items.itemid = itemsimages.fk_items_itemid 
      LEFT JOIN images ON itemsimages.fk_images_imageid = images.imageid 
      LEFT JOIN itemsunits ON items.itemid = itemsunits.fk_items_itemid 
      LEFT JOIN units ON itemsunits.fk_units_unitid = units.unitid 
      WHERE users.userid = ${req.params.userId}
      AND usersitems.spoiled = False
      AND usersitems.finished = False
      AND usersitems.quantityremaining > 0
      ORDER BY items.itemname`
    );
    res.json(getAllUserItems.rows)
    
  }catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }

})

//----------------------------------------------------------------------------
//                View Recipe Page requests
//----------------------------------------------------------------------------

//Get recipe name and description From recipeid and userId
app.get('/api/users/:userId/recipes/:recipeId/namedescription', async(req,res) => {
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
	    WHERE recipeId = ${req.params.recipeId}	
	      AND U.userId = ${req.params.userId}`
    );
    res.json(getRecipeInfoData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get recipe ingredients from recipeid
app.get('/api/users/:userId/recipes/:recipeId/ingredients', async(req,res) => {
  try{
    const getRecipeIngredientData = await pool.query(
      `SELECT  distinct
        I.itemName, 
        IR.quantity,
        IR.quantityunit
      FROM Items AS I
      INNER JOIN ItemsRecipes AS IR ON IR.FK_items_itemId = I.itemId
      INNER JOIN Recipes AS R ON IR.FK_recipes_recipeId = R.recipeId
	    INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
	    INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE R.recipeId = ${req.params.recipeId}`
    );
    res.json(getRecipeIngredientData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//verify recipeid exists
app.get('/api/users/:userId/recipes/:recipeId/verify', async(req,res) => {
  try{
    const getRecipeVerify = await pool.query(
    `SELECT 
      recipeId 
    FROM recipes AS R
	  INNER JOIN ItemsRecipes AS IR ON IR.FK_recipes_recipeId = R.recipeId
	  INNER JOIN Items AS I ON IR.FK_items_itemId = I.itemId
	  INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
	  INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
	  WHERE recipeid = ${req.params.recipeId}
      AND U.userid=${req.params.userId}`
    );
    if (getRecipeVerify.rows.length === 0 ) {
      res.status(404).send("404 recipeId doesn't exist");
    }
    else {res.status(200).send("recipe exists")}
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//get recipe steps from recipeid
app.get('/api/recipes/:recipeId/steps', async(req,res) => {
  try{
    const getRecipeStepData = await pool.query(

    `SELECT
	    S.StepNumber,
	    S.stepDescription
    FROM Recipes AS R
    INNER JOIN RecipesSteps AS RS ON RS.FK_recipes_recipeId = R.recipeId
    INNER JOIN Steps AS S ON RS.FK_steps_stepId = S.stepId
    WHERE R.recipeId = ${req.params.recipeId}
    ORDER BY S.stepNumber ASC`
    );
    res.json(getRecipeStepData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//----------------------------------------------------------------------------
//                Recipes Page requests
//----------------------------------------------------------------------------

//Get all ingredients spoiling in the next 5 days
app.get('/api/users/:userid/ingredients/spoilsoon', async(req,res) => {
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
      WHERE U.userId = ${req.params.userid}
        AND UI.spoilageDate <= (SELECT CURRENT_DATE+5)
        AND UI.finished = false
      ORDER BY UI.spoilageDate`
  );
    res.json(getSpoilSoonIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all ingredients in fridge
app.get('/api/users/:userid/ingredients/infridge', async(req,res) => {
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
      WHERE U.userId = ${req.params.userid}
        AND UI.finished = false
      ORDER BY UI.spoilageDate`
  );
    res.json(getInFridgeIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all recipes that use these ingredients that are in fride
app.get('/api/users/:userid/ingredients/:ingredients/infridge/recipes', async(req,res) => {
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
        AND U.userId = ${req.params.userid}
      ORDER BY ingredientsUsed DESC, ingredientsTot ASC
      limit 16`
  );
    res.json(getRecipeInFridgeIngredientsData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all recipes that use these ingredients that spoil soon
app.get('/api/users/:userid/ingredients/:ingredients/spoilsoon/recipes', async(req,res) => {
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
        AND U.userId = ${req.params.userid}
      ORDER BY ingredientsUsed DESC, ingredientsTot ASC
      limit 16`
  );
    res.json(getRecipeSpoilSoonIngredientsDataa.rows);
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

app.get('/api/recipe/:recipeid/ingredientlist', async(req,res) => {
  try{
    const Data = await pool.query(
      `select 
	    STRING_AGG(itemname, ', ') AS ingredientList
      FROM items AS I
	    INNER JOIN ItemsRecipes AS IR ON IR.FK_items_itemId = I.itemId
	    INNER JOIN Recipes AS R ON IR.FK_recipes_recipeId = R.recipeId
      where r.recipeId = ${req.params.recipeid}`
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
app.get('/api/users/:userid/items', async(req,res) => {
  try{
    const getAllUserItems = await pool.query(
      `SELECT distinct
	      I.itemid,
	      I.itemName
      FROM Items AS I
      INNER JOIN UsersItems AS UI ON UI.FK_items_itemId = I.itemId
      INNER JOIN Users AS U ON U.userId = UI.FK_users_userId
      WHERE U.userid = ${req.params.userid}
      ORDER by itemName`
  );
    res.json(getAllUserItems.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// make recipe
app.post('/api/add-recipe/recipe', async (req, res) => {
  const recipeName = (req.body.recipeName);
  const recipeDescription = (req.body.recipeDescription);

  if (recipeName == null || recipeName == "")  {
    res.status(400).json({ 
      message: 'No recipe name was given. Please give the recipe a name.',
      error: 'bad recipeName'
    });
  }
  else if (recipeDescription == null || recipeDescription == "") {
    res.status(400).json({ 
      message: 'No recipe description was given. Please fill in a description.',
      error: 'bad recipeDescription'
    });
  }
  else {
    try {
        // check to see if recipe name is used
        const checkName = await pool.query(`SELECT recipeName from recipes where recipeName = '${recipeName}'`)
        if (checkName.rows.length > 0) {res.status(400).json({
          message: 'Recipe with that name already exist. Please choose a different name.',
          error: 'RecipeName already used'
        })}
        else {
        // Insert new recipe name and description
        const insertRecipeRes = await pool.query(
          `INSERT INTO Recipes (recipeName, recipeDescription)
          VALUES ('${recipeName}', '${recipeDescription}')
          RETURNING recipeId`
        );
        //return recipe id
        res.status(200).json(insertRecipeRes.rows);
      }}
    catch (error) {
      console.error('Error adding recipe:', error); 
      res.status(500).json({ message: 'Error adding recipe', error: error.message });
    }
  }
});

app.post('/api/add-recipe/step', async (req, res) => {
  const stepNumber = (req.body.stepNumber);
  const stepDescription = (req.body.stepDescription);

  if (stepNumber == null || stepNumber <=0) {
    res.status(400).json({ 
     message: 'Error adding step number.',
     error: 'bad stepNumber'
    });
  }
  else if (stepDescription == null || stepDescription == "") {
    res.status(400).json({
      message: `No step description was given for step ${stepNumber}. Please fill in a description.`,
      error: 'bad stepDescription'
    });
  }
  else {
    try {
        // Insert new recipe name and description
        const insertStepRes = await pool.query(
          `INSERT INTO Steps (stepNumber, stepDescription)
          VALUES (${stepNumber}, '${stepDescription}')
          RETURNING stepId`
        );
        //return step id
        res.status(200).json(insertStepRes.rows);
      }
    catch (error) {
      console.error('Error adding step:', error); 
      res.status(500).json({ message: 'Error adding step', error: error.message });
    }
  }
});

app.post('/api/add-recipe/recipessteps', async (req, res) => {
  const recipeId = (req.body.recipeId);
  const stepId = (req.body.stepId);

  try {
    // Insert new recipessteps
    const insertRecipesStepRes = await pool.query(
      `INSERT INTO RecipesSteps (fk_recipes_recipeid, fk_steps_stepid)
      VALUES (${recipeId}, ${stepId})`
    );
    //return step id
    res.status(200).json(
      {message: `Linked stepId: ${stepId} and recipeId: ${recipeId} succesfully`}
    );
  }
catch (error) {
  console.error('Error adding recipestep:', error); 
  res.status(500).json({ message: 'Error adding recipestep', error: error.message });
}
});

app.post('/api/add-recipe/itemsrecipes', async (req, res) => {
  const recipeId = (req.body.recipeId);
  const itemId = (req.body.itemId);
  const quantity = (req.body.quantity);
  const quantityUnit = (req.body.quantityUnit);

  if (recipeId == null || recipeId <=0 ) {
    res.status(400).json({ 
      message: 'Error with recipeId',
      error: 'bad recipeId'
    });
  }
  else if (itemId == null || itemId <=0 ) {
    res.status(400).json({ 
      message: 'No Ingredient was selected. Please select an ingredient or delete unused item.',
      error: 'bad itemId'
    });
  }
  else if (quantity == null || quantity == "") {
    res.status(400).json({
      message: `No quantity was given for an item. Please fill in quantity or delete unused item.`,
      error: 'bad quantity'
    });
  }

  else {
    try {
      // Insert new itemsrecipes
      const insertItemsRecipesRes = await pool.query(
        `INSERT INTO ItemsRecipes (fk_recipes_recipeid, fk_items_itemid, quantity, quantityUnit)
        VALUES (${recipeId}, ${itemId}, '${quantity}', '${quantityUnit}')`
      );
      // state linked item and recipe succesfully
      res.status(200).json(
        {message: `Linked itemId: ${itemId} and recipeId: ${recipeId} succesfully`}
      );
    }
  catch (error) {
    console.error('Error adding step:', error); 
    res.status(500).json({ message: 'Error adding itemsrecipes', error: error.message });
  }
  }
});

//----------------------------------------------------------------------------
//                Cookbook Page
//----------------------------------------------------------------------------

app.get('/api/users/:userId/recipes/all', async (req, res) => {
  const userId = (req.params.userId);
  
  // Get all recipes a particular user has in their cookbook
  try {
    getAllUserRecipesRes = await pool.query(
      `SELECT DISTINCT
	      recipeId,
        recipeName,
        recipeDescription
      FROM recipes AS R
      INNER JOIN itemsrecipes AS IR ON IR.fk_recipes_recipeid = R.recipeid
      INNER JOIN items AS I ON IR.fk_items_itemid = I.itemid
      INNER JOIN usersitems AS UI ON UI.fk_items_itemid = I.itemid
      INNER JOIN users AS U ON UI.fk_users_userid = U.userid
      WHERE U.userid = ${userId}
      order by recipename`
    );
    res.status(200).json(getAllUserRecipesRes.rows);
  }
  catch (error) {
    console.error('Error getting user recipes:', error); 
    res.status(500).json({error: error.message});
  }
});

// Get all itemsrecipes ids in a list associated with recipeId
app.get('/api/delete-recipe/:recipeId/itemsrecipes', async (req, res) => {
  const recipeId = (req.params.recipeId);

  try {
    const getItemsRecipesIdListRes = await pool.query(
      `SELECT
	      STRING_AGG(CHR(39) || CAST(itemsrecipesid AS VARCHAR) || CHR(39), ', ') AS itemsrecipesidlist
	    FROM itemsrecipes
	    WHERE fk_recipes_recipeid = ${recipeId}`
    );
    res.status(200).json(getItemsRecipesIdListRes.rows);
  }
  catch (error) {
    console.error('Error getting itemsrecipes id list:', error); 
    res.status(500).json({ message: 'Error getting itemsrecipes id list', error: error.message });
  }
});

// Get all step ids in a list associated with recipeId
app.get('/api/delete-recipe/:recipeId/recipessteps', async (req, res) => {
  const recipeId = (req.params.recipeId);

  try {
    const getStepsIdListRes = await pool.query(
      `SELECT
	      STRING_AGG(CHR(39) || CAST(fk_steps_stepid AS VARCHAR) || CHR(39), ', ') AS stepidlist
	    FROM recipessteps
	    WHERE fk_recipes_recipeid = ${recipeId}`
    );
    res.status(200).json(getStepsIdListRes.rows);
  }
  catch (error) {
    console.error('Error getting steps id list:', error); 
    res.status(500).json({ message: 'Error getting steps id list', error: error.message });
  }
});

// delete items recipe relationship from id (cant just delete recipe)
app.delete('/api/delete-recipe/itemsrecipes', async (req, res) => {
  const itemsRecipesIdList = (req.body.itemsrecipesidlist);

  try {
    const deleteItemsRecipesRes = await pool.query(
      `DELETE FROM itemsrecipes
       WHERE itemsrecipesid IN (${itemsRecipesIdList})`
    );
    res.status(200).json(deleteItemsRecipesRes);
  }
  catch (error) {
    console.error('Error deleting itemsrecipes:', error);
    res.status(500).json({ message: 'Error deleting itemsrecipes', error: error.message });
  }
});

// delete all steps from id, will delete the recipestep relationship too
app.delete('/api/delete-recipe/steps', async (req, res) => {
  const stepsIdList = (req.body.stepidlist);

  try {
    const deleteStepsRes = await pool.query(
      `DELETE FROM steps
       WHERE stepid IN (${stepsIdList})`
    );
    res.status(200).json(deleteStepsRes);
  }
  catch (error) {
    console.error('Error deleting steps:', error);
    res.status(500).json({ message: 'Error deleting steps', error: error.message });
  }
});

// delete recipe from recipeId
app.delete('/api/delete-recipe/recipe', async (req, res) => {
  const recipeId = (req.body.recipeId);

  try {
    const deleteRecipeRes = await pool.query(
      `DELETE FROM recipes
       WHERE recipeId = ${recipeId}`
    );
    res.status(200).json(deleteRecipeRes );
  }
  catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
});

//----------------------------------------------------------------------------
//                Reports Page
//----------------------------------------------------------------------------

//Get all freq spoiled items
app.get('/api/users/:userid/reports/freqspoiled', async(req,res) => {
  try{
    const getFreqSpoiled = await pool.query(
      `SELECT 
        I.itemName AS Item,
        TO_CHAR(UI.dateAdded, 'mm/dd/yyyy') AS DateAdded,
        TO_CHAR(UI.spoilageDate,'mm/dd/yyyy') AS SpoilageDate,
        UI.quantityPurchased || ' ' ||U.unitabbreviation AS LastPurchasedTotal,
        (UI.quantityPurchased - UI.quantityRemaining) || ' ' ||U.unitabbreviation AS CurrentQuantityConsumed,
        UI.quantityRemaining || ' ' ||U.unitabbreviation AS CurrentQuantityRemaining,
        UI.finishedTotal+UI.spoiledTotal AS TimesBought,
          CASE 
            WHEN UI.spoiledTotal >0 
              THEN (round((UI.spoiledTotal/(UI.finishedTotal+UI.spoiledTotal)),4)
              *100)||'%'
            WHEN UI.spoiledTotal <=0
              THEN '0%' 
          END AS SpoiledPercent
        FROM UsersItems AS UI
        INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
        INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
        INNER JOIN Units AS U ON U.unitId=IU.FK_units_unitId
        INNER JOIN Users ON Users.userId = UI.FK_users_userId
          WHERE ((UI.spoiledTotal/(UI.finishedTotal+UI.spoiledTotal)) >= (0.30)
          AND purchaseAgain =true
          AND (NOT UI.spoiledTotal = 0)
          AND Users.userId = ${req.params.userid})
        ORDER BY I.itemName;`
  );
    res.json(getFreqSpoiled.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get all freq used items
app.get('/api/users/:userid/reports/freqused', async(req,res) => {
  try{
    const getFreqUsed = await pool.query(
      `SELECT 
        I.itemName AS Item,
        TO_CHAR(UI.dateAdded, 'mm/dd/yyyy') AS DateAdded,
        TO_CHAR(UI.spoilageDate,'mm/dd/yyyy') AS SpoilageDate,
        UI.quantityPurchased || ' ' ||U.UnitName AS LastPurchasedTotal,
        (UI.quantityPurchased - UI.quantityRemaining) || ' ' ||U.UnitName AS CurrentQuantityConsumed,
        UI.quantityRemaining || ' ' ||U.UnitName AS CurrentQuantityRemaining,
        CASE 
          WHEN UI.finished = true
            THEN 'YES'
          WHEN  UI.finished = false 
            THEN 'NO' 
        END AS InFridge,
        UI.finishedTotal+UI.spoiledTotal AS TimesBought,
	      CASE
		      WHEN UI.finishedTotal >0
			      THEN (round((UI.finishedTotal/(UI.finishedTotal+UI.spoiledTotal)),4)
		  			*100)||'%'
		      WHEN UI.finishedTotal <=0
	          THEN '0%'
	        END AS FinishedPercent
        FROM UsersItems AS UI
        INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
        INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
        INNER JOIN Units AS U ON U.unitId=IU.FK_units_unitId
        INNER JOIN Users ON Users.userId = UI.FK_users_userId
        WHERE ((UI.finishedTotal/(UI.finishedTotal+UI.spoiledTotal)) >= (0.70)
          AND purchaseAgain =true
          AND (NOT UI.finishedTotal = 0)
          AND Users.userId = ${req.params.userid})
        ORDER BY I.itemName`
  );
    res.json(getFreqUsed.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//----------------------------------------------------------------------------
//                Google Cloud Vision API
//----------------------------------------------------------------------------

let CREDENTIALS;

if (process.env.NODE_ENV === 'production') {
  // In production (Heroku), use the environment variable
  CREDENTIALS = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  // In development, use the JSON file
  const fs = require('fs');
  const path = require('path');
  const keyFilePath = path.join(__dirname, '../../service-account-key.json');
  const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
  CREDENTIALS = JSON.parse(keyFileContent);
}

const CONFIG = {
  credentials: CREDENTIALS
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
        categories.categoryname as groupname,
        categories.subcategoryname as optionname,
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
