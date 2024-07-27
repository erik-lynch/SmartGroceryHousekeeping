// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import React from "react";
import { LoginLogout, Nav, NavLink, NavMenu } from "./NavbarElements";
 
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>

                    <NavLink to="/" activeStyle>
                        Dashboard
                    </NavLink>
                    <NavLink to="/add_item" activeStyle>
                        Add Item
                    </NavLink>
                    <NavLink to="/users/1/reports" activeStyle>
                        Reports
                    </NavLink>
                    <NavLink to="/users/1/recipes" activeStyle>
                        Recipes
                    </NavLink>
                    <NavLink to="/users/1/add_recipe" activeStyle>
                        Add Recipe
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
