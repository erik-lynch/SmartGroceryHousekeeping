import React from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";

const Dashboard = () => {
    return (
        <div class="core">
            <h2>
                Recently Purchased
            </h2>

            <ItemCarousel 

                link="/edit_item"
                imagePath="/images/apple-1.jpg"
                altText="image of many apples"
                itemName="Apple"
                itemQuantity="5"
                itemUnit="apples"

            />

            <a href="/edit_item">Edit Item page link</a>

            <h2>
                Spoiling Soon
            </h2>

            <ItemCarousel 

                link="/edit_item"
                imagePath="/images/apple-1.jpg"
                altText="image of many apples"
                itemName="Apple"
                itemQuantity="5"
                itemUnit="apples"

            />


            <h2>
                All Items
            </h2>

            <ItemCarousel 

                link="/edit_item"
                imagePath="/images/apple-1.jpg"
                altText="image of many apples"
                itemName="Apple"
                itemQuantity="5"
                itemUnit="apples"

            />

            </div>
    );
};
 
export default Dashboard;