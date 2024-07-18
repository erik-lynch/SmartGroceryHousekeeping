import React from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";
 
const Recipes = () => {
    return (
        <div class="core">
            <h1>
                Recipes Using Items Spoiling Soon
            </h1>

            <ItemCarousel />

            <h1>
                Recipes With Minimal Additional Ingredients
            </h1>

            <ItemCarousel />

        </div>
    );
};
 
export default Recipes;