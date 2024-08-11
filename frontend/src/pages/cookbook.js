import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../services/auth";

const Cookbook = () => {
    const navigate = useNavigate();
    const [allRecipes, setAllRecipes] = useState([]);
    const [pageError, setPageError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllUserRecipes();
    }, []);

    const fetchAllUserRecipes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/recipes/all');
            setAllRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setPageError(error.response?.data?.message || "Failed to fetch recipes. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleViewRecipe = (recipeId) => {
        navigate(`/recipes/${recipeId}/view`);
    };

    const handleDeleteRecipe = async (recipeId) => {
        if (window.confirm("Are you sure you want to delete this recipe?")) {
            try {
                await axiosInstance.delete(`/api/recipes/${recipeId}`);
                setAllRecipes(allRecipes.filter(recipe => recipe.recipeid !== recipeId));
            } catch (error) {
                console.error("Failed to delete recipe:", error);
                alert(error.response?.data?.message || "Failed to delete recipe. Please try again.");
            }
        }
    };

    if (loading) return <p>Loading recipes...</p>;
    if (pageError) return <h1>Error: {pageError}</h1>;

    return (
        <div className="core">
            <h2>Cookbook</h2>
            <br />
            {allRecipes.length === 0 ? (
                <p>No recipes found. Start adding some recipes to your cookbook!</p>
            ) : (
                <div className="table-overflow">
                    <table>
                        <thead>
                            <tr className="header-row">
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allRecipes.map((recipeData) => (
                                <tr key={recipeData.recipeid}>
                                    <td>{recipeData.recipename}</td>
                                    <td>{recipeData.recipedescription}</td>
                                    <td>
                                        <button onClick={() => handleViewRecipe(recipeData.recipeid)}>View</button>
                                        <button onClick={() => handleDeleteRecipe(recipeData.recipeid)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Cookbook;