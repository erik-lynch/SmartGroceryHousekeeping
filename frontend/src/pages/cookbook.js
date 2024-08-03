import React from "react";
import{ useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

const Cookbook = () => {

        let { userId } = useParams();
        const navigate = useNavigate();

        const [allRecipes, setAllRecipes] = useState([]);
        const [pageError, setPageError] = useState(false);
        const [loading0, setLoading0] = useState(true);
    
        useEffect(() => {
    
        const fetchAllUserRecipes = async () => {
            try {
                setLoading0(true);
                const recipesRes  = await fetch(`http://localhost:3001/api/users/${userId}/recipes/all`);
                const recipesData = await recipesRes.json();
                //console.log(recipesData)
                setAllRecipes(recipesData);
                setLoading0(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }
        
        fetchAllUserRecipes();
        }, [userId]);
        
        const handleViewRecipe = async (recipeId) => {
            //console.log('view recipe recipeId:', recipeId);
            navigate(`/users/${userId}/recipes/${recipeId}/view_recipe`);
        };

        const handleDeleteRecipe = async (recipeId) => {
            async function deleteInOrder() {
                var allItemsRecipes = await getAllItemsRecipes(recipeId);
                var allSteps = await getAllSteps(recipeId);
                var itemsRecipesDeleted = await deleteAllItemsRecipes(allItemsRecipes);
                var stepsDeleted = await deleteAllSteps(allSteps);
                var recipeDeleted = await deleteRecipe(recipeId, itemsRecipesDeleted, stepsDeleted);
                await deletedRecipeSuccess(recipeDeleted, itemsRecipesDeleted, stepsDeleted);
            }
            
            async function getAllItemsRecipes(recipeId) {
                try {
                    const itemsRecipesRes = await fetch(`http://localhost:3001/api/delete-recipe/${recipeId}/itemsrecipes`, {
                        method: "GET",
                        headers: {"Content-Type": "application/json",}
                    });
                    if (itemsRecipesRes.ok) {
                        var itemsRecipesData = await itemsRecipesRes.json();
                        //console.log('itemsrecipes id data:', itemsRecipesData);
                        //console.log('itemsrecipes id list:', itemsRecipesData[0]);
                        return (itemsRecipesData[0]);
                } else {
                    const itemsRecipesErrorJson = await itemsRecipesRes.json();
                    console.error("Failed to get itemsRecipes:", itemsRecipesErrorJson.error);
                }
                } catch (error) {
                console.error("Failed in catch for get itemsRecipes", error);
                }
            }

            async function getAllSteps(recipeId) {
                try {
                    const stepsRes = await fetch(`http://localhost:3001/api/delete-recipe/${recipeId}/recipessteps`, {
                        method: "GET",
                        headers: {"Content-Type": "application/json",}
                    });
                    if (stepsRes.ok) {
                        var stepsData = await stepsRes.json();
                        //console.log('steps id data:', stepsData);
                        //console.log('steps id list:', stepsData[0]);
                        return (stepsData[0]);
                } else {
                    const stepErrorJson = await stepsRes.json();
                    console.error("Failed to get steps:", stepErrorJson.error);
                }
                } catch (error) {
                console.error("Failed in catch for get steps", error);
                }
            }

            async function deleteAllItemsRecipes(allItemsRecipes) {
                try {
                    const deleteIRRes = await fetch(`http://localhost:3001/api/delete-recipe/itemsrecipes`, {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(allItemsRecipes),
                    });
                    if (deleteIRRes.ok) {
                        //console.log("deleted IR ids:", allItemsRecipes)
                        return (true);
                } else {
                    const deleteIRErrorJson = await deleteIRRes.json();
                    console.error("Failed to delete itemsrecipes:", deleteIRErrorJson.error);
                    return(false);
                }
                } catch (error) {
                console.error("Failed in catch for get delete Items Recipes", error);
                }

            }

            async function deleteAllSteps(allSteps) {
                try {
                    const deleteStepsRes = await fetch(`http://localhost:3001/api/delete-recipe/steps`, {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify(allSteps),
                    });
                    if (deleteStepsRes.ok) {
                        //console.log("deleted Steps ids:", allSteps)
                        return (true);
                } else {
                    const deleteStepsErrorJson = await deleteStepsRes.json();
                    console.error("Failed to delete Steps:", deleteStepsErrorJson.error);
                    return(false);
                }
                } catch (error) {
                console.error("Failed in catch for get delete Steps", error);
                }

            }

            async function deleteRecipe(recipeId, allItemsRecipes, allSteps) {
                try {
                    const deleteRecipeRes = await fetch(`http://localhost:3001/api/delete-recipe/recipe`, {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json",},
                        body: JSON.stringify({recipeId: recipeId}),
                    });
                    if (deleteRecipeRes.ok) {
                        //console.log("deleted recipeid:", recipeId)
                        return (true);
                } else {
                    const deleteRecipeErrorJson = await deleteRecipeRes.json();
                    console.error("Failed to delete Recipe:", deleteRecipeErrorJson.error);
                    return(false);
                }
                } catch (error) {
                console.error("Failed in catch for delete Recipe", error);
                }

            }

            async function deletedRecipeSuccess(recipeDeleted, itemsRecipesDeleted, stepsDeleted) {
                if (recipeDeleted && itemsRecipesDeleted && stepsDeleted) {
                    //console.log('succesfully deleted recipe');
                    window.location.reload();
                }
                else {
                    console.log('recipe was not succesfully deleted');
                    alert('recipe was not deleted succesfully');
                }
            }

            deleteInOrder();
    
        };

        if (loading0) {
            return (<p>Loading</p>)
        };
    
        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        
        else {

    return (
        <div class="core">
            <h2>
                Cookbook
            </h2>

            <br></br>

            <div className="table-overflow">
            <table>
                <tr class="header-row">
                    <th>Name</th>
                    <th>Description</th>
                    <th></th>
                    <th></th>
                </tr>
                <br></br>
                {allRecipes.map((recipeData) => {
                    return (
                <tr key={recipeData.recipeid}>
                    <td>{recipeData.recipename}</td>
                    <td>{recipeData.recipedescription}</td>
                    <td><button onClick={() => handleViewRecipe(recipeData.recipeid)}>View</button></td>
                    <td><button onClick={() => handleDeleteRecipe(recipeData.recipeid)}>Delete</button></td>
                </tr>
                    )})}
            </table>
            </div>
        </div>
    );
};
};
 
export default Cookbook;