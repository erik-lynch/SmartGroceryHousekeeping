import React from "react";
import{ useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const View_Recipe = () => {

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    let { recipeId } = useParams();
    let { userId } = useParams();
    let navigate = useNavigate();

    // set use effect state changes- steps,ingredient,description for page data
    const [steps, setSteps] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [description, setDescription] = useState([]);

    // set use effect state changes- for page rendering and waiting
    const [pageError, setPageError] = useState(false);
    const [loading0, setLoading0] = useState(true);
    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [loading3, setLoading3] = useState(true);

    useEffect(() => {
    const fetchVerifyRecipeId = async () => {
        try {
            setLoading0(true);
            const verifyRes  = await fetch(`${API_URL}/api/users/${userId}/recipes/${recipeId}/verify`);
            setLoading0(false);
            if (verifyRes.status === 404) {
                setPageError(404);
            }
        }
        catch (error) {
            console.log("There was an error:", error);
            setPageError(error);
        }
    }

    const fetchStepData = async () => {
        try {
            setLoading1(true);
            const stepRes  = await fetch(`${API_URL}/api/recipes/${recipeId}/steps`);
            const stepData = await stepRes.json();
            setSteps(stepData);
            setLoading1(false);
        }
        catch (error) {
            console.log("There was an error:", error);
            setPageError(error);
        }
    }

    const fetchIngredientData = async () => {
        try {
            setLoading2(true);
            const ingredientRes  = await fetch(`${API_URL}/api/users/${userId}/recipes/${recipeId}/ingredients`);
            const ingredientData = await ingredientRes.json();
            setIngredients(ingredientData);
            setLoading2(false);
        }
        catch (error) {
            console.log("There was an error:", error);
            setPageError(error);
        }
    }

    const fetchDescriptionData = async () => {
        try {
        setLoading3(true);
        const descriptionRes  = await fetch(`${API_URL}/api/users/${userId}/recipes/${recipeId}/namedescription`);
        const descriptionData = await descriptionRes.json();
        setDescription(descriptionData);
        setLoading3(false);
        }
        catch (error) {
            console.log("There was an error:", error);
            setPageError(error);
        }
    }


    fetchVerifyRecipeId();
    fetchStepData();
    fetchIngredientData();
    fetchDescriptionData();
    }, [userId, recipeId]);

    if (loading0 || loading1 || loading2 || loading3) {
        return (<p>Loading</p>)
    };

    if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
    else {

    return (
        <div className="view-core">
            <div className="view-section-content">
                <div className="view-section">
                <div className="view-section-category-1">
                    <h2>
                        {description[0].recipename}
                    </h2>
                    <p>
                        {description[0].recipedescription}
                    </p>
                    </div>
                
                <br></br>
                
                <div className="view-section-category-2">
                    <h2>Ingredients:</h2>
                        <ul>
                            {ingredients.map((ingredientval,key) => {
                            return (
                                <li key={key}>{ingredientval.itemname} {ingredientval.quantity} {ingredientval.quantityunit}</li>
                            );
                            })}
                        </ul>
                
                </div>
                <br></br>
                
                <div className="view-section-category-3">
                    <h2>Directions:</h2>
                        <ol>
                            {steps.map((stepval,key) => {
                            return(
                                <li key={key}><br></br><br></br><p>{stepval.stepdescription}</p></li>
                            );
                            })}
                        </ol>
                </div>
                </div>
                <button onClick={() => navigate(-1)}> Return to previous page</button>
            </div>
        </div>
    )
};
};

export default View_Recipe;