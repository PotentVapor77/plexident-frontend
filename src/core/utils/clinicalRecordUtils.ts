// src/core/utils/clinicalRecordUtils.ts

import type { ClinicalRecordListResponse } from "../../types/clinicalRecords/typeBackendClinicalRecord";


/**
 * ============================================================================
 * UTILIDADES - CLINICAL RECORDS
 * ============================================================================
 */

/**
 * Filtra historiales por estado
 */
export const filterByEstado = (
  historiales: ClinicalRecordListResponse[],
  estado: string | undefined
): ClinicalRecordListResponse[] => {
  if (!estado || estado === "") return historiales;
  return historiales.filter((h) => h.estado === estado);
};

/**
 * Filtra historiales por paciente
 */
export const filterByPaciente = (
  historiales: ClinicalRecordListResponse[],
  pacienteId: string | undefined
): ClinicalRecordListResponse[] => {
  if (!pacienteId) return historiales;
  return historiales.filter((h) => h.paciente === pacienteId);
};

/**
 * Ordena historiales por fecha de atención (más recientes primero)
 */
export const sortByFechaAtencion = (
  historiales: ClinicalRecordListResponse[]
): ClinicalRecordListResponse[] => {
  return [...historiales].sort((a, b) => {
    const dateA = new Date(a.fecha_atencion).getTime();
    const dateB = new Date(b.fecha_atencion).getTime();
    return dateB - dateA;
  });
};

/**
 * Cuenta historiales por estado
 */
export const countByEstado = (
  historiales: ClinicalRecordListResponse[]
): Record<string, number> => {
  return historiales.reduce((acc, h) => {
    acc[h.estado] = (acc[h.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Verifica si un historial puede ser editado
 */
export const canEditRecord = (record: ClinicalRecordListResponse): boolean => {
  return record.puede_editar && record.estado !== "CERRADO" && record.activo;
};

/**
 * Verifica si un historial puede ser cerrado
 */
export const canCloseRecord = (record: ClinicalRecordListResponse): boolean => {
  return record.estado === "ABIERTO" && record.activo;
};

/**
 * Obtiene el color del badge según el nivel de completitud
 */
export const getCompletenessColor = (estaCompleto: boolean): string => {
  return estaCompleto
    ? "bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-400/10 dark:text-success-400"
    : "bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-400/10 dark:text-warning-400";
};

/**
 * Calcula estadísticas de historiales
 */
export const calculateStatistics = (historiales: ClinicalRecordListResponse[]) => {
  const total = historiales.length;
  const borradores = historiales.filter((h) => h.estado === "BORRADOR").length;
  const abiertos = historiales.filter((h) => h.estado === "ABIERTO").length;
  const cerrados = historiales.filter((h) => h.estado === "CERRADO").length;
  const completos = historiales.filter((h) => h.esta_completo).length;

  return {
    total,
    borradores,
    abiertos,
    cerrados,
    completos,
    incompletos: total - completos,
    porcentajeCompletos: total > 0 ? Math.round((completos / total) * 100) : 0,
  };
};
