import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";



 
const Add_Recipe = () => {

    let { userId } = useParams();
    const [allUserIdItems, setAllUserIdItems] = useState([]);
    const [pageError, setPageError] = useState(false);
    const [loading0, setLoading0] = useState(true);

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

    useEffect(() => {
        const fetchAllUserIdItems = async () => {
            try {
                setLoading0(true);
                const allUserIdItemsRes  = await fetch(`http://localhost:3001/api/users/${userId}/items`);
                const allUserIdItemsData = await allUserIdItemsRes.json();
                setAllUserIdItems(allUserIdItemsData);
                setLoading0(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }
    
        fetchAllUserIdItems();
    }, [userId]);


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
        //prevent page from reloading
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

        if (loading0) {
            return (<p>Loading</p>)
        };
    
        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {
    return (

        <div class="core">
            <h2>Add a Recipe to the Cookbook</h2>
            <form onSubmit={handleSubmit}>
                <h3>Recipe Name</h3>
                    <textarea 
                        id="recipeName" 
                        name="recipeName" 
                        value={recipeInfo.recipeName} 
                        onChange={handleRecipeInfoInputChange}
                        rows="2"
                        cols="50"
                    ></textarea><br/>
                <h3>Recipe Description:</h3>
                    <textarea 
                        id="recipeDescription" 
                        name="recipeDescription" 
                        value={recipeInfo.recipeDescription} 
                        onChange={handleRecipeInfoInputChange}
                        rows="4"
                        cols="50"
                        ></textarea> <br/>
                <h3> Ingredients List:</h3>
                    {recipeItems.map((items, i) => {
                        return(
                            <div class="grid-recipe">

                                <div class = "grid-recipe-item">
                                    <label htmlFor="itemName">Name: </label><br/>
                                        <select  class = "no-style-select" id="itemName" name="itemName" size="2" value={items.itemName} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                            {allUserIdItems.map((newItems, i) => {
                                                return (
                                                    <option key={i} value={newItems.itemid}>{newItems.itemname}</option>
                                                )
                                            })};
                                        </select><br/>
                                </div>

                                <div class = "grid-recipe-quantity">
                                    <label htmlFor="quantity">Quantity: </label>
                                    <input type="text" id="quantity" name="quantity" value={items.quantity} onChange={e => handleRecipeItemsInputChange(i,e)}/><br/>
                                <div/>

                                <div class= "grid-recipe-measurement">
                                    <label htmlFor="quantityUnit">Measurement:</label>
                                        <select id="quantityUnit" name="quantityUnit"   value={items.quantityUnit} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                            <option value="">No Unit</option>
                                            <option value="tsp">Teaspoon/Teaspoons</option>
                                            <option value="tbsp">Tablespoon/Tablespoons</option>
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

                            </div>
                            </div>
                        )
                    })}
                        <br/><div><button onClick={handleNewRecipeItem} >Add More Ingredients</button></div><br/>
                        <br/><br/>
                        <h3>Directions:</h3>
                        {recipeSteps.map((steps, i) => {
                            return(
                                <div>
                                    <label htmlFor="stepDescription">Step {i+1} :</label><br/><br/>
                                    <textarea
                                        id="stepDescription" 
                                        name="stepDescription"
                                        value={steps.stepDescription} 
                                        onChange={e => handleRecipeStepsInputChange(i,e)}
                                        rows="3"
                                        cols="50"
                                    ></textarea> <br/><br/>
                                </div>
                        )
                    })}
                    <div><button onClick={handleNewRecipeStep}>Add More Steps</button></div><br/><br/><br/>
            </form>
            <div><button>Submit</button></div><br/><br/><br/>
        </div>
    );
};
}

//<label htmlFor="recipeName">Recipe name:</label><br/><br/>
//<label htmlFor="recipeDescription">Recipe Description:</label><br/><br/>
//<label htmlFor="Ingredients">Ingredients List:</label><br/><br/>
//<label htmlFor="Steps">Directions:</label><br/><br/>
export default Add_Recipe;