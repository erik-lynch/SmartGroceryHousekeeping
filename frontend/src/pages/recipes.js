import React, { useState, useEffect } from 'react';
import RecipeCarousel from "../components/Carousel/RecipeCarousel";
import { axiosInstance } from "../services/auth";



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
        //console.log(jsonData[i])
        var recipeIngredientStr = string_nameClean(jsonData[i].extendedIngredients);
        var newJsonApiData = {
            link : jsonData[i].spoonacularSourceUrl,
            recipeTitle: jsonData[i].title,
            recipeIngredients: recipeIngredientStr
        }
        //console.log(newJsonApiData);
        arrayJsonObjApiData.push(newJsonApiData);
    }
    return arrayJsonObjApiData
}

const Recipes = () => {
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
                const response = await axiosInstance.get(`/api/ingredients/infridge`);
                const api_str_ingredients = string_items(response.data);
                setIngredients(api_str_ingredients);
                setLoading0(false);
            } catch (error) {
                console.error("There was an error:", error);
                setPageError(error.response?.data?.message || error.message);
            }
        }

        const fetchSpoilSoonIngredients = async () => {
            try {
                setLoading1(true);
                const response = await axiosInstance.get(`/api/ingredients/spoilsoon`);
                const api_str_s_ingredients = string_items(response.data);
                setSpoilIngredients(api_str_s_ingredients);
                setLoading1(false);
            } catch (error) {
                console.error("There was an error:", error);
                setApiMax(true);
                setPageError(error.response?.data?.message || error.message);
            }
        }

        fetchInFridgeIngredients();
        fetchSpoilSoonIngredients();
    }, []); 


//---------------------------------------------------------------- 
//      use ingredients in fridge for API and DB
//---------------------------------------------------------------- 

useEffect(() => {
    const fetchApiInFridgeRecipes = async () => {
        try {
            setLoading2(true);
            const response = await axiosInstance.get(`/api/ingredients/${ingredients}/spoon/infridge`);
            const apiInFridgeRecipeData = response.data;
            if (apiInFridgeRecipeData.status === 'failure') {
                setApiMax(true);
            } else {
                const apiFridgeData = fill_api_data(apiInFridgeRecipeData.results)
                setApiInFridge(apiFridgeData);
            }
            setLoading2(false);
        } catch (error) {
            console.error("There was an error:", error);
            setPageError(error.response?.data?.message || error.message);
        }
    }

    const fetchInFridgeRecipes = async () => {
        try {
            setLoading4(true);
            const response = await axiosInstance.get(`/api/ingredients/${ingredients}/infridge/recipes`);
            const inFridgeRecipeData = response.data;

            let sortedJsonInFridgeData = inFridgeRecipeData.sort((a, b) => 
                (a.ingredientstot - a.ingredientsused) - (b.ingredientstot - b.ingredientsused)
            );
            
            for (let i = 0; i < sortedJsonInFridgeData.length; i++) {
                const currentRecipeRes = await axiosInstance.get(`/api/recipe/${sortedJsonInFridgeData[i].recipeid}/ingredientlist`);
                sortedJsonInFridgeData[i]['recipeIngredients'] = currentRecipeRes.data[0].ingredientlist;
                sortedJsonInFridgeData[i]['link'] = `/recipes/${sortedJsonInFridgeData[i].recipeid}/view`;
                sortedJsonInFridgeData[i]['recipeTitle'] = sortedJsonInFridgeData[i].recipename;
            }

            setInFridgeRecipes(sortedJsonInFridgeData);
            setLoading4(false);
        } catch (error) {
            console.error("There was an error:", error);
            setPageError(error.response?.data?.message || error.message);
        }
    }

    if (ingredients) { 
        fetchApiInFridgeRecipes();
        fetchInFridgeRecipes();
    }
}, [ingredients]); // Removed userId from dependencies

useEffect(() => {
    const fetchApiSpoilSoonRecipes = async () => {
        try {
            setLoading3(true);
            const response = await axiosInstance.get(`/api/ingredients/${spoilIngredients}/spoon/spoilsoon`);
            const apiSpoilSoonRecipesData = response.data;
            if (apiSpoilSoonRecipesData.status === 'failure') {
                setApiMax(true);
            } else {
                const apiSpoilSoonData = fill_api_data(apiSpoilSoonRecipesData.results)
                setApiSpoilRecipes(apiSpoilSoonData);
            }
            setLoading3(false);
        } catch (error) {
            console.error("There was an error:", error);
            setPageError(error.response?.data?.message || error.message);
        }
    }

    const fetchSpoilSoonRecipes = async () => {
        try {
            setLoading5(true);
            const response = await axiosInstance.get(`/api/ingredients/${spoilIngredients}/spoilsoon/recipes`);
            const spoilSoonRecipesData = response.data;

            let sortedJsonSpoilSoonData = spoilSoonRecipesData.sort((a, b) => 
                (a.ingredientstot - a.ingredientsused) - (b.ingredientstot - b.ingredientsused)
            );
            
            for (let i = 0; i < sortedJsonSpoilSoonData.length; i++) {
                const currentRecipeRes = await axiosInstance.get(`/api/recipe/${sortedJsonSpoilSoonData[i].recipeid}/ingredientlist`);
                sortedJsonSpoilSoonData[i]['recipeIngredients'] = currentRecipeRes.data[0].ingredientlist;
                sortedJsonSpoilSoonData[i]['link'] = `/recipes/${sortedJsonSpoilSoonData[i].recipeid}/view`;
                sortedJsonSpoilSoonData[i]['recipeTitle'] = sortedJsonSpoilSoonData[i].recipename;
            }

            setFridgeSpoilRecipes(sortedJsonSpoilSoonData);
            setLoading5(false);
        } catch (error) {
            console.error("There was an error:", error);
            setPageError(error.response?.data?.message || error.message);
        }
    }

    if (spoilIngredients) {
        fetchApiSpoilSoonRecipes();
        fetchSpoilSoonRecipes();
    }
}, [spoilIngredients]);

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