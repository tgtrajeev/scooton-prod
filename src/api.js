import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { logoutAndRedirect } from './hooks/logout';

export const BASE_URL = 'https://scootin-300701.el.r.appspot.com';

const axiosInstance = axios.create({
  baseURL: 'https://scootin-300701.el.r.appspot.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {     
      
      logoutAndRedirect(); 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;



