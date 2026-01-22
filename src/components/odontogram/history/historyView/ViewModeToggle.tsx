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
  showModelsOnly = false,
  isCompareView = false,
}: ViewModeToggleProps) => {
  const buttonBase = `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    whitespace-nowrap
  `;

  const activeClass = `
    bg-brand-500 text-white shadow-theme-sm
  `;

  const inactiveClass = `
    bg-gray-100 text-gray-700 hover:bg-gray-200 
    dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
  `;

  const getButtonClass = (mode: HistoryViewMode) =>
    `${buttonBase} ${currentMode === mode ? activeClass : inactiveClass}`;

  // Modos disponibles según el tipo de vista
  const getAvailableModes = () => {
    if (isCompareView) {
      // En vista de comparación: solo modelos 3D o archivos
      return [
        { 
          key: 'models' as HistoryViewMode, 
          label: 'Modelos 3D', 
          icon: Grid3x3,
          title: 'Vista de modelos 3D comparativos' 
        },
        { 
          key: 'files' as HistoryViewMode, 
          label: 'Archivos', 
          icon: FileText,
          title: 'Archivos clínicos comparados' 
        },
      ];
    } else {
      // En vista individual: todos los modos normales
      return [
        { 
          key: 'compact' as HistoryViewMode, 
          label: 'Compacta', 
          icon: List,
          title: 'Vista compacta: Modelo 3D + lista textual' 
        },
        { 
          key: 'detailed' as HistoryViewMode, 
          label: 'Detallada', 
          icon: LayoutGrid,
          title: 'Vista detallada: Modelo 3D + SVGs de superficies' 
        },
        { 
          key: 'hidden' as HistoryViewMode, 
          label: 'Oculta', 
          icon: GitCompare,
          title: 'Ocultar panel lateral' 
        },
        { 
          key: 'files' as HistoryViewMode, 
          label: 'Archivos', 
          icon: FileText,
          title: 'Archivos clínicos del snapshot' 
        },
      ];
    }
  };

  const availableModes = getAvailableModes();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {availableModes.map((mode) => {
        const Icon = mode.icon;
        const isFilesMode = mode.key === 'files';
        
        return (
          <button
            key={mode.key}
            type="button"
            onClick={() => onModeChange(mode.key)}
            disabled={disabled}
            className={getButtonClass(mode.key)}
            title={mode.title}
          >
            <Icon size={16} />
            <span>{mode.label}</span>
            {isFilesMode && filesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {filesCount > 99 ? '99+' : filesCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};