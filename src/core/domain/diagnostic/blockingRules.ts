// src/core/domain/diagnostic/blockingRules.ts

import { type DiagnosticoEntry } from "../../types/odontograma.types";

/**
 * Lista de procedimientos que indican ausencia del diente
 * y deben bloquear otros diagnósticos
 */
const BLOCKING_DIAGNOSIS_KEYS = [
  'ausente',
  'extraccion_otra_causa',
  'perdida_otra_causa',
  'extraccion_indicada',
  // Puedes agregar más en el futuro
] as const;

export function isToothBlockedByAbsence(diagnosticos: DiagnosticoEntry[]): boolean {
  return diagnosticos.some(diag => {
    const key = diag.procedimientoId.toLowerCase();
    
    // Verificar si el procedimientoId está en la lista de bloqueos
    const isBlockingKey = BLOCKING_DIAGNOSIS_KEYS.some(
      blockingKey => key === blockingKey.toLowerCase()
    );
    
    // También verificar por palabras clave en el nombre del procedimiento
    const nombre = diag.nombre?.toLowerCase() || '';
    const hasBlockingTerm = 
      nombre.includes('ausente') ||
      nombre.includes('pérdida') ||
      nombre.includes('perdida') ||
      nombre.includes('extracción') ||
      nombre.includes('extraccion') ||
      nombre.includes('exodoncia');
    
    return isBlockingKey || hasBlockingTerm;
  });
}

export function isDiagnosisBlocking(diag: DiagnosticoEntry): boolean {
  return isToothBlockedByAbsence([diag]);
}