import api from "./api"

export interface BrewStyle {
  id: string
  name: string
  minTemp: number
  maxTemp: number
  createdAt: string
  updatedAt: string
}

export async function getBrewStyles(): Promise<BrewStyle[]> {
  const response = await api.get('/brew-styles')
  return response.data
}

export async function createBrewStyle(data: Omit<BrewStyle, 'id' | 'createdAt' | 'updatedAt'>): Promise<BrewStyle> {
  const response = await api.post('/brew-styles', data)
  return response.data
}

export async function updateBrewStyle(id: string, data: Partial<BrewStyle>): Promise<BrewStyle> {
  const response = await api.put(`/brew-styles/${id}`, data)
  return response.data
}

export async function deleteBrewStyle(id: string): Promise<void> {
  await api.delete(`/brew-styles/${id}`)
} 