import axios from 'axios';
import type { IUser, ICreateUserData, IUpdateUserData } from '../types/IUser';

const BASE_URL = 'http://localhost:8000/api/users/';

// 🔹 Crear configuración de headers con autenticación JWT
const createAuthConfig = (token: string) => {
  if (!token) {
    throw new Error('No hay token de autenticación disponible');
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
};

// 🔹 Interfaz para la respuesta estándar del backend
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  error?: string;
}

// 🔹 Obtener todos los usuarios
export const getAllUsers = async (token: string): Promise<IUser[]> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.get<ApiResponse<IUser[]>>(BASE_URL, config);
    
    console.log('📨 Respuesta de usuarios:', response.data);
    
    // ✅ CORREGIDO: Extraer los usuarios de response.data.data
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      const users = response.data.data;
      console.log(`✅ Obtenidos ${users.length} usuarios`);
      return users;
    } else {
      console.error('❌ Formato de respuesta inesperado:', response.data);
      throw new Error('Formato de respuesta inesperado del servidor');
    }
    
  } catch (error: unknown) {
    console.error('❌ Error en getAllUsers:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message || 
                     error.response?.data?.detail || 
                     'Error al obtener usuarios';
      throw new Error(message);
    }
    
    throw new Error('Error de conexión con el servidor');
  }
};

// 🔹 Crear usuario
export const createUser = async (token: string, userData: ICreateUserData): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.post<ApiResponse<IUser>>(BASE_URL, userData, config);
    
    // ✅ Extraer usuario de response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Respuesta del servidor incompleta');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al crear usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Actualizar usuario
export const updateUser = async (token: string, id: string, userData: IUpdateUserData): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.put<ApiResponse<IUser>>(`${BASE_URL}${id}/`, userData, config);
    
    // ✅ Extraer usuario de response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Respuesta del servidor incompleta');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al actualizar usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Eliminar usuario
export const deleteUser = async (token: string, id: string): Promise<void> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.delete<ApiResponse<void>>(`${BASE_URL}${id}/`, config);
    
    // ✅ Verificar respuesta exitosa
    if (response.data && response.data.status >= 200 && response.data.status < 300) {
      return;
    } else {
      throw new Error(response.data?.message || 'Error al eliminar usuario');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al eliminar usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Obtener usuario por ID
export const getUserById = async (token: string, id: string): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.get<ApiResponse<IUser>>(`${BASE_URL}${id}/`, config);
    
    // ✅ Extraer usuario de response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Respuesta del servidor incompleta');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al obtener usuario';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Obtener perfil del usuario actual
export const getCurrentUserProfile = async (token: string): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.get<ApiResponse<IUser>>(`${BASE_URL}profile/`, config);
    
    // ✅ Extraer usuario de response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Respuesta del servidor incompleta');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al obtener perfil';
      throw new Error(message);
    }
    throw error;
  }
};

// 🔹 Actualizar perfil del usuario actual
export const updateCurrentUserProfile = async (token: string, userData: Partial<IUser>): Promise<IUser> => {
  try {
    const config = createAuthConfig(token);
    const response = await axios.put<ApiResponse<IUser>>(`${BASE_URL}update_profile/`, userData, config);
    
    // ✅ Extraer usuario de response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Respuesta del servidor incompleta');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message ||
                     error.response?.data?.detail ||
                     'Error al actualizar perfil';
      throw new Error(message);
    }
    throw error;
  }
};