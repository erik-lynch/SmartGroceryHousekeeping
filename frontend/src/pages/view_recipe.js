import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";



const View_Recipe = () => {

    const [steps, setSteps] = useState([]);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchStepData = async () => {
            setLoading(true);
            const stepRes  = await fetch('http://localhost:3001/api/recipes/1/steps');
            const stepData = await stepRes.json();
            setSteps(stepData);
            setLoading(false);
        }
    
    fetchStepData();}, []);

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
    if (loading) return <h1>Loading</h1>;

    return (
        <div class="core">
            <h1>
                Recipe Name Variable
            </h1>
            <p>Recipe Description</p>
            <h2>Ingredients</h2>
                <ul>
                    <li>item 1</li>
                    <li>item 2</li>
                    <li>item 3</li>
                    <li>item 4</li>
                </ul>
            <h2>Recipe Steps</h2>

                <ol>
                    <li> {steps[1].stepdescription}</li>
                    <li> {steps[3].stepdescription}</li>
                    <li> {steps[4].stepdescription}</li>
                    <li> {steps[5].stepdescription}</li>
                </ol>

        </div>
    )
};

 
export default View_Recipe;