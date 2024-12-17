import api from './api';

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isAdmin: boolean;
  status: 'active' | 'inactive' | 'suspended';
  preferences: {
    notifications: {
      email: {
        enabled: boolean;
        types: string[];
      };
      push: {
        enabled: boolean;
        types: string[];
      };
    };
    theme: 'light' | 'dark' | 'system';
    dashboardLayout: Map<string, { visible: boolean; position: number }>;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
}

export interface UpdateUserPreferencesData {
  notifications?: {
    email?: {
      enabled?: boolean;
      types?: string[];
    };
    push?: {
      enabled?: boolean;
      types?: string[];
    };
  };
  theme?: 'light' | 'dark' | 'system';
  dashboardLayout?: Map<string, { visible: boolean; position: number }>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Get current user's profile
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Update current user's profile
export const updateProfile = async (data: UpdateUserProfileData): Promise<User> => {
  try {
    const response = await api.put('/users/me', data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Update current user's preferences
export const updatePreferences = async (data: UpdateUserPreferencesData): Promise<User> => {
  try {
    const response = await api.put('/users/me/preferences', data);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Change current user's password
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  try {
    await api.put('/users/me/password', data);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<{ message: string; tempPassword?: string }> => {
  try {
    const response = await api.post('/users/reset-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Admin functions
export const listUsers = async (filters = {}): Promise<User[]> => {
  try {
    const response = await api.get('/users', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error?.response?.data?.error || error.message;
  }
};

export const getUser = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error?.response?.data?.error || error.message;
  }
};

export const createUser = async (data: any): Promise<User> => {
  try {
    const response = await api.post('/users', data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error?.response?.data?.error || error.message;
  }
};

export const updateUser = async (id: string, data: any): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error?.response?.data?.error || error.message;
  }
};

export const updateUserStatus = async (id: string, status: string): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error?.response?.data?.error || error.message;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error?.response?.data?.error || error.message;
  }
}; 