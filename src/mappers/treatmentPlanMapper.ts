// src/mappers/treatmentPlanMapper.ts

import type {
  PlanTratamientoDetailResponse,
  SesionTratamientoDetailResponse,
  DiagnosticoSnapshot,
  Procedimiento,
  Prescripcion,
} from '../types/treatmentPlan/typeBackendTreatmentPlan';
import type {
  TreatmentPlanFormData,
  SessionFormData,
  PlanTratamientoCreatePayload,
  SesionTratamientoCreatePayload,
} from '../core/types/treatmentPlan.types';

// ============================================================================
// MAPPERS: Backend → Frontend (Para mostrar en UI)
// ============================================================================

/**
 * Mapea un plan de tratamiento del backend al dominio del frontend
 */
export function mapBackendPlanToFrontend(
  backend: PlanTratamientoDetailResponse
): TreatmentPlanFormData & { id: string } {
  return {
    id: backend.id,
    paciente: backend.paciente,
    titulo: backend.titulo,
    notas_generales: backend.notas_generales || '',
    usar_ultimo_odontograma: !!backend.version_odontograma,
  };
}

/**
 * Mapea una sesión de tratamiento del backend al dominio del frontend
 */

export function mapBackendSesionToFrontend(
  backend: SesionTratamientoDetailResponse
): SessionFormData & { id: string } {
  return {
    id: backend.id,
    plan_tratamiento: backend.plan_tratamiento,
    fecha_programada: backend.fecha_programada || "",
    autocompletar_diagnosticos: false, // no relevante en edición
    procedimientos: backend.procedimientos || [],
    prescripciones: backend.prescripciones || [],
    notas: backend.notas || "",
    cita_id: backend.cita, 
    estado: backend.estado,
  };
}

/**
 * Mapea diagnósticos disponibles del odontograma a formato legible
 */
export function mapDiagnosticosDisponibles(
  diagnosticos: DiagnosticoSnapshot[]
): Array<{
  id: string;
  dienteLabel: string;
  superficieLabel: string;
  diagnosticoLabel: string;
  prioridad: number;
  colorHex: string;
}> {
  return diagnosticos.map((diag) => ({
    id: diag.id,
    dienteLabel: `Diente ${diag.diente}`,
    superficieLabel: diag.superficie,
    diagnosticoLabel: `${diag.siglas} - ${diag.diagnostico_nombre}`,
    prioridad: diag.prioridad,
    colorHex: diag.color_hex,
  }));
}

// ============================================================================
// MAPPERS: Frontend → Backend (Para enviar al API)
// ============================================================================

/**
 * Mapea formulario de plan de tratamiento a payload del backend
 */
export function mapFrontendPlanToPayload(
  formData: TreatmentPlanFormData
): PlanTratamientoCreatePayload {
  return {
    paciente: formData.paciente,
    titulo: formData.titulo,
    notas_generales: formData.notas_generales || undefined,
    usar_ultimo_odontograma: formData.usar_ultimo_odontograma,
  };
}

/**
 * Mapea formulario de sesión de tratamiento a payload del backend
 */
export function mapFrontendSesionToPayload(
  formData: SessionFormData
): SesionTratamientoCreatePayload {
  return {
    plan_tratamiento: formData.plan_tratamiento,
    fecha_programada: formData.fecha_programada || null,
    autocompletar_diagnosticos: formData.autocompletar_diagnosticos,
    procedimientos:
      formData.procedimientos.length > 0 ? formData.procedimientos : undefined,
    prescripciones:
      formData.prescripciones.length > 0 ? formData.prescripciones : undefined,
    notas: formData.notas || undefined,
    cita_id: formData.cita_id || null,
    estado: formData.estado,
  };
}

// ============================================================================
// HELPERS: Transformaciones específicas
// ============================================================================

/**
 * Formatea fecha ISO a formato legible DD/MM/YYYY
 */
export function formatDateToReadable(isoDate: string | null): string {
  if (!isoDate) return 'No especificada';
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formatea fecha y hora ISO a formato legible
 */
export function formatDateTimeToReadable(isoDateTime: string | null): string {
  if (!isoDateTime) return 'No especificada';
  const date = new Date(isoDateTime);
  return date.toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convierte estado de sesión a etiqueta legible
 */
export function getEstadoSesionLabel(estado: string): string {
  const labels: Record<string, string> = {
    planificada: 'Planificada',
    en_progreso: 'En Progreso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
}

/**
 * Obtiene color del badge según estado de sesión
 */
export function getEstadoSesionColor(estado: string): string {
  const colors: Record<string, string> = {
    planificada: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    en_progreso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

/**
 * Valida que un procedimiento tenga campos mínimos
 */
export function validateProcedimiento(proc: Partial<Procedimiento>): boolean {
  return !!proc.descripcion && proc.descripcion.trim().length > 0;
}

/**
 * Valida que una prescripción tenga campos mínimos
 */
export function validatePrescripcion(presc: Partial<Prescripcion>): boolean {
  return (
    !!presc.medicamento &&
    presc.medicamento.trim().length > 0 &&
    !!presc.dosis &&
    presc.dosis.trim().length > 0
  );
}

/**
 * Genera un UUID temporal para usar en el frontend
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}


