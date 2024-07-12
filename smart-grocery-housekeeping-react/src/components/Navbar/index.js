import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
 
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
                    <NavLink to="/reports" activeStyle>
                        Reports
                    </NavLink>
                    <NavLink to="/recipes" activeStyle>
                        Recipes
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;