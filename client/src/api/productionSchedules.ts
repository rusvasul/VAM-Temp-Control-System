import api from './api';

export interface ProductionSchedule {
  _id: string;
  tankId: string;
  beerStyle: string;
  startDate: string;
  endDate: string;
}

export const createProductionSchedule = async (data: {
  tankId: string;
  beerStyle: string;
  startDate: string;
  endDate: string;
}): Promise<ProductionSchedule> => {
  try {
    console.log('Creating new production schedule', data);
    const response = await api.post('/production-schedules', data);
    console.log('Production schedule created successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating production schedule:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

export const getProductionSchedules = async (): Promise<ProductionSchedule[]> => {
  try {
    console.log('Fetching all production schedules');
    const response = await api.get('/production-schedules');
    console.log('Production schedules fetched successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching production schedules:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

export const updateProductionSchedule = async (id: string, data: Partial<ProductionSchedule>): Promise<ProductionSchedule> => {
  try {
    console.log(`Updating production schedule ${id}`, data);
    const response = await api.put(`/production-schedules/${id}`, data);
    console.log('Production schedule updated successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating production schedule:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

export const deleteProductionSchedule = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting production schedule ${id}`);
    await api.delete(`/production-schedules/${id}`);
    console.log('Production schedule deleted successfully');
  } catch (error) {
    console.error('Error deleting production schedule:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

export const getProductionScheduleById = async (id: string): Promise<ProductionSchedule> => {
  try {
    console.log(`Fetching production schedule ${id}`);
    const response = await api.get(`/production-schedules/${id}`);
    console.log('Production schedule fetched successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching production schedule:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}