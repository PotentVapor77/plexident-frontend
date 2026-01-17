// src/services/patient/anamnesisService.ts

import { ENDPOINTS } from '../../config/api';
import type { IAnamnesis, IAnamnesisCreate, IAnamnesisUpdate } from '../../types/anamnesis/IAnamnesis';
import axiosInstance from '../api/axiosInstance';

// ✅ Tipo para la respuesta estandarizada del backend
interface StandardResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

// Tipo para resumen de condiciones
interface ResumenCondiciones {
  resumen_condiciones: string;
  alergias: {
    antibioticos: string;
    anestesia: string;
    otras_alergias: boolean;
  };
  condiciones_criticas: {
    problemas_coagulacion: boolean;
    problemas_anestesicos: boolean;
    enfermedad_cardiaca: boolean;
  };
  enfermedades_cronicas: {
    diabetes: boolean;
    hipertension: boolean;
    asma: boolean;
  };
}

export const anamnesisService = {
  /**
   * Obtener todas las anamnesis con paginación
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
      results: IAnamnesis[];
    }>>(ENDPOINTS.anamnesis.base, { params });
    
    return response.data.data;
  },

  /**
   * Obtener anamnesis por ID
   */
  getById: async (id: string) => {
    const response = await axiosInstance.get<StandardResponse<IAnamnesis>>(
      ENDPOINTS.anamnesis.byId(id)
    );
    return response.data.data;
  },

  /**
   * Obtener anamnesis por ID de paciente
   */
  getByPaciente: async (pacienteId: string) => {
    const response = await axiosInstance.get<StandardResponse<IAnamnesis>>(
      ENDPOINTS.anamnesis.byPaciente(pacienteId)
    );
    return response.data.data;
  },

  /**
   * Crear nueva anamnesis
   */
  create: async (data: IAnamnesisCreate) => {
    const response = await axiosInstance.post<StandardResponse<IAnamnesis>>(
      ENDPOINTS.anamnesis.base,
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar anamnesis completa (PUT)
   */
  update: async (id: string, data: IAnamnesisUpdate) => {
    const response = await axiosInstance.put<StandardResponse<IAnamnesis>>(
      ENDPOINTS.anamnesis.byId(id),
      data
    );
    return response.data.data;
  },

  /**
   * Actualizar anamnesis parcial (PATCH)
   */
  partialUpdate: async (id: string, data: Partial<IAnamnesisUpdate>) => {
    const response = await axiosInstance.patch<StandardResponse<IAnamnesis>>(
      ENDPOINTS.anamnesis.byId(id),
      data
    );
    return response.data.data;
  },

  /**
   * Eliminar anamnesis (soft delete)
   */
  delete: async (id: string) => {
    const response = await axiosInstance.delete<StandardResponse<{ id: string }>>(
      ENDPOINTS.anamnesis.byId(id)
    );
    return response.data.data;
  },

  /**
   * Obtener resumen de condiciones médicas
   */
  getResumen: async (id: string) => {
    const response = await axiosInstance.get<StandardResponse<ResumenCondiciones>>(
      ENDPOINTS.anamnesis.resumenRiesgos(id)
    );
    return response.data.data;
  },
};