// src/mappers/clinicalRecordMapper.ts

import type { ClinicalRecordFormData } from "../core/types/clinicalRecord.types";
import type { ClinicalRecordCreatePayload, ClinicalRecordDetailResponse } from "../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * ============================================================================
 * MAPPERS - CLINICAL RECORDS
 * ============================================================================
 */

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatDateToReadable = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea solo la fecha (sin hora)
 */
export const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Convierte los datos del formulario al payload del backend
 */
export const mapFormDataToPayload = (
  formData: ClinicalRecordFormData
): ClinicalRecordCreatePayload => {
  return {
    paciente: formData.paciente,
    odontologo_responsable: formData.odontologo_responsable,
    motivo_consulta: formData.motivo_consulta || undefined,
    embarazada: formData.embarazada || undefined,
    enfermedad_actual: formData.enfermedad_actual || undefined,
    estado: formData.estado || "BORRADOR",
    observaciones: formData.observaciones || undefined,
    unicodigo: formData.unicodigo || undefined,
    establecimiento_salud: formData.establecimiento_salud || undefined,
  };
};

/**
 * Convierte la respuesta del backend a datos del formulario (para edición)
 */
export const mapResponseToFormData = (
  response: ClinicalRecordDetailResponse
): Partial<ClinicalRecordFormData> => {
  return {
    paciente: response.paciente,
    odontologo_responsable: response.odontologo_responsable,
    motivo_consulta: response.motivo_consulta,
    embarazada: response.embarazada || "",
    enfermedad_actual: response.enfermedad_actual,
    estado: response.estado,
    observaciones: response.observaciones,
    unicodigo: response.unicodigo,
    establecimiento_salud: response.establecimiento_salud,
  };
};

/**
 * Obtiene el texto del estado en español
 */
export const getEstadoDisplay = (estado: string): string => {
  const estados: Record<string, string> = {
    BORRADOR: "Borrador",
    ABIERTO: "Abierto",
    CERRADO: "Cerrado",
  };
  return estados[estado] || estado;
};

/**
 * Obtiene el color del badge según el estado
 */
export const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    BORRADOR: "bg-gray-100 text-gray-700 ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
    ABIERTO: "bg-blue-light-50 text-blue-light-700 ring-blue-light-600/20 dark:bg-blue-light-400/10 dark:text-blue-light-400 dark:ring-blue-light-400/20",
    CERRADO: "bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-400/10 dark:text-success-400 dark:ring-success-400/20",
  };
  return colores[estado] || colores.BORRADOR;
};
