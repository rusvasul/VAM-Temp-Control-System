import api from './api';
import { BrewStyle } from '@/types/brewStyle';

export const getBrewStyles = async () => {
  const response = await api.get<BrewStyle[]>('/brew-styles');
  return response.data;
};

export const getBrewStyle = async (id: string) => {
  const response = await api.get<BrewStyle>(`/brew-styles/${id}`);
  return response.data;
};

export const getBrewStylesByType = async (type: 'mead' | 'cider' | 'beer') => {
  const response = await api.get<BrewStyle[]>(`/brew-styles/type/${type}`);
  return response.data;
};

export const createBrewStyle = async (brewStyle: Omit<BrewStyle, 'id'>) => {
  const response = await api.post<BrewStyle>('/brew-styles', brewStyle);
  return response.data;
};

export const updateBrewStyle = async (id: string, brewStyle: Partial<BrewStyle>) => {
  // Remove any undefined or null values from the object
  const cleanedData = Object.fromEntries(
    Object.entries(brewStyle).filter(([_, v]) => v != null)
  );
  
  const response = await api.put<BrewStyle>(`/brew-styles/${id}`, cleanedData);
  return response.data;
};

export const deleteBrewStyle = async (id: string) => {
  await api.delete(`/brew-styles/${id}`);
};

export const uploadRecipeDocument = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('recipeDocument', file);
  
  const response = await api.post<BrewStyle>(
    `/brew-styles/${id}/recipe-document`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const deleteRecipeDocument = async (id: string) => {
  const response = await api.delete<BrewStyle>(`/brew-styles/${id}/recipe-document`);
  return response.data;
}; 