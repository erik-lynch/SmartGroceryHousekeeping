import { axiosInstance } from '../../services/auth';

async function handleDeleteRecipe(recipeId) {
    try {
        await axiosInstance.delete(`/api/recipes/${recipeId}`);
        return true; // Deletion successful
    } catch (error) {
        console.error("Failed to delete recipe:", error.response?.data?.error || error.message);
        return false; // Deletion failed
    }
}

export default handleDeleteRecipe;