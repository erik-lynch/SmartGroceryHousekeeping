//import React from "react";
//import ItemCarousel from "../components/Carousel/ItemCarousel";
 
/* Jillian has not pushed THE BELOW to main yet, but I am using this IT IS NOT MINE*/
import React from "react";
import RecipeCarousel from "../components/Carousel/RecipeCarousel";
import{ useState, useEffect } from 'react';

    // set use effect state changes- steps,ingredient,description for page data
    const [ingredients, setIngredients] = useState([]);
    const [spoilIngredients, setSpoilIngredients] = useState([]);
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

const Recipes = () => {
    useEffect(() => {
        fetchInFridgeIngredients();
        fetchSpoilSoonIngredients();
        fetchApiInFridgeRecipes();
        fetchApiSpoilSoonRecipes();
        fetchInFridgeRecipes
        fetchSpoilSoonRecipes();
        }, []);
 

        if (loading0 || loading1 || loading2 || loading3|| loading4|| loading5) {
            return (<h1>Loading</h1>)
        };

        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {
            return (
        <div class="core">
            <h2>
                Recipes Using Items Spoiling Soon
            </h2>

            <RecipeCarousel 
                link1="/recipes/1/view_recipe"
                recipeTitle1="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients1="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link2="/recipes/1/view_recipe"
                recipeTitle2="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients2="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link3="/recipes/1/view_recipe"
                recipeTitle3="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients3="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link4="/recipes/1/view_recipe"
                recipeTitle4="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients4="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link5="/recipes/1/view_recipe"
                recipeTitle5="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients5="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link6="/recipes/1/view_recipe"
                recipeTitle6="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients6="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link7="/recipes/1/view_recipe"
                recipeTitle7="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients7="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link8="/recipes/1/view_recipe"
                recipeTitle8="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients8="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />

            <h2>
                Recipes With Minimal Additional Ingredients
            </h2>

            <RecipeCarousel 
                link1="/recipes/1/view_recipe"
                recipeTitle1="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients1="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link2="/recipes/1/view_recipe"
                recipeTitle2="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients2="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link3="/recipes/1/view_recipe"
                recipeTitle3="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients3="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link4="/recipes/1/view_recipe"
                recipeTitle4="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients4="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link5="/recipes/1/view_recipe"
                recipeTitle5="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients5="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link6="/recipes/1/view_recipe"
                recipeTitle6="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients6="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link7="/recipes/1/view_recipe"
                recipeTitle7="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients7="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link8="/recipes/1/view_recipe"
                recipeTitle8="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients8="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />

            <h2>
                Recipes Suggested From Cookbook With Minimal Ingredients
            </h2>

            <RecipeCarousel 
                link1="/recipes/1/view_recipe"
                recipeTitle1="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients1="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link2="/recipes/1/view_recipe"
                recipeTitle2="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients2="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link3="/recipes/1/view_recipe"
                recipeTitle3="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients3="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link4="/recipes/1/view_recipe"
                recipeTitle4="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients4="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link5="/recipes/1/view_recipe"
                recipeTitle5="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients5="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link6="/recipes/1/view_recipe"
                recipeTitle6="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients6="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link7="/recipes/1/view_recipe"
                recipeTitle7="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients7="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link8="/recipes/1/view_recipe"
                recipeTitle8="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients8="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />

            <h2>
                Recipes Suggested From Cookbook With Items Spoiling Soon
            </h2>

            <RecipeCarousel 
                link1="/recipes/1/view_recipe"
                recipeTitle1="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients1="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link2="/recipes/1/view_recipe"
                recipeTitle2="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients2="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link3="/recipes/1/view_recipe"
                recipeTitle3="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients3="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link4="/recipes/1/view_recipe"
                recipeTitle4="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients4="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link5="/recipes/1/view_recipe"
                recipeTitle5="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients5="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link6="/recipes/1/view_recipe"
                recipeTitle6="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients6="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link7="/recipes/1/view_recipe"
                recipeTitle7="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients7="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"

                link8="/recipes/1/view_recipe"
                recipeTitle8="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients8="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />
        </div>
    
        
    );
};
};
 /* Jillian has not pushed THE ABOVE to main yet, but I am using this IT IS NOT MINE*/

/*
const Recipes = () => {
    return (
        <div class="core">
            <h1>
                Recipes Using Items Spoiling Soon
            </h1>

            <ItemCarousel
            item1 = {<a href="/recipes/1/view_recipe">Sample text 1 link</a>}
            item2="Sample text 2"
            item3="Sample text 3"
            item4="Sample text 4"
            item5="Sample text 5"
            item6="Sample text 6"
            item7="Sample text 7"
            item8="Sample text 8"
            />

            <h1>
                Recipes With Minimal Additional Ingredients
            </h1>

            <ItemCarousel 
            item1="Sample text 1"
            item2="Sample text 2"
            item3="Sample text 3"
            item4="Sample text 4"
            item5="Sample text 5"
            item6="Sample text 6"
            item7="Sample text 7"
            item8="Sample text 8"
            />

            <h1>
                Recipes Suggested From Cookbook
            </h1>

            <ItemCarousel 
            item1="Sample text 1"
            item2="Sample text 2"
            item3="Sample text 3"
            item4="Sample text 4"
            item5="Sample text 5"
            item6="Sample text 6"
            item7="Sample text 7"
            item8="Sample text 8"
            />
        </div>
    );
};
 
export default Recipes;
*/
export default Recipes;