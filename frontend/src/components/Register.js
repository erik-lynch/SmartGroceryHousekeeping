import React, { useState, useContext } from 'react';
import { register, login } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Register the user
      await register(firstname, lastname, email, password);
      
      // Log in the user immediately after registration
      const userData = await login(email, password);
      setUser(userData);
      
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="core additem-core">
      <div className="section-content">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister}>
          <label htmlFor="firstname">First Name:</label>
          <input
            type="text"
            id="firstname"
            placeholder="Enter your first name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
          
          <label htmlFor="lastname">Last Name:</label>
          <input
            type="text"
            id="lastname"
            placeholder="Enter your last name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
          
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
          
          <input type="submit" value="Register" className="button-submit-button" />
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;