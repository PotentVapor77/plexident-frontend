/**
 * ============================================================================
 * PERSONAL BACKGROUND SERVICE
 * ============================================================================
 */

import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import { createApiError } from '../../types/api';
import { logger } from '../../utils/logger';
import type {
  IPersonalBackground,
  IPersonalBackgroundCreate,
  IPersonalBackgroundUpdate,
  IPersonalBackgroundListResponse,
  IPersonalBackgroundSingleResponse,
} from '../../types/personalBackground/IPersonalBackground';

/**
 * Obtener lista paginada de antecedentes personales
 */
export const getPersonalBackgrounds = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
}): Promise<IPersonalBackgroundListResponse> => {
  try {
    logger.info('Obteniendo lista de antecedentes personales', params);
    const { data } = await api.get<IPersonalBackgroundListResponse>(
      ENDPOINTS.personalBackgrounds.base,
      { params }
    );
    logger.info('✅ Antecedentes personales obtenidos exitosamente', {
      count: data.data.count || 0,
    });
    return data;
  } catch (error) {
    logger.error('Error al obtener antecedentes personales', error);
    throw createApiError(error);
  }
};

/**
 * Obtener antecedentes personales por ID
 */
export const getPersonalBackgroundById = async (
  id: string
): Promise<IPersonalBackground> => {
  try {
    logger.info('Obteniendo antecedentes personales por ID', { id });
    const { data } = await api.get<IPersonalBackgroundSingleResponse>(
      ENDPOINTS.personalBackgrounds.byId(id)
    );
    if (!data.success || !data.data) {
      throw new Error('Antecedentes personales no encontrados');
    }
    logger.info('✅ Antecedentes personales obtenidos exitosamente', {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al obtener antecedentes personales', error);
    throw createApiError(error);
  }
};

/**
 * Obtener antecedentes personales por ID de paciente
 */
export const getPersonalBackgroundByPaciente = async (
  pacienteId: string
): Promise<IPersonalBackground> => {
  try {
    logger.info('Obteniendo antecedentes personales por paciente', { pacienteId });
    const { data } = await api.get<IPersonalBackgroundSingleResponse>(
      ENDPOINTS.personalBackgrounds.byPaciente(pacienteId)
    );
    if (!data.success || !data.data) {
      throw new Error('No se encontraron antecedentes para este paciente');
    }
    logger.info('✅ Antecedentes del paciente obtenidos exitosamente', {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al obtener antecedentes por paciente', error);
    throw createApiError(error);
  }
};

/**
 * Crear nuevos antecedentes personales
 */
export const createPersonalBackground = async (
  backgroundData: IPersonalBackgroundCreate
): Promise<IPersonalBackground> => {
  try {
    logger.info('Creando antecedentes personales', {
      paciente: backgroundData.paciente,
    });
    const { data } = await api.post<IPersonalBackgroundSingleResponse>(
      ENDPOINTS.personalBackgrounds.base,
      backgroundData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al crear antecedentes personales');
    }
    logger.info('✅ Antecedentes personales creados exitosamente', {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al crear antecedentes personales', error);
    throw createApiError(error);
  }
};

/**
 * Actualizar antecedentes personales
 */
export const updatePersonalBackground = async (
  id: string,
  backgroundData: IPersonalBackgroundUpdate
): Promise<IPersonalBackground> => {
  try {
    logger.info('Actualizando antecedentes personales', { id });
    const { data } = await api.patch<IPersonalBackgroundSingleResponse>(
      ENDPOINTS.personalBackgrounds.byId(id),
      backgroundData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al actualizar antecedentes personales');
    }
    logger.info('✅ Antecedentes personales actualizados exitosamente', {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al actualizar antecedentes personales', error);
    throw createApiError(error);
  }
};

/**
 * Eliminar antecedentes personales (eliminación lógica)
 */
export const deletePersonalBackground = async (id: string): Promise<{ id: string }> => {
  try {
    logger.info('Eliminando antecedentes personales', { id });
    const { data } = await api.delete<{ id: string }>(
      ENDPOINTS.personalBackgrounds.byId(id)
    );
    logger.info('✅ Antecedentes personales eliminados exitosamente', { id });
    return data;
  } catch (error) {
    logger.error('Error al eliminar antecedentes personales', error);
    throw createApiError(error);
  }
};

