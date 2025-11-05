// services/userService.tsx - CORREGIDO
// services/userService.ts
import axios from 'axios';
import type { IUser, ICreateUserData, IUpdateUserData } from '../types/IUser';



const BASE_URL = 'http://localhost:8000/tasks/api/usuario/';

// 🔹 Crear usuario
export const createUser = async (userData: ICreateUserData): Promise<IUser> => {
  try {
    console.log('📝 Creando usuario con datos:', {
      ...userData,
      contrasena: '***', // No mostrar la contraseña real
    });

    const response = await axios.post<IUser>(BASE_URL, userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error creando usuario:', error.response?.data);
      throw new Error(JSON.stringify(error.response?.data ?? 'Error desconocido'));
    }
    throw error;
  }
};

// 🔹 Actualizar usuario
export const updateUser = async (id: string, userData: IUpdateUserData): Promise<IUser> => {
  try {
    console.log(`📝 Actualizando usuario ${id}`, {
      ...userData,
      contrasena: userData.contrasena ? '***' : undefined,
    });

    const response = await axios.put<IUser>(`${BASE_URL}${id}/`, userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error actualizando usuario ${id}:`, error.response?.data);
      throw new Error(JSON.stringify(error.response?.data ?? 'Error desconocido'));
    }
    throw error;
  }
};

// 🔹 Obtener todos los usuarios
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response = await axios.get<IUser[]>(BASE_URL);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error obteniendo usuarios:', error.response?.data);
      throw new Error(JSON.stringify(error.response?.data ?? 'Error desconocido'));
    }
    throw error;
  }
};

// 🔹 Eliminar usuario
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}${id}/`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`Error eliminando usuario ${id}:`, error.response?.data);
      throw new Error(JSON.stringify(error.response?.data ?? 'Error desconocido'));
    }
    throw error;
  }
};