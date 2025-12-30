// src/core/domain/diagnostic/procConfig.ts

import type {
    DiagnosticoItem,
    PrioridadKey,
    DiagnosticoCategory,
} from "../../types/odontograma.types";

export type ProcConfigWithPriority = DiagnosticoItem & {
  prioridadKey: PrioridadKey;
};

const procConfigCache: Map<string, ProcConfigWithPriority | undefined> = new Map();

/**
 * Obtiene la configuración de un procedimiento por ID usando categorías dinámicas
 */
export const getProcConfigFromCategories = (
  procedimientoId: string,
  categorias: DiagnosticoCategory[]
): ProcConfigWithPriority | undefined => {
  if (procConfigCache.has(procedimientoId)) {
    return procConfigCache.get(procedimientoId);
  }

  for (const category of categorias) {
    const proc = category.diagnosticos.find(p => p.id === procedimientoId);
    if (proc) {
      const configWithPriority: ProcConfigWithPriority = {
        ...proc,
        prioridadKey: category.prioridadKey,
      } as ProcConfigWithPriority;

      procConfigCache.set(procedimientoId, configWithPriority);
      return configWithPriority;
    }
  }

  console.warn(`Configuración no encontrada para procedimiento: ${procedimientoId}`);
  procConfigCache.set(procedimientoId, undefined);
  return undefined;
};

export const clearProcConfigCache = (): void => {
  procConfigCache.clear();
};