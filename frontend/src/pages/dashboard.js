import { useState, useEffect, React } from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";
import loadingBar from "../components/Loading/loadingbar";


const Dashboard = () => {

    const userId = "1";
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [recentItems, setRecentItems] = useState(null);
    const [allItems, setAllItems] = useState(null);
    const [spoilItems, setSpoilItems] = useState(null);
    
    useEffect(() => {

        async function fetchAllItems() {

            try {
                const response = await fetch(`${API_URL}/dashboard/${userId}/allitems`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                setAllItems(await response.json());

            } catch (error) {
                console.error(error.message);
                }
        };

        async function fetchRecentItems() {

            try {
                const response = await fetch(`${API_URL}/dashboard/${userId}/recentitems`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                setRecentItems(await response.json());

            } catch (error) {
                console.error(error.message);
                }
        };

        async function fetchItemsSpoilingSoon() {

            try {
                const response = await fetch(`${API_URL}/dashboard/${userId}/spoilingsoon`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                setSpoilItems(await response.json());

            } catch (error) {
                console.error(error.message);
                }
        };

        fetchAllItems();
        fetchRecentItems();
        fetchItemsSpoilingSoon();

    }, []);
    
    
    if (!spoilItems || !allItems || !recentItems) {

        return(<h2>Loading...</h2>)

    } else {}

        return (

            <div className="core-dashboard">
                
                <h2>
                    Items - Recently Purchased
                </h2>

                <ItemCarousel content={recentItems} />
                

                <h2>
                    Items - Spoiling Soon
                </h2>

                <ItemCarousel content={spoilItems} />

                <h2>
                    All Items
                </h2>

                <ItemCarousel content={allItems} />

                </div>
        );
}
 
export default Dashboard;