// src/services/dashboard/dashboardApi.ts
import api from '../api/axiosInstance';
import type {
  DashboardResponse,
  OverviewResponse,
  KPIsResponse,
  CitasStatsResponse,
  DiagnosticosFrecuentesResponse,
  PeriodosDisponiblesResponse
} from '../../types/dashboard/IDashboard';

// ✅ Interfaz para la respuesta estándar del backend
interface StandardApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: null | unknown;
}

// Definir interfaces para los filtros
interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  periodo?: string;
}

interface CitasStatsFilters {
  fecha_inicio: string;
  fecha_fin: string;
}

interface DiagnosticosFrecuentesFilters {
  fecha_inicio: string;
  fecha_fin: string;
  limit?: number;
}

export const dashboardApi = {
  getDashboardStats: async (filters?: DashboardFilters): Promise<DashboardResponse> => {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.periodo) params.append('periodo', filters.periodo);

    const url = `/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<StandardApiResponse<DashboardResponse>>(url);
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },

  getOverview: async (): Promise<OverviewResponse> => {
    const response = await api.get<StandardApiResponse<OverviewResponse>>('/dashboard/overview');
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },

  getKPIs: async (periodo?: string): Promise<KPIsResponse> => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    
    const url = `/dashboard/kpis${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<StandardApiResponse<KPIsResponse>>(url);
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },

  getCitasStats: async (filters: CitasStatsFilters): Promise<CitasStatsResponse> => {
    const params = new URLSearchParams({
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin
    });
    
    const response = await api.get<StandardApiResponse<CitasStatsResponse>>(
      `/dashboard/citas-stats?${params.toString()}`
    );
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },

  getDiagnosticosFrecuentes: async (filters: DiagnosticosFrecuentesFilters): Promise<DiagnosticosFrecuentesResponse> => {
    const params = new URLSearchParams({
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin
    });
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get<StandardApiResponse<DiagnosticosFrecuentesResponse>>(
      `/dashboard/diagnosticos-frecuentes?${params.toString()}`
    );
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },

  getPeriodosDisponibles: async (): Promise<PeriodosDisponiblesResponse> => {
    const response = await api.get<StandardApiResponse<PeriodosDisponiblesResponse>>(
      '/dashboard/periodos-disponibles'
    );
    
    // ✅ CORRECCIÓN: Extraer el campo 'data' interno
    return response.data.data;
  },
};