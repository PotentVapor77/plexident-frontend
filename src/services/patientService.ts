// services/patientService.ts
import axios from 'axios';
import type { IPatient } from '../types/IPatient';

const BASE_URL = "http://localhost:8000/tasks/api/patients/";

// Función para obtener todos los pacientes
export const getAllPatients = async (): Promise<IPatient[]> => {
  const response = await axios.get(BASE_URL);
  return response.data; // Asumiendo que la API devuelve un array de pacientes directamente
};

// Función para obtener un paciente por ID
export const getPatientById = async (id: string): Promise<IPatient> => {
  const response = await axios.get(`${BASE_URL}${id}/`);
  return response.data;
};

// Función para crear un nuevo paciente
export const createPatient = async (patient: Omit<IPatient, 'id'>): Promise<IPatient> => {
  const response = await axios.post(BASE_URL, patient);
  return response.data;
};

// Función para actualizar un paciente
export const updatePatient = async (id: string, patient: Partial<IPatient>): Promise<IPatient> => {
  const response = await axios.put(`${BASE_URL}${id}/`, patient);
  return response.data;
};

// Función para eliminar un paciente
export const deletePatient = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}${id}/`);
};

export default {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};