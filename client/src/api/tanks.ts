import api from './api';
import { AxiosError } from 'axios';

export interface Tank {
  id: string;
  name: string;
  temperature: number;
  status: string;
  mode: string;
  valveStatus: string;
}

export interface TemperatureHistory {
  history: Array<{
    timestamp: string;
    temperature: number;
    tankId: string;
  }>;
}

// Tank Data
// GET /tanks
export const getTanks = async (): Promise<Tank[]> => {
  try {
    console.log('Fetching tanks from:', api.defaults.baseURL);
    const response = await api.get('/tanks');
    console.log('Tanks response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching tanks:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw error;
  }
};

// Update Tank
// PUT /tanks/:id
export const updateTank = async (id: string, updates: Partial<Tank>): Promise<Tank> => {
  try {
    const response = await api.put(`/tanks/${id}`, updates);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error updating tank:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw error;
  }
};

// System Status
export interface SystemStatus {
  chillerStatus: string;
  heaterStatus: string;
  systemMode: string;
}

export const getSystemStatus = async (): Promise<SystemStatus> => {
  try {
    console.log('Fetching system status');
    const response = await api.get('/system-status');
    console.log('System status response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching system status:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw error;
  }
};

// Update System Status
// PUT /api/system-status
export const updateSystemStatus = async (updates: Partial<SystemStatus>): Promise<SystemStatus> => {
  try {
    console.log('Updating system status with:', updates);
    const response = await api.put('/system-status', updates);
    console.log('System status update response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error updating system status:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};

// Temperature History
export const getTemperatureHistory = async (): Promise<TemperatureHistory> => {
  try {
    const response = await api.get('/temperature-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching temperature history:', error);
    // Fallback to mock data if API fails
    return {
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        temperature: 65 + Math.random() * 10,
        tankId: '1'
      }))
    };
  }
};

// Get Detailed Tank Data
export const getDetailedTankData = async (tankId: string): Promise<Tank> => {
  try {
    const response = await api.get(`/tanks/${tankId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching detailed tank data:', axiosError);
    throw error;
  }
};

// Create Tank
// POST /tanks
export const createTank = async (tankData: Partial<Tank>): Promise<Tank> => {
  try {
    const response = await api.post('/tanks', tankData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error creating tank:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw error;
  }
};

// Delete Tank
// DELETE /tanks/:id
export const deleteTank = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tanks/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error deleting tank:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw error;
  }
};