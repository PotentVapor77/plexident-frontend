// src/services/backgrounds/backgroundsService.ts

import { ENDPOINTS } from '../../config/api';
import type {
  IAntecedentePersonal,
  IAntecedentePersonalCreate,
  IAntecedentePersonalUpdate,
  IAntecedenteFamiliar,
  IAntecedenteFamiliarCreate,
  IAntecedenteFamiliarUpdate,
  IAntecedenteFilters,
  IAntecedentePagination,
} from '../../types/backgrounds/IBackground';
import api from '../api/axiosInstance';
import { createApiError } from '../../types/api';
import { logger } from '../../utils/logger';

interface CustomBackendResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: null | Record<string, string[]>;
}

interface PaginatedDataResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface AntecedentesResponse<T> {
  results: T[];
  pagination: IAntecedentePagination;
}

// ============================================================================
// ANTECEDENTES PERSONALES
// ============================================================================

export const getAntecedentesPersonales = async (
  filters?: IAntecedenteFilters
): Promise<AntecedentesResponse<IAntecedentePersonal>> => {
  try {
    const params = new URLSearchParams();
   
    params.append('expand', 'paciente');

    if (filters?.paciente) params.append('paciente', filters.paciente);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('ordering', '-fecha_creacion');

    const response = await api.get<CustomBackendResponse<PaginatedDataResponse<IAntecedentePersonal>>>(
      `${ENDPOINTS.personalBackgrounds.base}?${params.toString()}`
    );

    const backendData = response.data.data;

    return {
      results: backendData.results,
      pagination: {
        total_count: backendData.count,
        total_pages: backendData.total_pages,
        current_page: backendData.current_page,
        page_size: backendData.page_size,
      },
    };
  } catch (error) {
    logger.error('Error al obtener antecedentes personales', error);
    throw createApiError(error);
  }
};

export const getAllAntecedentesPersonales = async (
  filters?: IAntecedenteFilters
): Promise<AntecedentesResponse<IAntecedentePersonal>> => {
  try {
    const params = new URLSearchParams();
    params.append('expand', 'paciente');
    
    // Sin paginación para obtener todos
    if (filters?.paciente) params.append('paciente', filters.paciente);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('ordering', '-fecha_creacion');

    const response = await api.get<CustomBackendResponse<PaginatedDataResponse<IAntecedentePersonal>>>(
      `${ENDPOINTS.personalBackgrounds.base}?${params.toString()}&page_size=1000`
    );

    const backendData = response.data.data;

    return {
      results: backendData.results,
      pagination: {
        total_count: backendData.count,
        total_pages: 1,
        current_page: 1,
        page_size: 1000,
      },
    };
  } catch (error) {
    logger.error('Error al obtener todos los antecedentes personales', error);
    throw createApiError(error);
  }
};

export const getAntecedentePersonalById = async (id: string): Promise<IAntecedentePersonal> => {
  try {
    const response = await api.get<CustomBackendResponse<IAntecedentePersonal>>(
      `${ENDPOINTS.personalBackgrounds.byId(id)}?expand=paciente`
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al obtener antecedente personal por ID', error);
    throw createApiError(error);
  }
};

export const createAntecedentePersonal = async (
  data: IAntecedentePersonalCreate
): Promise<IAntecedentePersonal> => {
  try {
    const dataWithActivo = {
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
    };

    const response = await api.post<CustomBackendResponse<IAntecedentePersonal>>(
      ENDPOINTS.personalBackgrounds.base,
      dataWithActivo
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al crear antecedente personal', error);
    throw createApiError(error);
  }
};

export const updateAntecedentePersonal = async (
  id: string,
  data: IAntecedentePersonalUpdate
): Promise<IAntecedentePersonal> => {
  try {
    const response = await api.put<CustomBackendResponse<IAntecedentePersonal>>(
      ENDPOINTS.personalBackgrounds.byId(id),
      data
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al actualizar antecedente personal', error);
    throw createApiError(error);
  }
};

export const deleteAntecedentePersonal = async (id: string): Promise<void> => {
  try {
    await api.patch(ENDPOINTS.personalBackgrounds.byId(id), { activo: false });
    logger.info('Antecedente personal desactivado', { id });
  } catch (error) {
    logger.error('Error al desactivar antecedente personal', error);
    throw createApiError(error);
  }
};

// ============================================================================
// ANTECEDENTES FAMILIARES
// ============================================================================

export const getAntecedentesFamiliares = async (
  filters?: IAntecedenteFilters
): Promise<AntecedentesResponse<IAntecedenteFamiliar>> => {
  try {
    const params = new URLSearchParams();
    params.append('expand', 'paciente');

    if (filters?.paciente) params.append('paciente', filters.paciente);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('ordering', '-fecha_creacion');

    const response = await api.get<CustomBackendResponse<PaginatedDataResponse<IAntecedenteFamiliar>>>(
      `${ENDPOINTS.familyBackgrounds.base}?${params.toString()}`
    );

    const backendData = response.data.data;

    return {
      results: backendData.results,
      pagination: {
        total_count: backendData.count,
        total_pages: backendData.total_pages,
        current_page: backendData.current_page,
        page_size: backendData.page_size,
      },
    };
  } catch (error) {
    logger.error('Error al obtener antecedentes familiares', error);
    throw createApiError(error);
  }
};

export const getAllAntecedentesFamiliares = async (
  filters?: IAntecedenteFilters
): Promise<AntecedentesResponse<IAntecedenteFamiliar>> => {
  try {
    const params = new URLSearchParams();
    params.append('expand', 'paciente');

    if (filters?.paciente) params.append('paciente', filters.paciente);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('ordering', '-fecha_creacion');

    const response = await api.get<CustomBackendResponse<PaginatedDataResponse<IAntecedenteFamiliar>>>(
      `${ENDPOINTS.familyBackgrounds.base}?${params.toString()}&page_size=1000`
    );

    const backendData = response.data.data;

    return {
      results: backendData.results,
      pagination: {
        total_count: backendData.count,
        total_pages: 1,
        current_page: 1,
        page_size: 1000,
      },
    };
  } catch (error) {
    logger.error('Error al obtener todos los antecedentes familiares', error);
    throw createApiError(error);
  }
};

export const getAntecedenteFamiliarById = async (id: string): Promise<IAntecedenteFamiliar> => {
  try {
    const response = await api.get<CustomBackendResponse<IAntecedenteFamiliar>>(
      `${ENDPOINTS.familyBackgrounds.byId(id)}?expand=paciente`
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al obtener antecedente familiar por ID', error);
    throw createApiError(error);
  }
};

export const createAntecedenteFamiliar = async (
  data: IAntecedenteFamiliarCreate
): Promise<IAntecedenteFamiliar> => {
  try {
    const dataWithActivo = {
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
    };

    const response = await api.post<CustomBackendResponse<IAntecedenteFamiliar>>(
      ENDPOINTS.familyBackgrounds.base,
      dataWithActivo
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al crear antecedente familiar', error);
    throw createApiError(error);
  }
};

export const updateAntecedenteFamiliar = async (
  id: string,
  data: IAntecedenteFamiliarUpdate
): Promise<IAntecedenteFamiliar> => {
  try {
    const response = await api.put<CustomBackendResponse<IAntecedenteFamiliar>>(
      ENDPOINTS.familyBackgrounds.byId(id),
      data
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al actualizar antecedente familiar', error);
    throw createApiError(error);
  }
};

export const deleteAntecedenteFamiliar = async (id: string): Promise<void> => {
  try {
    await api.patch(ENDPOINTS.familyBackgrounds.byId(id), { activo: false });
    logger.info('Antecedente familiar desactivado', { id });
  } catch (error) {
    logger.error('Error al desactivar antecedente familiar', error);
    throw createApiError(error);
  }
};

// ============================================================================
// FUNCIONES ESPECIALES PARA DESACTIVAR AMBOS ANTECEDENTES
// ============================================================================

/**
 * Desactiva ambos antecedentes (personal y familiar) de un paciente
 * Busca por pacienteId y desactiva todo lo que encuentre
 */
export const desactivarTodosAntecedentesPorPacienteId = async (pacienteId: string): Promise<void> => {
  try {
    // Obtener antecedentes personales activos
    const antecedentesPersonales = await getAllAntecedentesPersonales({ 
      paciente: pacienteId, 
      activo: true 
    });
    
    // Obtener antecedentes familiares activos
    const antecedentesFamiliares = await getAllAntecedentesFamiliares({ 
      paciente: pacienteId, 
      activo: true 
    });
    
    // Preparar todas las peticiones de desactivación
    const promesasDesactivacion: Promise<void>[] = [];
    
    // Desactivar antecedentes personales
    antecedentesPersonales.results.forEach(antecedente => {
      promesasDesactivacion.push(
        api.patch(ENDPOINTS.personalBackgrounds.byId(antecedente.id), { activo: false })
          .then(() => logger.info('Antecedente personal desactivado', { id: antecedente.id }))
      );
    });
    
    // Desactivar antecedentes familiares
    antecedentesFamiliares.results.forEach(antecedente => {
      promesasDesactivacion.push(
        api.patch(ENDPOINTS.familyBackgrounds.byId(antecedente.id), { activo: false })
          .then(() => logger.info('Antecedente familiar desactivado', { id: antecedente.id }))
      );
    });
    
    // Ejecutar todas las desactivaciones
    await Promise.all(promesasDesactivacion);
    
    logger.info('✅ Todos los antecedentes desactivados para paciente', { 
      pacienteId, 
      personales: antecedentesPersonales.results.length,
      familiares: antecedentesFamiliares.results.length 
    });
  } catch (error) {
    logger.error('Error al desactivar antecedentes del paciente', error);
    throw createApiError(error);
  }
};

/**
 * Desactiva antecedente personal y familiar por sus IDs específicos
 */
export const desactivarAntecedentesPorIds = async (
  personalId: string, 
  familiarId: string
): Promise<void> => {
  try {
    await Promise.all([
      api.patch(ENDPOINTS.personalBackgrounds.byId(personalId), { activo: false }),
      api.patch(ENDPOINTS.familyBackgrounds.byId(familiarId), { activo: false })
    ]);
    
    logger.info('✅ Ambos antecedentes desactivados', { personalId, familiarId });
  } catch (error) {
    logger.error('Error al desactivar antecedentes por IDs', error);
    throw createApiError(error);
  }
};