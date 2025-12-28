// src/components/odontograma/3d/SuperficieSelector.tsx
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from "react";
import { useCrownInteractions } from "../../../hooks/odontogram/useCrownInteractions";
import { useRootInteractions } from "../../../hooks/odontogram/useRootInteractions";
import { useToothRootType } from "../../../hooks/odontogram/useToothRootType";
import { ODONTO_COLORS, type RootGroupKey } from "../../../core/types/odontograma.types";

// IMPORTAR SVGs DIRECTAMENTE
import odontSvg from "../../../assets/images/dental/odonto.svg";
import raizCanino from "../../../assets/images/roots/raiz_canino.svg";
import raizDental from "../../../assets/images/roots/raiz_dental.svg";
import raizIncisivo from "../../../assets/images/roots/raiz_incisivo.svg";
import raizMolarInferior from "../../../assets/images/roots/raiz_molar_inferior.svg";
import raizMolarSuperior from "../../../assets/images/roots/raiz_molar_superior.svg";
import raizPremolar from "../../../assets/images/roots/raiz_premolar.svg";
import type { PrincipalArea } from "../../../hooks/odontogram/useDiagnosticoSelect";
import { fdiToMeshName } from "../../../core/utils/toothTraslations";
import { getRootTypeByFDI } from "../../../hooks/odontogram/diagnosticoHooks/useToothSelection";
import { groupDentalSurfaces, type GroupedSurface } from "../../../core/utils/groupDentalSurfaces";

const UI_SELECTION_FALLBACK_COLOR = ODONTO_COLORS.SELECCIONADO_UI.fill;

const SURFACE_AREA_MAP: Record<string, 'corona' | 'raiz' | 'general'> = {
    // Superficies de la Corona (IDs técnicos)
    'cara_oclusal': 'corona',
    'cara_distal': 'corona',
    'cara_mesial': 'corona',
    'cara_vestibular': 'corona',
    'cara_lingual': 'corona',

    'raiz_mesial': 'raiz',
    'raiz_distal': 'raiz',
    'raiz_palatal': 'raiz',
    'raiz_vestibular': 'raiz',
    'raiz_principal': 'raiz',
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

interface SurfaceSelectorProps {
    selectedSurfaces: string[];
    onSurfaceSelect: (surfaces: string[]) => void;
    selectedTooth: string | null;
    isBlocked?: boolean;
    onAreaChange: (area: PrincipalArea) => void;
    onRootGroupChange?: (group: RootGroupKey | null) => void;
    getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
    activeDiagnosisColor: string | null;
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
    getPermanentColorForSurface,
    activeDiagnosisColor,
}, ref) => {

    const [svgLoaded, setSvgLoaded] = useState(false);
    const [rootSvgLoaded, setRootSvgLoaded] = useState(false);
    const [requiredAreaWarning, setRequiredAreaWarning] = useState<string | null>(null);

    const meshName = selectedTooth ? fdiToMeshName(selectedTooth) : null;
    const rootInfo = useToothRootType(meshName);

    // ============================================================================
    // AGRUPACIÓN DE SUPERFICIES (Igual que en DiagnosticosList)
    // ============================================================================
    const groupedSurfaces = useMemo((): GroupedSurface[] => {
        if (!selectedTooth || selectedSurfaces.length === 0) return [];

        // OBTENER rootType del diente (misma lógica que useToothSelection)
        const rootType = getRootTypeByFDI(selectedTooth);

        console.log('[SuperficieSelector] Grouping surfaces:', {
            selectedSurfaces,
            rootType,
            grouped: groupDentalSurfaces(selectedSurfaces, rootType)
        });

        return groupDentalSurfaces(selectedSurfaces, rootType);
    }, [selectedSurfaces, selectedTooth]);

    // ============================================================================
    // ÁREA PRINCIPAL desde superficies agrupadas 
    // ============================================================================
    const principalAreaFromGrouped = useMemo((): PrincipalArea => {
        if (groupedSurfaces.length === 0) return null;
        
        // Si hay grupo "Raíz completa" → 'raiz'
        const hasRootGroup = groupedSurfaces.some((gs) => 
    gs.type === 'group' && gs.isRoot && gs.label === 'Raíz completa'
);
        
        if (hasRootGroup) return 'raiz';
        
        // Si hay grupo "Corona completa" → 'corona'
        const hasCrownGroup = groupedSurfaces.some(
            (gs): gs is Extract<GroupedSurface, { type: 'group'; isRoot: false }>=> gs.type === 'group' && !gs.isRoot && gs.label === 'Corona completa'
        );
        
        if (hasCrownGroup) return 'corona';
        
        // Fallback al área de la primera superficie
        return getPrincipalArea(selectedSurfaces);
    }, [groupedSurfaces, selectedSurfaces]);

    useEffect(() => {
        if (!selectedTooth) {
            onRootGroupChange?.(null);
            return;
        }
        onRootGroupChange?.(rootInfo.type as RootGroupKey);
    }, [selectedTooth, rootInfo.type, onRootGroupChange]);

    // Deshabilitado si no hay diente seleccionado O si está bloqueado por prop
    const isDisabled = !selectedTooth || isBlocked;

    const uiSelectionColor = UI_SELECTION_FALLBACK_COLOR;
    const DEFAULT_COLOR = "#ffffff";

    useImperativeHandle(ref, () => ({
        showRequiredAreaWarning: (areas: PrincipalArea[]) => {
            if (!areas || areas.length === 0) return;
            if (areas.includes('corona') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'corona')) {
                setRequiredAreaWarning("Este diagnóstico requiere seleccionar al menos una superficie de CORONA");
                return;
            }
            if (areas.includes('raiz') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'raiz')) {
                setRequiredAreaWarning("Este diagnostico requiere seleccionar al menos una superficie de raiz.");
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
    }, [selectedTooth]);

    const handleSurfaceSelect = useCallback((surfaces: string[]) => {
        onSurfaceSelect(surfaces);
        // ➕ Usar área desde superficies agrupadas (más precisa)
        const area = principalAreaFromGrouped;
        onAreaChange(area);
        setRequiredAreaWarning(null);
    }, [onSurfaceSelect, onAreaChange, principalAreaFromGrouped]); // ➕ principalAreaFromGrouped

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

    // ➕ PASAR groupedSurfaces a useRootInteractions
    useRootInteractions({
        rootSvgLoaded,
        selectedTooth,
        rootInfo,
        selectedSurfaces,
        groupedSurfaces,  // ➕ NUEVO
        onSurfaceSelect: handleSurfaceSelect,
        getPermanentColorForSurface,
        previewColorHex: activeDiagnosisColor,
        UI_SELECTION_COLOR: uiSelectionColor,
        DEFAULT_COLOR,
    });

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
        return ROOT_SVG_MAP[pathName];
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
                    aria-label="Raiz dental seleccionada"
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
