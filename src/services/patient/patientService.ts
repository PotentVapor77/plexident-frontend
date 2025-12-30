/**
 * ============================================================================
 * PACIENTE SERVICE
 * ============================================================================
 */

import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import { createApiError } from '../../types/api';
import { logger } from '../../utils/logger';
import type {
  IPaciente,
  IPacienteCreate,
  IPacienteUpdate,
  IPacienteListResponse,
} from '../../types/patient/IPatient';

export const getPacientes = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  activo?: boolean; 
}): Promise<IPacienteListResponse> => {
  try {
    logger.info('Obteniendo lista de pacientes', params);
    const { data } = await api.get<IPacienteListResponse>(ENDPOINTS.patients.base, { params });
    logger.info('✅ Pacientes obtenidos exitosamente', { count: data.data.count || 0 });
    return data;
  } catch (error) {
    logger.error('Error al obtener pacientes', error);
    throw createApiError(error);
  }
};

export const getPacienteById = async (id: string): Promise<IPaciente> => {
  try {
    logger.info('Obteniendo paciente por ID', { id });
    const { data } = await api.get<{ success: boolean; data: IPaciente }>(
      ENDPOINTS.patients.byId(id)
    );
    if (!data.success || !data.data) {
      throw new Error('Paciente no encontrado');
    }
    logger.info('✅ Paciente obtenido exitosamente', { cedula: data.data.cedula_pasaporte });
    return data.data;
  } catch (error) {
    logger.error('Error al obtener paciente', error);
    throw createApiError(error);
  }
};

export const createPaciente = async (pacienteData: IPacienteCreate): Promise<IPaciente> => {
  try {
    logger.info('Creando nuevo paciente', { cedula: pacienteData.cedula_pasaporte });
    const { data } = await api.post<{ success: boolean; data: IPaciente }>(
      ENDPOINTS.patients.base,
      pacienteData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al crear paciente');
    }
    logger.info('✅ Paciente creado exitosamente', { id: data.data.id });
    return data.data;
  } catch (error) {
    logger.error('Error al crear paciente', error);
    throw createApiError(error);
  }
};

export const updatePaciente = async (
  id: string,
  pacienteData: IPacienteUpdate
): Promise<IPaciente> => {
  try {
    logger.info('Actualizando paciente', { id });
    const { data } = await api.patch<{ success: boolean; data: IPaciente }>(
      ENDPOINTS.patients.byId(id),
      pacienteData
    );
    if (!data.success || !data.data) {
      throw new Error('Error al actualizar paciente');
    }
    logger.info('✅ Paciente actualizado exitosamente', { id: data.data.id });
    return data.data;
  } catch (error) {
    logger.error('Error al actualizar paciente', error);
    throw createApiError(error);
  }
};

export const deletePaciente = async (id: string): Promise<void> => {
  try {
    logger.info('Eliminando paciente', { id });
    await api.delete(ENDPOINTS.patients.byId(id));
    logger.info('✅ Paciente eliminado exitosamente', { id });
  } catch (error) {
    logger.error('Error al eliminar paciente', error);
    throw createApiError(error);
  }
};

export const togglePacienteStatus = async (id: string): Promise<IPaciente> => {
  try {
    logger.info('Cambiando estado de paciente', { id });
    const { data } = await api.patch<{ success: boolean; data: IPaciente }>(
      ENDPOINTS.patients.toggleStatus(id)
    );
    if (!data.success || !data.data) {
      throw new Error('Error al cambiar estado');
    }
    logger.info('✅ Estado de paciente actualizado', { id, activo: data.data.activo });
    return data.data;
  } catch (error) {
    logger.error('Error al cambiar estado de paciente', error);
    throw createApiError(error);
  }
};

// yo lo cree: Navarrete

export const getPacientesActivos = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<IPaciente[]> => {
  try {
    logger.info('Obteniendo lista de pacientes activos', params);

    const { data } = await api.get<IPacienteListResponse>(ENDPOINTS.patients.base, {
      params: {
        ...params,
        activo: true,
      },
    });

    const list = data.data; 
    logger.info('✅ Pacientes activos obtenidos', { count: list.count });

    return list.results;
  } catch (error) {
    logger.error('Error al obtener pacientes activos', error);
    throw createApiError(error);
  }
};