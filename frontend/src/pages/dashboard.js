import React from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";

const Dashboard = () => {
    return (
        <div class="core">
            <h2>
                Recently Purchased
            </h2>

            <ItemCarousel />

            <a href="/edit_item">Edit Item page link</a>

            <h2>
                Spoiling Soon
            </h2>

            <ItemCarousel 
                ItemName="Apple"
                ItemQuantity="5"/>

            <h2>
                All Items
            </h2>

            <ItemCarousel />

        </div>
    );
};
 
export default Dashboard;