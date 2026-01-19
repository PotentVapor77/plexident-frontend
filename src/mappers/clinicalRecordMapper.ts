// src/mappers/clinicalRecordMapper.ts
import type { ClinicalRecordFormData } from "../core/types/clinicalRecord.types";
import type { 
  ClinicalRecordCreatePayload, 
  ClinicalRecordDetailResponse,
  ClinicalRecordInitialData
} from "../types/clinicalRecords/typeBackendClinicalRecord";

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
 * 🆕 Convierte los datos iniciales del backend al formato del formulario
 */
export const mapInitialDataToFormData = (
  initialData: ClinicalRecordInitialData,
  odontologoId?: string
): Partial<ClinicalRecordFormData> & { 
  _dates: {[key: string]: string | null} 
} => {
  // ✅ Manejo seguro con verificación de existencia
  const antecedentesPersonales = initialData.antecedentes_personales || null;
  const antecedentesFamiliares = initialData.antecedentes_familiares || null;
  const constantesVitales = initialData.constantes_vitales || null;
  const examenEstomatognatico = initialData.examen_estomatognatico || null;

  return {
    // Datos básicos del paciente
    paciente: initialData.paciente?.id || "",
    odontologo_responsable: odontologoId || "",
    motivo_consulta: initialData.motivo_consulta || "",
    embarazada: initialData.embarazada || "",
    enfermedad_actual: initialData.enfermedad_actual || "",
    
    // IDs para el payload (referencias FK) - ✅ Acceso seguro
    antecedentes_personales_id: antecedentesPersonales?.id || null,
    antecedentes_familiares_id: antecedentesFamiliares?.id || null,
    constantes_vitales_id: constantesVitales?.id || null,
    examen_estomatognatico_id: examenEstomatognatico?.id || null,
    
    // 🆕 DATOS EDITABLES - ✅ Garantizar que nunca sean undefined
    antecedentes_personales_data: antecedentesPersonales?.data || null,
    antecedentes_familiares_data: antecedentesFamiliares?.data || null,
    constantes_vitales_data: constantesVitales?.data || null,
    examen_estomatognatico_data: examenEstomatognatico?.data || null,
    
    // Metadata de fechas (para mostrar en headers)
    _dates: {
      motivo_consulta: initialData.motivo_consulta_fecha || null,
      enfermedad_actual: initialData.enfermedad_actual_fecha || null,
      antecedentes_personales: antecedentesPersonales?.fecha || null,
      antecedentes_familiares: antecedentesFamiliares?.fecha || null,
      constantes_vitales: constantesVitales?.fecha || null,
      examen_estomatognatico: examenEstomatognatico?.fecha || null,
    }
  };
};

/**
 * Convierte los datos del formulario al payload del backend para CREATE
 */
export const mapFormDataToPayload = (
  formData: ClinicalRecordFormData
): ClinicalRecordCreatePayload => {
  return {
    paciente: formData.paciente,
    odontologo_responsable: formData.odontologo_responsable,
    motivo_consulta: formData.motivo_consulta || undefined,
    embarazada: (formData.embarazada === "SI" || formData.embarazada === "NO")
      ? formData.embarazada
      : undefined,
    enfermedad_actual: formData.enfermedad_actual || undefined,
    
    // ⚠️ IMPORTANTE: Enviar solo IDs, no los datos completos
    antecedentes_personales: formData.antecedentes_personales_id || undefined,
    antecedentes_familiares: formData.antecedentes_familiares_id || undefined,
    constantes_vitales: formData.constantes_vitales_id || undefined,
    examen_estomatognatico: formData.examen_estomatognatico_id || undefined,
    
    estado: formData.estado || "BORRADOR",
    observaciones: formData.observaciones || undefined,
    unicodigo: formData.unicodigo || undefined,
    establecimiento_salud: formData.establecimiento_salud || undefined,
  };
};

/**
 * Convierte la respuesta del backend (detalle) al formato del formulario para EDIT
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
    antecedentes_personales_id: response.antecedentes_personales,
    antecedentes_familiares_id: response.antecedentes_familiares,
    constantes_vitales_id: response.constantes_vitales,
    examen_estomatognatico_id: response.examen_estomatognatico,
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
