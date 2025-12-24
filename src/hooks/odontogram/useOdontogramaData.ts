// src/components/hooks/useOdontogramaData.ts 

import { useState, useMemo, useCallback } from "react";
import { getColorFromEntry, getPermanentColorForSurface, getDominantColorForTooth } from "../../core/domain/diagnostic/colorResolution";
import { hydrateOdontogramaData } from "../../core/domain/diagnostic/dataHydration";
import { getProcConfig } from "../../core/domain/diagnostic/procConfig";
import { createBaseDiagnosticoEntry, updateDataWithDiagnostico, removeDiagnosticoFromData } from "../../core/domain/diagnostic/updateData";
import { validateDiagnosticoParams } from "../../core/domain/diagnostic/validation";
import { type OdontogramaData, type DiagnosticoEntry, type OdontoColorKey, type AreaAfectada, ODONTO_COLORS } from "../../core/types/typeOdontograma";

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





    // Cache de diagnósticos por diente
    const toothDiagnosesCache = useMemo(() => {
        const cache: Record<string, DiagnosticoEntry[]> = {};
        Object.keys(data).forEach(toothId => {
            if (!data[toothId]) return;
            const allDiagnoses = Object.values(data[toothId]).flat();
            cache[toothId] = allDiagnoses.map(entry => {
                const procConfig = getProcConfig(entry.procedimientoId);
                return {
                    ...entry,
                    siglas: entry.siglas || procConfig?.siglas || entry.procedimientoId,
                    prioridadKey: procConfig?.prioridadKey || 'INFORMATIVA',
                };
            });
        });
        return cache;
    }, [data]);

    // --- Funciones de Lectura Optimizadas ---

    const getDiagnosticosForSurface = useCallback(
        (toothId: string | null, surfaceId: string): DiagnosticoEntry[] => {
            if (!toothId || !data[toothId]) return [];
            return data[toothId][surfaceId] || [];
        },
        [data]
    );

    const getToothDiagnoses = useCallback(
        (toothId: string | null): DiagnosticoEntry[] => {
            return toothId ? toothDiagnosesCache[toothId] || [] : [];
        },
        [toothDiagnosesCache]
    );

    const getPreviewColor = useCallback(
        (procedimientoId: string, secondaryOptions: Record<string, any>): string | null => {
            const procConfig = getProcConfig(procedimientoId);
            if (!procConfig) return null;
            return getColorFromEntry(procConfig.simboloColor, secondaryOptions);
        },
        []
    );

    const getPermanentColor = useCallback(
        (toothId: string | null, surfaceId: string): string | null => {
            const diagnosticos = getDiagnosticosForSurface(toothId, surfaceId);
            return getPermanentColorForSurface(diagnosticos);
        },
        [getDiagnosticosForSurface]
    );

    const getDominantColor = useCallback(
        (toothId: string | null): string | null => {
            if (!toothId) return null;
            const diagnoses = getToothDiagnoses(toothId);
            return getDominantColorForTooth(diagnoses);
        },
        [getToothDiagnoses]
    );

    const isToothBlocked = useCallback(
        (toothId: string | null): boolean => {
            if (!toothId) return false;
            return dientesBloqueados[toothId] || false;
        },
        [dientesBloqueados]
    );

    // --- Funciones de Escritura Refactorizadas ---

    const applyDiagnostico = useCallback(
        (
            toothId: string,
            surfaceIds: string[],
            procedimientoId: string,
            colorKey: OdontoColorKey,
            secondaryOptions: Record<string, any>,
            descripcion: string,
            afectaArea: AreaAfectada[]
        ) => {
            if (!validateDiagnosticoParams(toothId, surfaceIds, procedimientoId, afectaArea)) {
                return;
            }

            const procConfig = getProcConfig(procedimientoId);
            if (!procConfig) {
                console.warn(`Procedimiento no encontrado: ${procedimientoId}`);
                return;
            }

            const affectsEntireTooth = afectaArea.includes('general');
            const finalColorHex = getColorFromEntry(colorKey, secondaryOptions);
            const colorData = ODONTO_COLORS[colorKey];

            const baseEntry = createBaseDiagnosticoEntry(
                procConfig,
                finalColorHex,
                colorData.priority,
                afectaArea,
                secondaryOptions,
                descripcion
            );

            setData(prevData =>
                updateDataWithDiagnostico(prevData, toothId, surfaceIds, baseEntry, affectsEntireTooth)
            );

            if (affectsEntireTooth) {
                setDientesBloqueados(prev => ({
                    ...prev,
                    [toothId]: true
                }));
            }
        },
        []
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
                    .some((entry: DiagnosticoEntry) => entry.areas_afectadas.includes('general'));

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
        getProcConfig,
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
