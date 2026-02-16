// src/components/odontogram/history/historyView/ViewModeToggle.tsx

import { LayoutGrid, List, GitCompare, FileText, Grid3x3 } from 'lucide-react';
import type { HistoryViewMode } from '../../../../core/types/historyView.types';

interface ViewModeToggleProps {
  currentMode: HistoryViewMode;
  onModeChange: (mode: HistoryViewMode) => void;
  disabled?: boolean;
  filesCount?: number;
  showModelsOnly?: boolean;
  isCompareView?: boolean;
}

export const ViewModeToggle = ({
  currentMode,
  onModeChange,
  disabled = false,
  filesCount = 0,
  //showModelsOnly = false,
  isCompareView = false,
}: ViewModeToggleProps) => {
  // Estilos base siguiendo la guía UI del sistema
  const buttonBase = `
    inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    whitespace-nowrap border
  `;

  // Estados de botón según la guía de UI
  const activeClass = `
    bg-brand-600 text-white border-brand-600 shadow-theme-sm
    hover:bg-brand-700 hover:border-brand-700
  `;

  const inactiveClass = `
    bg-white text-gray-700 border-gray-200 
    hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300
  `;

  const getButtonClass = (mode: HistoryViewMode) =>
    `${buttonBase} ${currentMode === mode ? activeClass : inactiveClass}`;

  // Función para obtener estilos del badge según la guía UI
  const getBadgeStyles = () => {
    return currentMode === 'files'
      ? 'bg-white/20 text-white' // Badge sobre botón activo
      : 'bg-brand-100 text-brand-700 border border-brand-200'; // Badge sobre botón inactivo
  };

  // Modos disponibles según el tipo de vista
  const getAvailableModes = () => {
    if (isCompareView) {
      // En vista de comparación: solo modelos 3D o archivos
      return [
        { 
          key: 'models' as HistoryViewMode, 
          label: 'Modelos 3D', 
          icon: Grid3x3,
          title: 'Vista de modelos 3D comparativos',
          description: 'Visualización comparativa de modelos'
        },
        { 
          key: 'files' as HistoryViewMode, 
          label: 'Archivos', 
          icon: FileText,
          title: 'Archivos clínicos comparados',
          description: 'Documentos y archivos adjuntos'
        },
      ];
    } else {
      // En vista individual: todos los modos normales
      return [
        { 
          key: 'compact' as HistoryViewMode, 
          label: 'Compacta', 
          icon: List,
          title: 'Vista compacta: Modelo 3D + lista textual',
          description: 'Visualización resumida del historial'
        },
        { 
          key: 'detailed' as HistoryViewMode, 
          label: 'Detallada', 
          icon: LayoutGrid,
          title: 'Vista detallada: Modelo 3D + SVGs de superficies',
          description: 'Información completa por superficie'
        },
        { 
          key: 'hidden' as HistoryViewMode, 
          label: 'Oculta', 
          icon: GitCompare,
          title: 'Ocultar panel lateral',
          description: 'Solo modelo 3D visible'
        },
        { 
          key: 'files' as HistoryViewMode, 
          label: 'Archivos', 
          icon: FileText,
          title: 'Archivos clínicos del snapshot',
          description: 'Documentos asociados al registro'
        },
      ];
    }
  };

  const availableModes = getAvailableModes();

  return (
    <div className="flex items-center p-1 bg-gray-50 rounded-lg border border-gray-200 shadow-theme-sm">
      {/* Contenedor tipo "segmented control" */}
      <div className="flex items-center gap-1">
        {availableModes.map((mode) => {
          const Icon = mode.icon;
          const isFilesMode = mode.key === 'files';
          const isActive = currentMode === mode.key;
          
          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => onModeChange(mode.key)}
              disabled={disabled}
              className={getButtonClass(mode.key)}
              title={mode.title}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
              <span>{mode.label}</span>
              
              {/* Badge de contador - siguiendo patrones de UI */}
              {isFilesMode && filesCount > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full
                  ${getBadgeStyles()}
                `}>
                  {filesCount > 99 ? '99+' : filesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Indicador de vista activa (sutil) - siguiendo patrón de pie de sección */}
      {!disabled && (
        <div className="ml-2 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              currentMode === 'files' ? 'bg-brand-500' :
              currentMode === 'compact' ? 'bg-blue-500' :
              currentMode === 'detailed' ? 'bg-purple-500' :
              currentMode === 'hidden' ? 'bg-gray-500' :
              'bg-emerald-500'
            }`} />
            <span className="text-xs text-gray-500">
              {availableModes.find(m => m.key === currentMode)?.description || 'Seleccione vista'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};