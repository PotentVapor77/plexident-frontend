// src/types/treatment-plan/typeBackendTreatmentPlan.ts


export const EstadoSesion = {
    PLANIFICADA: "planificada",
    EN_PROGRESO: "en_progreso",
    COMPLETADA: "completada",
    CANCELADA: "cancelada",
} as const;
export type EstadoSesion = typeof EstadoSesion[keyof typeof EstadoSesion];
export interface BackendPlanTratamiento {
    id: string;
    paciente: string; // UUID
    titulo: string;
    notas_generales: string | null;
    version_odontograma: string | null; // UUID del snapshot
    activo: boolean;
    fecha_creacion: string; // ISO 8601
    fecha_actualizacion: string;
    creado_por: string; // user_id
    editado_por: string | null;
    eliminado_por: string | null;
    fecha_edicion: string | null;
    fecha_eliminacion: string | null;
}

export interface BackendSesionTratamiento {
    id: string;
    plan_tratamiento: string; // UUID
    numero_sesion: number;
    fecha_programada: string | null; // ISO 8601 date
    fecha_realizacion: string | null; // ISO 8601 datetime
    estado: EstadoSesion;
    diagnosticos_complicaciones: DiagnosticoSnapshot[]; // JSON
    procedimientos: Procedimiento[]; // JSON
    prescripciones: Prescripcion[]; // JSON
    notas: string | null;
    observaciones: string | null;
    odontologo: number; // user_id
    cita: string | null; // UUID de cita (opcional)
    firma_digital: string | null;
    fecha_firma: string | null;
    activo: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
    creado_por: number | null;
    editado_por: number | null;
    eliminado_por: number | null;
}

export interface DiagnosticoSnapshot {
    id: string;
    diente: string; // FDI code
    superficie: string;
    diagnostico_key: string;
    diagnostico_nombre: string;
    siglas: string;
    color_hex: string;
    prioridad: number;
    categoria: string;
    descripcion: string;
    estado_tratamiento: "diagnosticado" | "en_tratamiento" | "tratado" | "cancelado";
    atributos_clinicos: Record<string, any>;
}

export interface Procedimiento {
    id?: string; // UUID temporal frontend
    codigo?: string; // Código CDT/procedimiento
    descripcion: string;
    diente?: string; // FDI (opcional)
    superficie?: string; // (opcional)
    costo_estimado?: number;
    duracion_estimada?: number; // minutos
    completado?: boolean;
    fecha_completado?: string;
    notas?: string;
}

export interface Prescripcion {
    id?: string; // UUID temporal frontend
    medicamento: string;
    dosis: string;
    frecuencia: string; // "c/8h", "1 vez al día", etc.
    duracion: string; // "7 días", "2 semanas", etc.
    via_administracion?: "oral" | "topica" | "sublingual" | "inyectable";
    indicaciones?: string;
}

export interface CitaInfo {
    id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
}

// ============================================================================
// SERIALIZERS RESPONSES
// ============================================================================

export interface PlanTratamientoListResponse {
    id: string;
    titulo: string;
    paciente_nombre: string;
    fecha_creacion: string;
    creado_por_nombre: string;
    total_sesiones: number;
    sesiones_completadas: number;
    activo: boolean;
    version_odontograma: string | null;
}

export interface PlanTratamientoDetailResponse extends BackendPlanTratamiento {
    paciente_info: {
        id: string;
        nombres: string;
        apellidos: string;
        cedula_pasaporte: string;
    };
    creado_por_info: {
        id: number;
        nombres: string;
        apellidos: string;
    } | null;
    sesiones: SesionTratamientoListResponse[];
    estadisticas: {
        total: number;
        planificadas: number;
        en_progreso: number;
        completadas: number;
        canceladas: number;
    };
}

export interface SesionTratamientoListResponse {
    id: string;
    numero_sesion: number;
    fecha_programada: string | null;
    fecha_realizacion: string | null;
    estado: EstadoSesion;
    estado_display: string;
    esta_firmada: boolean;
    odontologo_nombre: string;
    total_diagnosticos: number;
    total_procedimientos: number;
    total_prescripciones: number;
    fecha_firma: string | null;
    fecha_creacion: string;
}

export interface SesionTratamientoDetailResponse extends BackendSesionTratamiento {
    odontologo_info: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    plan_titulo: string;
    estado_display: string;
    cita_info: CitaInfo | null;
}

export interface DiagnosticosDisponiblesResponse {
    version_odontograma: string | null;
    fecha_odontograma: string | null;
    total_diagnosticos: number;
    diagnosticos: DiagnosticoSnapshot[];
}
