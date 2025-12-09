// src/components/CameraControls.tsx
import React, { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// --- 1. Definición de Vistas Preestablecidas ---
interface ViewPreset {
  position: [number, number, number];
  target: [number, number, number];
  label: string;
}

// Incluimos 'FREE' como una opción de clave de vista
export type ViewPresetKey = 'FRONT' | 'TOP' | 'LEFT' | 'OPEN_MOUTH' | 'FREE' | 'RIGHT';

// Vistas fijas (el Modo Libre no requiere posición ni target fijos)
export const VIEW_PRESETS: Record<Exclude<ViewPresetKey, 'FREE'>, ViewPreset> = {
  'FRONT': { position: [0, 0, 5], target: [0, 0, 0], label: "Vista Frontal" },
  'TOP': { position: [0, 5, 0], target: [0, 0, 0], label: "Vista Superior" },
  'LEFT': { position: [-5, 0, 0], target: [0, 0, 0], label: "Vista Lateral (IZ)" },
  'OPEN_MOUTH': {
    position: [0, -5, 0],
    target: [0, 1, -0.3],
    label: "Boca Abierta"
  },
  'RIGHT': { position: [5, 0, 0], target: [0, 0, 0], label: "Vista Lateral (DR)" },
};

interface CameraControlsProps {
  currentView: ViewPresetKey;
  setJawOpenState: (isOpen: boolean) => void; 
}

// --- 2. Componente de Control de Cámara (Usado dentro de Canvas) ---
export const CameraControls = ({ currentView, setJawOpenState }: CameraControlsProps) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // El estado de los controles de órbita (habilitados o no) depende de si estamos en 'FREE'
  const wasOpenRef = useRef(false);
  const isFreeMode = currentView === 'FREE';

  useFrame(() => {
    if (controlsRef.current && !isFreeMode) {
      const preset = VIEW_PRESETS[currentView as Exclude<ViewPresetKey, 'FREE'>];
      const targetPosition = new THREE.Vector3(...preset.position);
      const targetTarget = new THREE.Vector3(...preset.target);

      // Interpolación suave (Lerp) para la posición y el target
      camera.position.lerp(targetPosition, 0.05);
      controlsRef.current.target.lerp(targetTarget, 0.05);
      controlsRef.current.update();

      // Habilitar los controles de Orbit al finalizar la animación
      if (camera.position.distanceTo(targetPosition) < 0.01) {
        controlsRef.current.enabled = true;
      }
    }
  });

  // Efecto para controlar el estado de los OrbitControls y resetear la animación
  useEffect(() => {
    const isOpenView = currentView === 'OPEN_MOUTH';
    if (controlsRef.current) {
      if (isFreeMode) {
        // En Modo Libre, habilitamos inmediatamente el control del usuario
        controlsRef.current.enabled = true;
        setJawOpenState(wasOpenRef.current);
      } else {
        // 2. MODO FIJO:
        controlsRef.current.enabled = false;

        // Actualizamos el estado de la mandíbula para el modelo
        setJawOpenState(isOpenView);

        // Guardamos el estado actual para el futuro cambio a FREE.
        wasOpenRef.current = isOpenView;
      }
    }
  }, [currentView, isFreeMode, setJawOpenState]);


  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={3}
      maxDistance={6}
      enableDamping={true}
      dampingFactor={0.1}
    />
  );
};

// --- 3. Componente de Botones de UI con Dropdown ---
interface PerspectiveButtonsProps {
  currentView: ViewPresetKey;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewPresetKey>>;
}

export const PerspectiveButtons = ({ currentView, setCurrentView }: PerspectiveButtonsProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Lista de vistas fijas
  const fixedViews = Object.entries(VIEW_PRESETS) as [Exclude<ViewPresetKey, 'FREE'>, ViewPreset][];
  const isFreeMode = currentView === 'FREE';


  const handleSelectFixedView = (key: Exclude<ViewPresetKey, 'FREE'>) => {
    setCurrentView(key);
    setDropdownOpen(false);
  };

  const handleToggleFreeMode = () => {
    if (isFreeMode) {
      // Si está en Modo Libre, vuelve a la vista Frontal
      setCurrentView('FRONT');
    } else {
      // Si está en vista fija, cambia a Modo Libre
      setCurrentView('FREE');
    }
    setDropdownOpen(false);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
      {/* Botón Principal: Modo Libre */}
      <button
        onClick={handleToggleFreeMode}
        className={`
                        px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl shadow-lg
                        ${isFreeMode
            ? "bg-red-600 text-white shadow-red-500/50"
            : "bg-gray-800 text-white hover:bg-gray-700"
          }
                    `}
      >
        {isFreeMode ? "Modo Libre (Activo)" : "Activar Modo Libre"}
      </button>

      {/* Dropdown para Vistas Fijas */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`
                            flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-xl shadow-lg
                            ${isFreeMode
              ? "bg-white text-gray-700 hover:bg-gray-100"
              : "bg-blue-600 text-white shadow-blue-500/50"
            }
                        `}
        >
          {isFreeMode
            ? "Vistas Fijas"
            : VIEW_PRESETS[currentView as Exclude<ViewPresetKey, 'FREE'>]?.label || "Vistas Fijas"
          }
          <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden right-0">
            {fixedViews.map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleSelectFixedView(key)}
                className={`
                                        block w-full text-left px-4 py-2 text-sm transition-colors duration-150
                                        ${currentView === key
                    ? "bg-blue-500 text-white font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                                    `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};