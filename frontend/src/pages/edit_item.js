import React from "react";
import { FaImage } from "react-icons/fa";
 
const Edit_Item = () => {
    return (
        <div class="core">

            <div class="left-inline-div">
                <FaImage class="image-placeholder"/>
            </div>

            <div class="right-inline-div">
                <h2>
                    Grocery Item Name
                </h2>
                <p>Tags go here</p>
                <p>Projected spoil date: DATE</p>
                <p>Current quantity - Unit of measure</p>
                <br/><br/>
                <label for="fname">Update Quantity</label> <br/>
                <input type="number" id="quantity" name="quantity" value="1"/> <br/>
                <input type="submit" value="Spoiled"></input>
                <input type="submit" value="Finished"></input>
                <br/><br/>
                <a href="/">Return to Dashboard</a>
            </div>
            
        </div>
    );
};
 
export default Edit_Item;