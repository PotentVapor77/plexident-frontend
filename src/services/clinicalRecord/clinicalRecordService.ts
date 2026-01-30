// src/api/services/clinicalRecordService.ts

import type {
  ApiListWrapper,
  ClinicalRecordClosePayload,
  ClinicalRecordCreatePayload,
  ClinicalRecordDetailResponse,
  ClinicalRecordInitialData,
  ClinicalRecordListResponse,
  ClinicalRecordPaginatedResponse,
  ClinicalRecordReopenPayload,
  ClinicalRecordUpdatePayload,
} from "../../types/clinicalRecords/typeBackendClinicalRecord";
import axiosInstance from "../api/axiosInstance";

const BASE_URL = "clinical-records";

/**
 * Servicio para interactuar con el backend de historiales clínicos
 * Todos los endpoints retornan datos wrappados en ApiListWrapper
 */
export const clinicalRecordService = {
  /**
   * Obtener todos los historiales clínicos
   */
  getAll: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    estado?: string;
    paciente?: string;
    odontologo_responsable?: string;
    activo?: boolean;
  }): Promise<ClinicalRecordPaginatedResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );

    const response = await axiosInstance.get<
      ApiListWrapper<ClinicalRecordPaginatedResponse>
    >(`${BASE_URL}/`, { params: cleanParams });

    return response.data.data;
  },

  /**
   * Obtener un historial clínico por ID
   */
  getById: async (id: string): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.get<
      ApiListWrapper<ClinicalRecordDetailResponse>
    >(`${BASE_URL}/${id}/`);

    return response.data.data;
  },

  /**
   * Obtener historiales de un paciente específico
   */
  getByPaciente: async (
    pacienteId: string
  ): Promise<ApiListWrapper<ClinicalRecordListResponse[]>> => {
    const response = await axiosInstance.get<
      ApiListWrapper<ClinicalRecordListResponse[]>
    >(`${BASE_URL}/by-paciente/`, {
      params: { paciente_id: pacienteId },
    });

    return response.data;
  },

  /**
   * Cargar datos iniciales de un paciente para pre-llenar el formulario
   */
  getInitialData: async (
    pacienteId: string
  ): Promise<ClinicalRecordInitialData> => {
    const response = await axiosInstance.get<
      ApiListWrapper<ClinicalRecordInitialData>
    >(`${BASE_URL}/cargar-datos-iniciales/`, {
      params: { paciente_id: pacienteId },
    });

    return response.data.data;
  },

  /**
   * Crear un nuevo historial clínico
   */
  create: async (
    payload: ClinicalRecordCreatePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<
      ApiListWrapper<ClinicalRecordDetailResponse>
    >(`${BASE_URL}/`, payload);

    return response.data.data;
  },

  /**
   * Actualizar un historial clínico existente
   */
  update: async (
    id: string,
    payload: ClinicalRecordUpdatePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.patch<
      ApiListWrapper<ClinicalRecordDetailResponse>
    >(`${BASE_URL}/${id}/`, payload);

    return response.data.data;
  },

  /**
   * Cerrar un historial clínico
   */
  close: async (
    id: string,
    payload?: ClinicalRecordClosePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<
      ApiListWrapper<ClinicalRecordDetailResponse>
    >(`${BASE_URL}/${id}/cerrar/`, payload || {});

    return response.data.data;
  },

  /**
   * Reabrir un historial cerrado
   */
  reopen: async (
    id: string,
    payload: ClinicalRecordReopenPayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<
      ApiListWrapper<ClinicalRecordDetailResponse>
    >(`${BASE_URL}/${id}/reabrir/`, payload);

    return response.data.data;
  },

  /**
   * Eliminar (lógicamente) un historial clínico
   */
  delete: async (id: string): Promise<{ id: string }> => {
    const response = await axiosInstance.delete<ApiListWrapper<{ id: string }>>(
      `${BASE_URL}/${id}/`
    );

    return response.data.data;
  },
  addForm033: async (
    historialId: string,
    form033Data: any,
    observaciones?: string
  ): Promise<any> => {
    const response = await axiosInstance.post<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/agregar-form033/`,
      {
        form033_data: form033Data,
        observaciones: observaciones || ''
      }
    );
    
    return response.data.data;
  },

  /**
   * Obtener snapshot del Form033 de un historial
   */
  getForm033: async (historialId: string): Promise<any> => {
    const response = await axiosInstance.get<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/obtener-form033/`
    );
    
    return response.data.data;
  },

  /**
   * Eliminar snapshot del Form033 de un historial
   */
  deleteForm033: async (historialId: string): Promise<void> => {
    await axiosInstance.delete(
      `${BASE_URL}/${historialId}/eliminar-form033/`
    );
  },

  /**
   * Obtener anamnesis de un historial clínico
   */
  getAnamnesis: async (historialId: string): Promise<any> => {
    const response = await axiosInstance.get<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/obtener-anamnesis/`
    );
    
    return response.data.data;
  },
  getIndicadoresByHistorial: async (historialId: string): Promise<any> => {
    const response = await axiosInstance.get<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/indicadores-salud-bucal/`
    );
    return response.data.data;
  },

  saveIndicadores: async (historialId: string, data: any): Promise<any> => {
    const response = await axiosInstance.post<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/guardar-indicadores-salud-bucal/`,
      data
    );
    return response.data.data;
  },

};

export default clinicalRecordService;
