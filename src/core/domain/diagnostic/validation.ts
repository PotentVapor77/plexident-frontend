// validation.ts
import type { AreaAfectada } from '../../types/odontograma.types';

export const validateDiagnosticoParams = (
  toothId: string,
  surfaceIds: string[],
  procedimientoId: string,
  afectaArea: AreaAfectada[]
): boolean => {
  if (!toothId || !procedimientoId) {
    console.warn('Parámetros inválidos: toothId vacío');
    return false;
  }

  const isGeneral = afectaArea.includes('general');

  // Solo obligamos surfaceIds cuando NO es diagnóstico general
  if (!isGeneral && (!surfaceIds || surfaceIds.length === 0)) {
    console.warn('Parámetros inválidos: surfaceIds vacío para diagnóstico por superficie');
    return false;
  }

  if (!procedimientoId) {
    console.warn('Parámetros inválidos: procedimientoId vacío');
    return false;
  }

  if (!afectaArea || afectaArea.length === 0) {
    console.warn('Parámetros inválidos: afectaArea vacío');
    return false;
  }

  console.warn('[Hook] validateDiagnosticoParams = false', {
    toothId,
    surfaceIds,
    procedimientoId,
    afectaArea,
  });

  return true;
};