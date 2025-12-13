// src/core/domain/diagnostic/procConfig.ts

import { DIAGNOSTICO_CATEGORIES } from "../../config/odontograma";
import type { DiagnosticoItem, PrioridadKey } from "../../types/typeOdontograma";


export type ProcConfigWithPriority = DiagnosticoItem & {
    prioridadKey: PrioridadKey;
};

// Cache persistente para evitar búsquedas repetidas
const procConfigCache: Map<string, ProcConfigWithPriority | undefined> = new Map();

/**
 * Obtiene la configuración de un procedimiento por ID
 * Incluye caché para optimizar búsquedas repetidas
 */
export const getProcConfig = (procedimientoId: string): ProcConfigWithPriority | undefined => {
    // Verificar caché primero
    if (procConfigCache.has(procedimientoId)) {
        return procConfigCache.get(procedimientoId);
    }

    // Buscar en categorías
    for (const category of DIAGNOSTICO_CATEGORIES) {
        const proc = category.diagnosticos.find(p => p.id === procedimientoId);

        if (proc) {
            const configWithPriority: ProcConfigWithPriority = {
                ...proc,
                prioridadKey: category.prioridadKey
            } as ProcConfigWithPriority;

            // Guardar en caché
            procConfigCache.set(procedimientoId, configWithPriority);
            return configWithPriority;
        }
    }

    // Configuración no encontrada, guardar en caché como undefined
    console.warn(`Configuración no encontrada para procedimiento: ${procedimientoId}`);
    procConfigCache.set(procedimientoId, undefined);
    return undefined;
};

/**
 * Limpia el caché de configuración (útil para testing)
 */
export const clearProcConfigCache = (): void => {
    procConfigCache.clear();
};