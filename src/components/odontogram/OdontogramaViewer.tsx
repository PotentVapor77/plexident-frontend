// src/components/odontograma/OdontogramaViewer.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OdontogramaModel } from "./3d/OdontogramaModel";
import { CameraControls, VIEW_PRESETS, type ViewPresetKey, PerspectiveButtons } from "./3d/CameraControls";
import { type DatosDiente, type Diagnostico } from "./preview/ToothStatusDisplay";
import { useOdontogramaData } from "../../hooks/odontogram/useOdontogramaData";
import { useSurfaceSelection } from "../../hooks/odontogram/useSurfaceSelection";
import { DentalBackground } from "../../hooks/gradients/DentalGradient";
import { PanelPreviewDiente } from "./preview/ToothPreviewPanel";
import { toothTranslations } from "../../core/utils/toothTraslations";
import { DiagnosticoPanel } from "./diagnostic/DiagnosticoPanel";
import { DiagnosticosGrid } from "./diagnostic/DiagnosticosGrid";

type OdontogramaViewerProps = {
    onSelectTooth: React.Dispatch<React.SetStateAction<string | null>>;
};

export const OdontogramaViewer = ({ onSelectTooth }: OdontogramaViewerProps) => {
    const odontogramaDataHook = useOdontogramaData();
    const { getPreviewColor, getToothDiagnoses, getProcConfig } = odontogramaDataHook;

    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const { getSurfacesForTooth, setSurfacesForTooth } = useSurfaceSelection();

    const [previewProcId, setPreviewProcId] = useState<string | null>(null);
    const [previewOptions, setPreviewOptions] = useState<Record<string, string>>({});

    const [currentView, setCurrentView] = useState<ViewPresetKey>('FRONT');
    const [isJawOpen, setIsJawOpen] = useState(false);
    
    // Estado para la animación de resize
    const [isResizing, setIsResizing] = useState(false);
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

        if (!diagnosticoEntries || diagnosticoEntries.length === 0) return null;

        const diagnosticos: Diagnostico[] = diagnosticoEntries
            .map(entry => {
                const procConfig = getProcConfig(entry.procedimientoId);
                if (!procConfig) return null;

                return {
                    id: entry.id,
                    nombre: procConfig.nombre,
                    prioridadKey: procConfig.prioridadKey,
                    areas_afectadas: entry.areas_afectadas,
                } as Diagnostico;
            })
            .filter((diag): diag is Diagnostico => diag !== null);

        if (diagnosticos.length === 0) return null;

        return { diagnósticos: diagnosticos };

    }, [selectedTooth, getToothDiagnoses, getProcConfig]);

    const previewColorHex = useMemo(() => {
        if (!selectedTooth || !previewProcId) return null;
        return getPreviewColor(previewProcId, previewOptions);
    }, [selectedTooth, previewProcId, previewOptions, getPreviewColor]);

    // EFECTO PARA MANEJAR EL REDIMENSIONAMIENTO
    useEffect(() => {
  if (!canvasContainerRef.current) return;

  const canvasContainer = canvasContainerRef.current;
  let resizeTimeout: ReturnType<typeof setTimeout>;
  let completeTimeout: ReturnType<typeof setTimeout>;

  const handleResize = () => {
    // Limpiar timeouts previos
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (completeTimeout) clearTimeout(completeTimeout);

    // Activar animación de resize
    setIsResizing(true);

    // Debounce: desactivar estado de resizing después de 300ms
    resizeTimeout = setTimeout(() => {
      setIsResizing(false);
    }, 300);

    // Mostrar animación final después de 350ms
    completeTimeout = setTimeout(() => {
      // Aquí puedes agregar lógica adicional si lo necesitas
      if (canvasContainer) {
        canvasContainer.classList.add('resize-complete');
        setTimeout(() => {
          canvasContainer.classList.remove('resize-complete');
        }, 300);
      }
    }, 350);
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvasContainer);

  return () => {
    resizeObserver.disconnect();
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (completeTimeout) clearTimeout(completeTimeout);
  };
}, []);

    return (
        <div className="flex w-full h-full bg-gray-100">
            <div 
                ref={canvasContainerRef}
                className={`relative flex-grow h-full overflow-hidden canvas ${
                    isResizing ? 'odontograma-resizing' : ''
                }`}
            >
                {/* Botones de Perspectiva */}
                <PerspectiveButtons setCurrentView={setCurrentView} currentView={currentView} />

                {/* Canvas 3D */}
                <div className="absolute inset-0">
                    <Canvas 
                        camera={{ position: VIEW_PRESETS.FRONT.position, fov: 15 }} 
                        gl={{ antialias: true }}
                        className={`canvas-3d-transition ${
                            isResizing ? 'brightness-105' : 'brightness-100'
                        }`}
                    >
                        <DentalBackground />
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[5, 10, 5]} intensity={1.8} />
                        <directionalLight position={[-5, -5, -5]} intensity={0.5} />

                        {/* Control de cámara */}
                        <CameraControls currentView={currentView} setJawOpenState={setIsJawOpen} />

                        <OdontogramaModel
                            selectedTooth={selectedTooth}
                            setSelectedTooth={handleSelectTooth}
                            previewColorHex={previewColorHex}
                            odontogramaDataHook={odontogramaDataHook}
                            isJawOpen={isJawOpen}
                        />
                    </Canvas>
                </div>

                {/* Panel de Preview del diente */}
                <PanelPreviewDiente dienteSeleccionado={selectedTooth} datosDiente={currentToothData} />

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
                className="w-72 border-l border-black"
                selectedTooth={selectedTooth}
                selectedSurfaces={currentSurfaces}
                onSurfaceSelect={handleSurfaceSelect}
                onPreviewChange={setPreviewProcId}
                onPreviewOptionsChange={setPreviewOptions}
                odontogramaDataHook={odontogramaDataHook}
            />
        </div>
    );
};