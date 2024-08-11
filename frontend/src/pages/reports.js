import React, { useState, useEffect } from "react";
import { axiosInstance } from "../services/auth";

const Reports = () => {
    const [freqSpoiled, setFreqSpoiled] = useState([]);
    const [freqUsed, setFreqUsed] = useState([]);
    const [pageError, setPageError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const spoiledRes = await axiosInstance.get('/api/reports/freqspoiled');
                setFreqSpoiled(spoiledRes.data);
                
                const usedRes = await axiosInstance.get('/api/reports/freqused');
                setFreqUsed(usedRes.data);
            } catch (error) {
                console.error("There was an error:", error);
                setPageError(error.response?.data?.message || error.message || "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (pageError) return <h1>There was an error: {pageError}</h1>;

    return (
        <div className="core">
            <h2>Frequently Spoiled Items</h2>
            <br />
            <div className="table-overflow">
                <table>
                    <thead>
                        <tr className="header-row">
                            <th>Item</th>
                            <th>Last Date Added</th>
                            <th>Last Spoilage Date</th>
                            <th>Last Quantity Purchased</th>
                            <th>Last Amount Eaten</th>
                            <th>Last Amount Left</th>
                            <th>Times Purchased</th>
                            <th>Percent Purchases With Spoilage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {freqSpoiled.map((data, key) => (
                            <tr key={key}>
                                <td>{data.item}</td>
                                <td>{data.dateadded}</td>
                                <td>{data.spoilagedate}</td>
                                <td>{data.lastpurchasedtotal}</td>
                                <td>{data.currentquantityconsumed}</td>
                                <td>{data.currentquantityremaining}</td>
                                <td>{data.timesbought}</td>
                                <td>{data.spoiledpercent}</td>   
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <br /><br /><br />
            
            <h2>Frequently Used Items</h2>
            <br />
            <div className="table-overflow">
                <table>
                    <thead>
                        <tr className="header-row">
                            <th>Item</th>
                            <th>Last Date Added</th>
                            <th>Last Spoilage Date</th>
                            <th>Last Quantity Purchased</th>
                            <th>Last Amount Eaten</th>
                            <th>Last Amount Left</th>
                            <th>In Fridge</th>
                            <th>Times Purchased</th>
                            <th>Percent Purchases Fully Finished</th>
                        </tr>
                    </thead>
                    <tbody>
                        {freqUsed.map((data, key) => (
                            <tr key={key}>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;