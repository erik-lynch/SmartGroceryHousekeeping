
import './App.css';
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import AddItem from "./pages/add_item";
import EditItem from "./pages/edit_item";
import Recipes from "./pages/recipes";
import Reports from "./pages/reports";
import ViewRecipe from "./pages/view_recipe";
import AddRecipe from "./pages/add_recipe";
import Cookbook from "./pages/cookbook";
import Login from "./components/Login";
import Register from "./components/Register";
import { UserProvider } from './UserContext';

function App() {
    
    return (
        <UserProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route exact path="/" element={<Dashboard />} />
                    <Route path="/add_item" element={<AddItem />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/edit_item/:itemId/:usersItemsId" element={<EditItem />} />
                    <Route path="/recipes/:recipeId/view" element={<ViewRecipe />} />
                    <Route path="/add_recipe" element={<AddRecipe />} />
                    <Route path="/cookbook" element={<Cookbook />} /> {/* Updated this line */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
                <Footer />
            </Router>
        </UserProvider>
    );
}

export default App;
