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
            hydrated[toothId][surfaceId] = initialData[toothId][surfaceId].map(
                hydrateDiagnosticoEntry
            );
        }
    }

    return hydrated;
};