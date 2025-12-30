// src/services/familyBackground/familyBackgroundService.ts

import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import { createApiError } from '../../types/api';
import { logger } from '../../utils/logger';
import type {
  IFamilyBackground,
  IFamilyBackgroundCreate,
  IFamilyBackgroundUpdate,
  IFamilyBackgroundListResponse,
  IFamilyBackgroundSingleResponse,
} from '../../types/familyBackground/IFamilyBackground';

/**
 * Obtener lista paginada de antecedentes familiares
 */
export const getFamilyBackgrounds = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
}): Promise<IFamilyBackgroundListResponse> => {
  try {
    logger.info('Obteniendo lista de antecedentes familiares', params);
    const { data } = await api.get<IFamilyBackgroundListResponse>(
      ENDPOINTS.familyBackgrounds.base,
      { params }
    );
    logger.info('✅ Antecedentes familiares obtenidos exitosamente', {
      count: data.data.count || 0,
    });
    return data;
  } catch (error) {
    logger.error('Error al obtener antecedentes familiares', error);
    throw createApiError(error);
  }
};

/**
 * Obtener antecedentes familiares por ID
 */
export const getFamilyBackgroundById = async (
  id: string
): Promise<IFamilyBackground> => {
  try {
    logger.info('Obteniendo antecedentes familiares por ID', { id });
    const { data } = await api.get<IFamilyBackgroundSingleResponse>(
      ENDPOINTS.familyBackgrounds.byId(id)
    );
    if (!data.success || !data.data) {
      throw new Error('Antecedentes familiares no encontrados');
    }
    logger.info('✅ Antecedentes familiares obtenidos exitosamente', {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al obtener antecedentes familiares', error);
    throw createApiError(error);
  }
};

/**
 * Obtener antecedentes familiares por ID de paciente
 */
export const getFamilyBackgroundByPaciente = async (
  pacienteId: string
): Promise<IFamilyBackground> => {
  try {
    logger.info('Obteniendo antecedentes familiares por paciente', { pacienteId });
    const { data } = await api.get<IFamilyBackgroundSingleResponse>(
      ENDPOINTS.familyBackgrounds.byPaciente(pacienteId)
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
 * Crear nuevos antecedentes familiares
 */
export const createFamilyBackground = async (
  backgroundData: IFamilyBackgroundCreate
): Promise<IFamilyBackground> => {
  try {
    logger.info('Creando antecedentes familiares', {
      paciente: backgroundData.paciente,
    });
    const { data } = await api.post<IFamilyBackgroundSingleResponse>(
      ENDPOINTS.familyBackgrounds.base,
      backgroundData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al crear antecedentes familiares');
    }
    logger.info('✅ Antecedentes familiares creados exitosamente', {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al crear antecedentes familiares', error);
    throw createApiError(error);
  }
};

/**
 * Actualizar antecedentes familiares
 */
export const updateFamilyBackground = async (
  id: string,
  backgroundData: IFamilyBackgroundUpdate
): Promise<IFamilyBackground> => {
  try {
    logger.info('Actualizando antecedentes familiares', { id });
    const { data } = await api.patch<IFamilyBackgroundSingleResponse>(
      ENDPOINTS.familyBackgrounds.byId(id),
      backgroundData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al actualizar antecedentes familiares');
    }
    logger.info('✅ Antecedentes familiares actualizados exitosamente', {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error('Error al actualizar antecedentes familiares', error);
    throw createApiError(error);
  }
};

/**
 * Eliminar antecedentes familiares (eliminación lógica)
 */
export const deleteFamilyBackground = async (id: string): Promise<{ id: string }> => {
  try {
    logger.info('Eliminando antecedentes familiares', { id });
    const { data } = await api.delete<{ id: string }>(
      ENDPOINTS.familyBackgrounds.byId(id)
    );
    logger.info('✅ Antecedentes familiares eliminados exitosamente', { id });
    return data;
  } catch (error) {
    logger.error('Error al eliminar antecedentes familiares', error);
    throw createApiError(error);
  }
};
