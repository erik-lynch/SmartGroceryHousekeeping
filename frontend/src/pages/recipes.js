import React from "react";
import RecipeCarousel from "../components/Carousel/RecipeCarousel";

const Recipes = () => {
    return (
        <div class="core">
            <h2>
                Recipes Using Items Spoiling Soon
            </h2>

            <RecipeCarousel 
                link="https://www.google.com/"
                recipeTitle="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />

            <h2>
                Recipes With Minimal Additional Ingredients
            </h2>

            <RecipeCarousel 
                link="https://www.google.com/"
                recipeTitle="Curry Tomatoes and Chickpeas With Cucumber Yogurt"
                recipeIngredients="Tomatoes, Yogurt, Cucumbers, Mint, Garlic, Lemon"
            />
        </div>
    );
};
 
export default Recipes;