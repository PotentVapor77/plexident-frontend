// src/core/types/clinicalRecord.types.ts

import type { AntecedentesFamiliaresData, AntecedentesPersonalesData, ConstantesVitalesData, EmbarazoEstado, EstadoHistorial, ExamenEstomatognaticoData } from "../../types/clinicalRecords/typeBackendClinicalRecord";

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
    
    // Estos campos pueden venir de la cabecera
    unicodigo: string;
    establecimiento_salud: string;
    numero_archivo: string;
    numero_historia_clinica_unica?: string;
    institucion_sistema: string;
    numero_hoja: number;
    
    usar_ultimos_datos: boolean;

    // Mantener IDs para el payload
    antecedentes_personales_id?: string | null;
    antecedentes_familiares_id?: string | null;
    constantes_vitales_id?: string | null;
    examen_estomatognatico_id?: string | null;

    // NUEVO: Datos editables de secciones
    antecedentes_personales_data?: AntecedentesPersonalesData | null;
    antecedentes_familiares_data?: AntecedentesFamiliaresData | null;
    constantes_vitales_data?: ConstantesVitalesData | null;
    examen_estomatognatico_data?: ExamenEstomatognaticoData | null;
    
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
