// src/types/dashboard/IDashboard.ts

// Tipos básicos
export interface DashboardMetricas {
  // ✅✅✅ Métricas principales (3) ✅✅✅
  pacientes_activos?: number;
  citas_hoy?: number;
  citas_semana?: number;
  
  // Métricas comunes
  total_pacientes?: number;
  pacientes_inactivos?: number;
  signos_vitales_hoy?: number;
  
  // Métricas administrador
  citas_mes?: number;
  citas_asistidas_hoy?: number;
  citas_asistidas_mes?: number;
  odontologos_activos?: number;
  
  // Métricas odontólogo
  mis_pacientes_atendidos?: number;
  mis_citas_mes?: number;
  mis_citas_hoy?: number;
  mis_citas_asistidas_hoy?: number;
  mis_citas_semana?: number;
  citas_en_atencion_hoy?: number;
  pacientes_condiciones_importantes?: number;
  pacientes_con_condiciones?: number;
  pacientes_sin_anamnesis?: number;
  
  // Métricas asistente
  pacientes_atendidos_hoy?: number;
  citas_registradas_hoy?: number;
  citas_programadas_hoy?: number;
  citas_confirmadas_hoy?: number;
  pacientes_nuevos_mes?: number;
  
  // ✅✅✅ Info adicional para subtítulos y tooltips ✅✅✅
  info_citas_hoy?: {
    fecha: string;
    descripcion: string;
    label?: string;
  };
  
  info_semana?: {
    inicio: string;
    fin: string;
    descripcion: string;
    label?: string;
  };
  
  // ✅✅✅ NUEVO: Información de periodo para las tarjetas ✅✅✅
  periodo_info?: {
    nombre: string;
    label: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  
  // ✅ Info del periodo del filtro
  info_periodo_filtro?: {
    descripcion: string;
    label: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  
  // Metadata del periodo
  periodo_activo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  
  // ✅ Permitir propiedades dinámicas adicionales
  [key: string]: number | string | Record<string, unknown> | undefined;
}

export interface AccesoRapido {
  accion: string;
  label: string;
  icon: string;
}

export interface GraficoData {
  label: string;
  value: number;
}

export interface TablaCita {
  id: string;
  paciente: string;
  odontologo?: string;
  fecha?: string;
  hora?: string;
  estado: string;
  estado_codigo?: string;
  motivo?: string;
}

export interface TablaPaciente {
  id: string;
  nombre: string;
  cedula?: string;
  fecha_registro?: string;
  telefono?: string;
  condiciones?: string;
  alergias?: string;
  ultimo_signo?: string;
  ultima_visita?: string;
}

export interface TablaUsuario {
  username: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface TablaSignoVital {
  id: string;
  paciente: string;
  temperatura?: number | string;
  pulso?: number;
  presion_arterial?: string;
  fecha?: string;
  registrado_por?: string;
}

// ✅ RF-06.2: Distribución por estado
export interface DistribucionEstado {
  estado: string;
  estado_display: string;
  total: number;
  porcentaje: number;
}

// ✅ RF-06.3: Diagnósticos frecuentes
export interface DiagnosticoFrecuente {
  diagnostico_id: string;
  diagnostico_key: string;
  diagnostico_nombre: string;
  diagnostico_siglas: string;
  categoria_nombre: string;
  total: number;
  total_superficies?: number;
  dientes_afectados?: number;
  dientes_lista?: string[];
  dientes_detalle?: Array<{
    diente: string;
    superficies: number;
  }>;
  porcentaje: number;
  activos: number;
  tratados: number;
}

// ✅ RF-06.3: Diagnósticos por diente
export interface DiagnosticoPorDienteDetalle {
  diagnostico: string;
  siglas: string;
  total: number;
  superficies_afectadas?: number;
}

export interface DiagnosticoPorDiente {
  [codigoFDI: string]: DiagnosticoPorDienteDetalle[];
}

// Evolución de citas
export interface EvolucionCitaMensual {
  mes: string;
  mes_corto: string;
  total: number;
  mes_numero?: number;
  año?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CitaPorDia {
  fecha: string;
  total: number;
}

export interface CitaPorOdontologo {
  odontologo__username: string;
  odontologo__nombres: string;
  odontologo__apellidos: string;
  total: number;
}

export interface MotivoConsulta {
  motivo_consulta: string;
  total: number;
}

export interface DistribucionGenero {
  sexo: string;
  total: number;
}

// Gráficos del dashboard
export interface GraficosData {
  // ✅ RF-06.2: Distribución por estado
  distribucion_estados?: DistribucionEstado[];
  
  // ✅ RF-06.3: Diagnósticos frecuentes
  diagnosticos_frecuentes?: DiagnosticoFrecuente[];
  
  // Gráficos existentes
  evolucion_citas?: EvolucionCitaMensual[];
  citas_por_dia?: CitaPorDia[];
  citas_por_odontologo?: CitaPorOdontologo[];
  motivos_consulta_frecuentes?: MotivoConsulta[];
  distribucion_genero?: DistribucionGenero[];
  signos_por_hora?: Array<{
    hora: string;
    total: number;
  }>;
}

// Tablas del dashboard
export interface TablasData {
  ultimas_citas?: TablaCita[];
  pacientes_recientes?: TablaPaciente[];
  usuarios_sistema?: TablaUsuario[];
  mis_citas?: TablaCita[];
  pacientes_condiciones?: TablaPaciente[];
  citas_del_dia?: TablaCita[];
  ultimos_signos?: TablaSignoVital[];
  
  // ✅ RF-06.3: Tabla de diagnósticos frecuentes
  top_diagnosticos?: DiagnosticoFrecuente[];
}

// Listas del dashboard
export interface ListasData {
  mis_citas?: TablaCita[];
  pacientes_condiciones?: TablaPaciente[];
  pacientes_sin_consulta?: TablaPaciente[];
  pacientes_sin_anamnesis?: TablaPaciente[];
  citas_del_dia?: TablaCita[];
  ultimos_signos?: TablaSignoVital[];
  pacientes_sin_signos?: TablaPaciente[];
}

// ✅ RF-06.3: Analíticas avanzadas
export interface AnaliticasData {
  diagnosticos_por_diente?: DiagnosticoPorDiente;
}

// ✅ RF-06.6: Tipos para filtros
export interface PeriodoFiltro {
  label: string;
  fecha_inicio: string;
  fecha_fin: string;
  periodo: string;
}

// Tipo para periodos disponibles
export interface PeriodosDisponibles {
  hoy: PeriodoFiltro;
  semana_actual: PeriodoFiltro;
  mes_actual: PeriodoFiltro;
  trimestre_actual: PeriodoFiltro;
  anio_actual: PeriodoFiltro;
  [key: string]: PeriodoFiltro;
}

// Respuesta principal del dashboard
export interface DashboardResponse {
  rol: string;
  metricas: DashboardMetricas;
  graficos?: GraficosData;
  tablas?: TablasData;
  listas?: ListasData;
  analiticas?: AnaliticasData;
  accesos_rapidos?: AccesoRapido[];
  mensaje?: string;
  timestamp?: string;
  usuario?: {
    username: string;
    nombre_completo: string;
  };
}

// Respuesta para vista general
export interface OverviewResponse {
  total_pacientes: number;
  pacientes_activos: number;
  citas_hoy: number;
  signos_vitales_hoy: number;
  rol: string;
  timestamp: string;
}

// Enums para roles
export const UserRole = {
  ADMINISTRADOR: 'Administrador',
  ODONTOLOGO: 'Odontologo',
  ASISTENTE: 'Asistente'
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Enums para estados de cita
export const EstadoCita = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada',
  EN_ATENCION: 'En Atención',
  ASISTIDA: 'Asistida',
  NO_ASISTIDA: 'No Asistida',
  CANCELADA: 'Cancelada'
} as const;

export type EstadoCitaType = (typeof EstadoCita)[keyof typeof EstadoCita];

// Interfaces para respuestas de API específicas
export interface KPIsResponse {
  total_pacientes_activos: number;
  citas_hoy: number;
  citas_semana: number;
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface CitasStatsResponse {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
    total_dias?: number;
  };
  estadisticas: {
    total: number;
    programadas: number;
    confirmadas: number;
    en_atencion: number;
    asistidas: number;
    no_asistidas: number;
    canceladas: number;
  };
  distribucion_estados: DistribucionEstado[];
  promedio_diario: number;
  evolucion_diaria?: CitaPorDia[];
}

export interface DiagnosticosFrecuentesResponse {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  total_diagnosticos_periodo: number;
  diagnosticos_frecuentes: DiagnosticoFrecuente[];
  diagnosticos_por_diente: DiagnosticoPorDiente;
  metadata?: {
    limit: number;
    tipo_analisis: string;
  };
}

export interface PeriodosDisponiblesResponse {
  periodos: PeriodosDisponibles;
  fecha_actual: string;
}
