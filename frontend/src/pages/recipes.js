import React from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";
 
const Recipes = () => {
    return (
        <div class="core">
            <h2>
                Recipes Using Items Spoiling Soon
            </h2>

            <ItemCarousel />

            <h2>
                Recipes With Minimal Additional Ingredients
            </h2>

            <ItemCarousel />
        </div>
    );
};
 
export default Recipes;