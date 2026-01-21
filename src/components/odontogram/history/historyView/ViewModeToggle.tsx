// src/components/odontogram/history/historyView/ViewModeToggle.tsx

import { LayoutGrid, List, GitCompare, FileText } from 'lucide-react';
import type { HistoryViewMode } from '../../../../core/types/historyView.types';

interface ViewModeToggleProps {
  currentMode: HistoryViewMode;
  onModeChange: (mode: HistoryViewMode) => void;
  disabled?: boolean;
  filesCount?: number;
}

export const ViewModeToggle = ({
  currentMode,
  onModeChange,
  disabled = false,
  filesCount = 0,
}: ViewModeToggleProps) => {
  const buttonBase = `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
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

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Vista Compacta */}
      <button
        onClick={() => onModeChange('compact')}
        disabled={disabled}
        className={getButtonClass('compact')}
        title="Vista compacta: Modelo 3D + lista textual"
      >
        <List size={16} />
        <span>Compacta</span>
      </button>

      {/* Vista Detallada */}
      <button
        onClick={() => onModeChange('detailed')}
        disabled={disabled}
        className={getButtonClass('detailed')}
        title="Vista detallada: Modelo 3D + SVGs de superficies"
      >
        <LayoutGrid size={16} />
        <span>Detallada</span>
      </button>

      {/* Vista Oculta */}
      <button
        onClick={() => onModeChange('hidden')}
        disabled={disabled}
        className={getButtonClass('hidden')}
        title="Ocultar "
      >
        <GitCompare size={16} />
        <span>Oculta</span>
      </button>

      {/* Vista Archivos Clínicos */}
 <button
        type="button"
        onClick={() => onModeChange('files')}
        disabled={disabled}
        className={getButtonClass('files')}
        title="Archivos clínicos del snapshot"
      >
        <FileText className="h-4 w-4" />
        <span>Archivos</span>
        {filesCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
            {filesCount}
          </span>
        )}
      </button>

    </div>
  );
};
