import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = () => {
  const user = getCurrentUser();
  return user?.token;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (firstname, lastname, email, password) => {
  const response = await axiosInstance.post('/api/register', { firstname, lastname, email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (email, password) => {
  const response = await axiosInstance.post('/api/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const refreshToken = async () => {
  const user = getCurrentUser();
  if (user && user.refreshToken) {
    const response = await axiosInstance.post('/api/refresh-token', { refreshToken: user.refreshToken });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify({ ...user, ...response.data }));
    }
    return response.data;
  }
  return null;
};

export { axiosInstance };