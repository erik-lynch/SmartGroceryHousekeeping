import {React, useState, useEffect} from "react";
import { useLocation, useParams } from "react-router-dom";
 
const Edit_Item = () => {

    const [itemInfo, setItemInfo] = useState(null);
    const routeParams = useParams();
    console.log(routeParams)

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
    return (

        <div className="core">

            <img className="edit-img"
                  src={itemInfo[0].imagefilepath}
                  alt=""
            />


                <div className="edit-content">
                <h2>{itemInfo[0].itemname}</h2>

                <p>{itemInfo[0].tagname}</p>

                <p>Expiring: {itemInfo[0].spoilagedate}</p>
                <p>{itemInfo[0].quantityremaining} {itemInfo[0].unitabbreviation}</p>

                <br/><br/>

                <label form="fname">Update Quantity</label> <br/>
                <input type="number" id="quantity" name="quantity" value="1"/> <br/>
                <input type="submit" value="Spoiled"></input>
                <input type="submit" value="Finished"></input>

                <br/><br/>
                <a href="/">Return to Dashboard</a>
                </div>

            
        </div>

    );
}};
 
export default Edit_Item;