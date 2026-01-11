// src/core/types/treatmentPlan.types.ts
import type { DiagnosticoSnapshot, EstadoSesion, Prescripcion, Procedimiento } from "../../types/treatmentPlan/typeBackendTreatmentPlan";


// ============================================================================
// PAYLOADS PARA API
// ============================================================================

export interface PlanTratamientoCreatePayload {
    paciente: string; // UUID
    titulo: string;
    notas_generales?: string;
    usar_ultimo_odontograma?: boolean;
    version_odontograma?: string | null;
}

export interface PlanTratamientoUpdatePayload extends Partial<PlanTratamientoCreatePayload> { }

export interface SesionTratamientoCreatePayload {
    plan_tratamiento: string; // UUID
    fecha_programada?: string | null; // YYYY-MM-DD
    autocompletar_diagnosticos?: boolean;
    procedimientos?: Procedimiento[];
    prescripciones?: Prescripcion[];
    notas?: string;
    cita_id?: string | null; // UUID
    estado?: EstadoSesion;
    diagnosticoscomplicaciones?: DiagnosticoSnapshot[];
}

export interface SesionTratamientoUpdatePayload extends Partial<SesionTratamientoCreatePayload> {
    diagnosticos_complicaciones?: any[];
    observaciones?: string;
}

// ============================================================================
// FORM DATA (Estado interno del formulario)
// ============================================================================

export interface TreatmentPlanFormData {
    paciente: string;
    titulo: string;
    notas_generales: string;
    usar_ultimo_odontograma: boolean;
}

export interface SessionFormData {
    plan_tratamiento: string;
    fecha_programada: string;
    autocompletar_diagnosticos: boolean;
    procedimientos: Procedimiento[];
    prescripciones: Prescripcion[];
    notas: string;
    cita_id: string | null;
    estado: EstadoSesion;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
    paciente_id?: string | null;
    search?: string;
}

export interface SessionPaginationParams extends PaginationParams {
    plan_id?: string;
    estado?: EstadoSesion;
}
