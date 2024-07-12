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
                    <NavLink to="/reports" activeStyle>
                        Reports
                    </NavLink>
                    <NavLink to="/recipes" activeStyle>
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