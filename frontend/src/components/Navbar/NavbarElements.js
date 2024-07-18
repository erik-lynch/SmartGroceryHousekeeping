// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";
 
export const Nav = styled.nav`
    background: #FFE7C3;
    padding: 20px;
`;
 
export const NavLink = styled(Link)`
    float: left;    
    color: #000080;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    text-decoration: none;
    padding: 10px 20px;
    cursor: pointer;
    &.active {
        background: white;
    }
    border-radius: 8px;
    margin: 5px;
`;
 
export const LoginLogout = styled(Link)`
    float: right;    
    color: white;
    background-color: #000080;
    border: none;
    text-decoration: none;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px;
`;
 
export const NavMenu = styled.div`
    display: inline-block;
    flex-wrap: wrap;
    }
`;

