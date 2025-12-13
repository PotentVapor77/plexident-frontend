import type { AreaAfectada } from '../../types/typeOdontograma';

export const validateDiagnosticoParams = (
    toothId: string,
    surfaceIds: string[],
    procedimientoId: string,
    afectaArea: AreaAfectada[]
): boolean => {
    if (!toothId || !surfaceIds || surfaceIds.length === 0) {
        console.warn('Parámetros inválidos: toothId o surfaceIds vacíos');
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

    return true;
};