// src/components/hooks/useOdontogramaData.ts 

import { useState, useMemo, useCallback } from "react";
import { getColorFromEntry, getPermanentColorForSurface, getDominantColorForTooth, getPriorityFromKey } from "../../core/domain/diagnostic/colorResolution";
import { hydrateOdontogramaData } from "../../core/domain/diagnostic/dataHydration";
import { getProcConfigFromCategories } from "../../core/domain/diagnostic/procConfig";
import { createBaseDiagnosticoEntry, updateDataWithDiagnostico, removeDiagnosticoFromData } from "../../core/domain/diagnostic/updateData";
import { validateDiagnosticoParams } from "../../core/domain/diagnostic/validation";
import { type OdontogramaData, type DiagnosticoEntry, type AreaAfectada, } from "../../core/types/odontograma.types";
import { useCatalogoDiagnosticos } from "./useCatalogoDiagnosticos";
import { isToothBlockedByAbsence } from "../../core/domain/diagnostic/blockingRules";
import { eliminarDiagnostico } from "../../services/odontogram/odontogramaService";

// --- Funciones Auxiliares de Mapeo ---
const initialDientesBloqueados: Record<string, boolean> = {};

export const useOdontogramaData = (initialData: OdontogramaData = {}) => {
    const [data, setData] = useState(() => {
        const hydrated = hydrateOdontogramaData(initialData);
        return hydrated;
    });

    const [dientesBloqueados, setDientesBloqueados] = useState<Record<string, boolean>>(initialDientesBloqueados);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [tipoDiagnosticoSeleccionado] = useState<string | null>(null);
    const { categorias } = useCatalogoDiagnosticos();

    // --- Funciones de Lectura Optimizadas ---
    const getDiagnosticosForSurface = useCallback(
        (toothId: string | null, surfaceId: string): DiagnosticoEntry[] => {
            if (!toothId || !data[toothId]) return [];
            return data[toothId][surfaceId] || [];
        },
        [data]
    );

    const getToothDiagnoses = useCallback((toothId: string) => {
        return data[toothId] || {};
    }, [data]);

    const getPreviewColor = useCallback(
        (procedimientoId: string, secondaryOptions: Record<string, string>): string | null => {
            if (!categorias) return null;
            const procConfig = getProcConfigFromCategories(procedimientoId, categorias);
            if (!procConfig) return null;
            return getColorFromEntry(procConfig.simboloColor as any, secondaryOptions);
        },
        [categorias]
    );

    const getPermanentColor = useCallback(
        (toothId: string | null, surfaceId: string): string | null => {
            if (!toothId || !data[toothId]) return null;
            const toothData = data[toothId];
            const direct = toothData[surfaceId] || [];
            const crownAll = toothData['corona_completa'] || [];
            const rootAll = toothData['raiz_completa'] || [];
            const general = toothData['general'] || [];
            const all = [...direct, ...crownAll, ...rootAll, ...general] as DiagnosticoEntry[];
            return getPermanentColorForSurface(all);
        },
        [data]
    );

    const getDominantColor = useCallback((toothId: string) => {
        const toothData = data[toothId];
        if (!toothData) return null;
        return getDominantColorForTooth(Object.values(toothData).flat());
    }, [data]);

    const isToothBlocked = useCallback((toothId: string) => {
        const toothData = data[toothId];
        if (!toothData) return false;
        const allDiagnoses = Object.values(toothData).flat() as DiagnosticoEntry[];
        return isToothBlockedByAbsence(allDiagnoses);
    }, [data]);

    const autoRemoveAbsenceDiagnosis = (
        data: OdontogramaData,
        toothId: string,
        newEntry: DiagnosticoEntry
    ): OdontogramaData => {
        // Si el nuevo diagnóstico es de ausencia, no limpiar nada.
        const toothData = data[toothId];
        if (isToothBlockedByAbsence([newEntry])) {
    let workingData = { ...data };
    Object.entries(toothData).forEach(([surfaceId, entries]) => {
      (entries as DiagnosticoEntry[]).forEach(entry => {
        if (!isToothBlockedByAbsence([entry])) {  // ← Eliminar caries/obturaciones/etc
          workingData = removeDiagnosticoFromData(workingData, toothId, surfaceId, entry.id);
        }
      });
    });
    return workingData;
  }

  // ❌ Caso anterior (newEntry NO ausencia → eliminar ausencias previas)
  const allExisting = Object.values(toothData).flat() as DiagnosticoEntry[];
  if (!isToothBlockedByAbsence(allExisting)) return data;

  let workingData = { ...data };
  Object.entries(toothData).forEach(([surfaceId, entries]) => {
    (entries as DiagnosticoEntry[]).forEach(entry => {
      if (isToothBlockedByAbsence([entry])) {
        workingData = removeDiagnosticoFromData(workingData, toothId, surfaceId, entry.id);
      }
    });
  });
  return workingData;
};

    const eliminarAusenciasBackend = useCallback(async (toothId: string) => {
        const toothData = data[toothId];
        if (!toothData) return;

        const absenceIds: string[] = [];
        // Recopilar TODOS los IDs de diagnósticos de ausencia del diente
        Object.entries(toothData).forEach(([surfaceId, entries]) => {
            (entries as DiagnosticoEntry[]).forEach(entry => {
                if (isToothBlockedByAbsence([entry])) {
                    absenceIds.push(entry.id);
                }
            });
        });

        // Eliminar en paralelo (fire and forget)
        if (absenceIds.length > 0) {
            Promise.allSettled(
                absenceIds.map(id => eliminarDiagnostico(id))
            ).catch(err => {
                console.error("[Auto-limpieza] Error eliminando ausencias backend:", err);
            });
        }
    }, [data]);

    // --- Funciones de Escritura Refactorizadas ---
    const applyDiagnostico = useCallback(
        (
            toothId: string,
            surfaceIds: string[],
            procedimientoId: string,
            colorKey: string,
            secondaryOptions: Record<string, string>,
            descripcion: string,
            afectaArea: AreaAfectada[]
        ) => {
            console.log('[Hook] applyDiagnostico IN', { toothId, surfaceIds, procedimientoId, colorKey, secondaryOptions, descripcion, afectaArea });

            if (!validateDiagnosticoParams(toothId, surfaceIds, procedimientoId, afectaArea)) {
                console.warn('[Hook] validateDiagnosticoParams = false');
                return;
            }

            console.log("[Hook] Paso 1: validación OK", { toothId, surfaceIds, procedimientoId, afectaArea });

            if (!categorias) {
                console.warn("[Hook] No hay catálogo de categorías cargado todavía");
                return;
            }

            // 2. Obtener configuración y metadatos de color
            const procConfig = getProcConfigFromCategories(procedimientoId, categorias);
            console.log("[Hook] Paso 2: procConfig", procConfig);

            if (!procConfig) {
                console.warn("[Hook] Procedimiento no encontrado", procedimientoId);
                return;
            }

            console.log('[Hook] Paso 3: antes de color', { colorKey, secondaryOptions });
            let finalColorHex: string;
            let priority: number;

            try {
                finalColorHex = getColorFromEntry(colorKey as any, secondaryOptions);
                priority = getPriorityFromKey(colorKey);
                console.log('[Hook] Paso 4: color calculado', { finalColorHex, priority });
            } catch (e) {
                console.error('[Hook] ERROR en color/prioridad', e, { colorKey, secondaryOptions });
                return;
            }

            let baseEntry: DiagnosticoEntry;
            try {
                baseEntry = createBaseDiagnosticoEntry(procConfig, finalColorHex, priority, afectaArea, secondaryOptions, descripcion);
                console.log('[Hook] Paso 5: baseEntry creado', baseEntry);
            } catch (e) {
                console.error('[Hook] ERROR creando baseEntry', e, { procConfig, finalColorHex, priority, afectaArea });
                return;
            }

            const affectsEntireTooth = afectaArea.includes('general');

            const prevToothData = data[toothId];
            const prevDiagnoses = prevToothData ? Object.values(prevToothData).flat() as DiagnosticoEntry[] : [];
            const hasPreviousActiveDx = prevDiagnoses.some(diag => !isToothBlockedByAbsence([diag]));
            const activeDxIdsToDelete: string[] = [];
            if (hasPreviousActiveDx && isToothBlockedByAbsence([baseEntry])) {  // ← newEntry="ausente"
                prevDiagnoses.forEach(entry => {
                    if (!isToothBlockedByAbsence([entry])) {  // ← Es caries/obturación/etc
                        activeDxIdsToDelete.push(entry.id);
                    }
                });
            }

            const willRemoveAbsence = prevToothData && isToothBlockedByAbsence(
                Object.values(prevToothData).flat() as DiagnosticoEntry[]
            );

            const absenceIdsToDelete: string[] = [];
            if (prevToothData && willRemoveAbsence && !isToothBlockedByAbsence([baseEntry])) {
                Object.entries(prevToothData).forEach(([surfaceId, entries]) => {
                    (entries as DiagnosticoEntry[]).forEach(entry => {
                        if (isToothBlockedByAbsence([entry])) {
                            absenceIdsToDelete.push(entry.id);
                        }
                    });
                });
            }

            setData(prevData => {
                try {
                    const cleanedData = autoRemoveAbsenceDiagnosis(prevData, toothId, baseEntry);
                    const newData = updateDataWithDiagnostico(cleanedData, toothId, surfaceIds, baseEntry, affectsEntireTooth);
                    return { ...newData };
                } catch (e) {
                    return prevData;
                }
            });

            if (activeDxIdsToDelete.length > 0) {
    console.info(`[Auto-limpieza] Eliminando ${activeDxIdsToDelete.length} diagnósticos previos del diente ${toothId}`);
    Promise.allSettled(
      activeDxIdsToDelete.map(id => eliminarDiagnostico(id))
    ).catch(err => {
      console.error('[Auto-limpieza] Error eliminando backend:', err);
    });
  }

        }, [categorias, data]);

    const removeDiagnostico = useCallback(async (toothId: string, surfaceId: string, entryIdToRemove: string) => {
        setData(prevData => removeDiagnosticoFromData(prevData, toothId, surfaceId, entryIdToRemove));

        eliminarDiagnostico(entryIdToRemove).catch(err => {
            console.error('Error eliminando diagnóstico backend:', err);
        });
    }, []);

    const saveOdontogramaData = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLastSaveTime(new Date());
            console.log("Datos del odontograma guardados con éxito:", data);
        } catch (error) {
            console.error("Error al guardar datos del odontograma:", error);
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, data]);

    const clearAllData = useCallback(() => {
        setData({});
        setDientesBloqueados({});
    }, []);

    const exportData = useCallback((): OdontogramaData => {
        return JSON.parse(JSON.stringify(data));
    }, [data]);

    const loadFromBackend = useCallback((newData: OdontogramaData) => {
        const hydrated = hydrateOdontogramaData(newData);
        setData(hydrated);
        setDientesBloqueados({});
    }, []);
    return {
        // Estado
        odontogramaData: data,
        isSaving,
        lastSaveTime,
        tipoDiagnosticoSeleccionado,
        dientesBloqueados,

        // Funciones de lectura
        getDiagnosticosForSurface,
        getToothDiagnoses,
        getPermanentColorForSurface: getPermanentColor,
        getDominantColorForTooth: getDominantColor,
        isToothBlocked,

        getColorFromEntry,
        getPreviewColor,

        // Funciones de escritura
        applyDiagnostico,
        removeDiagnostico,
        saveOdontogramaData,
        clearAllData,
        exportData,

        // Utilidades
        setData,

        // Carga de datos
        loadFromBackend
    };
};