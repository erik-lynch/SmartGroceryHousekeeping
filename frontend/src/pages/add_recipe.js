import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const Add_Recipe = () => {

    let { userId } = useParams();

    // for page loading
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
        //console.log('name:', itemData[i]);
        //console.log('value', e.target.value);
        itemData[i][e.target.name] = e.target.value;
        setRecipeItems((itemData))
    };
    
    // submission

    const handleSubmit = async (e) => {
        //prevent page from reloading
        e.preventDefault();
        async function inOrder() {
            var recipeId = await makeRecipe();
            var stepIdArr = await makeSteps();
            var linkrsdone = await linkRecipeSteps(recipeId, stepIdArr);
            var linkirdone = await linkItemsRecipe(recipeId);
            
            await wasCreated(recipeId, stepIdArr, linkrsdone, linkirdone);
        }

        async function makeRecipe() {
            // Add recipe to recipe table and get recipeId
            try {
                //console.log(recipeInfo)
                const recipeRes = await fetch("http://localhost:3001/api/add-recipe/recipe", {
                    method: "POST",
                    headers: {"Content-Type": "application/json",},
                    body: JSON.stringify(recipeInfo),
                });
                if (recipeRes.ok) {
                    var recipeResData = await recipeRes.json();
                    //console.log('recipeResData:', recipeResData[0]);
                    //console.log('recipeResDataid:', recipeResData[0].recipeid);
                    //setRecipeId(recipeResData[0].recipeid);
                    //setRecipeAdded(true);
                    return (recipeResData[0].recipeid)
                } else {
                    const errorJson = await recipeRes.json();
                    console.error("Failed to add recipe:", errorJson.error);
                    alert('Failed to add recipe. Perhaps recipe already exists? Try a new name.')
                }
                } catch (error) {
                console.error("Error submitting form:", error);
                }
        }
        
        async function makeSteps() {
            try {
                //get array of stepIds to later link to recipes
                //console.log(recipeSteps);
                var tempStepIdArr = [];
                for (let i=0; i < recipeSteps.length; i++) {
                    //console.log(recipeSteps[i]);
                    var stepRes = await fetch("http://localhost:3001/api/add-recipe/step", {
                        method: "POST",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(recipeSteps[i]),
                    })
        
                    if (stepRes.ok) {
                        var stepResData = await stepRes.json();
                        //console.log('stepResData:', stepResData[0]);
                        //console.log('stepResDataid:', stepResData[0].stepid);
                        tempStepIdArr.push(stepResData[0].stepid);
                    } else {
                        const errorJson = await stepRes.json();
                        console.error("Failed to add step:", errorJson.error);
                        alert('Failed to step.')
                    }
                };
                //setStepIdArr(tempStepIdArr);
                //setStepsAdded(true);
                return (tempStepIdArr)
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
        
        async function linkRecipeSteps(recipeId, stepIdArr) {
            try {
                for (let i=0; i < stepIdArr.length; i++) {
                    var jsonRecipeStepIds = {
                        stepId: stepIdArr[i],
                        recipeId: recipeId
                    };
        
                    var recipesstepsRes = await fetch("http://localhost:3001/api/add-recipe/recipessteps", {
                        method: "POST",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(jsonRecipeStepIds),
                    });
                    if (recipesstepsRes.ok) {
                        //console.log('succesfully added link for: ', jsonRecipeStepIds)
                    } else {
                        const errorJson = await recipesstepsRes.json();
                        console.error("Failed to add recipesstep link:", errorJson.error);
                        alert('Failed to add link for recipe and step: ', jsonRecipeStepIds)
                    }
                }
                //setRsAdded(true);
                return(true);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
            
        }
        
        async function linkItemsRecipe(recipeId) {
            try {
                //console.log(recipeItems);
                //console.log(recipeId);
                for (let i=0; i < recipeItems.length; i++) {
                    
                    var jsonItemsRecipesInfo = {
                        itemId: recipeItems[i].itemId,
                        recipeId: recipeId,
                        quantity: recipeItems[i].quantity,
                        quantityUnit: recipeItems[i].quantityUnit
                    };
        
                    var itemsRecipesRes = await fetch("http://localhost:3001/api/add-recipe/itemsrecipes", {
                        method: "POST",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(jsonItemsRecipesInfo),
                    });
                    if (itemsRecipesRes.ok) {
                        //console.log('succesfully added link for: ', jsonItemsRecipesInfo)
                    } else {
                        const errorJson = await itemsRecipesRes.json();
                        console.error("Failed to add itemsrecipess link:", errorJson.error);
                        alert('Failed to add link for recipe and item: ', jsonItemsRecipesInfo)
                    }
                }
                //setIrAdded(true);
                return(true);
            }
            catch (error) {
                console.error("Error submitting form:", error);
            }}
        
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
                console.log('error making recipe delete succesful tables')
                //todo delete steps, recipes, M:M tables needed that were succesful
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

        <div class="core">
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
                        class="recipe-text"
                    ></textarea><br/>
                <h3>Recipe Description:</h3>
                    <textarea 
                        id="recipeDescription" 
                        name="recipeDescription" 
                        value={recipeInfo.recipeDescription} 
                        onChange={handleRecipeInfoInputChange}
                        rows="4"
                        cols="55"
                        class="recipe-text"
                        ></textarea> <br/>
                <h3> Ingredients List:</h3>
                    {recipeItems.map((items, i) => {
                        return(
                            <div class="grid-recipe">

                                <div class = "grid-recipe-item">
                                    <label htmlFor="itemId">Name: </label><br/>
                                        <select  class="recipe-select-ingredient" id="itemId" name="itemId" size="2" value={items.itemId} onChange={e => handleRecipeItemsInputChange(i,e)}>
                                            <option value={-1}> Not selected</option>
                                            {allUserIdItems.map((newItems, i) => {
                                                return (
                                                    <option key={i} value={newItems.itemid}>{newItems.itemname}</option>
                                                )
                                            })};
                                        </select><br/>
                                </div>

                                <div class = "grid-recipe-quantity">
                                    <label htmlFor="quantity">Quantity: </label>
                                    <input class="recipe-quantity" type="text" id="quantity" name="quantity" value={items.quantity} onChange={e => handleRecipeItemsInputChange(i,e)}/><br/>
                                <div/>

                                <div class= "grid-recipe-measurement">
                                    <label htmlFor="quantityUnit">Measurement:</label>
                                        <select id="quantityUnit" name="quantityUnit"   class="recipe-select-measurement" value={items.quantityUnit} onChange={e => handleRecipeItemsInputChange(i,e)}>
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
                        <br/><div><button className="recipe-add-button" onClick={handleNewRecipeItem} >Add Ingredients</button></div><br/>

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
                                        class="recipe-text"
                                    ></textarea> <br/><br/>
                                </div>
                        )
                    })}
                    <div><button className="recipe-add-button" onClick={handleNewRecipeStep}>Add Steps</button></div><br/>
            </form>
            <div><button className="recipe-submit-button" onClick={handleSubmit}>Submit</button></div>
        </div>
    );
};
}

export default Add_Recipe;