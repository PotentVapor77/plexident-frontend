// src/components/odontograma/OdontogramaViewer.tsx
import { useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OdontogramaModel } from "./3d/OdontogramaModel";
import {
    CameraControls,
    VIEW_PRESETS,
    type ViewPresetKey,
    PerspectiveButtons,
} from "./3d/CameraControls";
import { type DatosDiente, type Diagnostico } from "./preview/ToothStatusDisplay";
import { useOdontogramaData } from "../../hooks/odontogram/useOdontogramaData";
import { useSurfaceSelection } from "../../hooks/odontogram/useSurfaceSelection";
import { DentalBackground } from "../../hooks/gradients/DentalGradient";
import { PanelPreviewDiente } from "./preview/ToothPreviewPanel";
import { toothTranslations } from "../../core/utils/toothTraslations";
import { DiagnosticoPanel } from "./diagnostic/DiagnosticoPanel";
import { DiagnosticosGrid } from "./diagnostic/DiagnosticosGrid";
import React from "react";
import type { OdontogramaData } from "../../core/types/typeOdontograma";

type OdontogramaViewerProps = {
    // Borrar
    initialData?: OdontogramaData;
    readOnly?: boolean;
    //
    onSelectTooth: React.Dispatch<React.SetStateAction<string | null>>;
    freezeResize: boolean;
};

export const OdontogramaViewer = ({
    onSelectTooth,
    freezeResize,
}: OdontogramaViewerProps) => {
    const odontogramaDataHook = useOdontogramaData();
    const { getPreviewColor, getToothDiagnoses, getProcConfig } =
        odontogramaDataHook;

    const [selectedTooth, setSelectedTooth] = React.useState<string | null>(null);
    const { getSurfacesForTooth, setSurfacesForTooth } = useSurfaceSelection();

    const [previewProcId, setPreviewProcId] = React.useState<string | null>(null);
    const [previewOptions, setPreviewOptions] = React.useState<
        Record<string, string>
    >({});

    const [currentView, setCurrentView] =
        React.useState<ViewPresetKey>("FRONT");
    const [isJawOpen, setIsJawOpen] = React.useState(false);

    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const handleSelectTooth = (tooth: string | null) => {
        setSelectedTooth(tooth);
        onSelectTooth(tooth);
        setPreviewProcId(null);
        setPreviewOptions({});
    };

    const handleSurfaceSelect = (surfaces: string[]) => {
        if (selectedTooth) setSurfacesForTooth(selectedTooth, surfaces);
    };

    const currentSurfaces = getSurfacesForTooth(selectedTooth);

    const currentToothData: DatosDiente | null = useMemo(() => {
        if (!selectedTooth) return null;

        const diagnosticoEntries = getToothDiagnoses(selectedTooth);
        if (!diagnosticoEntries?.length) return null;

        const diagnosticos: Diagnostico[] = diagnosticoEntries
            .map((entry) => {
                const procConfig = getProcConfig(entry.procedimientoId);
                if (!procConfig) return null;

                return {
                    id: entry.id,
                    nombre: procConfig.nombre,
                    prioridadKey: procConfig.prioridadKey,
                    areas_afectadas: entry.areas_afectadas,
                };
            })
            .filter(Boolean) as Diagnostico[];

        return diagnosticos.length ? { diagnósticos: diagnosticos } : null;
    }, [selectedTooth, getToothDiagnoses, getProcConfig]);

    const previewColorHex = useMemo(() => {
        if (!selectedTooth || !previewProcId) return null;
        return getPreviewColor(previewProcId, previewOptions);
    }, [selectedTooth, previewProcId, previewOptions, getPreviewColor]);

    // ===============================
    // RESIZE OBSERVER ESTABLE
    // ===============================
    useEffect(() => {
  if (!canvasContainerRef.current) return;
  
  const container = canvasContainerRef.current;
  let animationFrame: number | null = null;

  const handleResize = () => {
    if (freezeResize) return;
    
    // Cancelar frame anterior si existe
    if (animationFrame) cancelAnimationFrame(animationFrame);
    
    container.classList.add("is-resizing");
    
    // Usar requestAnimationFrame en lugar de setTimeout
    animationFrame = requestAnimationFrame(() => {
      container.classList.remove("is-resizing");
    });
  };

  const observer = new ResizeObserver(handleResize);
  observer.observe(container);

  return () => {
    observer.disconnect();
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}, [freezeResize]);

    return (
        <div className="flex w-full h-full bg-gray-100">
            <div
                ref={canvasContainerRef}
                className="relative flex-grow h-full overflow-hidden canvas"
            >
                <PerspectiveButtons
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                />

                <div className="absolute inset-0">
                    <Canvas
                        camera={{ position: VIEW_PRESETS.FRONT.position, fov: 15 }}
                        dpr={[1, 1.5]}
                        frameloop="demand"
                        resize={{ debounce: 0 }}
                        gl={{ antialias: true, powerPreference: "high-performance" }}
                    >
                        <DentalBackground />
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[5, 10, 5]} intensity={1.8} />
                        <directionalLight position={[-5, -5, -5]} intensity={0.5} />

                        <CameraControls
                            currentView={currentView}
                            setJawOpenState={setIsJawOpen}
                        />

                        <OdontogramaModel
                            selectedTooth={selectedTooth}
                            setSelectedTooth={handleSelectTooth}
                            previewColorHex={previewColorHex}
                            odontogramaDataHook={odontogramaDataHook}
                            isJawOpen={isJawOpen}
                        />
                    </Canvas>
                </div>

                <PanelPreviewDiente
                    dienteSeleccionado={selectedTooth}
                    datosDiente={currentToothData}
                />

                {selectedTooth && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg z-10">
                        <p className="text-sm font-medium text-gray-700">
                            Diente seleccionado:{" "}
                            <span className="font-bold">
                                {toothTranslations[selectedTooth]?.nombre || selectedTooth} (#
                                {toothTranslations[selectedTooth]?.numero || "?"})
                            </span>
                        </p>
                    </div>
                )}
            </div>

            <DiagnosticosGrid
                selectedTooth={selectedTooth}
                odontogramaData={odontogramaDataHook.odontogramaData}
                removeDiagnostico={odontogramaDataHook.removeDiagnostico}
            />

            <DiagnosticoPanel
                className="w-75 flex-none border-l border-black"
                selectedTooth={selectedTooth}
                selectedSurfaces={currentSurfaces}
                onSurfaceSelect={handleSurfaceSelect}
                onPreviewChange={setPreviewProcId}
                onPreviewOptionsChange={setPreviewOptions}
                odontogramaDataHook={odontogramaDataHook} rootGroupKey={null}            />
        </div>
    );
};