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
  DiagnosticosCIEResponse,
  PlanTratamientoData,
  SesionTratamientoData,
} from "../../types/clinicalRecords/typeBackendClinicalRecord";
import axiosInstance from "../api/axiosInstance";
import diagnosticosCieService from "./diagnosticosCieService";
import { indicesCariesService } from "./indicesCariesService";

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

  getAvailableDiagnosticsCIE: async (pacienteId: string, tipocarga?: "nuevos" | "todos" | null) => {
  const response = await axiosInstance.get<ApiListWrapper<DiagnosticosCIEResponse>>(
    `${BASE_URL}/diagnosticos-cie/`,
    {
      params: { 
        paciente_id: pacienteId,
        tipo_carga: tipocarga || "nuevos"
      }
    }
  );
  return response.data.data;
},
  getDiagnosticsByRecord: async (historialId: string) => {
  const response = await axiosInstance.get<ApiListWrapper<DiagnosticosCIEResponse>>(
    `${BASE_URL}/${historialId}/obtener-diagnosticos-cie/`
  );
  return response.data.data;
},
getSesionesByHistorial: async (historialId: string): Promise<SesionTratamientoData[]> => {
  const response = await axiosInstance.get<ApiListWrapper<SesionTratamientoData[]>>(
    `${BASE_URL}/${historialId}/sesiones-plan-tratamiento/`
  );
  return response.data.data;
},
getPlanTratamientoByHistorial: async (historialId: string): Promise<PlanTratamientoData> => {
  try {
    const response = await axiosInstance.get<ApiListWrapper<PlanTratamientoData>>(
      `${BASE_URL}/${historialId}/plan-tratamiento/`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error obteniendo plan para historial ${historialId}:`, error);
    throw error;
  }
},


getPlanesTratamientoPaciente: async (pacienteId: string): Promise<PlanTratamientoData[]> => {
  const response = await axiosInstance.get<ApiListWrapper<PlanTratamientoData[]>>(
    `${BASE_URL}/planes-tratamiento/`,
    { params: { pacienteid: pacienteId } }
  );
  return response.data.data;
},

getDatosCompletosPlan: async (historialId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get<ApiListWrapper<any>>(
      `${BASE_URL}/${historialId}/datos-completos-plan/`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error obteniendo datos completos del plan para historial ${historialId}:`, error);
    throw error;
  }
},
getPlanesDisponibles: async (pacienteId: string): Promise<PlanTratamientoData[]> => {
    return clinicalRecordService.getPlanesTratamientoPaciente(pacienteId);
  },

  getPlanTratamientoHistorico: async (historialId: string): Promise<PlanTratamientoData | null> => {
  try {
    const response = await axiosInstance.get<ApiListWrapper<PlanTratamientoData>>(
      `${BASE_URL}/${historialId}/plan-tratamiento-historico/`
    );
    return response.data.data;
  } catch (error: any) {
    // Si no tiene plan asociado, retornar null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
},

  loadDiagnosticsToRecord: diagnosticosCieService.loadToRecord,
  deleteAllDiagnosticsFromRecord: diagnosticosCieService.deleteAllFromRecord,
  deleteDiagnosticIndividual: diagnosticosCieService.deleteIndividual,
  updateDiagnosticType: diagnosticosCieService.updateType,
  syncDiagnosticsInRecord: diagnosticosCieService.syncInRecord,


  getLatestByPaciente: indicesCariesService.getLatestByPaciente,
  getByHistorial: indicesCariesService.getByHistorial,
  saveToHistorial: indicesCariesService.saveToHistorial,
  updateInHistorial: indicesCariesService.updateInHistorial

};

export default clinicalRecordService;
