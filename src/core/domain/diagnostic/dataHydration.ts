// src/core/domain/diagnostic/dataHydration.ts

import type { DiagnosticoEntry, OdontogramaData } from "../../types/typeOdontograma";
import { getProcConfig } from "./procConfig";

export const hydrateDiagnosticoEntry = (entry: DiagnosticoEntry): DiagnosticoEntry => {
    if (entry.siglas) return entry;

    const config = getProcConfig(entry.procedimientoId);
    if (!config) return entry;

    return {
        ...entry,
        nombre: entry.nombre || config.nombre,
        siglas: entry.siglas || config.siglas,
    };
};

/**
 * Hidrata todos los datos del odontograma
 * Asegura que cada entrada tenga siglas y nombre completo
 */
export const hydrateOdontogramaData = (initialData: OdontogramaData): OdontogramaData => {
    const hydrated: OdontogramaData = {};

    for (const toothId in initialData) {
        hydrated[toothId] = {};

        for (const surfaceId in initialData[toothId]) {
            // SOLO CAMBIO: Validar que sea un array antes de hacer map
            const surfaceData = initialData[toothId][surfaceId];

            if (Array.isArray(surfaceData)) {
                hydrated[toothId][surfaceId] = surfaceData.map(hydrateDiagnosticoEntry);
            } else {
                // Si no es array, inicializar como array vacío
                hydrated[toothId][surfaceId] = [];
            }
        }
    }

    return hydrated;
};
