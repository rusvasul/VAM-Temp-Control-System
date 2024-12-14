import api from './api';

export interface BeerStyle {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
}

// Get all beer styles
export const getBeerStyles = async (): Promise<BeerStyle[]> => {
  const response = await api.get('/beer-styles');
  return response.data;
};

// Create a new beer style
export const createBeerStyle = async (beerStyle: Omit<BeerStyle, 'id'>): Promise<BeerStyle> => {
  const response = await api.post('/beer-styles', beerStyle);
  return response.data;
};

// Update a beer style
export const updateBeerStyle = async (id: string, updates: Partial<BeerStyle>): Promise<BeerStyle> => {
  const response = await api.put(`/beer-styles/${id}`, updates);
  return response.data;
};

// Delete a beer style
export const deleteBeerStyle = async (id: string): Promise<void> => {
  await api.delete(`/beer-styles/${id}`);
}; 