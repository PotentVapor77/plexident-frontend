// src/api/services/clinicalRecordService.ts

import type { ApiListWrapper, ClinicalRecordClosePayload, ClinicalRecordCreatePayload, ClinicalRecordDetailResponse, ClinicalRecordInitialData, ClinicalRecordListResponse, ClinicalRecordPaginatedResponse, ClinicalRecordReopenPayload, ClinicalRecordUpdatePayload } from "../../types/clinicalRecords/typeBackendClinicalRecord";
import axiosInstance from "../api/axiosInstance";

const BASE_URL = "clinical-records";


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
  >(BASE_URL + "/", { params: cleanParams });
  
  return response.data.data;
},

  /**
   * Obtener un historial clínico por ID
   */
  getById: async (id: string): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.get<ClinicalRecordDetailResponse>(
      `${BASE_URL}/${id}/`
    );
    return response.data;
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
  getInitialData: async (pacienteId: string): Promise<ClinicalRecordInitialData> => {
    const response = await axiosInstance.get<ClinicalRecordInitialData>(
      `${BASE_URL}/cargar-datos-iniciales/`,
      { params: { paciente_id: pacienteId } }
    );
    return response.data;
  },

  /**
   * Crear un nuevo historial clínico
   */
  create: async (
    payload: ClinicalRecordCreatePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<ClinicalRecordDetailResponse>(
      BASE_URL + "/",
      payload
    );
    return response.data;
  },

  /**
   * Actualizar un historial clínico existente
   */
  update: async (
    id: string,
    payload: ClinicalRecordUpdatePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.patch<ClinicalRecordDetailResponse>(
      `${BASE_URL}/${id}/`,
      payload
    );
    return response.data;
  },

  /**
   * Cerrar un historial clínico
   */
  close: async (
    id: string,
    payload?: ClinicalRecordClosePayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<ClinicalRecordDetailResponse>(
      `${BASE_URL}/${id}/cerrar/`,
      payload || {}
    );
    return response.data;
  },

  /**
   * Reabrir un historial cerrado
   */
  reopen: async (
    id: string,
    payload: ClinicalRecordReopenPayload
  ): Promise<ClinicalRecordDetailResponse> => {
    const response = await axiosInstance.post<ClinicalRecordDetailResponse>(
      `${BASE_URL}/${id}/reabrir/`,
      payload
    );
    return response.data;
  },

  /**
   * Eliminar (lógicamente) un historial clínico
   */
  delete: async (id: string): Promise<{ id: string }> => {
    const response = await axiosInstance.delete<{ id: string }>(
      `${BASE_URL}/${id}/`
    );
    return response.data;
  },
};

export default clinicalRecordService;
