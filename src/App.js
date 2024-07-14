
import './App.css';
import React from "react";
import Navbar from "./components/Navbar";
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
            </Routes>
        </Router>
    );
}

export default App;
