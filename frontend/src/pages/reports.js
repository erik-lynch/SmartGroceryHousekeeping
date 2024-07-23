import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const Reports = () => {

        // get userId for URL parameter
        let { userId } = useParams();
    
        // set use effect state changes- frequently spoiled, frequently used
        const [freqSpoiled, setFreqSpoiled] = useState([]);
        const [freqUsed, setFreqUsed] = useState([]);

        // set use effect state changes- for page rendering and waiting
        const [pageError, setPageError] = useState(false);
        const [loading0, setLoading0] = useState(true);
        const [loading1, setLoading1] = useState(true);
    
        useEffect(() => {
    
        const fetchFreqSpoiled = async () => {
            try {
                setLoading0(true);
                const freqSpoiledRes  = await fetch(`http://localhost:3001/api/users/${userId}/reports/freqspoiled`);
                const freqSpoiledData = await freqSpoiledRes.json();
                console.log(freqSpoiledData)
                setFreqSpoiled(freqSpoiledData);
                setLoading0(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }
    
        const fetchFreqUsed = async () => {
            try {
                setLoading1(true);
                const freqUsedRes  = await fetch(`http://localhost:3001/api/users/${userId}/reports/freqused`);
                const freqUsedData = await freqUsedRes.json();
                setFreqUsed(freqUsedData);
                setLoading1(false);
            }
            catch (error) {
                console.log("There was an error:", error);
                setPageError(error);
            }
        }
    
    
        
        fetchFreqSpoiled();
        fetchFreqUsed();
        }, [userId]);
    
        if (loading0 || loading1) {
            return (<p>Loading</p>)
        };
    
        if (pageError) {return (<h1>There was an error: {pageError} </h1>)}
        else {


    return (
        <div class="core">
            <h2>
                Frequently Spoiled Items
            </h2>

            <br></br>
            <table>
                <tr class="header-row">
                    <th>Item</th>
                    <th>Last <br></br>Date Added</th>
                    <th>Last <br></br>Spoilage Date</th>
                    <th>Last <br></br>Quantity Purchased</th>
                    <th>Last <br></br>Amount Eaten</th>
                    <th>Last <br></br>Amount Left</th>
                    <th>Times <br></br>Purchased</th>
                    <th>Percent <br></br>Purchases <br></br>With Spoilage</th>
                </tr>
                <br></br>
                {freqSpoiled.map((data,key) => {
                    return (
                <tr key={key}>
                    <th>{data.item}</th>
                    <th>{data.dateadded}</th>
                    <th>{data.spoilagedate}</th>
                    <th>{data.lastpurchasedtotal}</th>
                    <th>{data.currentquantityconsumed}</th>
                    <th>{data.currentquantityremaining}</th>
                    <th>{data.timesbought}</th>
                    <th>{data.spoiledpercent}</th>   
                </tr>
                    )})}
            </table>
            <br></br>
            <br></br>
            <br></br>
            
            <h2>
                Frequently Used Items
            </h2>

            <br></br>
            <table>
                <tr class="header-row">
                    <th>Item</th>
                    <th>Last<br></br> Date Added</th>
                    <th>Last<br></br> Spoilage Date</th>
                    <th>Last<br></br> Quantity <br></br> Purchased</th>
                    <th>Last<br></br> Amount Eaten</th>
                    <th>Last<br></br> Amount Left</th>
                    <th>In Fridge</th>
                    <th>Times<br></br> Purchased</th>
                    <th>Percent<br></br> Purchases<br></br> Fully Finished</th>
                </tr>
                <br></br>
                {freqUsed.map((data,key) => {
                    return (
                <tr key={key}>
                    <th>{data.item}</th>
                    <th>{data.dateadded}</th>
                    <th>{data.spoilagedate}</th>
                    <th>{data.lastpurchasedtotal}</th>
                    <th>{data.currentquantityconsumed}</th>
                    <th>{data.currentquantityremaining}</th>
                    <th>{data.infridge}</th>
                    <th>{data.timesbought}</th>
                    <th>{data.finishedpercent}</th>   
                </tr>
                    )})}
                
            </table>
        </div>
    );
};
};
 
export default Reports;