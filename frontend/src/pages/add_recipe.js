import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const Add_Recipe = () => {

    let { userId } = useParams();

    // for page loading
    const [allUserIdItems, setAllUserIdItems] = useState([]);
    const [pageError, setPageError] = useState(false);
    const [loading0, setLoading0] = useState(true);

    
    const [recipeId, setRecipeId] = useState([]);
    const [stepIdArr, setStepIdArr] = useState([]);

    const [recipeAdded, setRecipeAdded]= useState(false);
    const [stepsAdded, setStepsAdded]= useState(false);
    const [rsAdded, setRsAdded]= useState(false);
    const [irAdded, setIrAdded]= useState(false);


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
        itemId: 1,
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
            itemId: 1,
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
        itemData[i][e.target.name] = e.target.value;
        setRecipeItems((itemData))
    };
    
    // submission

    const handleSubmit = async (e) => {
        //prevent page from reloading
        e.preventDefault();
        
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
                console.log('recipeResData:', recipeResData[0]);
                console.log('recipeResDataid:', recipeResData[0].recipeid);
                setRecipeId(recipeResData[0].recipeid);
                setRecipeAdded(true);
            } else {
                const errorJson = await recipeRes.json();
                console.error("Failed to add recipe:", errorJson.error);
                alert('Failed to add recipe. Perhaps recipe already exists? Try a new name.')
            }
            } catch (error) {
            console.error("Error submitting form:", error);
            }
            
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
                setStepIdArr(tempStepIdArr);
                setStepsAdded(true);
            } catch (error) {
                console.error("Error submitting form:", error);
            }
            
            try {
                if (recipeAdded && stepsAdded) {
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
                        console.log('succesfully added link for: ', jsonRecipeStepIds)
                    } else {
                        const errorJson = await recipesstepsRes.json();
                        console.error("Failed to add recipesstep link:", errorJson.error);
                        alert('Failed to add link for recipe and step: ', jsonRecipeStepIds)
                    }
                }
                setRsAdded(true);
            }
            } catch (error) {
                console.error("Error submitting form:", error);
            }
            
            
            try {
                if (recipeAdded) {
                console.log(recipeItems);
                console.log(recipeId);
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
                        console.log('succesfully added link for: ', jsonItemsRecipesInfo)
                    } else {
                        const errorJson = await itemsRecipesRes.json();
                        console.error("Failed to add itemsrecipess link:", errorJson.error);
                        alert('Failed to add link for recipe and item: ', jsonItemsRecipesInfo)
                    }
                }
                setIrAdded(true);
            }
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        

            if (recipeAdded || stepsAdded || rsAdded || irAdded) {
                alert('Recipe Added succesfully');
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
                <h3>Recipe Name:</h3>
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
                                        <select  class = "no-style-select" id="itemName" name="itemName" size="2" value={items.itemid} onChange={e => handleRecipeItemsInputChange(i,e)}>
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
                        <br/><div><button className="recipe-button" onClick={handleNewRecipeItem} >Add More Ingredients</button></div><br/>

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
                                        cols="50"
                                    ></textarea> <br/><br/>
                                </div>
                        )
                    })}
                    <div><button className="recipe-button" onClick={handleNewRecipeStep}>Add More Steps</button></div><br/><br/>
            </form>
            <div><button className="recipe-button" onClick={handleSubmit}>Submit</button></div><br/><br/><br/>

        </div>
    );
};
}

export default Add_Recipe;