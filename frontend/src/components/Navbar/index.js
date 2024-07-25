// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import React from "react";
import { LoginLogout, Nav, NavLink, NavMenu } from "./NavbarElements";
 
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>

                    <NavLink to="/" activestyle="true">
                        Dashboard
                    </NavLink>
                    <NavLink to="/add_item" activestyle="true">
                        Add Item
                    </NavLink>
                    <NavLink to="/reports" activestyle="true">
                        Reports
                    </NavLink>
                    <NavLink to="/users/1/recipes" activestyle="true">
                        Recipes
                    </NavLink>
                    <LoginLogout>
                        Login
                    </LoginLogout>
                    
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;
