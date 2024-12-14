import api from '@/api/api';

export interface Settings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  refreshRate: number;
  numberOfTanks: number;
}

// Fetch settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const response = await api.get('/settings');
    console.log('Settings fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error?.response?.data?.error || error.message;
  }
};

// Update settings
export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    console.log('Updating settings with:', settings);
    const response = await api.put('/settings', settings);
    console.log('Settings updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error?.response?.data?.error || error.message;
  }
}; 