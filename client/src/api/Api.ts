import axios from 'axios';
import { toast } from '@/hooks/useToast';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  request => {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/login';
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive"
      });
    } else if (error.response?.data?.error) {
      toast({
        title: "Error",
        description: error.response.data.error,
        variant: "destructive"
      });
    } else if (error.message === 'Network Error') {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive"
      });
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;