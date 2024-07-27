require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const https = require('https');

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


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})


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


app.post('/api/add-item', async (req, res) => {
  const { iname, unit, quantity, ripeRating, barcode, itemDescription, recipeId } = req.body; 

  try {
    const itemResult = await pool.query(
      'SELECT itemId FROM Items WHERE itemName = $1 OR itemName = $2',
      [iname, barcode]
    );

    let itemId;

    if (itemResult.rows.length > 0) {
      // Item exists
      itemId = itemResult.rows[0].itemid;
    } else {
      // Insert new item
      const insertItemResult = await pool.query(
        'INSERT INTO Items (itemName, itemDescription) VALUES ($1, $2) RETURNING itemId',
        [iname, itemDescription] 
      );
      itemId = insertItemResult.rows[0].itemid;
    }
    res.status(200).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error); 
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
});

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
    //console.log(getRecipeInFridgeIngredientsData.rows);
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
    //console.log(getRecipeSpoilSoonIngredientsData.rows);
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
    //console.log(Data.rows);
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
  console.log(req.body);
  const recipeName = (req.body.recipeName);
  const recipeDescription = (req.body.recipeDescription);
  console.log('recipeName:',recipeName);
  console.log('recipeDescription:',recipeDescription);
  console.log(`INSERT INTO Recipes (recipeName, recipeDescription)
          VALUES (${recipeName}, ${recipeDescription})
          RETURNING recipeId`);

  if (recipeName === null || recipeName === "")  {
    res.status(400).json({ message: 'Error adding recipe name'});
  }
  else if (recipeDescription === null || recipeDescription === "") {
    res.status(400).json({ message: 'Error adding recipe description'});
  }
  else {
    try {
        console.log('get to try statement');
        // Insert new recipe name and description
        const insertRecipeRes = await pool.query(
          `INSERT INTO Recipes (recipeName, recipeDescription)
          VALUES ('${recipeName}', '${recipeDescription}')
          RETURNING recipeId`
        );
        //return recipe id
        res.status(200).json(insertRecipeRes.rows);
      }
    catch (error) {
      console.error('Error adding recipe:', error); 
      res.status(500).json({ message: 'Error adding recipe', error: error.message });
    }
  }
});

app.post('/api/add-recipe/step', async (req, res) => {
  const stepNumber = (req.body.stepNumber);
  const stepDescription = (req.body.stepDescription);

  if (stepNumber === null || stepNumber <=0 || !(isNumber(stepNumber)) ) {
    res.status(400).json({ message: 'Error adding step number'});
  }
  else if (stepDescription === null || stepDescription === "") {
    res.status(400).json({ message: 'Error adding step description'});
  }
  else {
    try {
        // Insert new recipe name and description
        const insertStepRes = await pool.query(
          `INSERT INTO Steps (stepNumber, stepDescription)
          VALUES (${stepNumber}, ${stepDescription})
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
  console.error('Error adding step:', error); 
  res.status(500).json({ message: 'Error adding step', error: error.message });
}
});

app.post('/api/add-recipe/itemsrecipes', async (req, res) => {
  const recipeId = (req.body.recipeId);
  const itemId = (req.body.itemName);
  const quantity = (req.body.quantity);
  const quantityUnit = (req.body.quantityUnit);

  if (recipeId === null || recipeId <=0 || !(isNumber(recipeId)) ) {
    res.status(400).json({ message: 'Error with recipeId'});
  }
  else if (itemId === null || itemId <=0 || !(isNumber(itemId)) ) {
    res.status(400).json({ message: 'Error with itemId'});
  }
  else if (quantity === null || quantity === "") {
    res.status(400).json({ message: 'Error with quantity'});
  }
  else if (quantityUnit === "") {
    res.status(400).json({ message: 'Error with quantity unit'});
  }
  else {
    try {
      // Insert new itemsrecipes
      const insertItemsRecipesRes = await pool.query(
        `INSERT INTO RecipesSteps (fk_recipes_recipeid, fk_items_itemid, quantity, quantityUnit)
        VALUES (${recipeId}, ${itemId}, ${quantity}, ${quantityUnit})`
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

app.delete('/api/add-recipe/unsuccessful/recipe', async (req, res) => {
  const recipeId = (req.body.recipeId);
  try {
    // attemp recipe deletion
    const deleteRecipeRes = await pool.query(
      `DELETE FROM Recipes
       WHERE ${recipeId}`
    );
    //return succesful delete message for recipe
    res.status(200).json(
      {message: `Succesfully deleted recipeId: ${recipeId}`}
    );
  }
catch (error) {
  console.error('Error deleting recipe:', error); 
  res.status(500).json({ message: 'Error deleting recipe', error: error.message });
}
});

app.delete('/api/add-recipe/unsuccessful/step', async (req, res) => {
  const stepId = (req.body.stepId);
  try {
    // attemp step deletion
    const deleteStepRes = await pool.query(
      `DELETE FROM Steps
       WHERE ${stepId}`
    );
    //return succesful delete message for step
    res.status(200).json(
      {message: `Succesfully deleted stepId: ${stepId}`}
    );
  }
catch (error) {
  console.error('Error deleting step:', error);
  res.status(500).json({ message: 'Error deleting step', error: error.message });
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
        UI.quantityPurchased || ' ' ||U.UnitName AS LastPurchasedTotal,
        (UI.quantityPurchased - UI.quantityRemaining) || ' ' ||U.UnitName AS CurrentQuantityConsumed,
        UI.quantityRemaining || ' ' ||U.UnitName AS CurrentQuantityRemaining,
        UI.finishedTotal+UI.spoiledTotal AS TimesBought,
          CASE 
            WHEN UI.spoiledTotal >0 
              THEN ((UI.spoiledTotal/(UI.finishedTotal+UI.spoiledTotal))*100)||'%'
            WHEN UI.spoiledTotal <=0
              THEN '0%' 
          END AS SpoiledPercent
        FROM UsersItems AS UI
        INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
        INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
        INNER JOIN Units AS U ON U.unitId=IU.FK_units_unitId
        INNER JOIN Users ON Users.userId = UI.FK_users_userId
          WHERE ((UI.spoiledTotal/(UI.finishedTotal+UI.spoiledTotal)) >= (0.15)
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
			      THEN ((UI.finishedTotal/(UI.finishedTotal+UI.spoiledTotal))*100)||'%'
		      WHEN UI.finishedTotal <=0
	          THEN '0%'
	        END AS FinishedPercent
        FROM UsersItems AS UI
        INNER JOIN Items AS I ON UI.FK_items_itemId = I.itemId
        INNER JOIN ItemsUnits AS IU ON IU.FK_items_itemId = I.itemId
        INNER JOIN Units AS U ON U.unitId=IU.FK_units_unitId
        INNER JOIN Users ON Users.userId = UI.FK_users_userId
        WHERE ((UI.finishedTotal/(UI.finishedTotal+UI.spoiledTotal)) >= (0.65)
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


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = pool;
