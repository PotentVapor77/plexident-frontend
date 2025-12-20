// src/components/odontogram/history/OdontogramaHistoryViewer.tsx

import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OdontogramaModel } from "../3d/OdontogramaModel";
import { useOdontogramaData } from "../../../hooks/odontogram/useOdontogramaData";
import {
  CameraControls,
  VIEW_PRESETS,
  type ViewPresetKey,
  PerspectiveButtons,
} from "../3d/CameraControls";
import { DentalBackground } from "../../../hooks/gradients/DentalGradient";

interface OdontogramaHistoryViewerProps {
  odontogramaData: any;
}

export const OdontogramaHistoryViewer = ({
  odontogramaData,
}: OdontogramaHistoryViewerProps) => {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewPresetKey>("FRONT");
  const [isJawOpen, setIsJawOpen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Hook de datos del odontograma
  const odontogramaDataHook = useOdontogramaData(odontogramaData);

  // Resize observer para prevenir re-renders
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    let animationFrame: number | null = null;

    const handleResize = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      container.classList.add("is-resizing");
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
  }, []);

  return (
    // ✅ w-full h-full para ocupar el contenedor padre (ya sea flex-1 o h-[400px])
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Contenedor del Canvas */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
      >
        <Canvas
          camera={{
            position: VIEW_PRESETS["FRONT"].position,
            fov: 50,
          }}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
          dpr={[1, 2]}
          shadows
        >
          {/* DentalBackground DEBE estar dentro del Canvas */}
          <DentalBackground />

          {/* Iluminación - Sistema completo como el original */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.4} />

          {/* Controles de Cámara */}
          <CameraControls
            currentView={currentView}
            setJawOpenState={setIsJawOpen}
          />

          {/* Modelo del Odontograma */}
          <OdontogramaModel
            selectedTooth={selectedTooth}
            setSelectedTooth={setSelectedTooth}
            previewColorHex={null}
            odontogramaDataHook={odontogramaDataHook}
            isJawOpen={isJawOpen}
          />
        </Canvas>
      </div>

      {/* Badge de Solo Lectura - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold backdrop-blur-sm">
          SOLO LECTURA
        </div>
      </div>

      {/* Botones de Perspectiva - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <PerspectiveButtons
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      </div>
    </div>
  );
};
