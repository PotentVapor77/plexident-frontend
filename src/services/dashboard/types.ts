// src/services/dashboard/types.ts

export interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  periodo?: string;
}

export interface CitasStatsFilters {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface DiagnosticosFrecuentesFilters {
  fecha_inicio: string;
  fecha_fin: string;
  limit?: number;
}

export interface TratamientosFrecuentesFilters {
  fecha_inicio: string;
  fecha_fin: string;
  limit?: number;
}

export interface EstadisticasAvanzadasFilters {
  fecha_inicio: string;
  fecha_fin: string;
  tipo?: 'diagnosticos' | 'tratamientos' | 'completo';
}