import React from "react";
import RecipeCarousel from "../components/Carousel/RecipeCarousel";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

function string_items(obj) {
    var string_val = '';
    for (let i=0; i < obj.length; i++) {
        string_val = string_val + "'" + obj[i].itemname + "'";
        if (i < obj.length-1) {
            string_val = string_val + ', ';
        }
    }
    return string_val;
}

function string_nameClean(obj) {
    var string_val = "";
    for (let i=0; i < obj.length; i++) {
        string_val = string_val + obj[i].nameClean;
        if (i < obj.length-1) {
            string_val = string_val + ", ";
        }
    }
    return string_val;
  }

function fill_api_data(jsonData) {
    var arrayJsonObjApiData = [];
    for (let i=0; i < jsonData.length; i++) {
        var recipeIngredientStr = string_nameClean(jsonData[i].extendedIngredients);
        var newJsonApiData = {
            link : jsonData[i].spoonacularSourceUrl,
            recipeTitle: jsonData[i].title,
            recipeIngredients: recipeIngredientStr
        }
        arrayJsonObjApiData.push(newJsonApiData);
    }
    return arrayJsonObjApiData
}

const Recipes = () => {

        let { userId } = useParams();
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        // set use effect state changes- steps,ingredient,description for page data
        const [ingredients, setIngredients] = useState("");
        const [spoilIngredients, setSpoilIngredients] = useState("");
        const [apiInFridge, setApiInFridge] = useState([]);
        const [apiSpoilRecipes, setApiSpoilRecipes] = useState([]);
        const [inFridgeRecipes, setInFridgeRecipes] = useState([]);
        const [fridgeSpoilRecipes, setFridgeSpoilRecipes] = useState([]);
        const [apiMax, setApiMax] = useState(false);

        // set use effect state changes- for page rendering and waiting
        const [pageError, setPageError] = useState(false);
        const [loading0, setLoading0] = useState(true);
        const [loading1, setLoading1] = useState(true);
        const [loading2, setLoading2] = useState(true);
        const [loading3, setLoading3] = useState(true);
        const [loading4, setLoading4] = useState(true);
        const [loading5, setLoading5] = useState(true);

//---------------------------------------------------------------- 
//      pull ingredients from fridge
//---------------------------------------------------------------- 
    useEffect(() => {
        const fetchInFridgeIngredients = async () => {
            try {
                setLoading0(true);
                const inFridgeIngredientsRes  = await fetch(`${API_URL}/api/users/${userId}/ingredients/infridge`);
                const inFridgeIngredientsData = await inFridgeIngredientsRes.json();
                const api_str_ingredients = string_items(inFridgeIngredientsData);
                setIngredients(api_str_ingredients);
                setLoading0(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }

        const fetchSpoilSoonIngredients = async () => {
            try {
                setLoading1(true);
                const spoilSoonIngredientsRes  = await fetch(`${API_URL}/api/users/${userId}/ingredients/spoilsoon`);
                const spoilSoonIngredientsData = await spoilSoonIngredientsRes.json();
                const api_str_s_ingredients = string_items(spoilSoonIngredientsData);
                setSpoilIngredients(api_str_s_ingredients);
                setLoading1(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setApiMax(true);
                setPageError(error); 
            }
        }

        fetchInFridgeIngredients();
        fetchSpoilSoonIngredients();
        }, [userId]);


//---------------------------------------------------------------- 
//      use ingredients in fridge for API and DB
//---------------------------------------------------------------- 

useEffect(() => {

        const fetchApiInFridgeRecipes = async () => {
            try {
                setLoading2(true);
                const apiInFridgeRecipesRes  = await fetch(`${API_URL}/api/ingredients/${ingredients}/spoon/infridge`);
                const apiInFridgeRecipeData = await apiInFridgeRecipesRes.json();
                if (apiInFridgeRecipeData.status === 'failure') {
                    setApiMax(true);
                }
                else {
                const apiFridgeData = fill_api_data(apiInFridgeRecipeData.results)
                setApiInFridge(apiFridgeData);
                }
                setLoading2(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }

        const fetchInFridgeRecipes = async () => {
            try {
                setLoading4(true);
                const inFridgeRecipesRes  = await fetch(`${API_URL}/api/users/${userId}/ingredients/${ingredients}/infridge/recipes`);
                const inFridgeRecipeData = await inFridgeRecipesRes.json();

                let sortedJsonInFridgeData;

                //couldn't get sql to use temp col value...so this sorts by least ingredients missing (sql secondary-more used ingredient desc , total ingredienst asc)
                sortedJsonInFridgeData = inFridgeRecipeData.sort((a, b) => {
                    if ((a.ingredientstot-a.ingredientsused) < (b.ingredientstot-b.ingredientsused)) {
                      return -1;
                    }
                    else if ((a.ingredientstot-a.ingredientsused) > (b.ingredientstot-b.ingredientsused)){
                        return 1;
                    }
                    else {
                        return 0;
                    }
                  });
                
                // get total ingredient list for each recipe and update array
                for (let i=0; i < sortedJsonInFridgeData.length; i++) {
                    // send recipeId to get list of ingredients
                    var currentRecipeRes  = await fetch(`${API_URL}/api/recipe/${sortedJsonInFridgeData[i].recipeid}/ingredientlist`);
                    var currentRecipeData = await currentRecipeRes.json();
                    sortedJsonInFridgeData[i]['recipeIngredients'] = currentRecipeData[0].ingredientlist;
                    sortedJsonInFridgeData[i]['link'] = `/users/${userId}/recipes/${sortedJsonInFridgeData[i].recipeid}/view_recipe`;
                    sortedJsonInFridgeData[i]['recipeTitle'] = sortedJsonInFridgeData[i].recipename;
                }

                setInFridgeRecipes(sortedJsonInFridgeData);
                setLoading4(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }

        if (ingredients) { 
            fetchApiInFridgeRecipes();
            fetchInFridgeRecipes();
        }
        }, [userId, ingredients]);


//---------------------------------------------------------------- 
//      use soon to spoil in fridge for API and DB
//---------------------------------------------------------------- 
useEffect(() => {

            const fetchApiSpoilSoonRecipes = async () => {
                try {
                    setLoading3(true);
                    const apiSpoilSoonRecipesRes  = await fetch(`${API_URL}/api/ingredients/${spoilIngredients}/spoon/spoilsoon`);
                    const apiSpoilSoonRecipesData = await apiSpoilSoonRecipesRes.json();
                    if (apiSpoilSoonRecipesData.status === 'failure') {
                        setApiMax(true);
                    }
                    else {
                    const apiSpoilSoonData = fill_api_data(apiSpoilSoonRecipesData.results)
                    setApiSpoilRecipes(apiSpoilSoonData);
                    }
                    setLoading3(false);
                }
                catch (error) {
                    console.log("There was an error:", error);
                    setPageError(error);
                }
            }
 
            const fetchSpoilSoonRecipes = async () => {
                try {
                    setLoading5(true);
                    const spoilSoonRecipesRes  = await fetch(`${API_URL}/api/users/${userId}/ingredients/${spoilIngredients}/infridge/recipes`);
                    const spoilSoonRecipesData = await spoilSoonRecipesRes.json();

                    let sortedJsonSpoilSoonData;

                
                sortedJsonSpoilSoonData = spoilSoonRecipesData.sort((a, b) => {
                    if ((a.ingredientstot-a.ingredientsused) < (b.ingredientstot-b.ingredientsused)) {
                      return -1;
                    }
                    else if ((a.ingredientstot-a.ingredientsused) > (b.ingredientstot-b.ingredientsused)){
                        return 1;
                    }
                    else {
                        return 0;
                    }
                  });
                
                // get total ingredient list for each recipe and update array
                for (let i=0; i < sortedJsonSpoilSoonData.length; i++) {
                    // send recipeId to get list of ingredients
                    var currentRecipeRes  = await fetch(`${API_URL}/api/recipe/${sortedJsonSpoilSoonData[i].recipeid}/ingredientlist`);
                    var currentRecipeData = await currentRecipeRes.json();
                    sortedJsonSpoilSoonData[i]['recipeIngredients'] = currentRecipeData[0].ingredientlist;
                    sortedJsonSpoilSoonData[i]['link'] = `/users/${userId}/recipes/${sortedJsonSpoilSoonData[i].recipeid}/view_recipe`;
                    sortedJsonSpoilSoonData[i]['recipeTitle'] = sortedJsonSpoilSoonData[i].recipename;
                }

                setFridgeSpoilRecipes(sortedJsonSpoilSoonData);
                    setLoading5(false);
                }
                catch (error) {
                    console.log("There was an error:", error);
                    setPageError(error);
                }
                    
            }

            if (spoilIngredients) {
                fetchApiSpoilSoonRecipes();
                fetchSpoilSoonRecipes();
            }
            }, [userId, spoilIngredients]);

        if (loading0 || loading1 || loading2 || loading3 || loading4 || loading5)
        {
            return (<p>Loading</p>)
        };

        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {
            return (

            <div className="core">

            <h2>
                Recipes Suggested From Cookbook With Minimal Ingredients
            </h2>

            <RecipeCarousel content={inFridgeRecipes} />

            <h2>
                Recipes Suggested From Cookbook With Items Spoiling Soon
            </h2>

            <RecipeCarousel content={fridgeSpoilRecipes} />
            
            <h2>
                Recipes - Minimal Additional Ingredients
            </h2>
            {apiMax? (<p>Max API calls reached today</p>) :
            <RecipeCarousel content={apiInFridge} /> }

            <h2>
                Recipes Using Items Spoiling Soon
            </h2>
            {apiMax? (<p>Max API calls reached today</p>) :
            <RecipeCarousel content={apiSpoilRecipes} />}

        </div>
    );
};
};

export default Recipes;