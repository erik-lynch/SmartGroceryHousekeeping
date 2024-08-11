import React, { useState, useContext } from 'react';
import { login } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from "../UserContext";
import '../App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userData = await login(email, password);
        setUser(userData);
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        // You might want to show an error message to the user here
      }
    };

  return (
    <div className="core additem-core">
      <div className="section-content">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <input type="submit" value="Login" className="button-submit-button" />
        </form>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;