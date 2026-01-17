// src/types/clinicalRecord/typeBackendClinicalRecord.ts

// Estados del historial
export type EstadoHistorial = "BORRADOR" | "ABIERTO" | "CERRADO";

// Tipo de embarazo
export type EmbarazoEstado = "SI" | "NO";


/**
 * Respuesta básica de lista de historiales clínicos
 */
export interface ClinicalRecordListResponse {
  id: string;
  paciente: string;
  paciente_nombre: string;
  paciente_cedula: string;
  odontologo_responsable: string;
  odontologo_nombre: string;
  fecha_atencion: string;
  fecha_creacion: string;
  fecha_cierre: string | null;
  estado: EstadoHistorial;
  estado_display: string;
  motivo_consulta: string;
  activo: boolean;
  puede_editar: boolean;
  esta_completo: boolean;
}

/**
 * Respuesta detallada de un historial clínico individual
 */
export interface ClinicalRecordDetailResponse {
  id: string;
  // Paciente
  paciente: string;
  paciente_info: {
    id: string;
    nombres: string;
    apellidos: string;
    cedula_pasaporte: string;
    sexo: "M" | "F";
    edad: number;
    fecha_nacimiento: string;
  };

  // Odontólogo
  odontologo_responsable: string;
  odontologo_info: {
    id: string;
    nombres: string;
    apellidos: string;
    rol: string;
  };

  // Secciones del Form 033
  motivo_consulta: string;
  embarazada: EmbarazoEstado | null;
  enfermedad_actual: string;

  // Referencias a secciones
  antecedentes_personales: string | null;
  antecedentes_personales_data?: AntecedentesPersonalesData;
  
  antecedentes_familiares: string | null;
  antecedentes_familiares_data?: AntecedentesFamiliaresData;
  
  constantes_vitales: string | null;
  constantes_vitales_data?: ConstantesVitalesData;
  
  examen_estomatognatico: string | null;
  examen_estomatognatico_data?: ExamenEstomatognaticoData;

  // Metadata
  estado: EstadoHistorial;
  estado_display: string;
  fecha_atencion: string;
  fecha_cierre: string | null;
  observaciones: string;
  
  // Datos administrativos
  institucion_sistema: string;
  unicodigo: string;
  establecimiento_salud: string;
  numero_hoja: number;

  // Auditoría
  creado_por: string;
  creado_por_info: {
    nombres: string;
    apellidos: string;
  };
  actualizado_por: string | null;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  activo: boolean;
  puede_editar: boolean;
  esta_completo: boolean;
}

/**
 * Tipos auxiliares para las secciones
 */
export interface AntecedentesPersonalesData {
  id: string;
  alergias: string;
  medicamentos_actuales: string;
  enfermedades_previas: string;
  cirugias_previas: string;
  hospitalizaciones: string;
}

export interface AntecedentesFamiliaresData {
  id: string;
  diabetes: boolean;
  hipertension: boolean;
  cardiopatias: boolean;
  cancer: boolean;
  otros: string;
}

export interface ConstantesVitalesData {
  id: string;
  presion_arterial: string;
  frecuencia_cardiaca: number;
  temperatura: number;
  peso: number;
  talla: number;
}

export interface ExamenEstomatognaticoData {
  id: string;
  labios: string;
  mucosa: string;
  lengua: string;
  paladar: string;
  encias: string;
  saliva: string;
}

// ============================================================================
// REQUEST TYPES (Lo que enviamos al backend)
// ============================================================================

/**
 * Payload para crear un historial clínico
 */
export interface ClinicalRecordCreatePayload {
  paciente: string;
  odontologo_responsable: string;
  motivo_consulta?: string;
  embarazada?: EmbarazoEstado;
  enfermedad_actual?: string;
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  constantes_vitales?: string;
  examen_estomatognatico?: string;
  estado?: EstadoHistorial;
  observaciones?: string;
  unicodigo?: string;
  establecimiento_salud?: string;
}

/**
 * Payload para actualizar un historial clínico
 */
export interface ClinicalRecordUpdatePayload {
  motivo_consulta?: string;
  embarazada?: EmbarazoEstado;
  enfermedad_actual?: string;
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  constantes_vitales?: string;
  examen_estomatognatico?: string;
  estado?: EstadoHistorial;
  observaciones?: string;
}

/**
 * Payload para cerrar un historial
 */
export interface ClinicalRecordClosePayload {
  observaciones_cierre?: string;
}

/**
 * Payload para reabrir un historial
 */
export interface ClinicalRecordReopenPayload {
  motivo_reapertura: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface ClinicalRecordPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClinicalRecordListResponse[];
  total_pages: number;
  current_page: number;
}

/**
 * Datos iniciales pre-cargados del paciente
 */
export interface ClinicalRecordInitialData {
  paciente: {
    id: string;
    nombre_completo: string;
    cedula_pasaporte: string;
    sexo: "M" | "F";
    edad: number;
  };
  motivo_consulta: string;
  embarazada: EmbarazoEstado | null;
  enfermedad_actual: string;
  antecedentes_personales_id: string | null;
  antecedentes_familiares_id: string | null;
  constantes_vitales_id: string | null;
  examen_estomatognatico_id: string | null;
}
export interface ApiListWrapper<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: unknown;
}