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

// Mapeo exhaustivo de IDs tÃ©cnicos a Ã¡reas principales.
const SURFACE_AREA_MAP: Record<string, 'corona' | 'raiz' | 'general'> = {
    // Superficies de la Corona (IDs tÃ©cnicos)
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

// MAPEO DE TIPOS DE RAÃZ A SVGs IMPORTADOS
const ROOT_SVG_MAP: Record<string, string> = {
    'raiz_molar_superior': raizMolarSuperior,
    'raiz_molar_inferior': raizMolarInferior,
    'raiz_premolar': raizPremolar,
    'raiz_canino': raizCanino,
    'raiz_incisivo': raizIncisivo,
    'raiz_dental': raizDental,
};

// FunciÃ³n CLAVE: Clasifica el ID tÃ©cnico a un Ã¡rea principal ('corona' o 'raiz').
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



    // Deshabilitado si no hay diente seleccionado O si estÃ¡ bloqueado por prop
    const isDisabled = !selectedTooth || isBlocked;

    const activeDiagnosisColor = ((tipoDiagnosticoSeleccionado as any)?.colorHex) ?? null;
    const uiSelectionColor = UI_SELECTION_FALLBACK_COLOR;
    const DEFAULT_COLOR = "#ffffff";

    useImperativeHandle(ref, () => ({
        showRequiredAreaWarning: (areas: PrincipalArea[]) => {
            if (!areas || areas.length === 0) return;
            if (areas.includes('corona') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'corona')) {
                setRequiredAreaWarning("âš ï¸ Este diagnÃ³stico requiere seleccionar al menos una superficie de CORONA");
                return;
            }
            if (areas.includes('raiz') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'raiz')) {
                setRequiredAreaWarning("âš ï¸ Este diagnÃ³stico requiere seleccionar al menos una superficie de RAÃZ");
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
        //onAreaChange(null);
    }, [selectedTooth]);

    const handleSurfaceSelect = useCallback((surfaces: string[]) => {
        onSurfaceSelect(surfaces);
        const area = getPrincipalArea(surfaces);
        onAreaChange(area);
        setRequiredAreaWarning(null); // limpia advertencia si seleccionÃ³ superficie
    }, [onSurfaceSelect, onAreaChange]);

    // Hooks de interacciÃ³n
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

    // FUNCIÃ“N MEJORADA: Retorna la ruta SVG del ROOT_SVG_MAP
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
Â  Â  Â  Â  relative 
Â  Â  Â  Â  flex 
Â  Â  Â  Â  flex-col 
Â  Â  Â  Â  items-center 
Â  Â  Â  Â  justify-center 
Â  Â  Â  Â  p-2 
Â  Â  Â  Â  space-y-1 
Â  Â  Â  Â  transform 
Â  Â  Â  Â  scale-[0.9] 
Â  Â  Â  Â  transition-opacity 
Â  Â  Â  Â  duration-300 
Â  Â  Â  Â  ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}
Â  Â  `;

    // Se eliminÃ³ svgBaseClasses para control individual.

    return (
        <>
            {requiredAreaWarning && (
                <div className="bg-warning-50 border-l-4 border-warning-400 text-warning-700 p-3 mb-4 rounded-lg text-theme-sm">
                    {requiredAreaWarning}
                </div>
            )}

            {/* Contenedor ÃšNICO para ambos SVGs (Corona y RaÃ­z) */}
            <div className={containerClasses}>

                {/* SVG DE LA RAÃZ */}
                <object
                    id="raiz-svg"
                    data={getRootSvgPath()}
                    type="image/svg+xml"
                    className="w-42 h-40 block max-w-full"
                    key={`raiz-${rootInfo.type}-${selectedTooth}`}
                    onLoad={() => setRootSvgLoaded(true)}
                    role="img"
                    aria-label="RaÃ­z dental seleccionada"
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