import {React, useState, useEffect} from "react";
import { useParams } from "react-router-dom";

const Edit_Item = () => {
    
    const [itemInfo, setItemInfo] = useState(null);
    const [itemTags, setItemTags] = useState(null);

    const [markedSpoiled, setSpoiled] = useState("");
    const [markedFinished, setFinished] = useState("");
    const [markedUpdated, setUpdated] = useState("");

    const [spoilButton, setSpoilButton] = useState(true);
    const [finishButton, setFinishButton] = useState(true);
    const [updateButton, setUpdateButton] = useState(true);

    const [formData, setFormData] = useState({
        newlySpoiled: 0,
        newlyFinished: 0,
        newlyAdded: 0,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    function handleSpoiled() {
        setSpoiled("Item has been marked as spoiled.");
        fetchItemInfo();
        setTimeout(function(){
            setUpdated("");
        }, 3000);
    }

    function handleFinished() {
        setFinished("Item has been marked as finished.");
        fetchItemInfo();
        setTimeout(function(){
            setUpdated("");
        }, 3000);
    }

    function handleUpdate() {
        setUpdated("Item has been updated.");
        formData.newlyAdded = 0;
        formData.newlyFinished = 0;
        formData.newlySpoiled = 0;
        fetchItemInfo();
        setTimeout(function(){
            setUpdated("");
        }, 3000);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
          ...formData,
        };
    
        try {
          const response = await fetch(`http://localhost:3001/api/edit_item/${routeParams.usersItemsId}`, {
            method: "PUT",
            mode: "cors",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToSend),
          });
    
          if (response.ok) {
            console.log("Item edited successfully");
            handleUpdate();
          } else {
            const errorText = await response.text();
            console.error("Failed to edit item:", errorText);
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        }
        
    };

    const handleSpoil = async (e) => {
        e.preventDefault();
    
        try {
          const response = await fetch(`http://localhost:3001/api/spoil_item/${routeParams.usersItemsId}`, {
            method: "PUT",
            mode: "cors",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
          });
    
          if (response.ok) {
            console.log("Item spoiled successfully");
            handleSpoiled();
          } else {
            const errorText = await response.text();
            console.error("Failed to spoil item:", errorText);
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        }
        
    };

    const handleFinish = async (e) => {
        e.preventDefault();
    
        try {
          const response = await fetch(`http://localhost:3001/api/finish_item/${routeParams.usersItemsId}`, {
            method: "PUT",
            mode: "cors",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
          });
    
          if (response.ok) {
            console.log("Item marked as finished successfully");
            handleFinished();
          } else {
            const errorText = await response.text();
            console.error("Failed to finish item:", errorText);
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        }
        
    };

    const routeParams = useParams();

    async function fetchItemInfo() {

        try {
            const response = await fetch(`http://localhost:3001/useritem/${routeParams.userId}/${routeParams.itemId}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            setItemInfo(await response.json());

        } catch (error) {
            console.error(error.message);
        }

    };

    async function fetchTags() {

        try {
            const response = await fetch(`http://localhost:3001/useritem/${routeParams.itemId}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            setItemTags(await response.json());

        } catch (error) {
            console.error(error.message);
        }

    };

    useEffect(() => {

        fetchTags();
        fetchItemInfo();

    }, []);


    if (!itemInfo || !itemTags) {

        return(<h2>Loading...</h2>)

    } else {


        return (

            <div className="core">

                <div className="edit-image-content">

                <img className="edit-img"
                    src={itemInfo[0].imagefilepath}
                    alt=""
                />


                    <div className="edit-content">
                    <h1>{itemInfo[0].itemname}</h1>

                   {itemTags.map((e) => (
                         <div className="tag">{e.tagname}</div>
                    ))}

                    <p className="item-info"><b>Quantity:</b> {itemInfo[0].quantityremaining} {itemInfo[0].unitabbreviation}</p>
                    <p><b className="item-info">Expiring:</b> {itemInfo[0].formatspoilagedate}</p>

                    <br/>
                   
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="newlyAdded"><b>Adding:</b> </label>
                        <input
                            type="number"
                            id="newlyAdded"
                            name="newlyAdded"
                            value={formData.newlyAdded}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="newlyFinished"><b>Finished:</b> </label>
                        <input
                            type="number"
                            id="newlyFinished"
                            name="newlyFinished"
                            value={formData.newlyFinished}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="newlySpoiled"><b>Lost to Spoilage:</b> </label>
                        <input
                            type="number"
                            id="newlySpoiled"
                            name="newlySpoiled"
                            value={formData.newlySpoiled}
                            onChange={handleInputChange}
                        />
                        {updateButton && <input type="submit" value="Save"></input>}
                        <p>{markedUpdated}</p>

                        {spoilButton && <input type="button" class="spoil" value="Mark All Spoiled" onClick={handleSpoil}></input>}
                        <p>{markedSpoiled}</p>

                        {finishButton && <input type="button" class= "finish" value="Mark All Finished" onClick={handleFinish} ></input>}
                        <p>{markedFinished}</p>
                        
                    </form>
                    <br/><br/>

                    

                    <br/><br/>
                    <a className="return-dashboard" href="/">Return to Dashboard</a>
                    </div>

                
                </div>
            </div>

        );
}};
 
export default Edit_Item;