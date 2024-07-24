import React from "react";
import RecipeCarousel from "../components/Carousel/RecipeCarousel";
import{ useState, useEffect } from 'react';
import recipesTestData from "../components/Carousel/recipes-test-data";
import spoon_api_test_data from "../components/Carousel/spoon_api_test_data";
import { useParams } from "react-router-dom";


function string_items(obj) {
    var string_val = "";
    for (let i=0; i < obj.length; i++) {
        string_val = string_val + obj[i].itemname;
        if (i < obj.length-1) {
            string_val = string_val + ", ";
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
        console.log(jsonData[i])
        var recipeIngredientStr = string_nameClean(jsonData[i].extendedIngredients);
        var newJsonApiData = {
            link : jsonData[i].sourceUrl,
            recipeTitle: jsonData[i].title,
            recipeIngredients: recipeIngredientStr
        }
        arrayJsonObjApiData.push(newJsonApiData);
    }
    return arrayJsonObjApiData
}

const Recipes = () => {
        
        const SPOONACULAR_API_KEY = '';

        let { userId } = useParams();


        // set use effect state changes- steps,ingredient,description for page data
        const [ingredients, setIngredients] = useState("");
        const [spoilIngredients, setSpoilIngredients] = useState("");
        const [apiInFridge, setApiInFridge] = useState([]);
        const [apiSpoilRecipes, setApiSpoilRecipes] = useState([]);
        const [inFridgeRecipes, setInFridgeRecipes] = useState([]);
        const [fridgeSpoilRecipes, setFridgeSpoilRecipes] = useState([]);

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
                const inFridgeIngredientsRes  = await fetch(`http://localhost:3001/api/users/${userId}/ingredients/infridge`);
                const inFridgeIngredientsData = await inFridgeIngredientsRes.json();
                console.log(inFridgeIngredientsData)
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
                const spoilSoonIngredientsRes  = await fetch(`http://localhost:3001/api/users/${userId}/ingredients/spoilsoon`);
                const spoilSoonIngredientsData = await spoilSoonIngredientsRes.json();
                const api_str_s_ingredients = string_items(spoilSoonIngredientsData);
                setSpoilIngredients(api_str_s_ingredients);
                setLoading1(false);
            }
            catch (error) {
                console.log("There was an error:", error);
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
/*
        const fetchApiInFridgeRecipes = async () => {
            try {
                setLoading2(true);
                const apiInFridgeRecipesRes  = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=recipe&includeIngredients=${ingredients}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true&addRecipeInstructions=true&number=8&sort=min-missing-ingredients`);
                const apiInFridgeRecipeData = await apiInFridgeRecipesRes.json();
                setApiInFridge(apiInFridgeRecipeData);
                setLoading2(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }
*/
        const fetchInFridgeRecipes = async () => {
            try {
                setLoading4(true);
                const inFridgeRecipesRes  = await fetch(``);
                const inFridgeRecipeData = await inFridgeRecipesRes.json();
                setInFridgeRecipes(inFridgeRecipeData);
                setLoading4(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }

        if (ingredients) { 
            console.log("ingredients:", ingredients);
            //fetchApiInFridgeRecipes();
            fetchInFridgeRecipes();
        }
        }, [ingredients]);


//---------------------------------------------------------------- 
//      use soon to spoil in fridge for API and DB
//---------------------------------------------------------------- 
useEffect(() => {
/*
            const fetchApiSpoilSoonRecipes = async () => {
                try {
                    setLoading3(true);
                    const apiSpoilSoonRecipesRes  = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=recipe&includeIngredients=${spoilIngredients}&instructionsRequired=true&fillIngredients=true&addRecipeInformation=true&addRecipeInstructions=true&number=8&sort=max-used-ingredients`);
                    const apiSpoilSoonRecipesData = await apiSpoilSoonRecipesRes.json();
                    setApiSpoilRecipes(apiSpoilSoonRecipesData);
                    setLoading3(false);
                }
                catch (error) {
                    console.log("There was an error:", error);
                    setPageError(error);
                }
            }
*/  
            const fetchSpoilSoonRecipes = async () => {
                try {
                    setLoading5(true);
                    const spoilSoonRecipesRes  = await fetch(``);
                    const spoilSoonRecipesData = await spoilSoonRecipesRes.json();
                    setFridgeSpoilRecipes(spoilSoonRecipesData);
                    setLoading5(false);
                }
                catch (error) {
                    console.log("There was an error:", error);
                    setPageError(error);
                }
                    
            }

            if (spoilIngredients) {
                console.log(" spoil ingredients:", spoilIngredients);
                //fetchApiSpoilSoonRecipes();
                fetchSpoilSoonRecipes();
            }
            }, [spoilIngredients]);

        if (loading0 || loading1 || loading4 || loading5)// || loading2) //|| loading3)
        {
            return (<p>Loading</p>)
        };

        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {
            console.log(spoon_api_test_data);
            const apiData =fill_api_data(spoon_api_test_data.results);

            return (

                

            <div class="core">
            <h2>
                Recipes Using Items Spoiling Soon
            </h2>

            <RecipeCarousel content={apiData} />

            <h2>
                Recipes With Minimal Additional Ingredients
            </h2>

            <RecipeCarousel content={recipesTestData} />

            <h2>
                Recipes Suggested From Cookbook With Minimal Ingredients
            </h2>

            <RecipeCarousel content={recipesTestData} />

            <h2>
                Recipes Suggested From Cookbook With Items Spoiling Soon
            </h2>

            <RecipeCarousel content={recipesTestData} />
            
        </div>
    );
};
};

export default Recipes;