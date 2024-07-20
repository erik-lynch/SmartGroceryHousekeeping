require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();

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
//                View Recipe Page requests
//----------------------------------------------------------------------------

//Get recipe name and description From recipeid
app.get('/api/recipes/:recipeId/namedescription', async(req,res) => {
  try{
    const getRecipeInfoData = await pool.query(
      `SELECT
        recipeName,
        recipeDescription
      FROM recipes
      WHERE recipeId = ${req.params.recipeId}`
    );
    res.json(getRecipeInfoData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get recipe ingredients from recipeid
app.get('/api/recipes/:recipeId/ingredients', async(req,res) => {
  try{
    const getRecipeIngredientData = await pool.query(
      `SELECT 
        I.itemName, 
        IR.quantity
      FROM Items AS I
      INNER JOIN ItemsRecipes AS IR ON IR.FK_items_itemId = I.itemId
      INNER JOIN Recipes AS R ON IR.FK_recipes_recipeId = R.recipeId
      WHERE R.recipeId = ${req.params.recipeId}`
    );
    res.json(getRecipeIngredientData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
//verify recipeid exists
app.get('/api/recipes/:recipeId/verify', async(req,res) => {
  try{
    const getRecipeVerify = await pool.query(
    `SELECT recipeId FROM recipes where recipeid = ${req.params.recipeId}`
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
    ORDER BY S.stepNumber ASC;
  `
    );
    res.json(getRecipeStepData.rows);
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
