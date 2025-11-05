// services/citaService.tsx
import axios from 'axios';
import type { ICita,ICreateCitaData,IUpdateCitaData } from '../types/ICita';

// Obtener todas las citas


const BASE_URL = 'http://localhost:8000/tasks/api/appointments/';

export const getAllCitas = async (): Promise<ICita[]> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener citas:', error);
    throw error;
  }
};

// Crear una nueva cita
export const createCita = async (data: ICreateCitaData): Promise<ICita> => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    throw error;
  }
};

// Actualizar una cita existente
export const updateCita = async (id: string, data: IUpdateCitaData): Promise<ICita> => {
  try {
    const response = await axios.put(`${BASE_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar la cita ${id}:`, error);
    throw error;
  }
};

// Eliminar una cita
export const deleteCita = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}${id}/`);
  } catch (error) {
    console.error(`❌ Error al eliminar la cita ${id}:`, error);
    throw error;
  }
};
