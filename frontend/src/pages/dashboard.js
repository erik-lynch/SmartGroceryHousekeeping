import React from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";
import dashboardTestData from "../components/Carousel/dashboard-test-data";

const Dashboard = () => {
    return (
        <div class="core">
            <h2>
                Recently Purchased
            </h2>

            <ItemCarousel content={dashboardTestData} />

            <h2>
                Spoiling Soon
            </h2>

            <ItemCarousel content={dashboardTestData} />

            <h2>
                All Items
            </h2>

            <ItemCarousel content={dashboardTestData} />

            </div>
    );
};
 
export default Dashboard;