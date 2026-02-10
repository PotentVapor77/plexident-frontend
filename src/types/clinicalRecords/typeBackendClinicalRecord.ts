

// src/types/clinicalRecord/typeBackendClinicalRecord.ts

// ============================================================================
// TIPOS BASE
// ============================================================================

export type EstadoHistorial = "BORRADOR" | "ABIERTO" | "CERRADO";
export type EmbarazoEstado = "SI" | "NO";
export type Sexo = "M" | "F";
export type EstadoSesion = "PLANIFICADA" | "EN_PROGRESO" | "COMPLETADA" | "CANCELADA";
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
  hemorragias_detalle: string;

  vih_sida: string | null;
  vih_sida_otro: string;

  tuberculosis: string | null;
  tuberculosis_otro: string;

  // Enfermedades crónicas
  asma: string | null;
  asma_otro: string;
  diabetes: string | null;
  diabetes_otro: string;
  hipertension_arterial: string | null;
  hipertension_arterial_otro: string;
  enfermedad_cardiaca: string | null;
  enfermedad_cardiaca_otro: string;

  otros_antecedentes_personales: string;
  habitos: string;
  observaciones: string;

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

  // Enfermedades cardiovasculares
  cardiopatia_familiar: string | null;
  cardiopatia_familiar_otro: string;
  hipertension_arterial_familiar: string | null;
  hipertension_arterial_familiar_otro: string;
  enfermedad_vascular_familiar: string | null;
  enfermedad_vascular_familiar_otro: string;

  endocrino_metabolico_familiar: string | null;
  endocrino_metabolico_familiar_otro: string;

  // Cáncer
  cancer_familiar: string | null;
  cancer_familiar_otro: string;
  tipo_cancer: string | null;
  tipo_cancer_otro: string;

  tuberculosis_familiar: string | null;
  tuberculosis_familiar_otro: string;

  // Enfermedades mentales
  enfermedad_mental_familiar: string | null;
  enfermedad_mental_familiar_otro: string;

  enfermedad_infecciosa_familiar: string | null;
  enfermedad_infecciosa_familiar_otro: string;

  malformacion_familiar: string | null;
  malformacion_familiar_otro: string;

  // Otros
  otros_antecedentes_familiares: string;
  observaciones: string;

  // Metadata
  creado_por: string;
  actualizado_por: string;
  paciente: string;
}


export const VIH_SIDA_CHOICES = [
  { value: 'NEGATIVO', label: 'Negativo' },
  { value: 'POSITIVO', label: 'Positivo' },
  { value: 'DESCONOCIDO', label: 'Desconocido' },
  { value: 'OTRO', label: 'Otro' },
] as const;

export const TUBERCULOSIS_CHOICES = [
  { value: 'NUNCA', label: 'Nunca' },
  { value: 'TRATADA', label: 'Tratada' },
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'DESCONOCIDO', label: 'Desconocido' },
  { value: 'OTRO', label: 'Otro' },
] as const;

export const TIPO_CANCER_CHOICES = [
  { value: 'MAMA', label: 'Mama' },
  { value: 'PULMON', label: 'Pulmón' },
  { value: 'PROSTATA', label: 'Próstata' },
  { value: 'COLON', label: 'Colon' },
  { value: 'ESTOMAGO', label: 'Estómago' },
  { value: 'HIGADO', label: 'Hígado' },
  { value: 'PANCREAS', label: 'Páncreas' },
  { value: 'LEUCEMIA', label: 'Leucemia' },
  { value: 'PIEL', label: 'Piel' },
  { value: 'OTRO', label: 'Otro' },
] as const;

export const FAMILIAR_BASE_CHOICES = [
  { value: 'NO', label: 'No' },
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'HERMANO', label: 'Hermano(a)' },
  { value: 'ABUELO', label: 'Abuelo(a)' },
  { value: 'TIO', label: 'Tío(a)' },
  { value: 'OTRO', label: 'Otro familiar' },
] as const;
export const ESTADO_EXAMENES_CHOICES = [
  { value: 'SIN_PEDIDO', label: 'Sin Pedido', color: 'gray' },
  { value: 'PENDIENTE', label: 'Pendiente', color: 'orange' },
  { value: 'COMPLETADO', label: 'Completado', color: 'green' },
] as const;
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
  indicadores_salud?: any;
  indicadores_salud_bucal?: IndicadoresSaludBucalData;
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
  indicadores_salud_bucal: string | null;
  indicadores_salud_bucal_data?: IndicadoresSaludBucalData;

  // Metadata
  estado: EstadoHistorial;
  estado_display: string;
  fecha_atencion: string;
  fecha_cierre: string | null;
  observaciones: string;

  institucion_sistema: string;
  unicodigo: string;
  establecimiento_salud: string;
  numero_hoja: number;
  numero_historia_clinica_unica: string;
  numero_archivo: string;

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

  indices_caries?: string | null;
  indices_caries_data?: IndicesCariesData | null;

  diagnosticos_cie?: string | null;
  diagnosticos_cie_data?: DiagnosticosCIEResponse | null;
  tiene_diagnosticos_cie?: boolean;
  diagnosticos_cie_activos?: number;
  diagnosticos_cie_inactivos?: number;
  plan_tratamiento_data?: PlanTratamientoData | null;
  plan_tratamiento?: PlanTratamientoData | null;
  plan_tratamiento_id?: string | null;
  plan_tratamiento_sesiones?: SesionTratamientoData[] | null;
  plan_tratamiento_titulo?: string | null;
  plan_tratamiento_descripcion?: string | null;
  version_odontograma?: string | null;
  examenes_complementarios?: ExamenesComplementariosData[] | null;
  examenes_complementarios_data: ExamenesComplementariosData | null; // 🆕
    
}
export interface CamposFormulario {
  institucion_sistema: string;
  unicodigo: string;
  establecimiento_salud: string;
  numero_historia_clinica_unica: string;
  numero_archivo: string;
  numero_hoja: number;
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
  } | null;
  motivo_consulta: string | null;
  motivo_consulta_fecha: string | null;
  embarazada: EmbarazoEstado | null;
  enfermedad_actual: string | null;
  enfermedad_actual_fecha: string | null;
  campos_formulario: {
    institucion_sistema: string;
    unicodigo: string;
    establecimiento_salud: string;
    numero_historia_clinica_unica: string;
    numero_archivo: string;
    numero_hoja: number;
  }


  ;



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
  IndicadoresSaludBucal: {
    id: string | null;
  }
  indicadores_salud_bucal: {
    id: string | null;
    fecha: string | null;
    data: IndicadoresSaludBucalData | null;
  } | null;
  indices_caries?: {
    id: string | null;
    fecha: string | null;
    data: IndicesCariesData | null;
  } | null;
  diagnosticos_cie?: {
    id: string | null;
    fecha: string | null;
    data: DiagnosticosCIEResponse | null;
    tipo_carga: "nuevos" | "todos" | null;
  } | null;

  plan_tratamiento?: {
    id: string;
    titulo: string;
    descripcion?: string;
    sesiones?: SesionTratamientoData[];
    version_odontograma?: string;
    estado?: string;
    fecha_creacion: string;
  } | null;

  examenes_complementarios?: {
    id: string | null;
    fecha: string | null;
    data: ExamenesComplementariosData | null;

  }

}
export interface InformacionPiezas {
  tiene_metadata: boolean;
  mensaje?: string;
  advertencia?: string;
  denticion?: 'permanente' | 'temporal' | 'mixta';
  estadisticas?: {
    total_piezas: number;
    piezas_originales: number;
    piezas_alternativas: number;
    piezas_no_disponibles: number;
    porcentaje_disponible: number;
    piezas_disponibles: number;
  };
  piezas_mapeo?: Record<string, {
    codigo_usado: string;
    es_alternativa: boolean;
    disponible: boolean;
    codigo_original: string;
    diente_id: string | null;
    ausente: boolean;
    motivo?: string;
    tipo?: string;
    motivo_original_no_disponible?: string;
    motivo_alternativa_no_disponible?: string;

  }

  >;
}
export interface ResumenIndicador {
  nivel: string;
  valor: number | null;
  rango?: string | null;
  recomendacion: string;
}
export interface IndicadoresSaludBucalData {
  id: string;
  fecha: string;
  fecha_formateada: string;
  paciente_nombre: string | null;
  creado_por_nombre: string | null;

  // Diagnósticos con descripciones
  enfermedad_periodontal: "LEVE" | "MODERADA" | "SEVERA" | null;
  enfermedad_periodontal_display: string | null;
  tipo_oclusion: "ANGLE_I" | "ANGLE_II" | "ANGLE_III" | null;
  tipo_oclusion_display: string | null;
  nivel_fluorosis: "NINGUNA" | "LEVE" | "MODERADA" | "SEVERA" | null;
  nivel_fluorosis_display: string | null;
  nivel_gingivitis_display: string | null;
  piezas_usadas_en_registro?: {
    piezas_mapeo: Record<string, {
      codigo_usado: string;
      es_alternativa: boolean;
      disponible: boolean;
      codigo_original?: string;
      diente_id?: string | null;
      ausente?: boolean;
      ambos_ausentes?: boolean;
      motivo?: string;
      datos?: Record<string, number>;
    }>;
    denticion: 'permanente' | 'temporal';
    estadisticas: any;
    fecha_registro?: string;
    tipo_operacion?: string;
  } | null;
  // Promedios
  ohi_promedio_placa: number;
  ohi_promedio_calculo: number;
  gi_promedio_gingivitis: number;

  // Resúmenes estructurados
  resumen_higiene: ResumenIndicador;
  resumen_gingival: ResumenIndicador;

  valores_por_pieza: ValorPorPieza[];

  informacion_piezas: InformacionPiezas;

  informacion_calculo_json: any | null;

  observaciones: string | null;
  activo: boolean;

  advertencia?: string;
  requiere_actualizacion_metadata?: boolean;
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
  indicadores_salud_bucal?: string;
  estado?: EstadoHistorial;
  observaciones?: string;
  unicodigo?: string;
  establecimiento_salud?: string;

  temperatura?: string | null;
  pulso?: number | null;
  frecuencia_respiratoria?: number | null;
  presion_arterial?: string | null;
  plan_tratamiento?: string;
  examenes_complementarios?: string;
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

  temperatura?: string | null;
  pulso?: number | null;
  frecuencia_respiratoria?: number | null;
  presion_arterial?: string | null;
  plan_tratamiento?: string | null;
  indicadores_salud_bucal?: string | null;
  indices_caries?: string | null;
  examenes_complementarios?: string | null;
}

export interface ValorPorPieza {
  pieza_original: string;
  pieza_usada: string;
  es_alternativa: boolean;
  disponible: boolean;
  placa: {
    valor: number | null;
    descripcion: string | null;
    escala: string;
  };
  calculo: {
    valor: number | null;
    descripcion: string | null;
    escala: string;
  };
  gingivitis: {
    valor: number | null;
    descripcion: string | null;
    escala: string;
  };
  completo: boolean;
  mensaje_alternativa?: string;

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
export interface IndicesCariesData {
  id: string;
  paciente: string;
  version_id: string | null;
  fecha: string;
  // Índices CPO (Adultos)
  cpo_c: number;
  cpo_p: number;
  cpo_o: number;
  cpo_total: number;

  // Índices ceo (Niños)
  ceo_c: number;
  ceo_e: number;
  ceo_o: number;
  ceo_total: number;
}

// Para respuestas que pueden tener campos null
export interface LatestIndicesCariesResponse {
  id: string | null;
  paciente: string | null;
  version_id: string | null;
  fecha: string | null;
  cpo_c: number | null;
  cpo_p: number | null;
  cpo_o: number | null;
  cpo_total: number | null;
  ceo_c: number | null;
  ceo_e: number | null;
  ceo_o: number | null;
  ceo_total: number | null;
  disponible?: boolean;
  origen?: string;
}

export interface DiagnosticoCIEData {
  id: string;
  tipo_cie_display: string;
  prioridad_efectiva: number;
  estado_tratamiento: string;
  fecha_creacion: any;
  diagnostico_dental_id: string;
  diagnostico_nombre: string;
  diagnostico_siglas: string;
  codigo_cie: string;
  diente_fdi: string;
  superficie_nombre: string;
  fecha_diagnostico: string;
  tipo_cie: "PRE" | "DEF";
  activo: boolean;
  // Campos opcionales
  descripcion?: string;
}

export interface DiagnosticosCIEResponse {
  success: boolean;
  message: string;
  disponible?: boolean;
  tipo_carga: "todos" | "nuevos" | null;
  total_diagnosticos: number;
  diagnosticos: DiagnosticoCIEData[];
  paciente_nombre?: string;
  paciente_cedula?: string;
  estadisticas?: {
    presuntivos: number;
    definitivos: number;
  };
}

export interface DiagnosticoCIEIndividualResponse {
  success: boolean;
  message: string;
  diagnostico_id?: string;
  tipo_cie?: "PRE" | "DEF";
  tipo_cie_display?: string;
  error?: string;
}

export interface DiagnosticoCIEUpdatePayload {
  tipo_cie: "PRE" | "DEF";
}

export interface SincronizarDiagnosticosPayload {
  diagnosticos_finales: Array<{
    diagnostico_dental_id: string;
    tipo_cie: "PRE" | "DEF";
  }>;
  tipo_carga: "nuevos" | "todos";
}

export interface SincronizarDiagnosticosResponse {
  success: boolean;
  message: string;
  tipo_carga: string;
  total_diagnosticos: number;
  estadisticas: {
    desactivados: number;
    creados: number;
    actualizados: number;
  };
  diagnosticos: DiagnosticoCIEData[];
  error?: string;
}
export interface SesionTratamientoData {
  id: string;
  plan_tratamiento: string;
  numero_sesion: number;
  fecha_programada: string | null;
  fecha_ejecucion: string | null;
  procedimientos: string;
  diagnosticos_complicaciones: string;
  diagnosticos_y_complicaciones: string;
  prescripciones: string;
  notas: string;
  estado: EstadoSesion;
  cita: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  // Borrar si no se necesita
  observaciones: string | null;

}
export type EstadoPlanTratamiento = "ACTIVO" | "INACTIVO";

export interface PlanTratamientoData {
  id: string;

  titulo: string;
  descripcion?: string;
  sesiones?: SesionTratamientoData[];
  version_odontograma?: string;
  estado?: string;
  fecha_creacion: string;

}

export interface PlanesTratamientoPacienteResponse {
  success: boolean;
  message: string;
  planes: PlanTratamientoData[];
  total_planes: number;
  tiene_plan_activo: boolean;
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
  page_size: number;
}

export interface ApiListWrapper<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: unknown;
}

export type EstadoExamenesComplementarios = "PENDIENTE" | "COMPLETADO" | "SIN_PEDIDO";

export interface ExamenesComplementariosData {
  // Identificación
  id: string;
  paciente: string;

  // Auditoría
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;

  // PEDIDO DE EXÁMENES
  pedido_examenes: string;
  pedido_examenes_detalle: string;

  informe_examenes: string;
  informe_examenes_detalle: string;

  // CAMPOS COMPUTADOS (read-only)
  estado_examenes: EstadoExamenesComplementarios;
  resumen_examenes_complementarios: string;
  tiene_pedido_examenes_pendiente: boolean;
  tiene_informe_examenes_completado: boolean;
}

export interface ExamenesComplementariosCreatePayload {
  paciente: string;
  pedido_examenes?: string;
  pedido_examenes_detalle?: string;
  informe_examenes?: string;
  informe_examenes_detalle?: string;
}
export interface ExamenesComplementariosUpdatePayload {
  pedido_examenes?: string;
  pedido_examenes_detalle?: string;
  informe_examenes?: string;
  informe_examenes_detalle?: string;
}

/**
 * Respuesta de la API para operaciones con exámenes
 */
export interface ExamenesComplementariosResponse {
  success: boolean;
  message: string;
  data: ExamenesComplementariosData;
}

/**
 * Respuesta para listado de exámenes del paciente
 */
export interface ExamenesComplementariosListResponse {
  success: boolean;
  total: number;
  paciente_id: string;
  examenes: ExamenesComplementariosData[];
}


