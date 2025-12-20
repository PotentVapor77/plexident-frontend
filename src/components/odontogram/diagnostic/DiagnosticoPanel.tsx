// src/components/Odontograma/DiagnosticoPanel.tsx
import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { DiagnosticoSelect, SurfaceSelector, type PrincipalArea, type RootGroupKey, type SurfaceSelectorRef } from "..";
import type { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import type { AreaAfectada, DiagnosticoEntry, OdontoColorKey } from "../../../core/types/typeOdontograma";
import { DIAGNOSTICO_CATEGORIES } from "../../../core/config/odontograma";



const ALL_SURFACE_IDS = [
    'cara_vestibular',
    'cara_distal',
    'cara_mesial',
    'cara_lingual',
    'cara_oclusal',
    'raiz:raiz-mesial',
    'raiz:raiz-distal',
    'raiz:raiz-palatal',
    'raiz:raiz-vestibular',
    'raiz:raiz-principal',
];
const ROOT_GROUPS: Record<RootGroupKey, {
    label: string;
    surfaces: string[];
}> = {
    molar_superior: {
        label: "Raíz (Molar superior)",
        surfaces: [
            "raiz:raiz-palatal",
            "raiz:raiz-mesial",
            "raiz:raiz-distal",
        ],
    },
    molar_inferior: {
        label: "Raíz (Molar inferior)",
        surfaces: [
            "raiz:raiz-mesial",
            "raiz:raiz-distal",
        ],
    },
    premolar: {
        label: "Raíz (Premolar)",
        surfaces: [
            "raiz:raiz-palatal",
            "raiz:raiz-vestibular",
        ],
    },
    anterior: {
        label: "Raíz (Principal)",
        surfaces: ["raiz:raiz-principal"],
    },
};

type DisplaySurface =
    | { type: "group"; label: string }
    | { type: "single"; id: string };

const getSurfaceName = (surfaceId: string): string => {
    const names: Record<string, string> = {
        cara_vestibular: "Vestibular",
        cara_distal: "Distal",
        cara_mesial: "Mesial",
        cara_lingual: "Lingual",
        cara_oclusal: "Oclusal",
        "raiz:raiz-mesial": "Raíz Mesial",
        "raiz:raiz-distal": "Raíz Distal",
        "raiz:raiz-palatal": "Raíz Palatal",
        "raiz:raiz-vestibular": "Raíz Vestibular",
        "raiz:raiz-principal": "Raíz Principal",
    };
    return names[surfaceId] || surfaceId.replace("raiz:", "").replace(/-/g, " ");
};

type Props = {
    className?: string;
    selectedTooth: string | null;
    selectedSurfaces: string[];
    onSurfaceSelect: (surfaces: string[]) => void;
    onPreviewChange: Dispatch<SetStateAction<string | null>>;
    onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, string>>>;
    odontogramaDataHook: ReturnType<typeof useOdontogramaData>;
    rootGroupKey: RootGroupKey | null;
};

export const DiagnosticoPanel = ({
    className,
    selectedTooth,
    selectedSurfaces,
    onSurfaceSelect,
    onPreviewChange,
    onPreviewOptionsChange,
    odontogramaDataHook,
    rootGroupKey,
}: Props) => {
    const {
        applyDiagnostico,
        getDiagnosticosForSurface,
        removeDiagnostico,
        isToothBlocked,
        saveOdontogramaData,
        isSaving,
        lastSaveTime,
    } = odontogramaDataHook;

    const [currentArea, setCurrentArea] = useState<PrincipalArea>(null);
    const surfaceSelectorRef = useRef<SurfaceSelectorRef>(null);

    const handleAreaChange = useCallback((area: PrincipalArea) => {
        setCurrentArea(area);
    }, []);

    const isBlocked = isToothBlocked(selectedTooth);
    const surfaceIdWithData = selectedTooth && selectedSurfaces.length === 1 ? selectedSurfaces[0] : null;
    const appliedDiagnosticos: DiagnosticoEntry[] =
        surfaceIdWithData && selectedTooth ? getDiagnosticosForSurface(selectedTooth, surfaceIdWithData) : [];

    // FIX: MOVER LA FUNCIÓN getDisplaySurfaces AQUÍ ARRIBA PARA QUE PUEDA SER LLAMADA SIN ERROR
    const getDisplaySurfaces = (
        selectedSurfaces: string[],
        rootGroupKey: RootGroupKey | null
    ): DisplaySurface[] => {

        if (!rootGroupKey) {
            return selectedSurfaces.map(s => ({ type: "single", id: s }));
        }

        const group = ROOT_GROUPS[rootGroupKey];

        const rootSurfacesSelected = selectedSurfaces.filter(s => s.startsWith("raiz:"));
        const nonRootSurfaces = selectedSurfaces.filter(s => !s.startsWith("raiz:"));

        const hasAllRoots =
            group.surfaces.length > 0 &&
            group.surfaces.every(s => selectedSurfaces.includes(s));

        const result: DisplaySurface[] = [];

        if (hasAllRoots) {
            result.push({
                type: "group",
                label: group.label,
            });
        } else {
            rootSurfacesSelected.forEach(s =>
                result.push({ type: "single", id: s })
            );
        }

        nonRootSurfaces.forEach(s =>
            result.push({ type: "single", id: s })
        );

        
        return result;
    };
    
    // FIX: Declarar la variable displaySurfaces aquí, después de que getDisplaySurfaces esté definida
    const displaySurfaces = getDisplaySurfaces(selectedSurfaces, rootGroupKey);

    const handleDiagnosticoApply = (
        procedimientoId: string,
        colorKey: OdontoColorKey,
        secondaryOptions: Record<string, string>,
        descripcion: string,
        afectaArea: AreaAfectada[]
    ) => {
        if (!selectedTooth) return;

        // Validar que haya selección en las áreas requeridas
        if (afectaArea.includes('corona') && !selectedSurfaces.some(s => s.startsWith('cara_'))) {
            surfaceSelectorRef.current?.showRequiredAreaWarning(['corona']);
            return;
        }
        if (afectaArea.includes('raiz') && !selectedSurfaces.some(s => s.startsWith('raiz:'))) {
            surfaceSelectorRef.current?.showRequiredAreaWarning(['raiz']);
            return;
        }

        let surfacesToApply = selectedSurfaces.length > 0 ? selectedSurfaces : [];

        if (afectaArea.includes('general')) {
            surfacesToApply = ALL_SURFACE_IDS;
        }

        const procedimiento = DIAGNOSTICO_CATEGORIES.flatMap(c => c.diagnosticos)
            .find(p => p.id === procedimientoId);
        const siglas = procedimiento?.siglas ?? null;

        applyDiagnostico(
            selectedTooth,
            surfacesToApply,
            procedimientoId,
            colorKey,
            { ...secondaryOptions, ...(siglas ? { siglas } : {}) },
            descripcion,
            afectaArea
        );

        onSurfaceSelect([]);
        setCurrentArea(null);
        surfaceSelectorRef.current?.clearRequiredAreaWarning();
    };

    const getDiagnosticoLabel = (diag: DiagnosticoEntry) => {
        let label = diag.procedimientoId.replace(/_/g, " ");
        Object.entries(diag.secondaryOptions || {}).forEach(([key, value]) => {
            if (key !== "descripcion") label += ` [${value.replace(/_/g, " ")}]`;
        });
        return label;
    };

    return (
        <div className={`h-full bg-white dark:bg-gray-900 shadow-theme-lg border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden ${className}`}>

            {/* HEADER */}
            <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Panel de Diagnóstico
                </h2>

            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div className="px-6 py-3 flex-1 overflow-y-auto custom-scrollbar">
                <SurfaceSelector
                    ref={surfaceSelectorRef}
                    selectedSurfaces={selectedSurfaces}
                    onSurfaceSelect={onSurfaceSelect}
                    selectedTooth={selectedTooth}
                    isBlocked={isBlocked}
                    onAreaChange={handleAreaChange}
                />

                {/* ALERTA DIENTE AUSENTE/BLOQUEADO */}
                {selectedTooth && isBlocked && (
                    <div className="bg-error-50 border-l-4 border-error-500 text-error-700 dark:bg-error-900/20 dark:text-error-400 p-4 mt-2 text-theme-sm font-medium rounded-r-lg">
                        Diente {selectedTooth} marcado como Ausente.
                    </div>
                )}

                {/* LISTA DE DIAGNÓSTICOS EXISTENTES */}
                {surfaceIdWithData && appliedDiagnosticos.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                        <h3 className="text-theme-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Diagnósticos en {getSurfaceName(surfaceIdWithData)}
                        </h3>
                        <ul className="space-y-2">
                            {appliedDiagnosticos.map((diag) => (
                                <li key={diag.id} className="group flex items-start justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-theme-xs hover:shadow-theme-md transition-all">
                                    <div className="flex flex-col overflow-hidden flex-1">
                                        <span className="text-theme-sm font-medium overflow-hidden text-ellipsis" style={{ color: diag.colorHex }}>
                                            {getDiagnosticoLabel(diag)}
                                        </span>
                                        {diag.descripcion && (
                                            <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-1 break-words">"{diag.descripcion}"</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeDiagnostico(selectedTooth!, surfaceIdWithData, diag.id)}
                                        className="ml-3 p-1.5 bg-error-50 text-error-600 border border-error-100 rounded-md hover:bg-error-100 hover:text-error-700 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800 dark:hover:bg-error-900/50 transition-colors"
                                        title="Eliminar diagnóstico"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* LISTA DE SUPERFICIES SELECCIONADAS  */}
                {selectedSurfaces.length > 0 ? (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                        <p className="text-theme-sm font-semibold text-gray-900 dark:text-white mb-3">Superficies</p>
                        <div className="flex flex-wrap gap-2"> {/* Contenedor de chips */}
                            <div className="flex flex-wrap gap-2">
    {displaySurfaces.map((item: DisplaySurface, idx) => {
    if (item.type === "group") {
        return (
            <div
                key={`group-${idx}`}
                className="inline-flex items-center px-3 py-1
                           bg-brand-100 dark:bg-brand-900/30
                           text-brand-800 dark:text-brand-200
                           text-theme-sm font-medium
                           rounded-full"
            >
                {item.label}
            </div>
        );
    }

    return (
        <div
            key={item.id}
            className="inline-flex items-center gap-1.5 px-3 py-1
                       bg-brand-50 dark:bg-brand-900/20
                       border border-brand-100 dark:border-brand-800
                       rounded-full"
        >
            <span className="text-theme-sm font-medium text-brand-700 dark:text-brand-300">
                {getSurfaceName(item.id)}
            </span>
            <button
                onClick={() =>
                    onSurfaceSelect(
                        selectedSurfaces.filter(s => s !== item.id)
                    )
                }
            >
                ✕
            </button>
        </div>
    );
})}
</div>

                        </div>
                    </div>
                ) : (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center">
                        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                            {selectedTooth && !isBlocked
                                ? "Haz clic en una superficie para comenzar."
                                : isBlocked
                                    ? "Este diente está bloqueado para nuevos diagnósticos."
                                    : "Selecciona un diente en el odontograma."}
                        </p>
                    </div>
                )}

                {/* SELECTOR DE DIAGNÓSTICOS */}
                {!isBlocked && selectedTooth && (
                    <div className="mt-3">
                        <DiagnosticoSelect
                            onApply={handleDiagnosticoApply}
                            onCancel={() => {
                                onSurfaceSelect([]);
                                setCurrentArea(null);
                                surfaceSelectorRef.current?.clearRequiredAreaWarning();
                            }}
                            onPreviewChange={onPreviewChange}
                            onPreviewOptionsChange={onPreviewOptionsChange}
                            currentArea={currentArea}
                        />
                    </div>
                )}
            </div>

            {/* FOOTER / ACCIONES */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
                <button
                    onClick={() => {
                        saveOdontogramaData();
                        onSurfaceSelect([]);
                        setCurrentArea(null);
                        surfaceSelectorRef.current?.clearRequiredAreaWarning();
                    }}
                    disabled={isSaving}
                    className={`w-full py-2.5 text-theme-sm font-medium rounded-lg shadow-theme-sm transition-all duration-200 flex items-center justify-center gap-2 ${isSaving
                        ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                        : "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-600"
                        }`}
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                        </>
                    ) : "Guardar Sesión Clínica"}
                </button>

                {lastSaveTime && (
                    <p className="text-theme-xs text-success-600 dark:text-success-400 text-center font-medium flex items-center justify-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Guardado: {lastSaveTime.toLocaleTimeString()}
                    </p>
                )}
            </div>
        </div>
    );
};