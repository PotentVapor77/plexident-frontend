// src/components/hooks/useOdontogramaData.ts 

import { useState, useMemo, useCallback } from "react";
import { getColorFromEntry, getPermanentColorForSurface, getDominantColorForTooth, getPriorityFromKey } from "../../core/domain/diagnostic/colorResolution";
import { hydrateOdontogramaData } from "../../core/domain/diagnostic/dataHydration";
import { getProcConfigFromCategories } from "../../core/domain/diagnostic/procConfig";
import { createBaseDiagnosticoEntry, updateDataWithDiagnostico, removeDiagnosticoFromData } from "../../core/domain/diagnostic/updateData";
import { validateDiagnosticoParams } from "../../core/domain/diagnostic/validation";
import { type OdontogramaData, type DiagnosticoEntry, type AreaAfectada, } from "../../core/types/typeOdontograma";
import { useCatalogoDiagnosticos } from "./useCatalogoDiagnosticos";
import { isToothBlockedByAbsence } from "../../core/domain/diagnostic/blockingRules";

// --- Funciones Auxiliares de Mapeo  ---

const initialDientesBloqueados: Record<string, boolean> = {};

export const useOdontogramaData = (initialData: OdontogramaData = {}) => {
    const [data, setData] = useState(() => {
        const hydrated = hydrateOdontogramaData(initialData);
        return hydrated;
    });
    const [dientesBloqueados, setDientesBloqueados] = useState<Record<string, boolean>>(initialDientesBloqueados);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [tipoDiagnosticoSeleccionado] = useState(null);




    const { categorias } = useCatalogoDiagnosticos();
    // Cache de diagnósticos por diente
    const toothDiagnosesCache = useMemo(() => {
        const cache: Record<string, DiagnosticoEntry[]> = {};

        Object.keys(data).forEach(toothId => {
            if (!data[toothId]) return;
            const allDiagnoses = Object.values(data[toothId]).flat() as DiagnosticoEntry[];

            cache[toothId] = allDiagnoses.map(entry => {
                const procConfig = categorias
                    ? getProcConfigFromCategories(entry.procedimientoId, categorias)
                    : undefined;

                return {
                    ...entry,
                    siglas: entry.siglas || procConfig?.siglas || entry.procedimientoId,
                    prioridadKey: procConfig?.prioridadKey || "INFORMATIVA",
                };
            });
        });

        return cache;
    }, [data, categorias]);

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
        (procedimientoId: string, secondaryOptions: Record<string, DiagnosticoEntry[]>): string | null => {
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

            const all = [
                ...direct,
                ...crownAll,
                ...rootAll,
                ...general,
            ] as DiagnosticoEntry[];

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
        if (isToothBlockedByAbsence([newEntry])) {
            return data;
        }

        const toothData = data[toothId];
        if (!toothData) return data;

        const allExisting = Object.values(toothData).flat() as DiagnosticoEntry[];

        // Si el diente no tiene ausencias, no hacer nada.
        if (!isToothBlockedByAbsence(allExisting)) {
            return data;
        }

        let workingData = { ...data };

        // Eliminar todas las entradas que cumplan la regla de ausencia/perdida/extracción.
        Object.entries(toothData).forEach(([surfaceId, entries]) => {
            (entries as DiagnosticoEntry[]).forEach(entry => {
                if (isToothBlockedByAbsence([entry])) {
                    workingData = removeDiagnosticoFromData(
                        workingData,
                        toothId,
                        surfaceId,
                        entry.id
                    );
                }
            });
        });

        return workingData;
    };
    // --- Funciones de Escritura Refactorizadas ---

    const applyDiagnostico = useCallback(
        (
            toothId: string,
            surfaceIds: string[],
            procedimientoId: string,
            colorKey: string,
            secondaryOptions: Record<string, any>,
            descripcion: string,
            afectaArea: AreaAfectada[]
        ) => {

            console.log('[Hook] applyDiagnostico IN', {
                toothId,
                surfaceIds,
                procedimientoId,
                colorKey,
                secondaryOptions,
                descripcion,
                afectaArea,
            });
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
            setData(prevData => {
                try {
                    // Detectar si hay diagnóstico de ausencia que será eliminado
                    const toothData = prevData[toothId];
                    const willRemoveAbsence = toothData && isToothBlockedByAbsence(
                        Object.values(toothData).flat() as DiagnosticoEntry[]
                    );

                    const cleanedData = autoRemoveAbsenceDiagnosis(prevData, toothId, baseEntry);
                    const newData = updateDataWithDiagnostico(
                        cleanedData,
                        toothId,
                        surfaceIds,
                        baseEntry,
                        affectsEntireTooth
                    );

                    // ✅ NOTIFICACIÓN: Si se eliminó ausencia, avisar al usuario
                    if (willRemoveAbsence && !isToothBlockedByAbsence([baseEntry])) {
                        // Aquí puedes usar tu sistema de toast/notificaciones
                        console.info(`[Auto-limpieza] Diagnóstico de ausencia eliminado del diente ${toothId}`);

                        // Si tienes un sistema de toast (react-toastify, sonner, etc):
                        // toast.info(`Diente ${toothId}: Diagnóstico de ausencia eliminado automáticamente`);
                    }

                    console.log('[Hook] applyDiagnostico OUT', {
                        toothId,
                        newToothData: newData[toothId],
                        absenceRemoved: willRemoveAbsence
                    });

                    return { ...newData };
                } catch (e) {
                    console.error('[Hook] ERROR en updateDataWithDiagnostico', e);
                    return prevData;
                }
            });
        },
        [categorias]
    );
    const removeDiagnostico = useCallback(
        (toothId: string, surfaceId: string, entryIdToRemove: string) => {
            setData(prevData =>
                removeDiagnosticoFromData(prevData, toothId, surfaceId, entryIdToRemove)
            );

            // Verificar si hay otros bloqueadores
            setData(prevData => {
                const hasOtherBlockers = Object.values(prevData[toothId] || {})
                    .flat()
                    .some((entry: DiagnosticoEntry) => entry.areasafectadas.includes('general'));

                if (!hasOtherBlockers) {
                    setDientesBloqueados(prev => ({ ...prev, [toothId]: false }));
                }

                return prevData;
            });
        },
        []
    );

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

        // ✅ Validar y limpiar ausencias obsoletas después de cargar
        const cleanedData: OdontogramaData = {};

        Object.entries(hydrated).forEach(([toothId, toothData]) => {
            cleanedData[toothId] = { ...toothData };

            // Verificar si hay diagnósticos de ausencia
            const allDiagnoses = Object.values(toothData).flat() as DiagnosticoEntry[];
            const hasAbsence = isToothBlockedByAbsence(allDiagnoses);

            if (hasAbsence) {
                // Si hay ausencia, verificar si hay otros diagnósticos incompatibles
                const nonAbsenceDiagnoses = allDiagnoses.filter(
                    diag => !isToothBlockedByAbsence([diag])
                );

                // Si hay diagnósticos NO-ausencia, eliminar las ausencias
                if (nonAbsenceDiagnoses.length > 0) {
                    Object.entries(toothData).forEach(([surfaceId, entries]) => {
                        cleanedData[toothId][surfaceId] = (entries as DiagnosticoEntry[]).filter(
                            entry => !isToothBlockedByAbsence([entry])
                        );

                        // Limpiar superficies vacías
                        if (cleanedData[toothId][surfaceId].length === 0) {
                            delete cleanedData[toothId][surfaceId];
                        }
                    });
                }
            }
        });

        setData(cleanedData);
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
