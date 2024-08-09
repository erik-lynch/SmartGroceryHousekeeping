// Adapted from https://www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
// Retrieved July 10, 2024

import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";
 
export const Nav = styled.nav`
    background: #FFE7C3;
    padding: 20px;
    display: grid;

    @media only screen and (max-width: 600px) {
        overflow: hidden;
        position: relative;
        padding: 0;
        height: fit-content;
        background: white;
        margin-bottom: 20px;
    }
`;
 
export const NavLink = styled(Link)`
    float: left;    
    color: black;
    text-decoration: none;
    padding: 10px 20px;
    cursor: pointer;
    &.active {
        background: white;
        font-weight: bold;
    }
    border-radius: 8px;
    margin: 5px;

    @media only screen and (max-width: 600px) {
        border-radius: 0;
        margin: 0px;
        padding: 20px;
        color: black;
        &.active {
            background: black;
            color: white;
            font-weight: bold;
        }
    }
`;
 
export const LoginLogout = styled(Link)`
    float: right;    
    color: white;
    background-color: black;
    border: none;
    text-decoration: none;
    font-weight: bold;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px;
    @media only screen and (max-width: 600px) {
        border-radius: 0;
        margin: 0px;
        padding: 20px;
        background-color: black;
        color: white;
    }
`;
 
export const NavMenu = styled.div`
    display: block;
    align-items: center;
    @media only screen and (max-width: 600px) {
        display: grid;
        margin: 0;

    }

`;

