import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../services/auth";
import handleDeleteRecipe from "../components/Functions/handleDeleteRecipe";


const Add_Recipe = () => {
    // for page loading
    const [allUserItems, setAllUserItems] = useState([]);
    const [pageError, setPageError] = useState(false);
    const [loading, setLoading] = useState(true);

    // step counter
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
        itemId: -1,
        quantity: '1',
        quantityUnit: ""
    }]);

    useEffect(() => {
        const fetchAllUserItems = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/items');
                setAllUserItems(response.data);
                setLoading(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error.message);
                setLoading(false);
            }
        }
    
        fetchAllUserItems();
    }, []);

    // Add new fields (steps and items)

    const handleNewRecipeStep = (e) => {
        e.preventDefault();
        const newCount = stepFormNumber + 1;
        setStepFormNumber(newCount);
        let newStep = {
            stepNumber: newCount,
            stepDescription: ""
        };
        setRecipeSteps([...recipeSteps, newStep]);
    };

    const handleNewRecipeItem = (e) => {
        e.preventDefault();
        let newItem = {
            itemId: -1,
            quantity: '1',
            quantityUnit: ""
        };
        setRecipeItems([...recipeItems, newItem]);
    };

    // handle remove (steps and items)

    const handleDeleteRecipeStep = (e) => {
        e.preventDefault();
        if (recipeSteps.length > 1) {
            const newCount = stepFormNumber - 1;
            setStepFormNumber(newCount);
            setRecipeSteps(recipeSteps.slice(0, -1));
        }
    };

    const handleDeleteRecipeItem = (i, e) => {
        e.preventDefault();
        if (recipeItems.length > 1) {
            setRecipeItems(recipeItems.filter((_, index) => index !== i));
        }
    };

    // input change handlers

    const handleRecipeInfoInputChange = (e) => {
        const { name, value } = e.target;
        setRecipeInfo({ ...recipeInfo, [name]: value });
    };

    const handleRecipeStepsInputChange = (i, e) => {
        let stepData = [...recipeSteps];
        stepData[i][e.target.name] = e.target.value;
        setRecipeSteps(stepData);
    };

    const handleRecipeItemsInputChange = (i, e) => {
        let itemData = [...recipeItems];
        itemData[i][e.target.name] = e.target.value;
        setRecipeItems(itemData);
    };
    
    // submission

    const handleSubmit = async (e) => {
        e.preventDefault();
        let recipeId;
        try {
            // Add recipe
            const recipeRes = await axiosInstance.post('/api/add-recipe/recipe', recipeInfo);
            recipeId = recipeRes.data.recipeid;
    
            // Add steps
            const stepIds = await Promise.all(recipeSteps.map(async (step) => {
                const res = await axiosInstance.post('/api/add-recipe/step', step);
                if (!res.data || !res.data[0] || !res.data[0].stepid) {
                    throw new Error(`Invalid response from step creation: ${JSON.stringify(res.data)}`);
                }
                return res.data[0].stepid;
            }));
    
            // Link steps to recipe
            await Promise.all(stepIds.map(stepId => 
                axiosInstance.post('/api/add-recipe/recipessteps', { recipeId, stepId })
            ));
    
            // Link items to recipe
            await Promise.all(recipeItems.filter(item => item.itemId !== -1).map(item => 
                axiosInstance.post('/api/add-recipe/itemsrecipes', { ...item, recipeId })
            ));
    
            alert('Recipe added successfully');
    
            // Reset form
            setRecipeInfo({recipeName: "", recipeDescription: ""});
            setRecipeItems([{itemId: -1, quantity: '1', quantityUnit: ""}]);
            setStepFormNumber(1);
            setRecipeSteps([{stepNumber: 1, stepDescription: ""}]);
            document.getElementById("recipeAddForm").reset();
    
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(error.message || "An error occurred while adding the recipe");
            if (recipeId) {
                try {
                    await handleDeleteRecipe(recipeId);
                } catch (deleteError) {
                    console.error("Error deleting partial recipe:", deleteError);
                }
            }
        }
    };

    if (loading) {
        return <p>Loading</p>;
    }

    if (pageError) {
        return <h1>There was an error: {pageError}</h1>;
    }
    return (

        <div className="core">
            <h2>Add a Recipe to the Cookbook</h2>
            <form id="recipeAddForm" onSubmit={handleSubmit}>
                <h3>Recipe Name:</h3>
                    <textarea 
                        id="recipeName" 
                        name="recipeName" 
                        value={recipeInfo.recipeName} 
                        onChange={handleRecipeInfoInputChange}
                        rows="2"
                        cols="55"
                        className="recipe-text"
                    ></textarea><br/>
                <h3>Recipe Description:</h3>
                    <textarea 
                        id="recipeDescription" 
                        name="recipeDescription" 
                        value={recipeInfo.recipeDescription} 
                        onChange={handleRecipeInfoInputChange}
                        rows="4"
                        cols="55"
                        className="recipe-text"
                        ></textarea> <br/>
                <h3> Ingredients List:</h3>
                    {recipeItems.map((items, i) => {
                        return(
                            <div className="grid-recipe">

                                <div className = "grid-recipe-item">
                                    <label htmlFor="itemId">Name: </label><br/>
                                        <select  className="recipe-select-ingredient" id="itemId" name="itemId" size="2" value={items.itemId} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                            <option value={-1}> Not selected</option>
                                            {allUserItems.map((newItems, k) => {
                                                return (
                                                    <option key={k} value={newItems.itemid}>{newItems.itemname}</option>
                                                )
                                            })};
                                        </select><br/>
                                </div>
                                
                                <div className = "grid-recipe-quantity">
                                    <label htmlFor="quantity">Quantity: </label>
                                    <button className="recipe-delete-item-button" onClick={e => handleDeleteRecipeItem(i,e)}>X</button>
                                    <input className="recipe-quantity" type="text" id="quantity" name="quantity" value={items.quantity} onChange={e => handleRecipeItemsInputChange(i,e)}/><br/>
                                <div/>

                                <div className= "grid-recipe-measurement">
                                    <label htmlFor="quantityUnit">Measurement:</label>
                                        <select id="quantityUnit" name="quantityUnit"   className="recipe-select-measurement" value={items.quantityUnit} onChange={e => handleRecipeItemsInputChange(i,e)}>
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
                        <br/><div><button className="recipe-add-button" onClick={handleNewRecipeItem} >Add Ingredient</button></div><br/>

                        <h3>Directions:</h3>
                        {recipeSteps.map((steps, i) => {
                            return(
                                <div>
                                    <label htmlFor="stepDescription">Step {steps.stepNumber} :</label><br/><br/>
                                    <textarea
                                        id="stepDescription" 
                                        name="stepDescription"
                                        value={steps.stepDescription} 
                                        onChange={e => handleRecipeStepsInputChange(i,e)}
                                        rows="3"
                                        cols="55"
                                        className="recipe-text"
                                    ></textarea> <br/><br/>
                                </div>
                                
                        )
                    })}
                    <div><button className="recipe-add-button" onClick={handleNewRecipeStep}>Add Step</button>
                    <button className="recipe-delete-step-button" onClick={handleDeleteRecipeStep}>Remove Step</button></div><br/>
            </form>
            <div><button className="recipe-submit-button" onClick={handleSubmit}>Submit</button></div>
        </div>
    );
};


export default Add_Recipe;