// src/services/complementaryExam/complementaryExamService.ts

import { ENDPOINTS } from '../../config/api';
import type {
  IComplementaryExam,
  IComplementaryExamCreate,
  IComplementaryExamUpdate,
  IComplementaryExamFilters,
  IComplementaryExamPagination,
} from '../../types/complementaryExam/IComplementaryExam';
import api from '../api/axiosInstance';
import { createApiError } from '../../types/api';
import { logger } from '../../utils/logger';

interface CustomBackendResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: null | Record<string, unknown>;
}

interface PaginatedDataResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ComplementaryExamResponse<T> {
  results: T[];
  pagination: IComplementaryExamPagination;
}

// ============================================================================
// EXAMENES COMPLEMENTARIOS
// ============================================================================

export const getComplementaryExams = async (
  filters?: IComplementaryExamFilters
): Promise<ComplementaryExamResponse<IComplementaryExam>> => {
  try {
    const params = new URLSearchParams();
    params.append('expand', 'paciente');

    if (filters?.paciente) params.append('paciente', filters.paciente);
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
    if (filters?.pedido_examenes) params.append('pedido_examenes', filters.pedido_examenes);
    if (filters?.informe_examenes) params.append('informe_examenes', filters.informe_examenes);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<CustomBackendResponse<PaginatedDataResponse<IComplementaryExam>>>(
      `${ENDPOINTS.complementaryExams.base}?${params.toString()}`
    );

    const backendData = response.data.data;
    const pageSize = filters?.page_size || 10;
    const currentPage = filters?.page || 1;
    const totalPages = Math.ceil(backendData.count / pageSize);

    // Calcular si hay páginas siguiente/anterior
    const hasNext = backendData.next !== null;
    const hasPrevious = backendData.previous !== null;

    return {
      results: backendData.results,
      pagination: {
        total_count: backendData.count,
        total_pages: totalPages,
        current_page: currentPage,
        page_size: pageSize,
        has_next: hasNext,
        has_previous: hasPrevious,
      },
    };
  } catch (error) {
    logger.error('Error al obtener exámenes complementarios', error);
    throw createApiError(error);
  }
};

// ... resto de las funciones permanecen igual
export const getComplementaryExamById = async (id: string): Promise<IComplementaryExam> => {
  try {
    const response = await api.get<CustomBackendResponse<IComplementaryExam>>(
      `${ENDPOINTS.complementaryExams.byId(id)}?expand=paciente`
    );
    return response.data.data;
  } catch (error) {
    logger.error('Error al obtener examen complementario por ID', error);
    throw createApiError(error);
  }
};

export const createComplementaryExam = async (
  data: IComplementaryExamCreate
): Promise<IComplementaryExam> => {
  try {
    const dataWithActivo = {
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
    };

    const response = await api.post<CustomBackendResponse<IComplementaryExam>>(
      ENDPOINTS.complementaryExams.base,
      dataWithActivo
    );

    return response.data.data;
  } catch (error) {
    logger.error('Error al crear examen complementario', error);
    throw createApiError(error);
  }
};

export const updateComplementaryExam = async (
  id: string,
  data: IComplementaryExamUpdate
): Promise<IComplementaryExam> => {
  try {
    const response = await api.put<CustomBackendResponse<IComplementaryExam>>(
      ENDPOINTS.complementaryExams.byId(id),
      data
    );

    return response.data.data;
  } catch (error) {
    logger.error('Error al actualizar examen complementario', error);
    throw createApiError(error);
  }
};

export const deleteComplementaryExam = async (id: string): Promise<void> => {
  try {
    await api.patch(ENDPOINTS.complementaryExams.byId(id), { activo: false });
    logger.info('Examen complementario desactivado', { id });
  } catch (error) {
    logger.error('Error al desactivar examen complementario', error);
    throw createApiError(error);
  }
};