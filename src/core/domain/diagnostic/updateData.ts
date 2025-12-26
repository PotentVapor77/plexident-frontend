import type { AreaAfectada, DiagnosticoEntry, OdontogramaData } from "../../types/typeOdontograma";
import { isToothBlockedByAbsence } from "./blockingRules";
import { hydrateDiagnosticoEntry } from "./dataHydration";



/**
 * Genera un ID único para la entrada de diagnóstico
 */
export const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea la entrada base de diagnóstico con toda la información necesaria
 */
export const createBaseDiagnosticoEntry = (
    // Id con prefijo temporal
    procConfig: any, // ProcConfigWithPriority
    finalColorHex: string,
    priority: number,
    afectaArea: AreaAfectada[],
    secondaryOptions: Record<string, any>,
    descripcion: string
): DiagnosticoEntry => {
    return hydrateDiagnosticoEntry({
        id: generateUniqueId(),
        procedimientoId: procConfig.id,
        nombre: procConfig.nombre,
        siglas: procConfig.siglas,
        colorHex: finalColorHex,
        priority: priority,
        areasafectadas: afectaArea,
        secondaryOptions,
        descripcion,
        superficieId: undefined,
        prioridadKey: procConfig.prioridadKey,
    });
};

/**
 * Actualiza los datos del odontograma con el nuevo diagnóstico
 * Maneja lógica de bloqueos y superficies
 */
export const updateDataWithDiagnostico = (
  prevData: OdontogramaData,
  toothId: string,
  surfaceIds: string[],
  baseEntry: DiagnosticoEntry,
  affectsEntireTooth: boolean
): OdontogramaData => {
  console.log('[updateData] IN', {
    toothId,
    surfaceIds,
    affectsEntireTooth,
    prevToothData: prevData[toothId],
  });

  const newData = { ...prevData };
  if (!newData[toothId]) {
    newData[toothId] = {};
  }

  const isBlockingDiagnosis = isToothBlockedByAbsence([baseEntry]);
  if (isBlockingDiagnosis) {
    console.log('[updateData] Limpiando diente por diagnóstico bloqueador', {
      toothId,
      procedimientoId: baseEntry.procedimientoId
    });
    newData[toothId] = {};
  }

  const targetSurfaces = affectsEntireTooth ? ['general'] : surfaceIds;

  targetSurfaces.forEach(surfaceId => {
    const newEntry: DiagnosticoEntry = {
      ...baseEntry,
      superficieId: surfaceId,
    };

    newData[toothId] = {
      ...newData[toothId],
      [surfaceId]: [...(newData[toothId][surfaceId] || []), newEntry],
    };
  });

  console.log('[updateData] OUT', {
    toothId,
    newToothData: newData[toothId],
  });

  return newData;
};

/**
 * Elimina un diagnóstico específico del odontograma
 */
export const removeDiagnosticoFromData = (
    prevData: OdontogramaData,
    toothId: string,
    surfaceId: string,
    entryIdToRemove: string
): OdontogramaData => {
    const newData = { ...prevData };

    // Si no existe el diente, no hacer nada
    if (!newData[toothId]) return newData;

    const currentDiagnosticos = newData[toothId]?.[surfaceId] || [];
    const newDiagnosticos = currentDiagnosticos.filter(entry => entry.id !== entryIdToRemove);

    // Actualizar o eliminar la superficie
    if (newDiagnosticos.length === 0) {
        const { [surfaceId]: removed, ...rest } = newData[toothId];
        newData[toothId] = rest;
    } else {
        newData[toothId] = { ...newData[toothId], [surfaceId]: newDiagnosticos };
    }

    // Eliminar diente si no tiene más superficies
    if (Object.keys(newData[toothId] || {}).length === 0) {
        delete newData[toothId];
    }

    return newData;
};