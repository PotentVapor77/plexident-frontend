import type { AreaAfectada, DiagnosticoEntry, OdontogramaData } from "../../types/typeOdontograma";
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
        areas_afectadas: afectaArea,
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
    const newData = { ...prevData };

    // Inicializar diente si no existe
    if (!newData[toothId]) {
        newData[toothId] = {};
    }

    // Si afecta todo el diente, limpiar todas las superficies existentes
    if (affectsEntireTooth) {
        newData[toothId] = {};
    }

    // Determinar superficies objetivo
    const targetSurfaces = affectsEntireTooth ? ["diente_completo"] : surfaceIds;

    // Aplicar diagnóstico a cada superficie objetivo
    targetSurfaces.forEach(surfaceId => {
        // Si ya existe diagnóstico de diente completo, no hacer nada
        if (newData[toothId]["diente_completo"] && surfaceId !== "diente_completo") {
            return;
        }

        // Si vamos a aplicar diente_completo, limpiar otras superficies
        if (surfaceId === "diente_completo" && Object.keys(newData[toothId]).length > 0) {
            newData[toothId] = {};
        }

        const newEntry = {
            ...baseEntry,
            superficieId: surfaceId
        };

        newData[toothId] = {
            ...newData[toothId],
            [surfaceId]: [...(newData[toothId][surfaceId] || []), newEntry]
        };
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