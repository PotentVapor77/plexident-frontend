// src/types/clinicalRecord/typeBackendClinicalRecord.ts

// ============================================================================
// TIPOS BASE
// ============================================================================

export type EstadoHistorial = "BORRADOR" | "ABIERTO" | "CERRADO";
export type EmbarazoEstado = "SI" | "NO";
export type Sexo = "M" | "F";

// ============================================================================
// TIPOS DE DATOS DE SECCIONES (CORREGIDOS SEGÚN BACKEND REAL)
// ============================================================================

/**
 * Antecedentes Personales - Estructura REAL del backend
 */
export interface AntecedentesPersonalesData {
  id: string;
  paciente_nombre: string;
  paciente_cedula: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  
  // Alergias
  alergia_antibiotico: string | null;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string | null;
  alergia_anestesia_otro: string;
  
  // Condiciones médicas
  hemorragias: string | null;
  vih_sida: string | null;
  tuberculosis: string | null;
  asma: string | null;
  diabetes: string | null;
  diabetes_otro: string;
  hipertension_arterial: string | null;
  enfermedad_cardiaca: string | null;
  enfermedad_cardiaca_otro: string;
  
  // Metadata
  creado_por: string;
  actualizado_por: string;
  paciente: string;
}

/**
 * Antecedentes Familiares - Estructura REAL del backend
 */
export interface AntecedentesFamiliaresData {
  id: string;
  paciente_nombre: string;
  paciente_cedula: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  
  // Historial familiar
  cardiopatia_familiar: string | null;
  hipertension_arterial_familiar: string | null;
  enfermedad_vascular_familiar: string | null;
  cancer_familiar: string | null;
  enfermedad_mental_familiar: string | null;
  otros_antecedentes_familiares: string;
  
  // Metadata
  creado_por: string;
  actualizado_por: string;
  paciente: string;
}

/**
 * Constantes Vitales - Estructura REAL del backend
 */
export interface ConstantesVitalesData {
  id: string;
  paciente_nombre: string;
  paciente_cedula: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  
  // Signos vitales
  temperatura: string;
  pulso: number;
  frecuencia_respiratoria: number;
  presion_arterial: string;
  
  // Metadata
  creado_por: string;
  actualizado_por: string;
  paciente: string;
}

/**
 * Examen Estomatognático - Estructura REAL del backend
 */
export interface ExamenEstomatognaticoData {
  id: string;
  paciente_nombre: string;
  paciente_cedula: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  
  // Flags generales
  examen_sin_patologia: boolean;
  tiene_patologias: boolean;
  total_regiones_anormales: number;
  
  // ATM
  atm_cp: boolean;
  atm_sp: boolean;
  atm_absceso: boolean;
  atm_fibroma: boolean;
  atm_herpes: boolean;
  atm_ulcera: boolean;
  atm_otra_patologia: boolean;
  atm_observacion: string;
  
  // Mejillas
  mejillas_cp: boolean;
  mejillas_sp: boolean;
  mejillas_absceso: boolean;
  mejillas_fibroma: boolean;
  mejillas_herpes: boolean;
  mejillas_ulcera: boolean;
  mejillas_otra_patologia: boolean;
  mejillas_descripcion: string;
  
  // Maxilar Inferior
  maxilar_inferior_cp: boolean;
  maxilar_inferior_sp: boolean;
  maxilar_inferior_absceso: boolean;
  maxilar_inferior_fibroma: boolean;
  maxilar_inferior_herpes: boolean;
  maxilar_inferior_ulcera: boolean;
  maxilar_inferior_otra_patologia: boolean;
  maxilar_inferior_descripcion: string;
  
  // Maxilar Superior
  maxilar_superior_cp: boolean;
  maxilar_superior_sp: boolean;
  maxilar_superior_absceso: boolean;
  maxilar_superior_fibroma: boolean;
  maxilar_superior_herpes: boolean;
  maxilar_superior_ulcera: boolean;
  maxilar_superior_otra_patologia: boolean;
  maxilar_superior_descripcion: string;
  
  // Paladar
  paladar_cp: boolean;
  paladar_sp: boolean;
  paladar_absceso: boolean;
  paladar_fibroma: boolean;
  paladar_herpes: boolean;
  paladar_ulcera: boolean;
  paladar_otra_patologia: boolean;
  paladar_descripcion: string;
  
  // Piso de Boca
  piso_boca_cp: boolean;
  piso_boca_sp: boolean;
  piso_boca_absceso: boolean;
  piso_boca_fibroma: boolean;
  piso_boca_herpes: boolean;
  piso_boca_ulcera: boolean;
  piso_boca_otra_patologia: boolean;
  piso_boca_descripcion: string;
  
  // Carrillos
  carrillos_cp: boolean;
  carrillos_sp: boolean;
  carrillos_absceso: boolean;
  carrillos_fibroma: boolean;
  carrillos_herpes: boolean;
  carrillos_ulcera: boolean;
  carrillos_otra_patologia: boolean;
  carrillos_descripcion: string;
  
  // Glándulas Salivales
  glandulas_salivales_cp: boolean;
  glandulas_salivales_sp: boolean;
  glandulas_salivales_absceso: boolean;
  glandulas_salivales_fibroma: boolean;
  glandulas_salivales_herpes: boolean;
  glandulas_salivales_ulcera: boolean;
  glandulas_salivales_otra_patologia: boolean;
  glandulas_salivales_descripcion: string;
  
  // Ganglios
  ganglios_cp: boolean;
  ganglios_sp: boolean;
  ganglios_absceso: boolean;
  ganglios_fibroma: boolean;
  ganglios_herpes: boolean;
  ganglios_ulcera: boolean;
  ganglios_otra_patologia: boolean;
  ganglios_descripcion: string;
  
  // Lengua
  lengua_cp: boolean;
  lengua_sp: boolean;
  lengua_absceso: boolean;
  lengua_fibroma: boolean;
  lengua_herpes: boolean;
  lengua_ulcera: boolean;
  lengua_otra_patologia: boolean;
  lengua_descripcion: string;
  
  // Labios
  labios_cp: boolean;
  labios_sp: boolean;
  labios_absceso: boolean;
  labios_fibroma: boolean;
  labios_herpes: boolean;
  labios_ulcera: boolean;
  labios_otra_patologia: boolean;
  labios_descripcion: string;
  
  // Resumen de patologías
  regiones_con_patologia: Array<{
    region: string;
    descripcion: string;
  }>;
  atm_patologias: {
    absceso: boolean;
    fibroma: boolean;
    herpes: boolean;
    ulcera: boolean;
    otra: boolean;
    observacion: string;
  };
  
  // Metadata
  creado_por: string;
  actualizado_por: string;
  paciente: string;
}

// ============================================================================
// RESPUESTAS DEL BACKEND
// ============================================================================

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
    sexo: Sexo;
    edad: number;
    fecha_nacimiento: string | null;
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
 * Datos iniciales pre-cargados del paciente
 */
export interface ClinicalRecordInitialData {
  paciente: {
    id: string;
    nombre_completo: string;
    cedula_pasaporte: string;
    sexo: Sexo;
    edad: number;
  };
  motivo_consulta: string;
  motivo_consulta_fecha: string | null;
  embarazada: EmbarazoEstado | null;
  enfermedad_actual: string;
  enfermedad_actual_fecha: string | null;
  
  // Estructura mejorada: {id, fecha, data}
  antecedentes_personales: {
    id: string | null;
    fecha: string | null;
    data: AntecedentesPersonalesData | null;
  } | null;
  
  antecedentes_familiares: {
    id: string | null;
    fecha: string | null;
    data: AntecedentesFamiliaresData | null;
  } | null;
  
  constantes_vitales: {
    id: string | null;
    fecha: string | null;
    data: ConstantesVitalesData | null;
  } | null;
  
  examen_estomatognatico: {
    id: string | null;
    fecha: string | null;
    data: ExamenEstomatognaticoData | null;
  } | null;
}

// ============================================================================
// REQUEST PAYLOADS
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
// PAGINACIÓN Y WRAPPERS
// ============================================================================

export interface ClinicalRecordPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClinicalRecordListResponse[];
  total_pages: number;
  current_page: number;
}

export interface ApiListWrapper<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: unknown;
}
