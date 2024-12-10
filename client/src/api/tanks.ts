import api from './api';

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
    tankId: number;
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
    console.error('Error fetching tanks:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
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
    console.error('Error updating tank:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
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

export const getSystemStatus = (): Promise<SystemStatus> => {
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
        tankId: 1
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
    console.error('Error fetching detailed tank data:', error);
    throw error;
  }
};