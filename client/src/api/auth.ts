import api from './api';
import type { AuthResponse } from "@/contexts/AuthContext";

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { message: string, token: string, isAdmin: boolean }
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', String(response.data.isAdmin || false));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register
// POST /auth/register
// Request: { email: string, password: string }
// Response: { message: string, token: string, isAdmin: boolean }
export const register = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', String(response.data.isAdmin || false));
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout
// POST /auth/logout
// Response: { message: string }
export const logout = async (): Promise<{ data: { message: string } }> => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    console.log('Logout successful');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};