import React, { useContext } from "react";
import { LoginLogout, Nav, NavLink, NavMenu, UserInfo, RightSection } from "./NavbarElements";
import { logout } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
  };
 
  return (
    <Nav>
      <NavMenu>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/add_item">Add Item</NavLink>
        {user && (
          <>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/recipes">Recipes</NavLink>
            <NavLink to="/add_recipe">Add Recipe</NavLink>
            <NavLink to="/cookbook">Cookbook</NavLink>
          </>
        )}
      </NavMenu>
      <RightSection>
        {user ? (
          <>
            <UserInfo>{`${user.user.firstname} ${user.user.lastname} (${user.user.email})`}</UserInfo>
            <LoginLogout onClick={handleLogout}>Logout</LoginLogout>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </RightSection>
    </Nav>
  );
};

export default Navbar;