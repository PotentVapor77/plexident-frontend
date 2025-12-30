// src/components/odontogram/history/OdontogramaHistoryViewer.tsx
import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, OdontogramaModel, PerspectiveButtons, type ViewPresetKey } from "..";
import { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import { DentalBackground } from "../../../hooks/gradients/DentalGradient";

interface OdontogramaHistoryViewerProps {
  odontogramaData: any;
}

export const OdontogramaHistoryViewer = ({
  odontogramaData,
}: OdontogramaHistoryViewerProps) => {
  const [currentView, setCurrentView] = useState<ViewPresetKey>("FRONT");
  const [isJawOpen, setIsJawOpen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Inicializamos el hook con los datos recibidos
  const odontogramaDataHook = useOdontogramaData(odontogramaData);

  // EFECTO CRUCIAL: Sincronizar el hook cuando la prop 'odontogramaData' cambie (al navegar por el historial)
  useEffect(() => {
    if (odontogramaData && odontogramaDataHook.loadFromBackend) {
      odontogramaDataHook.loadFromBackend(odontogramaData);
    }
  }, [odontogramaData]);

  // Manejo de redimensionamiento (Resizing optimization)
  useEffect(() => {
  if (!canvasContainerRef.current) return;

  const container = canvasContainerRef.current;
  let animationFrame: number | null = null;

  const handleResize = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);

    container.classList.add("is-resizing");

    // Darle al menos un frame extra para que el ojo note el cambio
    animationFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.classList.remove("is-resizing");
      });
    });
  };

  const observer = new ResizeObserver(handleResize);
  observer.observe(container);

  return () => {
    observer.disconnect();
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}, []);

  const CAMERA_DISTANCE = 0.5;

  return (
  <div className="relative w-full h-full flex flex-col min-h-[600px] bg-muted/5 rounded-xl overflow-hidden border shadow-inner">
    {/* Contenedor ABSOLUTO como en el viewer */}
    <div
      ref={canvasContainerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
      }}
      className="canvas-container flex w-full h-full bg-gray-100"
    >
      {/* Wrapper interno igual al viewer */}
      <div className="relative flex-grow h-full overflow-hidden">
        <Canvas
          camera={{
            fov: 15,
            position: [0, 1.6, CAMERA_DISTANCE],
            near: 0.1,
            far: 1000,
          }}
          dpr={[1, 1.5]}
          frameloop="demand"
          resize={{ debounce: 0 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
          shadows
        >
          {/* Escena y luces */}
          <DentalBackground />
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.5}
            castShadow
          />

          {/* Controles de cámara y modelo */}
          <CameraControls
            currentView={currentView}
            setJawOpenState={setIsJawOpen}
          />

          <OdontogramaModel
            selectedTooth={null}
            setSelectedTooth={() => {}}
            isJawOpen={isJawOpen}
            odontogramaDataHook={odontogramaDataHook}
            previewColorHex={null}
          />
        </Canvas>

        {/* UI Overlays (top) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="pointer-events-auto bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            HISTORIAL: SOLO LECTURA
          </div>

          <div className="pointer-events-auto">
            <PerspectiveButtons
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </div>
        </div>

        {/* Overlay de Sincronización */}
        {odontogramaDataHook.isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-50">
            <div className="flex flex-col items-center gap-2 bg-background p-4 rounded-xl shadow-2xl border">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-muted-foreground">
                Actualizando vista...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

};