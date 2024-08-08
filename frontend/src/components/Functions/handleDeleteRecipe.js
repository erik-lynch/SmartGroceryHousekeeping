async function handleDeleteRecipe(recipeId, stepIdArr) {

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
            const itemsRecipesRes = await fetch(`${API_URL}/api/delete-recipe/${recipeId}/itemsrecipes`, {
                method: "GET",
                headers: {"Content-Type": "application/json",}
            });
            if (itemsRecipesRes.ok) {
                var itemsRecipesData = await itemsRecipesRes.json();
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
            const stepsRes = await fetch(`${API_URL}/api/delete-recipe/${recipeId}/recipessteps`, {
                method: "GET",
                headers: {"Content-Type": "application/json",}
            });
            if (stepsRes.ok) {
                var stepsData = await stepsRes.json();
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
            const deleteIRRes = await fetch(`${API_URL}/api/delete-recipe/itemsrecipes`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify(allItemsRecipes),
            });
            if (deleteIRRes.ok) {
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
        if (!stepIdArr[1]) {
            var string_val = "";
            for (let i=0; i < stepIdArr[0].length; i++) {
                string_val = string_val + "'" + stepIdArr[0][i] + "'";
                if (i < stepIdArr[0].length-1) {
                    string_val = string_val + ", ";
                }
            }
            allSteps = {stepidlist: string_val};
          }
        try {
            const deleteStepsRes = await fetch(`${API_URL}/api/delete-recipe/steps`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify(allSteps),
            });
            if (deleteStepsRes.ok) {
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
            const deleteRecipeRes = await fetch(`${API_URL}/api/delete-recipe/recipe`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({recipeId: recipeId}),
            });
            if (deleteRecipeRes.ok) {
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
            return(true);
        }
        else {
            return(false);
        }
    }

    //console.log('the recipeId is:', recipeId);
    const deletedAllRecipe = deleteInOrder();
    return(deletedAllRecipe);
}
export default handleDeleteRecipe;