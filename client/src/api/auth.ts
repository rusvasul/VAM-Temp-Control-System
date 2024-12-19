import api from '@/api/api';
import type { AuthResponse } from "@/contexts/AuthContext";

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Login
export const login = async ({ email, password, rememberMe = false }: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', String(response.data.isAdmin || false));
      
      // Handle remember me token
      if (response.data.rememberMeToken) {
        localStorage.setItem('rememberMeToken', response.data.rememberMeToken);
      }
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 423) {
      throw new Error('Account is temporarily locked. Please try again later.');
    } else if (error.response?.status === 403 && error.response.data.needsVerification) {
      throw new Error('Please verify your email before logging in.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please try again later.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', String(response.data.isAdmin || false));
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid registration data');
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred. Please try again later.');
    }
    throw new Error('An unexpected error occurred during registration.');
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    const rememberMeToken = localStorage.getItem('rememberMeToken');
    if (rememberMeToken) {
      await api.post('/auth/logout', { rememberMeToken });
    } else {
      await api.post('/auth/logout');
    }
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('rememberMeToken');
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to process password reset request.');
  }
};

// Reset password
export const resetPassword = async ({ token, newPassword }: ResetPasswordData): Promise<void> => {
  try {
    await api.post('/auth/reset-password', { token, newPassword });
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to reset password.');
  }
};

// Verify email
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await api.post('/auth/verify-email', { token });
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to verify email.');
  }
};

// Resend verification email
export const resendVerification = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/resend-verification', { email });
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to resend verification email.');
  }
};