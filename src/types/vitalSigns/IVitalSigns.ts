// src/types/vitalSigns/IVitalSigns.ts

/**
 * Interfaz para el paciente básico en constantes vitales
 */
export interface IPacienteBasico {
  id: string;
  nombres: string;
  apellidos: string;
  cedula_pasaporte: string;
  sexo?: 'M' | 'F';
  edad?: number;
  condicion_edad?: string;
}

/**
 * Interfaz base para constantes vitales (lectura desde API) - Ahora incluye datos de consulta
 */
export interface IVitalSigns {
  id: string;
  paciente: string | IPacienteBasico;
  
  // Campos de consulta (agregados)
  fecha_consulta: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  observaciones: string;
  
  // Campos originales de constantes vitales
  temperatura: number | null;
  pulso: number | null;
  frecuencia_respiratoria: number | null;
  presion_arterial: string;
  
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  creado_por: string | null;
  actualizado_por: string | null;
}

/**
 * Interfaz para crear nuevas constantes vitales (ahora incluye consulta)
 */
export interface IVitalSignsCreate {
  paciente: string;
  
  // Campos de consulta
  fecha_consulta?: string;
  motivo_consulta?: string;
  enfermedad_actual?: string;
  observaciones?: string;
  
  // Campos originales
  temperatura?: number | null;
  pulso?: number | null;
  frecuencia_respiratoria?: number | null;
  presion_arterial?: string;
}

/**
 * Interfaz para actualizar constantes vitales (ahora incluye consulta)
 */
export interface IVitalSignsUpdate {
  // Campos de consulta
  fecha_consulta?: string;
  motivo_consulta?: string;
  enfermedad_actual?: string;
  observaciones?: string;
  
  // Campos originales
  temperatura?: number | null;
  pulso?: number | null;
  frecuencia_respiratoria?: number | null;
  presion_arterial?: string;
  activo?: boolean;
}

/**
 * Interfaz para respuesta paginada de la API
 */
export interface IVitalSignsPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IVitalSigns[];
}

/**
 * Interfaz para parámetros de filtrado
 */
export interface IVitalSignsFilters {
  search?: string;
  activo?: boolean;
  paciente?: string;
  page?: number;
  page_size?: number;
}

export interface IVitalSignsListResponse {
  success: boolean;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IVitalSigns[];
  };
}

/**
 * Respuesta de un solo registro de constantes vitales
 */
export interface IVitalSignsSingleResponse {
  success: boolean;
  data: IVitalSigns;
}