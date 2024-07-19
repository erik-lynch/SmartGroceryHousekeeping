import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";



const View_Recipe = () => {

    const [steps, setSteps] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [description, setDescription] = useState([]);
    const [error, setError] = useState([]);
    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [loading3, setLoading3] = useState(true);

    let { recipeId } = useParams();

    const fetchStepData = async () => {
        setLoading1(true);
        const stepRes  = await fetch(`http://localhost:3001/api/recipes/${recipeId}/steps`);
        const stepData = await stepRes.json();
        setSteps(stepData);
        setLoading1(false);
    }

    const fetchIngredientData = async () => {
        setLoading2(true);
        const ingredientRes  = await fetch(`http://localhost:3001/api/recipes/${recipeId}/ingredients`);
        const ingredientData = await ingredientRes.json();
        setIngredients(ingredientData);
        setLoading2(false);
    }

    const fetchDescriptionData = async () => {
        setLoading3(true);
        const descriptionRes  = await fetch(`http://localhost:3001/api/recipes/${recipeId}/namedescription`);
        const descriptionData = await descriptionRes.json();
        setDescription(descriptionData);
        setLoading3(false);
    }

    useEffect(() => {
    fetchStepData();
    fetchIngredientData();
    fetchDescriptionData();
    }, []);

//    const [steps, setSteps] = useState([]);
//
//    const fetchSteps = () => {
//        fetch('http://localhost:3001/api/recipes/1/steps')
//        .then(response => {
//            return response.json();
//    })
//    .then(data => {
//        console.log(data);
//        setSteps(data);
//    })
//    }

//useEffect(() => {
//    fetchSteps()}
//    , []);

    //to get rid of error where attribute set before assigned
    // if any one is not loaded display loading screen
    if (loading1 || loading2 || loading3) return <h1>Loading</h1>;

    return (
        <div class="core">
            <h1>
                {description[0].recipename}
            </h1>
            <p>{description[0].recipedescription}</p>
            <h2>Ingredients:</h2>
                <ul>
                    {ingredients.map((ingredientval) => {
                        return (
                            <li>{ingredientval.itemname} {ingredientval.quantity} OptionalUnitQuantity</li>
                        );
                    })}
                </ul>
            <h2>Directions:</h2>
                
                <ol>
                {steps.map((stepval) => {
                    return(
                        <li> {stepval.stepdescription}</li>
                    );
                })}
                </ol>
        </div>
    )
};

 
export default View_Recipe;