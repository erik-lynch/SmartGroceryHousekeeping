import React from "react";
import RecipeCarousel from "../components/Carousel/RecipeCarousel";
import recipesTestData from "../components/Carousel/recipes-test-data";

const Recipes = () => {
    return (
        <div class="core">
            <h2>
                Recipes Using Items Spoiling Soon
            </h2>

            <RecipeCarousel content={recipesTestData} />

            <h2>
                Recipes With Minimal Additional Ingredients
            </h2>

            <RecipeCarousel content={recipesTestData} />
            
        </div>
    );
};
 
export default Recipes;