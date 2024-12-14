import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for authentication
api.interceptors.request.use(request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Starting Request:', request.method, request.url, request.headers);
  return request;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Response Error:', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);

      // Handle authentication errors
      if (error.response.status === 401) {
        console.log('Authentication error - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error?.response?.data?.error || error.message);
  }
);

export default api;