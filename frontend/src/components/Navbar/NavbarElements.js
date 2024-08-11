import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";
 
export const Nav = styled.nav`
    background: #FFE7C3;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
 
export const NavLink = styled(Link)`
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
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    @media only screen and (max-width: 600px) {
        flex-direction: column;
    }
`;

export const RightSection = styled.div`
    display: flex;
    align-items: center;
`;

export const UserInfo = styled.span`
    color: black;
    padding: 10px 20px;
    margin: 5px;
`;

export const LoginLogout = styled(Link)`
    color: white;
    background-color: black;
    border: none;
    text-decoration: none;
    font-weight: bold;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px;
`;