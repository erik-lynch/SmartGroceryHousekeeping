import React from "react";
import{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const Reports = () => {

        // get userId for URL parameter
        let { userId } = useParams();

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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
                const freqSpoiledRes  = await fetch(`${API_URL}/api/users/${userId}/reports/freqspoiled`);
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
                const freqUsedRes  = await fetch(`${API_URL}/api/users/${userId}/reports/freqused`);
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
        <div className="core">
            <h2>
                Frequently Spoiled Items
            </h2>

            <br></br>

            <div className="table-overflow">
            <table>
                <thead>
                <tr className="header-row">
                    <th>Item</th>
                    <th>Last <br></br>Date Added</th>
                    <th>Last <br></br>Spoilage Date</th>
                    <th>Last <br></br>Quantity Purchased</th>
                    <th>Last <br></br>Amount Eaten</th>
                    <th>Last <br></br>Amount Left</th>
                    <th>Times <br></br>Purchased</th>
                    <th>Percent <br></br>Purchases <br></br>With Spoilage</th>
                </tr>
                </thead>
                {freqSpoiled.map((data,key) => {
                    return (
                        <tbody key={key}>
                        <tr>
                            <td>{data.item}</td>
                            <td>{data.dateadded}</td>
                            <td>{data.spoilagedate}</td>
                            <td>{data.lastpurchasedtotal}</td>
                            <td>{data.currentquantityconsumed}</td>
                            <td>{data.currentquantityremaining}</td>
                            <td>{data.timesbought}</td>
                            <td>{data.spoiledpercent}</td>   
                        </tr>
                        </tbody>
                    )})}
            </table>
            </div>

            <br></br>
            <br></br>
            <br></br>
            
            <h2>
                Frequently Used Items
            </h2>

            <br></br>

            <div className="table-overflow">
            <table>
                <thead>
                <tr className="header-row">
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
                </thead>
                {freqUsed.map((data,key) => {
                    return (
                        <tbody key={key}>
                        <tr>
                            <td>{data.item}</td>
                            <td>{data.dateadded}</td>
                            <td>{data.spoilagedate}</td>
                            <td>{data.lastpurchasedtotal}</td>
                            <td>{data.currentquantityconsumed}</td>
                            <td>{data.currentquantityremaining}</td>
                            <td>{data.infridge}</td>
                            <td>{data.timesbought}</td>
                            <td>{data.finishedpercent}</td>   
                        </tr>
                        </tbody>
                    )})}
                
            </table>
            </div>
            
        </div>
    );
};
};
 
export default Reports;