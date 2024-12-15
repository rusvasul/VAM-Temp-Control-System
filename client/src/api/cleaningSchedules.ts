import api from './api';
import { AxiosError } from 'axios';

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

class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    throw new ApiError(
      error.response?.data?.error || error.message,
      error.response?.status
    );
  }
  throw error;
};

export const getCleaningSchedules = async (): Promise<CleaningSchedule[]> => {
  try {
    const response = await api.get<CleaningSchedule[]>('/cleaning-schedules');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCleaningScheduleForTank = async (tankId: string): Promise<CleaningSchedule | null> => {
  try {
    const response = await api.get<CleaningSchedule>(`/cleaning-schedules/tank/${tankId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
};

export const createCleaningSchedule = async (schedule: CreateCleaningScheduleDto): Promise<CleaningSchedule> => {
  try {
    const response = await api.post<CleaningSchedule>('/cleaning-schedules', schedule);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCleaningSchedule = async (
  id: string,
  schedule: UpdateCleaningScheduleDto
): Promise<CleaningSchedule> => {
  try {
    const response = await api.put<CleaningSchedule>(`/cleaning-schedules/${id}`, schedule);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteCleaningSchedule = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cleaning-schedules/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};