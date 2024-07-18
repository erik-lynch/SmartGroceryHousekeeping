import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";


const View_Recipe = () => {

    const [steps, setSteps] = useState([]);

    const fetchSteps = () => {
        fetch('http://localhost:3001/api/recipes/1/steps')
        .then(response => {
            return response.json();
    })
    .then(data => {
        console.log(data);
        setSteps(data);
    })
    }

useEffect(() => {
    fetchSteps()}
    , []);


    return (
        <div class="core">
            <h1>
                Recipe Name Variable
            </h1>
            <p>Recipe Description</p>
            <h2>Ingredients</h2>
            <p>
                <ul>
                    <li>item 1</li>
                    <li>item 2</li>
                    <li>item 3</li>
                    <li>item 4</li>
                </ul>
            </p>
            <h2>Recipe Steps</h2>
            <p>
                <ol>
                    <li> step one instructions</li>
                    <li> step two instructions</li>
                    <li> step three instructions</li>
                    <li> step four instructions</li>
                </ol>
            </p>
        </div>
    );
};
 
export default View_Recipe;