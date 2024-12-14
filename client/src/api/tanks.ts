import api from '@/api/api';
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
  tankId: string;
  tankName: string;
  history: Array<{
    temperature: number;
    timestamp: string;
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
export const getTemperatureHistory = async (tankId: string, startDate?: string, endDate?: string): Promise<TemperatureHistory> => {
  try {
    console.log(`Fetching temperature history for tank ${tankId}`);
    let url = `/tanks/${tankId}/temperature-history`;
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }
    const response = await api.get(url);
    console.log('Temperature history response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching temperature history:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};

// Subscribe to real-time temperature updates
export const subscribeToTemperatureUpdates = (tankId: string, callback: (data: { temperature: number, timestamp: string }) => void) => {
  console.log(`Subscribing to temperature updates for tank ${tankId}`);
  const eventSource = new EventSource(`${api.defaults.baseURL}/tanks/${tankId}/temperature-stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`Received temperature update for tank ${tankId}:`, data);
      callback(data);
    } catch (error) {
      console.error('Error processing temperature update:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
  };

  return () => {
    console.log(`Unsubscribing from temperature updates for tank ${tankId}`);
    eventSource.close();
  };
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