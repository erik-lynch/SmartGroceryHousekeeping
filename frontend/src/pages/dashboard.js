import { useState, useEffect, React } from "react";
import ItemCarousel from "../components/Carousel/ItemCarousel";
import { axiosInstance, getCurrentUser } from '../services/auth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [recentItems, setRecentItems] = useState(null);
    const [allItems, setAllItems] = useState(null);
    const [spoilItems, setSpoilItems] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        const user = getCurrentUser();
        setIsLoggedIn(!!user);

        if (user) {
            fetchAllItems();
            fetchRecentItems();
            fetchItemsSpoilingSoon();
        }
    }, []);

    async function fetchAllItems() {
        try {
            const response = await axiosInstance.get('/dashboard/allitems');
            setAllItems(response.data);
        } catch (error) {
            console.error("Error fetching all items:", error.response?.data?.message || error.message);
        }
    }

    async function fetchRecentItems() {
        try {
            const response = await axiosInstance.get('/dashboard/recentitems');
            setRecentItems(response.data);
        } catch (error) {
            console.error("Error fetching recent items:", error.response?.data?.message || error.message);
        }
    }

    async function fetchItemsSpoilingSoon() {
        try {
            const response = await axiosInstance.get('/dashboard/spoilingsoon');
            setSpoilItems(response.data);
        } catch (error) {
            console.error("Error fetching spoiling items:", error.response?.data?.message || error.message);
        }
    }
    
    if (!isLoggedIn) {
        return (
            <div className="core-dashboard">
                <h2>Welcome to Your Dashboard</h2>
                <p>Please <Link to="/login">log in</Link> to access your dashboard.</p>
            </div>
        );
    }

    if (!spoilItems || !allItems || !recentItems) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="core-dashboard">
            <h2>Items - Recently Purchased</h2>
            <ItemCarousel content={recentItems} />
            
            <h2>Items - Spoiling Soon</h2>
            <ItemCarousel content={spoilItems} />

            <h2>All Items</h2>
            <ItemCarousel content={allItems} />
        </div>
    );
}
 
export default Dashboard;