
import './App.css';
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Dashboard from "./pages/dashboard";
import AddItem from "./pages/add_item";
import EditItem from "./pages/edit_item";
import Recipes from "./pages/recipes";
import Reports from "./pages/reports";
import ViewRecipe from "./pages/view_recipe";
import AddRecipe from "./pages/add_recipe";




function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<Dashboard />} />
                <Route path="/add_item" element={<AddItem />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/edit_item" element={<EditItem />} />
                <Route path="/recipes/:recipeId/view_recipe" element={<ViewRecipe />} />
                <Route path="/recipes/:recipeId/add_recipe" element={<AddRecipe />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
