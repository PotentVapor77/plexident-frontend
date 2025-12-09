// src/components/hooks/useOdontogramaData.ts 
import { useState, useCallback, useMemo } from "react";

import { DIAGNOSTICO_CATEGORIES, type DiagnosticoItem } from "../../components/config/odontograma";
import { MATERIAL_COLORS, type PrioridadKey, type DiagnosticoEntry, type OdontogramaData, type AreaAfectada, type OdontoColorKey, ODONTO_COLORS, type MaterialColorKey } from "../../types/odontograma";


// --- Tipos Auxiliares ---
type ProcConfigWithPriority = DiagnosticoItem & {
    prioridadKey: PrioridadKey;
};

// --- Funciones Auxiliares de Mapeo (Fuera del Hook) ---

const getProcConfig = (procedimientoId: string): ProcConfigWithPriority | undefined => {
    for (const category of DIAGNOSTICO_CATEGORIES) {
        const proc = category.diagnosticos.find(p => p.id === procedimientoId);
        if (proc) {
            return {
                ...proc,
                prioridadKey: category.prioridadKey
            } as ProcConfigWithPriority;
        }
    }
    console.warn(`Configuración no encontrada para procedimiento: ${procedimientoId}`);
    return undefined;
};

const hydrateDiagnosticoEntry = (entry: DiagnosticoEntry): DiagnosticoEntry => {
    if (entry.siglas) return entry;

    const config = getProcConfig(entry.procedimientoId);

    if (!config) return entry;

    return {
        ...entry,
        nombre: entry.nombre || config.nombre,
        siglas: entry.siglas || config.siglas,
    };
};

const hydrateOdontogramaData = (initialData: OdontogramaData): OdontogramaData => {
    const hydrated: OdontogramaData = {};
    for (const toothId in initialData) {
        hydrated[toothId] = {};
        for (const surfaceId in initialData[toothId]) {
            hydrated[toothId][surfaceId] = initialData[toothId][surfaceId].map(hydrateDiagnosticoEntry);
        }
    }
    return hydrated;
};

// --- Funciones Auxiliares para applyDiagnostico ---

/**
 * Genera un ID único para la entrada de diagnóstico
 */
const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea la entrada base de diagnóstico con toda la información necesaria
 */
const createBaseDiagnosticoEntry = (
    procConfig: ProcConfigWithPriority,
    finalColorHex: string,
    priority: number,
    afectaArea: AreaAfectada[],
    secondaryOptions: Record<string, string>,
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
 * Valida los parámetros de entrada para applyDiagnostico
 */
const validateDiagnosticoParams = (
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

/**
 * Actualiza los datos del odontograma con el nuevo diagnóstico
 */
const updateDataWithDiagnostico = (
    prevData: OdontogramaData,
    toothId: string,
    surfaceIds: string[],
    baseEntry: DiagnosticoEntry,
    affectsEntireTooth: boolean
): OdontogramaData => {
    const newData = { ...prevData };
    
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

// --- Hook Principal ---

const initialDientesBloqueados: Record<string, boolean> = {};

export const useOdontogramaData = (initialData: OdontogramaData = {}) => {
    // Inicialización del estado de datos usando la función de hidratación
    const [data, setData] = useState<OdontogramaData>(() => {
        return hydrateOdontogramaData(initialData);
    });

    const [dientesBloqueados, setDientesBloqueados] = useState<Record<string, boolean>>(initialDientesBloqueados);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [tipoDiagnosticoSeleccionado] = useState<DiagnosticoEntry | null>(null);

    // --- Lógica de Color Optimizada ---
    const getColorFromEntry = useCallback((colorKey: OdontoColorKey, secondaryOptions: Record<string, string>): string => {
        const baseColorData = ODONTO_COLORS[colorKey];

        if (colorKey === 'REALIZADO' && secondaryOptions.material_restauracion) {
            const materialKeyLower = secondaryOptions.material_restauracion;
            const materialKey = (materialKeyLower.charAt(0).toUpperCase() + materialKeyLower.slice(1)) as MaterialColorKey;

            if (MATERIAL_COLORS[materialKey]) {
                return MATERIAL_COLORS[materialKey].fill;
            }
        }
        return baseColorData.fill;
    }, []);

    // --- Funciones de Lectura Optimizadas con useMemo ---

    // Cache de diagnósticos por diente para mejor rendimiento
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

    const getDiagnosticosForSurface = useCallback((toothId: string | null, surfaceId: string): DiagnosticoEntry[] => {
        if (!toothId || !data[toothId]) return [];
        return data[toothId][surfaceId] || [];
    }, [data]);

    const getToothDiagnoses = useCallback((toothId: string | null): DiagnosticoEntry[] => {
        return toothId ? toothDiagnosesCache[toothId] || [] : [];
    }, [toothDiagnosesCache]);

    const getPreviewColor = useCallback((procedimientoId: string, secondaryOptions: Record<string, string>): string | null => {
        const procConfig = getProcConfig(procedimientoId);
        if (!procConfig) return null;
        return getColorFromEntry(procConfig.simboloColor, secondaryOptions);
    }, [getColorFromEntry]);

    const getPermanentColorForSurface = useCallback((toothId: string | null, surfaceId: string): string | null => {
        const diagnosticos = getDiagnosticosForSurface(toothId, surfaceId);
        if (diagnosticos.length === 0) return null;
        
        let highestPriority = Infinity;
        let permanentColor: string | null = null;
        
        for (const entry of diagnosticos) {
            if (entry.priority < highestPriority) {
                highestPriority = entry.priority;
                permanentColor = entry.colorHex;
            }
        }
        return permanentColor;
    }, [getDiagnosticosForSurface]);

    const getDominantColorForTooth = useCallback((toothId: string | null): string | null => {
        if (!toothId) return null;
        const diagnoses = getToothDiagnoses(toothId);
        if (diagnoses.length === 0) return null;
        
        let highestPriority = Infinity;
        let dominantColor: string | null = null;
        
        for (const entry of diagnoses) {
            if (entry.priority < highestPriority) {
                highestPriority = entry.priority;
                dominantColor = entry.colorHex;
            }
        }
        return dominantColor;
    }, [getToothDiagnoses]);

    const isToothBlocked = useCallback((toothId: string | null): boolean => {
        if (!toothId) return false;
        return dientesBloqueados[toothId] || false;
    }, [dientesBloqueados]);

    // --- Funciones de Escritura Refactorizadas ---

    const applyDiagnostico = useCallback((
        toothId: string,
        surfaceIds: string[],
        procedimientoId: string,
        colorKey: OdontoColorKey,
        secondaryOptions: Record<string, string>,
        descripcion: string,
        afectaArea: AreaAfectada[]
    ) => {
        // Validación de parámetros
        if (!validateDiagnosticoParams(toothId, surfaceIds, procedimientoId, afectaArea)) {
            return;
        }

        // Obtener configuración del procedimiento
        const procConfig = getProcConfig(procedimientoId);
        if (!procConfig) {
            console.warn(`Procedimiento no encontrado: ${procedimientoId}`);
            return;
        }

        // Determinar si afecta todo el diente
        const affectsEntireTooth = afectaArea.includes('general');
        
        // Obtener color y prioridad
        const finalColorHex = getColorFromEntry(colorKey, secondaryOptions);
        const colorData = ODONTO_COLORS[colorKey];

        // Crear entrada base
        const baseEntry = createBaseDiagnosticoEntry(
            procConfig,
            finalColorHex,
            colorData.priority,
            afectaArea,
            secondaryOptions,
            descripcion
        );

        // Actualizar estado de datos
        setData(prevData => 
            updateDataWithDiagnostico(
                prevData, 
                toothId, 
                surfaceIds, 
                baseEntry, 
                affectsEntireTooth
            )
        );

        // Bloquear diente si afecta completamente
        if (affectsEntireTooth) {
            setDientesBloqueados(prev => ({ 
                ...prev, 
                [toothId]: true 
            }));
        }

    }, [getColorFromEntry]);

    const removeDiagnostico = useCallback((toothId: string, surfaceId: string, entryIdToRemove: string) => {
        setData(prevData => {
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

            // Verificar si hay otros bloqueadores
            const hasOtherBlockers = Object.values(newData[toothId] || {})
                .flat()
                .some((entry: DiagnosticoEntry) => entry.areas_afectadas.includes('general'));

            // Desbloquear diente si no hay más bloqueadores
            if (!hasOtherBlockers) {
                setDientesBloqueados(prev => ({ ...prev, [toothId]: false }));
            }

            // Eliminar diente si no tiene más superficies
            if (Object.keys(newData[toothId] || {}).length === 0) {
                delete newData[toothId];
            }

            return newData;
        });
    }, []);

    const saveOdontogramaData = useCallback(async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
            // Simular guardado asíncrono
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLastSaveTime(new Date());
            console.log("Datos del odontograma guardados con éxito:", data);
        } catch (error) {
            console.error("Error al guardar datos del odontograma:", error);
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, data]);

    // --- Función para limpiar todos los datos ---
    const clearAllData = useCallback(() => {
        setData({});
        setDientesBloqueados({});
    }, []);

    // --- Función para exportar datos ---
    const exportData = useCallback((): OdontogramaData => {
        return JSON.parse(JSON.stringify(data));
    }, [data]);

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
        getPermanentColorForSurface,
        getDominantColorForTooth,
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
        setData, // Exportado para casos especiales
    };
};