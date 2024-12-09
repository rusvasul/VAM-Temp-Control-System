import api from './api';

// Tank Data
// GET /tanks
// Response: { tanks: Array<{ id: number, name: string, temperature: number, status: string, mode: string, valveStatus: string }> }
export const getTanks = () => {
  // Get the number of tanks from localStorage or use default of 9
  const settings = JSON.parse(localStorage.getItem('tankSettings') || '{"numberOfTanks": 9}');
  const numberOfTanks = settings.numberOfTanks;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        tanks: Array.from({ length: numberOfTanks }, (_, i) => ({
          id: i + 1,
          name: `Tank ${i + 1}`,
          temperature: 65 + Math.random() * 10,
          status: 'Active',
          mode: 'Cooling',
          valveStatus: 'Open'
        }))
      });
    }, 500);
  });
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