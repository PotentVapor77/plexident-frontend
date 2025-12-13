// src/components/odontograma/SuperficieSelector.tsx
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { useCrownInteractions } from "../../../hooks/odontogram/useCrownInteractions";
import { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import { useRootInteractions } from "../../../hooks/odontogram/useRootInteractions";
import { useToothRootType } from "../../../hooks/odontogram/useToothRootType";
import { ODONTO_COLORS, type RootGroupKey } from "../../../core/types/typeOdontograma";

// IMPORTAR SVGs DIRECTAMENTE
import odontSvg from "../../../assets/images/dental/odonto.svg";
import raizCanino from "../../../assets/images/roots/raiz_canino.svg";
import raizDental from "../../../assets/images/roots/raiz_dental.svg";
import raizIncisivo from "../../../assets/images/roots/raiz_incisivo.svg";
import raizMolarInferior from "../../../assets/images/roots/raiz_molar_inferior.svg";
import raizMolarSuperior from "../../../assets/images/roots/raiz_molar_superior.svg";
import raizPremolar from "../../../assets/images/roots/raiz_premolar.svg";
import type { PrincipalArea } from "../../../hooks/odontogram/useDiagnosticoSelect";

const UI_SELECTION_FALLBACK_COLOR = ODONTO_COLORS.SELECCIONADO_UI.fill;

// Mapeo exhaustivo de IDs técnicos a áreas principales.
const SURFACE_AREA_MAP: Record<string, 'corona' | 'raiz' | 'general'> = {
    // Superficies de la Corona (IDs técnicos)
    'cara_oclusal': 'corona',
    'cara_distal': 'corona',
    'cara_mesial': 'corona',
    'cara_vestibular': 'corona',
    'cara_lingual': 'corona',

    'raiz:raiz-mesial': 'raiz',
    'raiz:raiz-distal': 'raiz',
    'raiz:raiz-palatal': 'raiz',
    'raiz:raiz-vestibular': 'raiz',
    'raiz:raiz-principal': 'raiz',

    'general': 'general',
};

// MAPEO DE TIPOS DE RAÍZ A SVGs IMPORTADOS
const ROOT_SVG_MAP: Record<string, string> = {
    'raiz_molar_superior': raizMolarSuperior,
    'raiz_molar_inferior': raizMolarInferior,
    'raiz_premolar': raizPremolar,
    'raiz_canino': raizCanino,
    'raiz_incisivo': raizIncisivo,
    'raiz_dental': raizDental,
};

// Función CLAVE: Clasifica el ID técnico a un área principal ('corona' o 'raiz').
const getPrincipalArea = (surfaces: string[]): PrincipalArea => {
    if (surfaces.length === 0) return null;
    const firstSurface = surfaces[0];
    const mappedArea = SURFACE_AREA_MAP[firstSurface];
    if (mappedArea) return mappedArea;
    if (firstSurface.startsWith('raiz:')) return 'raiz';
    if (firstSurface.startsWith('cara_')) return 'corona';
    return 'general';
};

const getRootGroupKeyFromType = (type?: string): RootGroupKey | null => {
    switch (type) {
        case "raiz_molar_superior":
            return "molar_superior";
        case "raiz_molar_inferior":
            return "molar_inferior";
        case "raiz_premolar":
            return "premolar";
        case "raiz_canino":
        case "raiz_incisivo":
            return "anterior";
        default:
            return null;
    }
};


interface SurfaceSelectorProps {
    selectedSurfaces: string[];
    onSurfaceSelect: (surfaces: string[]) => void;
    selectedTooth: string | null;
    isBlocked?: boolean;
    onAreaChange: (area: PrincipalArea) => void;

    onRootGroupChange?: (group: RootGroupKey | null) => void;
}

export interface SurfaceSelectorRef {
    showRequiredAreaWarning: (areas: PrincipalArea[]) => void;
    clearRequiredAreaWarning: () => void;
}

export const SurfaceSelector = forwardRef<SurfaceSelectorRef, SurfaceSelectorProps>(({
    selectedSurfaces,
    onSurfaceSelect,
    selectedTooth,
    isBlocked,
    onAreaChange,
    onRootGroupChange,
}, ref) => {

    const [svgLoaded, setSvgLoaded] = useState(false);
    const [rootSvgLoaded, setRootSvgLoaded] = useState(false);
    const [requiredAreaWarning, setRequiredAreaWarning] = useState<string | null>(null);

    const rootInfo = useToothRootType(selectedTooth);
    useEffect(() => {
        if (!selectedTooth) {
            onRootGroupChange?.(null);
            return;
        }
        const groupKey = getRootGroupKeyFromType(rootInfo.type);
        onRootGroupChange?.(groupKey);
    }, [selectedTooth, rootInfo.type, onRootGroupChange]);
    const { getPermanentColorForSurface, tipoDiagnosticoSeleccionado } = useOdontogramaData();



    // Deshabilitado si no hay diente seleccionado O si está bloqueado por prop
    const isDisabled = !selectedTooth || isBlocked;

    const activeDiagnosisColor = ((tipoDiagnosticoSeleccionado as any)?.colorHex) ?? null;
    const uiSelectionColor = UI_SELECTION_FALLBACK_COLOR;
    const DEFAULT_COLOR = "#ffffff";

    useImperativeHandle(ref, () => ({
        showRequiredAreaWarning: (areas: PrincipalArea[]) => {
            if (!areas || areas.length === 0) return;
            if (areas.includes('corona') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'corona')) {
                setRequiredAreaWarning("⚠️ Este diagnóstico requiere seleccionar al menos una superficie de CORONA");
                return;
            }
            if (areas.includes('raiz') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'raiz')) {
                setRequiredAreaWarning("⚠️ Este diagnóstico requiere seleccionar al menos una superficie de RAÍZ");
                return;
            }
        },
        clearRequiredAreaWarning: () => setRequiredAreaWarning(null)
    }));

    // Resetea estados al cambiar de diente
    useEffect(() => {
        setSvgLoaded(false);
        setRootSvgLoaded(false);
        setRequiredAreaWarning(null);
        onAreaChange(null);
    }, [selectedTooth, onAreaChange]);

    const handleSurfaceSelect = useCallback((surfaces: string[]) => {
        onSurfaceSelect(surfaces);
        const area = getPrincipalArea(surfaces);
        onAreaChange(area);
        setRequiredAreaWarning(null); // limpia advertencia si seleccionó superficie
    }, [onSurfaceSelect, onAreaChange]);

    // Hooks de interacción
    useCrownInteractions({
        svgLoaded,
        selectedSurfaces,
        onSurfaceSelect: handleSurfaceSelect,
        selectedTooth,
        getPermanentColorForSurface,
        previewColorHex: activeDiagnosisColor,
        UI_SELECTION_COLOR: uiSelectionColor,
        DEFAULT_COLOR,
    });

    useRootInteractions({
        rootSvgLoaded,
        selectedTooth,
        rootInfo,
        selectedSurfaces,
        onSurfaceSelect: handleSurfaceSelect,
        getPermanentColorForSurface,
        previewColorHex: activeDiagnosisColor,
        UI_SELECTION_COLOR: uiSelectionColor,
        DEFAULT_COLOR,
    });

    // FUNCIÓN MEJORADA: Retorna la ruta SVG del ROOT_SVG_MAP
    const getRootSvgPath = useCallback(() => {
        const knownRootTypes = [
            'raiz_molar_superior',
            'raiz_molar_inferior',
            'raiz_premolar',
            'raiz_canino',
            'raiz_incisivo'
        ];
        const type = rootInfo.type || '';
        const pathName = knownRootTypes.includes(type) ? type : 'raiz_dental';
        return ROOT_SVG_MAP[pathName]; // Retorna URL importada (no string)
    }, [rootInfo.type]);

    // Estilos para el contenedor (Se mantiene el escalado general y el espaciado reducido)
    const containerClasses = `
        relative 
        flex 
        flex-col 
        items-center 
        justify-center 
        p-2 
        space-y-1 
        transform 
        scale-[0.9] 
        transition-opacity 
        duration-300 
        ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}
    `;

    // Se eliminó svgBaseClasses para control individual.

    return (
        <>
            {requiredAreaWarning && (
                <div className="bg-warning-50 border-l-4 border-warning-400 text-warning-700 p-3 mb-4 rounded-lg text-theme-sm">
                    {requiredAreaWarning}
                </div>
            )}

            {/* Contenedor ÚNICO para ambos SVGs (Corona y Raíz) */}
            <div className={containerClasses}>

                {/* SVG DE LA RAÍZ */}
                <object
                    id="raiz-svg"
                    data={getRootSvgPath()}
                    type="image/svg+xml"
                    className="w-42 h-40 block max-w-full"
                    key={`raiz-${rootInfo.type}-${selectedTooth}`}
                    onLoad={() => setRootSvgLoaded(true)}
                    role="img"
                    aria-label="Raíz dental seleccionada"
                />

                {/* SVG DE LA CORONA */}
                <object
                    id="odonto-svg"
                    data={odontSvg}
                    type="image/svg+xml"
                    className="w-36 h-36 block max-w-full"
                    key={`corona-${selectedTooth}`}
                    onLoad={() => setSvgLoaded(true)}
                    role="img"
                    aria-label="Odontograma - Corona dental"
                />
            </div>
        </>
    );
});

SurfaceSelector.displayName = 'SurfaceSelector';