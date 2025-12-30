/**
 * ============================================================================
 * USER SERVICE
 * ============================================================================
 */
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import { createApiError } from '../../types/api';
import type {
  IUser,
  ICreateUserData,
  IUpdateUserData,
  IUserListResponse,
} from '../../types/user/IUser';
import { logger } from '../../utils/logger';

/**
 * ============================================================================
 * LISTAR USUARIOS
 * ============================================================================
 */
export const getUsers = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean; 
}): Promise<IUserListResponse> => {
  try {
    logger.info('Obteniendo lista de usuarios', params);
    const { data } = await api.get(ENDPOINTS.users.base, {
      params,
    });

    logger.info('✅ Usuarios obtenidos exitosamente', {
      count: data.count || 0, // CAMBIO: Acceder a count del DRF
    });

    //  CAMBIO: Devolver data directamente (DRF pagination format)
    return data;
  } catch (error) {
    logger.error('Error al obtener usuarios', error);
    throw createApiError(error);
  }
};


/**
 * ============================================================================
 * OBTENER USUARIO POR ID
 * ============================================================================
 */
export const getUserById = async (id: string): Promise<IUser> => {
  try {
    logger.info('Obteniendo usuario por ID', { id });
    const { data } = await api.get<{ success: boolean; data: IUser }>(
      ENDPOINTS.users.byId(id)
    );

    if (!data.success || !data.data) {
      throw new Error('Usuario no encontrado');
    }

    logger.info('✅ Usuario obtenido exitosamente', { username: data.data.username });
    return data.data;
  } catch (error) {
    logger.error('Error al obtener usuario', error);
    throw createApiError(error);
  }
};

/**
 * ============================================================================
 * CREAR USUARIO
 * ============================================================================
 */
export const createUser = async (userData: ICreateUserData): Promise<IUser> => {
  try {
    logger.info('Creando nuevo usuario', { username: userData.username });
    const { data } = await api.post<{ success: boolean; data: IUser }>(
      ENDPOINTS.users.base,
      userData
    );

    if (!data.success || !data.data) {
      throw new Error('Error al crear usuario');
    }

    logger.info('✅ Usuario creado exitosamente', { id: data.data.id });
    return data.data;
  } catch (error) {
    logger.error('Error al crear usuario', error);
    throw createApiError(error);
  }
};

/**
 * ============================================================================
 * ACTUALIZAR USUARIO
 * ============================================================================
 */
export const updateUser = async (
  id: string,
  userData: IUpdateUserData
): Promise<IUser> => {
  try {
    logger.info('Actualizando usuario', { id });
    const { data } = await api.patch<{ success: boolean; data: IUser }>(
      ENDPOINTS.users.byId(id),
      userData
    );

    if (!data.success || !data.data) {
      throw new Error('Error al actualizar usuario');
    }

    logger.info('✅ Usuario actualizado exitosamente', { id: data.data.id });
    return data.data;
  } catch (error) {
    logger.error('Error al actualizar usuario', error);
    throw createApiError(error);
  }
};

/**
 * ============================================================================
 * ELIMINAR USUARIO (SOFT DELETE)
 * ============================================================================
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    logger.info('Eliminando usuario', { id });
    await api.delete(ENDPOINTS.users.byId(id));
    logger.info('✅ Usuario eliminado exitosamente', { id });
  } catch (error) {
    logger.error('Error al eliminar usuario', error);
    throw createApiError(error);
  }
};

/**
 * ============================================================================
 * TOGGLE STATUS (ACTIVAR/DESACTIVAR)
 * ============================================================================
 */
export const toggleUserStatus = async (id: string): Promise<IUser> => {
  try {
    logger.info('Cambiando estado de usuario', { id });
    const { data } = await api.patch<{ success: boolean; data: IUser }>(
      ENDPOINTS.users.toggleStatus(id)
    );

    if (!data.success || !data.data) {
      throw new Error('Error al cambiar estado');
    }

    logger.info('✅ Estado de usuario actualizado', { id, activo: data.data.is_active});
    return data.data;
  } catch (error) {
    logger.error('Error al cambiar estado de usuario', error);
    throw createApiError(error);
  }
};

export const reactivateUser = async (id: string): Promise<IUser> => {
  try {
    logger.info('Reactivando usuario', { id });
    const { data } = await api.patch<IUser>(
      `${ENDPOINTS.users.byId(id)}/reactivate/`
    );

    logger.info('✅ Usuario reactivado exitosamente', { id });
    return data;
  } catch (error) {
    logger.error('Error al reactivar usuario', error);
    throw createApiError(error);
  }
};