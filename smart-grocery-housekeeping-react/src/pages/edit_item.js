import React from "react";
 
const Edit_Item = () => {
    return (
        <div class="core">
            <h2>
                Grocery Item Name
            </h2>
            <p>Tags go here</p>
            <p>Projected spoil date: DATE</p>
            <p>Current quantity - Unit of measure</p>
            <br/>
            <label for="fname">Update Quantity</label> <br/>
            <input type="number" id="quantity" name="quantity" value="1"/> <br/>
            <input type="submit" value="Spoiled"></input>
            <input type="submit" value="Finished"></input>
            <br/>
            <a href="/">Return to Dashboard</a>
        </div>
    );
};
 
export default Edit_Item;