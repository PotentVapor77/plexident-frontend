// src/core/types/clinicalRecord.types.ts

import type { EmbarazoEstado, EstadoHistorial } from "../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * Datos del formulario de historial clínico
 */
export interface ClinicalRecordFormData {
    paciente: string;
    odontologo_responsable: string;
    motivo_consulta: string;
    embarazada: EmbarazoEstado | "";
    enfermedad_actual: string;
    estado: EstadoHistorial;
    observaciones: string;
    unicodigo: string;
    establecimiento_salud: string;
    usar_ultimos_datos: boolean; 
}

/**
 * Filtros para la tabla de historiales
 */
export interface ClinicalRecordFilters {
    search?: string;
    estado?: EstadoHistorial | "";
    paciente?: string;
    odontologo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    activo?: boolean;
}

/**
 * Estado de un historial 
 */
export interface ClinicalRecordStatus {
    value: EstadoHistorial;
    label: string;
    color: "blue" | "orange" | "green";
    icon: React.ComponentType<{ className?: string }>;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
    page: number;
    page_size: number;
}
