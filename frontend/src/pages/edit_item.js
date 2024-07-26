import {React, useState, useEffect} from "react";
import { useLocation, useParams } from "react-router-dom";

const Edit_Item = () => {

    const [itemInfo, setItemInfo] = useState(null);
    const routeParams = useParams();

    useEffect(() => {

        async function fetchItemInfo() {

            try {
                const response = await fetch(`http://localhost:3001/useritem/${routeParams.userId}/${routeParams.itemId}`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                setItemInfo(await response.json());
                console.log(await itemInfo);

            } catch (error) {
                console.error(error.message);
            }

        };

        fetchItemInfo();

    }, []);

    if (!itemInfo) {

        return(<h2>Loading...</h2>)

    } else {

        if (itemInfo[0].tagname == null) {itemInfo[0].tagname = 'Tag'}

        return (

            <div className="core">

                <img className="edit-img"
                    src={itemInfo[0].imagefilepath}
                    alt=""
                />


                    <div className="edit-content">
                    <h1>{itemInfo[0].itemname}</h1>

                    <div className="tag">{itemInfo[0].tagname}</div>

                    <p><b>Quantity:</b> {itemInfo[0].quantityremaining} {itemInfo[0].unitabbreviation}</p>
                    <p><b>Expiring:</b> {itemInfo[0].formatspoilagedate}</p>

                    <br/><br/>

                    <label form="fname"><b>Update Quantity:</b></label> <br/>
                    <input type="number" id="quantity" name="quantity" defaultValue={itemInfo[0].quantityremaining} min="0" max={itemInfo[0].quantityremaining}/> <br/>
                    <input type="submit" value="Spoiled"></input>
                    <input type="submit" value="Finished"></input>

                    <br/><br/>
                    <a href="/">Return to Dashboard</a>
                    </div>

                
            </div>

        );
}};
 
export default Edit_Item;