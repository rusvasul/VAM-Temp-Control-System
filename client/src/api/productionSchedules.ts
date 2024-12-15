import api from './api';
import { AxiosError } from 'axios';

export interface ProductionSchedule {
  _id?: string;
  tankId: string;
  brewStyle: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductionScheduleDto = Omit<ProductionSchedule, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductionScheduleDto = Partial<CreateProductionScheduleDto>;

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

export const getProductionSchedules = async (): Promise<ProductionSchedule[]> => {
  try {
    const response = await api.get<ProductionSchedule[]>('/production-schedules');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getProductionScheduleById = async (id: string): Promise<ProductionSchedule> => {
  try {
    const response = await api.get<ProductionSchedule>(`/production-schedules/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createProductionSchedule = async (schedule: CreateProductionScheduleDto): Promise<ProductionSchedule> => {
  try {
    const response = await api.post<ProductionSchedule>('/production-schedules', schedule);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateProductionSchedule = async (
  id: string,
  schedule: UpdateProductionScheduleDto
): Promise<ProductionSchedule> => {
  try {
    const response = await api.put<ProductionSchedule>(`/production-schedules/${id}`, schedule);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteProductionSchedule = async (id: string): Promise<void> => {
  try {
    await api.delete(`/production-schedules/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const checkScheduleConflict = async (schedule: CreateProductionScheduleDto): Promise<boolean> => {
  try {
    const response = await api.post<{ hasConflict: boolean }>('/production-schedules/check-conflict', schedule);
    return response.data.hasConflict;
  } catch (error) {
    handleApiError(error);
  }
};