import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import handleDeleteRecipe from "../components/Functions/handleDeleteRecipe";

const Add_Recipe = () => {

    let { userId } = useParams();

    // for page loading
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const [allUserIdItems, setAllUserIdItems] = useState([]);
    const [pageError, setPageError] = useState(false);
    const [loading0, setLoading0] = useState(true);

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
        const fetchAllUserIdItems = async () => {
            try {
                setLoading0(true);
                const allUserIdItemsRes  = await fetch(`${API_URL}/api/users/${userId}/items`);
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
        e.preventDefault();
        const newCount = stepFormNumber + 1;
        setStepFormNumber(newCount);
        let newStep = {
            stepNumber: stepFormNumber + 1,
            stepDescription: ""
        };
        setRecipeSteps([...recipeSteps, newStep]);
    };

    const handleNewRecipeItem = async(e) => {
        e.preventDefault();
        let newItem = {
            itemId: -1,
            quantity: '1',
            quantityUnit: ""
        };
        setRecipeItems([...recipeItems, newItem]);
    };

    // handle remove (steps and items)

    const handleDeleteRecipeStep = async(e) => {
        e.preventDefault();
        //must have at least 1 step
        if (recipeSteps.length > 1) {
            const newCount = stepFormNumber - 1;
            setStepFormNumber(newCount);
            recipeSteps.splice(-1);
            setRecipeSteps([...recipeSteps]);
        }
    };

    const handleDeleteRecipeItem = async(i, e) => {
        e.preventDefault();
        //must have at least 1 item
        if (recipeItems.length > 1) {
            recipeItems.splice(i, 1);
            setRecipeItems([...recipeItems]);
        }
    };

    // input change handlers

    const handleRecipeInfoInputChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        setRecipeInfo({ ...recipeInfo, [name]: value });
    };

    const handleRecipeStepsInputChange = (i,e) => {
        e.preventDefault();
        let stepData = [...recipeSteps];
        stepData[i][e.target.name] = e.target.value;
        setRecipeSteps(stepData)
    };

    const handleRecipeItemsInputChange = (i,e) => {
        e.preventDefault();
        let itemData = [...recipeItems];
        itemData[i][e.target.name] = e.target.value;
        setRecipeItems((itemData))
    };
    
    // submission

    const handleSubmit = async (e) => {
        //prevent page from reloading
        e.preventDefault();
        async function inOrder() {
            var recipeId = await makeRecipe();

            // first value arr second bool for stepIdArr
            var stepIdArr = await makeSteps(recipeId);
            var linkrsdone = await linkRecipeSteps(recipeId, stepIdArr);
            var linkirdone = await linkItemsRecipe(recipeId);
            
            await wasCreated(recipeId, stepIdArr, linkrsdone, linkirdone);
        }

        async function makeRecipe() {
            // Add recipe to recipe table and get recipeId
            try {
                const recipeRes = await fetch(`${API_URL}/api/add-recipe/recipe`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify(recipeInfo),
                });
                if (recipeRes.ok) {
                    var recipeResData = await recipeRes.json();
                    return (recipeResData[0].recipeid)
                } else {
                    const errorJson = await recipeRes.json();
                    console.error("Failed to add recipe:", errorJson.message);
                    alert(`${errorJson.message}`);
                    return(false);
                }
                } catch (error) {
                console.error("Error submitting form:", error);
                }
        }
        
        async function makeSteps(recipeId) {
            if (recipeId) {
            try {
                //get array of stepIds to later link to recipes
                var tempStepIdArr = [];
                for (let i=0; i < recipeSteps.length; i++) {
                    var stepRes = await fetch(`${API_URL}/api/add-recipe/step`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(recipeSteps[i]),
                    })
        
                    if (stepRes.ok) {
                        var stepResData = await stepRes.json();
                        tempStepIdArr.push(stepResData[0].stepid);
                    } else {
                        const errorJson = await stepRes.json();
                        console.error("Failed to add step:", errorJson.message);
                        alert(`${errorJson.message}`);
                        return ([tempStepIdArr, false]);
                    }
                };
                return ([tempStepIdArr, true]);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        else {
            return([false, false]);
        }
    }
        
        async function linkRecipeSteps(recipeId, stepIdArr) {
            if (recipeId && stepIdArr[1]) {
                try {
                    for (let i=0; i < stepIdArr[0].length; i++) {
                        var jsonRecipeStepIds = {
                            stepId: stepIdArr[0][i],
                            recipeId: recipeId
                        };
                        var recipesstepsRes = await fetch(`${API_URL}/api/add-recipe/recipessteps`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json",},
                            body: JSON.stringify(jsonRecipeStepIds),
                        });
                        if (recipesstepsRes.ok) {
                            continue;
                        } else {
                            const errorJson = await recipesstepsRes.json();
                            console.error("Failed to add recipesstep link:", errorJson.error);
                            return(false)
                        }
                    }
                    return(true);
                } catch (error) {
                    console.error("Error submitting form:", error);
                }
            }
            else {
                return(false);
            }    
        }
        
        async function linkItemsRecipe(recipeId) {
            if (recipeId && recipeItems) {
                try {
                    for (let i=0; i < recipeItems.length; i++) {
                        
                        var jsonItemsRecipesInfo = {
                            itemId: recipeItems[i].itemId,
                            recipeId: recipeId,
                            quantity: recipeItems[i].quantity,
                            quantityUnit: recipeItems[i].quantityUnit
                        };
            
                        var itemsRecipesRes = await fetch(`${API_URL}/api/add-recipe/itemsrecipes`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json",},
                            body: JSON.stringify(jsonItemsRecipesInfo),
                        });
                        if (itemsRecipesRes.ok) {
                            continue;
                        } else {
                            const errorJson = await itemsRecipesRes.json();
                            console.error("Failed to add itemsrecipess link:", errorJson.error);
                            alert(`${errorJson.message}`);
                            return(false);
                        }
                    }
                    return(true);
                }
                catch (error) {
                    console.error("Error submitting form:", error);
                }}
            else {
                console.log("recipe id or recipeItems were false");
                return(false);
            }
        }

        async function wasCreated(recipeId, stepIdArr, linkrsdone, linkirdone) {
            if (recipeId && stepIdArr && linkrsdone && linkirdone) {
                alert('Recipe added succesfully');

                // clear out saved info
                setRecipeInfo({recipeName: "", recipeDescription: "",});
                setRecipeItems([{itemId: -1, quantity: '1', quantityUnit: ""}]);
                setStepFormNumber(1);
                setRecipeSteps([{stepNumber: 1, stepDescription: ""}]);

                const recipeForm = document.getElementById("recipeAddForm");
                recipeForm.reset();
            }
            else { 
                if (recipeId) {
                    const deleteRecipeIdSuccess = handleDeleteRecipe(recipeId, stepIdArr);
                    if (deleteRecipeIdSuccess){
                        console.log('Error Making recipe. Succesfully deleted all recipe associated data');
                    }
                    else{
                        console.log('Error making recipe . Did not sucesfully deleted all recipe associated data');
                    }
                }
            }
        }

        inOrder();

    };


        if (loading0) {
            return (<p>Loading</p>)
        };
    
        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {
    return (

        <div className="additem-core">
            <div className="section-content">
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
                        
                    ></textarea><br/>
                <h3>Recipe Description:</h3>
                    <textarea 
                        id="recipeDescription" 
                        name="recipeDescription" 
                        value={recipeInfo.recipeDescription} 
                        onChange={handleRecipeInfoInputChange}
                        rows="4"
                        cols="55"
                        
                        ></textarea> <br/>
                <h2> Ingredients List:</h2>
                    {recipeItems.map((items, i) => {
                        return(
                            <div className="grid-recipe">
                                

                                <div className = "grid-recipe-item">
                                    <label htmlFor="itemId">Ingredient Name:</label><br/>
                                        <select  className="recipe-select-ingredient" id="itemId" name="itemId" size="2" value={items.itemId} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                            <option value={-1}> Not selected</option>
                                            {allUserIdItems.map((newItems, k) => {
                                                return (
                                                    <option key={k} value={newItems.itemid}>{newItems.itemname}</option>
                                                )
                                            })};
                                        </select><br/>
                                </div>
                                <div className="grid-recipe-delete">
                                    <button className="recipe-delete-item-button" onClick={e => handleDeleteRecipeItem(i,e)}>X</button>
                                </div>
                                <div className = "grid-recipe-quantity">
                                    <label htmlFor="quantity">Quantity: </label>
                                    <input className="recipe-quantity" type="text" id="quantity" name="quantity" value={items.quantity} onChange={e => handleRecipeItemsInputChange(i,e)}/><br/>
                                </div>

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
                            
                        )
                    })}
                        <div><button className="recipe-add-button" onClick={handleNewRecipeItem} >Add Ingredient</button></div>

                        <h2>Directions:</h2>
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
                                        cols="500"
                                        
                                    ></textarea>
                                </div>
                                
                        )
                    })}
                    <div>
                        <button className="recipe-add-button" onClick={handleNewRecipeStep}>Add Step</button>
                        <button className="recipe-delete-step-button" onClick={handleDeleteRecipeStep}>Remove Step</button>
                    </div>
            </form>
            <div><button className="recipe-submit-button" onClick={handleSubmit}>Submit</button></div>
        </div>
        </div>
    );
};
}

export default Add_Recipe;