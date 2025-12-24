// src/components/odontograma/SuperficieSelector.tsx
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { useCrownInteractions } from "../../../hooks/odontogram/useCrownInteractions";
import { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import { useRootInteractions } from "../../../hooks/odontogram/useRootInteractions";
import { useToothRootType } from "../../../hooks/odontogram/useToothRootType";
import { ODONTO_COLORS, type DiagnosticoEntry, type RootGroupKey } from "../../../core/types/typeOdontograma";

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

const UI_SELECTION_FALLBACK_COLOR = ODONTO_COLORS.SELECCIONADO_UI.fill;

// Mapeo exhaustivo de IDs tÃƒÂ©cnicos a ÃƒÂ¡reas principales.
const SURFACE_AREA_MAP: Record<string, 'corona' | 'raiz' | 'general'> = {
    // Superficies de la Corona (IDs tÃƒÂ©cnicos)
    'cara_oclusal': 'corona',
    'cara_distal': 'corona',
    'cara_mesial': 'corona',
    'cara_vestibular': 'corona',
    'cara_lingual': 'corona',

    'raiz:raiz_mesial': 'raiz',
    'raiz:raiz_distal': 'raiz',
    'raiz:raiz_palatal': 'raiz',
    'raiz:raiz_vestibular': 'raiz',
    'raiz:raiz_principal': 'raiz',
    'general': 'general',
};

// MAPEO DE TIPOS DE RAÃƒÂZ A SVGs IMPORTADOS
const ROOT_SVG_MAP: Record<string, string> = {
    'raiz_molar_superior': raizMolarSuperior,
    'raiz_molar_inferior': raizMolarInferior,
    'raiz_premolar': raizPremolar,
    'raiz_canino': raizCanino,
    'raiz_incisivo': raizIncisivo,
    'raiz_dental': raizDental,
};

// FunciÃƒÂ³n CLAVE: Clasifica el ID tÃƒÂ©cnico a un ÃƒÂ¡rea principal ('corona' o 'raiz').
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

    //const rootInfo = useToothRootType(selectedTooth);
    useEffect(() => {
        if (!selectedTooth) {
            onRootGroupChange?.(null);
            return;
        }
        onRootGroupChange?.(rootInfo.type as RootGroupKey);
    }, [selectedTooth, rootInfo.type, onRootGroupChange]);


    // Deshabilitado si no hay diente seleccionado O si estÃƒÂ¡ bloqueado por prop
    const isDisabled = !selectedTooth || isBlocked;

    const uiSelectionColor = UI_SELECTION_FALLBACK_COLOR;
    const DEFAULT_COLOR = "#ffffff";

    useImperativeHandle(ref, () => ({
        showRequiredAreaWarning: (areas: PrincipalArea[]) => {
            if (!areas || areas.length === 0) return;
            if (areas.includes('corona') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'corona')) {
                setRequiredAreaWarning("Ã¢Å¡ Ã¯Â¸Â Este diagnÃƒÂ³stico requiere seleccionar al menos una superficie de CORONA");
                return;
            }
            if (areas.includes('raiz') && !selectedSurfaces.some(s => SURFACE_AREA_MAP[s] === 'raiz')) {
                setRequiredAreaWarning("Ã¢Å¡ Ã¯Â¸Â Este diagnÃƒÂ³stico requiere seleccionar al menos una superficie de RAÃƒÂZ");
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
        setRequiredAreaWarning(null); // limpia advertencia si seleccionÃƒÂ³ superficie
    }, [onSurfaceSelect, onAreaChange]);

    // Hooks de interacciÃƒÂ³n
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

    // FUNCIÃƒâ€œN MEJORADA: Retorna la ruta SVG del ROOT_SVG_MAP
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
Ã‚  Ã‚  Ã‚  Ã‚  relative 
Ã‚  Ã‚  Ã‚  Ã‚  flex 
Ã‚  Ã‚  Ã‚  Ã‚  flex-col 
Ã‚  Ã‚  Ã‚  Ã‚  items-center 
Ã‚  Ã‚  Ã‚  Ã‚  justify-center 
Ã‚  Ã‚  Ã‚  Ã‚  p-2 
Ã‚  Ã‚  Ã‚  Ã‚  space-y-1 
Ã‚  Ã‚  Ã‚  Ã‚  transform 
Ã‚  Ã‚  Ã‚  Ã‚  scale-[0.9] 
Ã‚  Ã‚  Ã‚  Ã‚  transition-opacity 
Ã‚  Ã‚  Ã‚  Ã‚  duration-300 
Ã‚  Ã‚  Ã‚  Ã‚  ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}
Ã‚  Ã‚  `;

    // Se eliminÃƒÂ³ svgBaseClasses para control individual.

    return (
        <>
            {requiredAreaWarning && (
                <div className="bg-warning-50 border-l-4 border-warning-400 text-warning-700 p-3 mb-4 rounded-lg text-theme-sm">
                    {requiredAreaWarning}
                </div>
            )}

            {/* Contenedor ÃƒÅ¡NICO para ambos SVGs (Corona y RaÃƒÂ­z) */}
            <div className={containerClasses}>

                {/* SVG DE LA RAÃƒÂZ */}
                <object
                    id="raiz-svg"
                    data={getRootSvgPath()}
                    type="image/svg+xml"
                    className="w-42 h-40 block max-w-full"
                    key={`raiz-${rootInfo.type}-${selectedTooth}`}
                    onLoad={() => setRootSvgLoaded(true)}
                    role="img"
                    aria-label="RaÃƒÂ­z dental seleccionada"
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