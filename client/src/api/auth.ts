import type { AuthResponse } from "@/contexts/AuthContext";

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { message: string, token: string, isAdmin: boolean }
export const login = async (email: string, password: string) => {
  // Mocking the response
  return new Promise<AuthResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: 'Logged in successfully',
          token: 'mock-jwt-token',
          isAdmin: email === 'admin@example.com' // Simple mock admin check
        }
      });
    }, 500);
  });
  // return api.post('/auth/login', { email, password });
};

// Register
// POST /auth/register
// Request: { email: string, password: string }
// Response: { message: string, token: string, isAdmin: boolean }
export const register = async (data: { email: string; password: string }) => {
  // Mocking the response
  return new Promise<AuthResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: 'User created successfully',
          token: 'mock-jwt-token',
          isAdmin: false // New users are not admins by default
        }
      });
    }, 500);
  });
  // return api.post('/auth/register', data);
};

// Logout
// POST /auth/logout
// Response: { message: string }
export const logout = async () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: 'Logged out successfully'
        }
      });
    }, 500);
  });
  // return api.post('/auth/logout');
};