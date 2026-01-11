// src/services/treatmentPlan/treatmentPlanService.ts

import type {
  PaginatedResponse,
  PaginationParams,
  PlanTratamientoCreatePayload,
  PlanTratamientoUpdatePayload,
  SesionTratamientoCreatePayload,
  SesionTratamientoUpdatePayload,
  SessionPaginationParams,
} from "../../core/types/treatmentPlan.types";
import type {
  DiagnosticosDisponiblesResponse,
  PlanTratamientoDetailResponse,
  PlanTratamientoListResponse,
  SesionTratamientoDetailResponse,
  SesionTratamientoListResponse,
} from "../../types/treatmentPlan/typeBackendTreatmentPlan";
import api from "../api/axiosInstance";

// Tipo genérico para respuestas backend
type BackendResponse<T> = {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: any;
};

// ============================================================================
// HELPER: Construir query params
// ============================================================================
function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  return queryParams;
}

// ============================================================================
// PLANES DE TRATAMIENTO
// ============================================================================
export const treatmentPlanService = {
  // --------------------------------------------------------------------------
  // Listar planes
  // --------------------------------------------------------------------------
  async getPlanes(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<PlanTratamientoListResponse>> {
    const { page = 1, page_size = 10, paciente_id, search } = params;

    const queryParams = buildQueryParams({
      page,
      page_size,
      paciente_id,
      search,
    });

    const response = await api.get<
      BackendResponse<PaginatedResponse<PlanTratamientoListResponse>>
    >(`/odontogram/planes-tratamiento/?${queryParams}`);

    // ⬅ devolvemos solo la parte de paginación
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Obtener plan por ID
  // --------------------------------------------------------------------------
  async getPlanById(planId: string): Promise<PlanTratamientoDetailResponse> {
    const response = await api.get<BackendResponse<PlanTratamientoDetailResponse>>(
      `/odontogram/planes-tratamiento/${planId}/`
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Crear plan
  // --------------------------------------------------------------------------
  async createPlan(
    payload: PlanTratamientoCreatePayload
  ): Promise<PlanTratamientoDetailResponse> {
    const response = await api.post<BackendResponse<PlanTratamientoDetailResponse>>(
      "/odontogram/planes-tratamiento/",
      payload
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Actualizar plan
  // --------------------------------------------------------------------------
  async updatePlan(
    planId: string,
    payload: PlanTratamientoUpdatePayload
  ): Promise<PlanTratamientoDetailResponse> {
    const response = await api.patch<BackendResponse<PlanTratamientoDetailResponse>>(
      `/odontogram/planes-tratamiento/${planId}/`,
      payload
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Eliminar plan (borrado lógico)
  // --------------------------------------------------------------------------
  async deletePlan(planId: string): Promise<void> {
    await api.delete(`/odontogram/planes-tratamiento/${planId}/`);
  },

  // --------------------------------------------------------------------------
  // Obtener diagnósticos disponibles del odontograma
  // --------------------------------------------------------------------------
  async getDiagnosticosDisponibles(
    planId: string
  ): Promise<DiagnosticosDisponiblesResponse> {
    const response = await api.get<
      BackendResponse<DiagnosticosDisponiblesResponse>
    >(`/odontogram/planes-tratamiento/${planId}/diagnosticos_disponibles/`);
    return response.data.data;
  },
};

// ============================================================================
// SESIONES DE TRATAMIENTO
// ============================================================================
export const sessionService = {
  // --------------------------------------------------------------------------
  // Listar sesiones
  // --------------------------------------------------------------------------
  async getSessions(
    params: SessionPaginationParams = {}
  ): Promise<PaginatedResponse<SesionTratamientoListResponse>> {
    const { page = 1, page_size = 20, plan_id, paciente_id, estado } = params;

    const queryParams = buildQueryParams({
      page,
      page_size,
      plan_id,
      paciente_id,
      estado,
    });

    const response = await api.get<
      BackendResponse<PaginatedResponse<SesionTratamientoListResponse>>
    >(`/odontogram/sesiones-tratamiento/?${queryParams}`);

    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Obtener sesión por ID
  // --------------------------------------------------------------------------
  async getSessionById(sessionId: string): Promise<SesionTratamientoDetailResponse> {
    const response = await api.get<BackendResponse<SesionTratamientoDetailResponse>>(
      `/odontogram/sesiones-tratamiento/${sessionId}/`
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Crear sesión
  // --------------------------------------------------------------------------
  async createSession(
    payload: SesionTratamientoCreatePayload
  ): Promise<SesionTratamientoDetailResponse> {
    const response = await api.post<BackendResponse<SesionTratamientoDetailResponse>>(
      "/odontogram/sesiones-tratamiento/",
      payload
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Actualizar sesión
  // --------------------------------------------------------------------------
  async updateSession(
    sessionId: string,
    payload: SesionTratamientoUpdatePayload
  ): Promise<SesionTratamientoDetailResponse> {
    const response = await api.patch<BackendResponse<SesionTratamientoDetailResponse>>(
      `/odontogram/sesiones-tratamiento/${sessionId}/`,
      payload
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Completar sesión
  // --------------------------------------------------------------------------
  async completeSession(sessionId: string): Promise<SesionTratamientoDetailResponse> {
    const response = await api.post<BackendResponse<SesionTratamientoDetailResponse>>(
      `/odontogram/sesiones-tratamiento/${sessionId}/completar/`
    );
    return response.data.data;
  },

  // --------------------------------------------------------------------------
  // Firmar sesión
  // --------------------------------------------------------------------------
  async signSession(
    sessionId: string,
    firma_digital: string
  ): Promise<SesionTratamientoDetailResponse> {
    const response = await api.post<BackendResponse<SesionTratamientoDetailResponse>>(
      `/odontogram/sesiones-tratamiento/${sessionId}/firmar/`,
      { firma_digital }
    );
    return response.data.data;
  },
};
