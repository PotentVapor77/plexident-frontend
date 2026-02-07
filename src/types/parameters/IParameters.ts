// src/types/parameters/IParameters.ts

/**
 * ============================================================================
 * TYPES DEL MÓDULO DE PARÁMETROS (RF-07)
 * ============================================================================
 */

// ==================== HORARIOS (RF-07.1) ====================
export interface IHorario {
  id: string;
  dia_semana: number; // 0=Lunes, 6=Domingo
  dia_semana_display: string;
  apertura: string; // HH:MM
  cierre: string; // HH:MM
  activo: boolean;
  creado_por?: string;
  actualizado_por?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface IHorarioBulkUpdate {
  horarios: {
    id?: string; // ✅ Mantener opcional
    dia_semana: number;
    apertura: string; // HH:MM formato
    cierre: string;   // HH:MM formato
    activo: boolean;
  }[];
}


// ==================== DIAGNÓSTICOS (RF-07.2) ====================
export interface IDiagnostico {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  categoria_display: string;
  activo: boolean;
  creado_por?: string;
  actualizado_por?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface IDiagnosticoCreate {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
}

export interface IDiagnosticoUpdate {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  activo?: boolean;
}

// Categorías de diagnósticos
export type CategoriaDiagnostico =
  | 'CARIES'
  | 'ENCIAS'
  | 'ENDODONCIA'
  | 'PROTESIS'
  | 'CIRUGIA'
  | 'ORTODODONCIA'
  | 'PERIODONCIA'
  | 'INFECCIONES'
  | 'TRAUMA'
  | 'OTROS';

// ==================== MEDICAMENTOS (RF-07.3) ====================
export interface IMedicamento {
  id: string;
  nombre: string;
  principio_activo: string;
  presentacion: string;
  dosis_habitual: string;
  via_administracion: string;
  via_administracion_display: string;
  categoria: string;
  categoria_display: string;
  indicaciones?: string;
  contraindicaciones?: string;
  activo: boolean;
  creado_por?: string;
  actualizado_por?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface IMedicamentoCreate {
  nombre: string;
  principio_activo: string;
  presentacion: string;
  dosis_habitual: string;
  via_administracion: string;
  categoria: string;
  indicaciones?: string;
  contraindicaciones?: string;
}

export interface IMedicamentoUpdate {
  nombre?: string;
  principio_activo?: string;
  presentacion?: string;
  dosis_habitual?: string;
  via_administracion?: string;
  categoria?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  activo?: boolean;
}

// Categorías de medicamentos
export type CategoriaMedicamento =
  | 'ANALGESICO'
  | 'ANTIBIOTICO'
  | 'ANTIINFLAMATORIO'
  | 'ANESTESICO'
  | 'ANTISEPTICO'
  | 'CICATRIZANTE'
  | 'OTROS';

// Vías de administración
export type ViaAdministracion =
  | 'ORAL'
  | 'SUBLINGUAL'
  | 'TOPICA'
  | 'INYECTABLE'
  | 'INHALATORIA';

// ==================== SEGURIDAD (RF-07.4 y RF-07.5) ====================
export interface IConfiguracionSeguridad {
  id: string;
  // RF-07.4: Políticas de sesión
  tiempo_inactividad_minutos: number;
  max_intentos_login: number;
  duracion_bloqueo_minutos: number;
  
  // RF-07.5: Requisitos de contraseña
  longitud_minima_password: number;
  requiere_mayusculas: boolean;
  requiere_minusculas: boolean;
  requiere_numeros: boolean;
  requiere_especiales: boolean;
  
  // Historial y validez
  historial_password_cantidad: number;
  dias_validez_password: number;
  
  // Auditoría
  actualizado_por?: string;
  actualizado_en: string;
}

export interface IConfiguracionSeguridadUpdate {
  tiempo_inactividad_minutos?: number;
  max_intentos_login?: number;
  duracion_bloqueo_minutos?: number;
  longitud_minima_password?: number;
  requiere_mayusculas?: boolean;
  requiere_minusculas?: boolean;
  requiere_numeros?: boolean;
  requiere_especiales?: boolean;
  historial_password_cantidad?: number;
  dias_validez_password?: number;
}

// ==================== NOTIFICACIONES (RF-07.7) ====================
export interface IConfiguracionNotificaciones {
  id: string;
  // RF-07.7: Recordatorios de citas
  recordatorio_citas_horas_antes: number;
  enviar_email: boolean;
  enviar_sms: boolean;
  hora_envio_diaria: string; // HH:MM
  
  // Plantillas
  asunto_email_recordatorio: string;
  plantilla_sms: string;
  
  // Auditoría
  actualizado_por?: string;
  actualizado_en: string;
}

export interface IConfiguracionNotificacionesUpdate {
  recordatorio_citas_horas_antes?: number;
  enviar_email?: boolean;
  enviar_sms?: boolean;
  hora_envio_diaria?: string;
  asunto_email_recordatorio?: string;
  plantilla_sms?: string;
}

export interface ITestEmailRequest {
  email: string;
}

export interface ITestSmsRequest {
  telefono: string;
}

// ==================== PARÁMETROS GENERALES ====================
export interface IParametroGeneral {
  id: string;
  clave: string;
  valor: string;
  descripcion: string;
  tipo: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'JSON';
  categoria: string;
  actualizado_en: string;
}

// ==================== RESPUESTAS DE API ====================
export interface IParametersResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IBulkUpdateResponse {
  success: boolean;
  message: string;
  resultados: {
    dia_semana: number;
    success: boolean;
    created?: boolean;
    error?: string;
  }[];
}


