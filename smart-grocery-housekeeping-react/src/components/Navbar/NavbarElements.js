
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";
 
export const Nav = styled.nav`
    background: #f3e5ab;
    height: 80px;
    display: flex;
    justify-content: space-between;
    padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 12;
`;
 
export const NavLink = styled(Link)`
    color: #000080;
    display: flex;
    align-items: center;
    float: left;
    text-decoration: none;
    padding: 0 1rem;
    height: 50px;
    cursor: pointer;
    &.active {
        background: white;
    }
`;
 
export const LoginLogout = styled(Link)`
    color: #f3e5ab;
    background-color: #000080;
    border: none;
    display: inline-block;
    text-align: center;
    float: right;
    position: absolute;
    right: 15px;
    padding: 15px 30px;
    cursor: pointer;
`;
 
export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    margin-left: 24px;
    /* Second Nav */
    /* margin-right: 24px; */
    /* Third Nav */
    /* width: 100vw;
white-space: nowrap; */
    @media screen and (max-width: 768px) {
        display: none;
    }
`;