import React from "react";
 
const Reports = () => {
    return (
        <div class="core">
            <h2>
                Frequently Spoiled Items
            </h2>

            <br></br>
            <table>
                <tr class="header-row">
                    <th>Item</th>
                    <th>Date Added</th>
                    <th>Quantity</th>
                    <th>Date Marked Spoiled</th>
                </tr>
                <br></br>
                <tr>
                    <td>Radish</td>
                    <td>11/25/23</td>
                    <td>2 bunch</td>
                    <td>11/28/23</td>
                </tr>
                <br></br>
                <tr>
                    <td>Pear</td>
                    <td>11/27/23</td>
                    <td>2 count</td>
                    <td>11/30/23</td>
                </tr>
                <br></br>
                <tr>
                    <td>Milk</td>
                    <td>11/13/23</td>
                    <td>1 Gallon</td>
                    <td>11/30/23</td>
                </tr>
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
                    <th>Total Quantity Added</th>
                    <th>Percentage Spoiled</th>
                </tr>
                <br></br>
                <tr>
                    <td>Lemon</td>
                    <td>120</td>
                    <td>2%</td>
                </tr>
                <br></br>
                <tr>
                    <td>Pear</td>
                    <td>20</td>
                    <td>12%</td>
                </tr>
                
            </table>
        </div>
    );
};
 
export default Reports;