import React from "react";
import{ useState } from 'react';

 
const Add_Recipe = () => {

    // States

    const [stepFormNumber, setStepFormNumber] = useState(1);

    const [recipeInfo, setRecipeInfo] = useState({
        recipeName: "",
        recipeDescription: "",
    });

    const [recipeSteps, setRecipeSteps] = useState({
        stepNumber: stepFormNumber,
        stepDescription: ""
    });

    const [recipeItems, setRecipeItems] = useState({
        itemName: "",
        quantity: 1,
        quantityUnit: ""
    });

    // Add new fields (steps and items)

    const handleNewRecipeStep = async(e) => {
        setStepFormNumber(stepFormNumber + 1);
        let newStep = {
            stepNumber: stepFormNumber,
            stepDescription: ""
        };
        setRecipeSteps([...recipeSteps, newStep]);
    };

    const handleNewRecipeItem = async(e) => {
        let newItem = {
            itemName: "",
            quantity: 1,
            quantityUnit: ""
        };
        setRecipeItems([...recipeItems, newItem]);
    };

    // input change handlers

    const handleRecipeInfoInputChange = (e) => {
        const { name, value } = e.target;
        setRecipeInfo({ ...recipeInfo, [name]: value });
    };

    const handleRecipeStepsInputChange = (i, e) => {
        const { name, value } = e.target;
        setRecipeSteps({ ...recipeSteps[i], [name]: value });
    };

    const handleRecipeItemsInputChange = (i, e) => {
        const { name, value } = e.target;
        setRecipeItems({ ...recipeItems[i], [name]: value });
    };
    
    // submission

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeInfoToSend = {
            recipeInfo,
            ...recipeSteps,
            ...recipeItems
        };

        try {
            const response = await fetch("http://localhost:3001/api/add-recipe", {
                method: "POST",
                headers: {
            "Content-Type": "application/json",
                },
            body: JSON.stringify(recipeInfoToSend),
            });
        
            if (response.ok) {
                console.log("Recipe added successfully");
                if (recipeInfoToSend.recipeInfo.recipeName) {
                    alert(`Recipe added sucessfully ${recipeInfoToSend.recipeInfo.recipeName}`);
                }
            } else {
                const errorText = await response.text();
                console.error("Failed to add recipe:", errorText);
                alert('Failed to add recipe:', errorText)
            }
            } catch (error) {
            console.error("Error submitting form:", error);
            }
        };

    return (
        <div class="core">
            <h2>Add a Recipe to the Cookbook</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="recipeName">Recipe name:</label><br/><br/>
                        <textarea 
                        id="recipeName" 
                        name="recipeName" 
                        value={recipeInfo.recipeName} 
                        onChange={handleRecipeInfoInputChange}
                        ></textarea> <br/><br/>
                    <label htmlFor="recipeDescription">Recipe Description:</label><br/><br/>
                    <textarea 
                        id="recipeDescription" 
                        name="recipeDescription" 
                        value={recipeInfo.recipeDescription} 
                        onChange={handleRecipeInfoInputChange}
                        ></textarea> <br/><br/>
                    <label htmlFor="quantityUnit">Item Measurement Unit:</label> <br />
                        <select id="quantityUnit" name="quantityUnit" value={recipeItems.quantityUnit} onChange={handleRecipeItemsInputChange}>
                            <option value=""></option>
                            <option value="tsp">Teaspoon</option>
                            <option value="tbsp">Tablespoon</option>
                            <option value="cup">Cup</option>
                            <option value="cups">Cups</option>
                            <option value="qt">Quart/Quarts</option>
                            <option value="gal">Gallon/Gallons</option>
                            <option value="oz">Ounce/Ounces</option>
                            <option value="lb">Pound/Pounds</option>
                            <option value="fl oz">Fluid Ounce/Ounces</option>
                            <option value="mL">Milliliter/Milliliters</option>
                            <option value="L">Liter/Liters</option>
                            <option value="g">Gram/Grams</option>
                            <option value="kg">Kilogram/Kilograms</option>
                        </select>
                </form>
        </div>
    );
};
 
export default Add_Recipe;