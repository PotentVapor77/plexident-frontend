// src/components/CameraControls.tsx
import React, { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// --- 1. Definición de Vistas Preestablecidas ---
export interface ViewPreset {
  position: [number, number, number];
  target: [number, number, number];
  label: string;
  icon?: React.ReactNode; // Añadido para soporte de iconos en UI
}

export type ViewPresetKey = 'FRONT' | 'TOP' | 'LEFT' | 'OPEN_MOUTH' | 'FREE' | 'RIGHT';

// Iconos SVG auxiliares
const Icons = {
  Front: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>,
  Top: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 3v18" /><path d="M12 12l8-4.5" /><path d="M12 12l-8-4.5" /></svg>,
  Side: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="8" height="16" rx="1" /><path d="M16 8h4" /><path d="M16 12h4" /><path d="M16 16h4" /></svg>,
  Mouth: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01" /><path d="M15 9h.01" /><circle cx="12" cy="12" r="10" /></svg>
};

export const VIEW_PRESETS: Record<Exclude<ViewPresetKey, 'FREE'>, ViewPreset> = {
  'FRONT': { position: [0, 0, 5], target: [0, 0, 0], label: "Frontal", icon: Icons.Front },
  'TOP': { position: [0, 5, 0], target: [0, 0, 0], label: "Superior", icon: Icons.Top },
  'LEFT': { position: [-5, 0, 0], target: [0, 0, 0], label: "Lateral Izq.", icon: Icons.Side },
  'RIGHT': { position: [5, 0, 0], target: [0, 0, 0], label: "Lateral Der.", icon: Icons.Side },
  'OPEN_MOUTH': {
    position: [0, -5, 0],
    target: [0, 1, -0.3],
    label: "Boca Abierta",
    icon: Icons.Mouth
  },
};

interface CameraControlsProps {
  currentView: ViewPresetKey;
  setJawOpenState: (isOpen: boolean) => void;
}

// --- 2. Componente de Control de Cámara (Dentro del Canvas) ---
export const CameraControls = ({ currentView, setJawOpenState }: CameraControlsProps) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const wasOpenRef = useRef(false);
  const isFreeMode = currentView === 'FREE';

  useFrame(() => {
    if (controlsRef.current && !isFreeMode) {
      const preset = VIEW_PRESETS[currentView as Exclude<ViewPresetKey, 'FREE'>];
      if (!preset) return;

      const targetPosition = new THREE.Vector3(...preset.position);
      const targetTarget = new THREE.Vector3(...preset.target);

      // Interpolación suave
      camera.position.lerp(targetPosition, 0.05);
      controlsRef.current.target.lerp(targetTarget, 0.05);
      controlsRef.current.update();

      // Habilitar controles si llegamos al destino
      if (camera.position.distanceTo(targetPosition) < 0.05) {
        controlsRef.current.enabled = true;
      }
    }
  });

  useEffect(() => {
    const isOpenView = currentView === 'OPEN_MOUTH';
    if (controlsRef.current) {
      if (isFreeMode) {
        controlsRef.current.enabled = true;
        setJawOpenState(wasOpenRef.current);
      } else {
        controlsRef.current.enabled = false;
        setJawOpenState(isOpenView);
        wasOpenRef.current = isOpenView;
      }
    }
  }, [currentView, isFreeMode, setJawOpenState]);

  return (
    <OrbitControls
      ref={controlsRef}
      minDistance={3}
      maxDistance={8}
      enableDamping={true}
      dampingFactor={0.1}
    />
  );
};

// --- 3. Componente de UI (Botones flotantes) ---
interface PerspectiveButtonsProps {
  currentView: ViewPresetKey;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewPresetKey>>;
}

export const PerspectiveButtons = ({ currentView, setCurrentView }: PerspectiveButtonsProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fixedViews = Object.entries(VIEW_PRESETS) as [Exclude<ViewPresetKey, 'FREE'>, ViewPreset][];
  const isFreeMode = currentView === 'FREE';

  const handleSelectFixedView = (key: Exclude<ViewPresetKey, 'FREE'>) => {
    setCurrentView(key);
    setDropdownOpen(false);
  };

  const handleToggleFreeMode = () => {
    if (isFreeMode) {
      setCurrentView('FRONT');
    } else {
      setCurrentView('FREE');
    }
    setDropdownOpen(false);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-lg">
        
        {/* Botón Modo Libre */}
        <button
          onClick={handleToggleFreeMode}
          className={`
            flex items-center gap-2 px-4 py-2 text-theme-sm font-medium rounded-lg transition-all duration-200
            ${isFreeMode
              ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {isFreeMode ? "Modo Libre" : "Explorar"}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* Dropdown Vistas */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`
              flex items-center gap-2 px-4 py-2 text-theme-sm font-medium rounded-lg transition-all duration-200
              ${!isFreeMode
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            <span>
              {!isFreeMode 
                ? VIEW_PRESETS[currentView as Exclude<ViewPresetKey, 'FREE'>]?.label 
                : "Vistas Fijas"
              }
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menú Dropdown */}
          {dropdownOpen && (
            <>
              {/* Overlay transparente para cerrar al hacer clic fuera */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-theme-xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Seleccionar vista
                </div>
                {fixedViews.map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectFixedView(key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left
                      ${currentView === key
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <span className={`
                      ${currentView === key ? "text-brand-500" : "text-gray-400"}
                    `}>
                      {preset.icon}
                    </span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};