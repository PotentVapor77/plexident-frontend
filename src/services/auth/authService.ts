/**
 * ============================================================================
 * AUTH SERVICE - ✅ CORREGIDO CON ABORTSIGNAL
 * ============================================================================
 */

import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import { createApiError } from '../../types/api';
import type { IUser } from '../../types/user/IUser';
import { logger } from '../../utils/logger';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
  };
}

// ============================================================================
// LOGIN
// ============================================================================

export const login = async (credentials: LoginCredentials): Promise<{ user: IUser }> => {
  try {
    logger.info('Iniciando sesión...');
    
    const { data } = await api.post<LoginResponse>(ENDPOINTS.auth.login, credentials);
    
    if (!data.success || !data.data) {
      throw new Error('Respuesta de login inválida');
    }
    
    const { user } = data.data;
    
    logger.info('✅ Login exitoso');
    
    return { user };
  } catch (error) {
    logger.error('Error en login', error);
    throw createApiError(error);
  }
};

// ============================================================================
// ✅ GET CURRENT USER - CON ABORTSIGNAL
// ============================================================================

export const getCurrentUser = async (signal?: AbortSignal): Promise<IUser> => {
  try {
    const { data } = await api.get<{ success: boolean; data: { user: IUser } }>(
      ENDPOINTS.auth.me,
      { signal }  // ✅ Pasar signal para cancelación
    );
    
    if (!data.success || !data.data) {
      throw new Error('Usuario no encontrado');
    }
    
    return data.data.user;
  } catch (error) {
    throw createApiError(error);
  }
};

// ============================================================================
// LOGOUT
// ============================================================================

export const logout = async (): Promise<void> => {
  try {
    logger.info('Cerrando sesión...');
    
    await api.post(ENDPOINTS.auth.logout);
    
    logger.info('✅ Logout exitoso');
  } catch (error) {
    logger.warn('Error al hacer logout (continuando...)', error);
  }
};
