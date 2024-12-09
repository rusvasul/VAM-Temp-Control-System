import api from './api';

// Tank Data
// GET /tanks
// Response: Array<{ id: number, name: string, temperature: number, status: string, mode: string, valveStatus: string }>
export const getTanks = async () => {
  try {
    const response = await api.get('/tanks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tanks:', error);
    throw error;
  }
};

// System Status
// GET /system-status
// Response: { chillerStatus: string, heaterStatus: string, systemMode: string }
export const getSystemStatus = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chillerStatus: 'Running',
        heaterStatus: 'Standby',
        systemMode: 'Cooling'
      });
    }, 500);
  });
};

// Temperature History
// GET /temperature-history
// Response: { history: Array<{ timestamp: string, temperature: number, tankId: number }> }
export const getTemperatureHistory = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          temperature: 65 + Math.random() * 10,
          tankId: 1
        }))
      });
    }, 500);
  });
};