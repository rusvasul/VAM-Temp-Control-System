import api from './api';

export interface CleaningSchedule {
  _id: string;
  tankId: string;
  type: 'recurring' | 'single';
  schedule?: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  lastCleaning: string;
  nextCleaning: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCleaningScheduleDto = Omit<CleaningSchedule, '_id' | 'nextCleaning' | 'createdAt' | 'updatedAt'>;
export type UpdateCleaningScheduleDto = Partial<CreateCleaningScheduleDto>;

const getCleaningSchedules = async (): Promise<CleaningSchedule[]> => {
  try {
    const response = await api.get('/cleaning-schedules');
    console.log('Cleaning schedules fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching cleaning schedules:', error);
    throw error;
  }
};

const getCleaningScheduleForTank = async (tankId: string): Promise<CleaningSchedule | null> => {
  console.log(`Fetching cleaning schedule for tank ${tankId}`);
  try {
    const response = await api.get(`/cleaning-schedules/tank/${tankId}`);
    console.log('Tank cleaning schedule response:', response.data);
    return response.data;
  } catch (error) {
    if ((error as any)?.response?.status === 404) {
      console.log(`No cleaning schedule found for tank ${tankId}`);
      return null;
    }
    console.error('Error fetching tank cleaning schedule:', error);
    throw error;
  }
};

const createCleaningSchedule = async (schedule: CreateCleaningScheduleDto): Promise<CleaningSchedule> => {
  try {
    const response = await api.post('/cleaning-schedules', schedule);
    console.log('Cleaning schedule created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating cleaning schedule:', error);
    throw error;
  }
};

const updateCleaningSchedule = async (id: string, schedule: UpdateCleaningScheduleDto): Promise<CleaningSchedule> => {
  try {
    const response = await api.put(`/cleaning-schedules/${id}`, schedule);
    console.log('Cleaning schedule updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating cleaning schedule:', error);
    throw error;
  }
};

const deleteCleaningSchedule = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cleaning-schedules/${id}`);
    console.log('Cleaning schedule deleted successfully');
  } catch (error) {
    console.error('Error deleting cleaning schedule:', error);
    throw error;
  }
};

export {
  getCleaningSchedules,
  getCleaningScheduleForTank,
  createCleaningSchedule,
  updateCleaningSchedule,
  deleteCleaningSchedule
};