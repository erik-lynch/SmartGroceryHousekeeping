import React from "react";
import { FaUpload } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";

 
const Add_Item = () => {
    return (
        <div>
            <h2>
                Image Input
            </h2>
            <form>
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="button-upload"
                />
                <label htmlFor="button-upload">
                    <FaUpload />
                </label>
                <input accept="image/*" id="icon-button-file" type="file" capture="user" style={{ display: 'none' }} />
                <label htmlFor="icon-button-file">
                    <FaCamera />
                </label>
            </form>
            <h2>
                Manual Input
            </h2>
            <form>
                <label for="fname">Item name:</label> <br/>
                <input type="text" id="iname" name="iname" value="Value"/> <br/>
                <label for="fname">Item Measurement Unit:</label> <br/>
                <select id="unit" name="unit">
                    <option value="count">Count</option>
                    <option value="gallons">Gallons</option>
                    <option value="grams">Grams</option>
                </select>
                <br/>
                <label for="fname">Quantity of Item:</label> <br/>
                <input type="number" id="quantity" name="quantity" value="0"/> <br/>
                <label for="fname">Item Ripeness Rating (optional):</label> <br/>
                <input type="text" id="ripe-rating" name="ripe-rating" value="Value"/> <br/>
                <p>Tags</p>
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
};
 
export default Add_Item;