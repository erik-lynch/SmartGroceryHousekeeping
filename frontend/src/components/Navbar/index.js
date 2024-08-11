// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import React from "react";
import { LoginLogout, Nav, NavLink, NavMenu } from "./NavbarElements";
import { IoMenuOutline } from "react-icons/io5";

function mobileMenu() {
    const menu = document.getElementById("nav-links-mobile");
    if (menu.style.display === "block"){
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}
 
const Navbar = () => {
    return (

        <div>
            
        <div className="icon-container">
        <div className="icon-mobile" onClick={mobileMenu}>
            <IoMenuOutline size={30} />
        </div>
        </div>
        
        <Nav>

                <div className="nav-links-mobile" id="nav-links-mobile">
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
                </div>

            </Nav>
            </div>

    );
};
 
export default Navbar;
