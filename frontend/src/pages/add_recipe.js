import React from "react";
import{ useState } from 'react';

 
const Add_Recipe = () => {

    // States

    const [stepFormNumber, setStepFormNumber] = useState(1);

    const [recipeInfo, setRecipeInfo] = useState({
        recipeName: "",
        recipeDescription: "",
    });

    const [recipeSteps, setRecipeSteps] = useState([{
        stepNumber: stepFormNumber,
        stepDescription: ""
    }]);

    const [recipeItems, setRecipeItems] = useState([{
        itemName: "",
        quantity: 1,
        quantityUnit: ""
    }]);

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

    const handleRecipeStepsInputChange = (i,e) => {
        let stepData = [...recipeSteps];
        stepData[i][e.target.name] = e.target.value;
        setRecipeSteps(stepData)
    };

    const handleRecipeItemsInputChange = (i,e) => {
        let itemData = [...recipeItems];
        itemData[i][e.target.name] = e.target.value;
        setRecipeItems(itemData)
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
                        ></textarea> <br/><br/><br/>

                        {recipeItems.map((items, i) => {
                            return(
                                <div>
                                    <label htmlFor="Ingredients">Ingredients List:</label><br/><br/>
                                    <label htmlFor="quantityUnit">Name: </label>
                                    <input type="text" />
                                    <label htmlFor="quantityUnit">Quantity: </label>
                                    <input type="text" id="quantity" name="quantity" value={items.quantity} onChange={e => handleRecipeItemsInputChange(i,e)}/>
                                    <label htmlFor="quantityUnit">Measurement:</label>
                                    <select id="quantityUnit" name="quantityUnit" value={items.quantityUnit} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                        <option value="">No Unit</option>
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
                                </div>
                            )
                        })}
                        <br/><div><button>Add Ingredient</button></div><br/><br/>
                        <br/><br/>
                        {recipeSteps.map((steps, i) => {
                            return(
                                <div>
                                    <label htmlFor="Steps">Directions:</label><br/><br/>
                                    <label htmlFor="stepDescription">Step {i+1} :</label><br/><br/>
                                    <textarea
                                        id="stepDescription" 
                                        name="stepDescription"
                                        value={steps.stepDescription} 
                                        onChange={e => handleRecipeStepsInputChange(i,e)}
                                    ></textarea> <br/><br/>
                                </div>
                        )
                    })}
                    <div><button>Add Step</button></div><br/><br/><br/>
                </form>
                <div><button>Submit</button></div><br/><br/><br/>
        </div>
    );
};

export default Add_Recipe;