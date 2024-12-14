import api from '../api/api';
import { AxiosError } from 'axios';

export interface Alarm {
  _id: string;
  name: string;
  type: string;
  threshold: number;
  tankId: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all alarms
export const getAlarms = async (): Promise<Alarm[]> => {
  try {
    const response = await api.get('/alarms');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching alarms:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};

// Create a new alarm
export const createAlarm = async (alarmData: Partial<Alarm>): Promise<Alarm> => {
  try {
    const response = await api.post('/alarms', alarmData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error creating alarm:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};

// Update an alarm
export const updateAlarm = async (id: string, updates: Partial<Alarm>): Promise<Alarm> => {
  try {
    const response = await api.put(`/alarms/${id}`, updates);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error updating alarm:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};

// Delete an alarm
export const deleteAlarm = async (id: string): Promise<void> => {
  try {
    await api.delete(`/alarms/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error deleting alarm:', axiosError);
    if (axiosError.response) {
      console.error('Error response:', axiosError.response.data);
    }
    throw new Error(axiosError.response?.data?.error || axiosError.message);
  }
};