// src/services/consultation/consultationService.ts

import { ENDPOINTS } from '../../config/api';
import type { IConsultation, IConsultationCreate, IConsultationUpdate } from '../../types/consultations/IConsultation';
import axiosInstance from '../api/axiosInstance';

// ✅ Tipo para la respuesta estandarizada del backend
interface StandardResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export const consultationService = {
  /**
   * Obtener todas las consultas con paginación
   */
  getAll: async (params?: {
    search?: string;
    paciente?: string;
    activo?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const response = await axiosInstance.get<StandardResponse<{
      count: number;
      next: string | null;
      previous: string | null;
      results: IConsultation[];
    }>>(ENDPOINTS.consultations.base, { params });
    
    return response.data.data;
  },

  /**
   * Obtener consulta por ID
   */
  getById: async (id: string) => {
    const response = await axiosInstance.get<StandardResponse<IConsultation>>(
      ENDPOINTS.consultations.byId(id)
    );
    return response.data.data;
  },

  /**
   * Obtener consultas por ID de paciente
   */
  getByPaciente: async (pacienteId: string) => {
    const response = await axiosInstance.get<StandardResponse<IConsultation[]>>(
      ENDPOINTS.consultations.byPaciente(pacienteId)
    );
    return response.data.data;
  },

  /**
   * Crear nueva consulta
   */
  create: async (data: IConsultationCreate) => {
    const response = await axiosInstance.post<StandardResponse<IConsultation>>(
      ENDPOINTS.consultations.base,
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar consulta completa (PUT)
   */
  update: async (id: string, data: IConsultationUpdate) => {
    const response = await axiosInstance.put<StandardResponse<IConsultation>>(
      ENDPOINTS.consultations.byId(id),
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar consulta parcial (PATCH)
   */
  partialUpdate: async (id: string, data: Partial<IConsultationUpdate>) => {
    const response = await axiosInstance.patch<StandardResponse<IConsultation>>(
      ENDPOINTS.consultations.byId(id),
      data
    );
    return response.data.data;
  },

  /**
   * Eliminar consulta (soft delete)
   */
  delete: async (id: string) => {
    const response = await axiosInstance.delete<StandardResponse<{ id: string }>>(
      ENDPOINTS.consultations.byId(id)
    );
    return response.data.data;
  },

}