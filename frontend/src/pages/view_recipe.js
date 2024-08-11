import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../services/auth";

const View_Recipe = () => {
    let { recipeId } = useParams();
    let navigate = useNavigate();

    const [steps, setSteps] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [description, setDescription] = useState({});
    const [pageError, setPageError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                setLoading(true);

                // Verify recipe exists
                await axiosInstance.get(`/api/recipes/${recipeId}/verify`);

                // Fetch recipe data
                const [stepsRes, ingredientsRes, descriptionRes] = await Promise.all([
                    axiosInstance.get(`/api/recipes/${recipeId}/steps`),
                    axiosInstance.get(`/api/recipes/${recipeId}/ingredients`),
                    axiosInstance.get(`/api/recipes/${recipeId}/namedescription`)
                ]);

                setSteps(stepsRes.data);
                setIngredients(ingredientsRes.data);
                setDescription(descriptionRes.data);
                setLoading(false);
            } catch (error) {
                console.error("There was an error:", error);
                setPageError(error.response?.data?.message || error.message);
                setLoading(false);
            }
        };

        fetchRecipeData();
    }, [recipeId]);

    if (loading) {
        return <p>Loading</p>;
    }

    if (pageError) {
        return <h1>There was an error: {pageError}</h1>;
    }

    return (
        <div className="core">
            <h1>{description.recipename}</h1>
            <p>{description.recipedescription}</p>
            <h2>Ingredients:</h2>
            <ul>
                {ingredients.map((ingredient, key) => (
                    <li key={key}>{ingredient.itemname} {ingredient.quantity} {ingredient.quantityunit}</li>
                ))}
            </ul>
            <h2>Directions:</h2>
            <ol>
                {steps.map((step, key) => (
                    <li key={key}>{step.stepdescription}</li>
                ))}
            </ol>
            <br />
            <button onClick={() => navigate(-1)}>Return to previous page</button>
        </div>
    );
};

export default View_Recipe;