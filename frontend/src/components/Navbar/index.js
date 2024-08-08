// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import React from "react";
import { LoginLogout, Nav, NavLink, NavMenu } from "./NavbarElements";
 
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>

                    <NavLink to="/">
                        Dashboard
                    </NavLink>
                    <NavLink to="/add_item">
                        Add Item
                    </NavLink>
                    <NavLink to="/users/1/reports">
                        Reports
                    </NavLink>
                    <NavLink to="/users/1/recipes">
                        Recipes
                    </NavLink>
                    <NavLink to="/users/1/add_recipe">
                        Add Recipe
                    </NavLink>
                    <NavLink to="/users/1/cookbook">
                        Cookbook
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
