// src/components/odontogram/diagnostic/panel/ToothInfoCard.tsx

import React from 'react';
import type { ToothInfo } from '../../../../core/types/diagnostic.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface ToothInfoCardProps {
  // Información del diente (nombre, fdi)
  toothInfo: ToothInfo | null;
  // Diente seleccionado
  selectedTooth: string | null;
  // Condiciones de bloqueo
  isBlocked: boolean;
  // Cantidad de diagnosticos aplicados
  diagnosticosCount: number;
}

// ============================================================================
// COMPONENTE: ToothInfoCard
// ============================================================================

export const ToothInfoCard: React.FC<ToothInfoCardProps> = ({
  toothInfo,
  selectedTooth,
  isBlocked,
  diagnosticosCount,
}) => {
  // ============================================================================
  // ESTADO: Sin diente seleccionado
  // ============================================================================

  if (!selectedTooth || !toothInfo) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-theme-sm">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Selecciona un diente
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Haz clic en un diente del odontograma 3D para ver sus diagnósticos y gestionar información clínica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ESTADO: Diente bloqueado (ausente/perdido)
  // ============================================================================

  if (isBlocked) {
    return (
      <div className="bg-gradient-to-br from-error-50 to-white border border-error-200 rounded-lg p-4 shadow-theme-sm">
        <div className="flex items-start gap-3">
          {/* Icono de advertencia */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-error-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-error-800">
                {toothInfo.nombre}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-700">
                Pieza #{toothInfo.numero}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-error-700 leading-relaxed">
                Este diente está marcado como <strong>ausente o perdido</strong>. No se pueden aplicar diagnósticos adicionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ESTADO: Diente normal (con información completa)
  // ============================================================================

  return (
    <div className="bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-lg p-4 shadow-theme-sm">
      <div className="flex items-start gap-3">
        {/* Icono del diente */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {toothInfo.nombre}
          </h3>

          {/* Metadatos */}
          <div className="flex items-center gap-3 text-xs">
            {/* Número FDI */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                Pieza #{toothInfo.numero}
              </span>
            </div>

            {/* Separador */}
            <span className="text-gray-300">•</span>

            {/* Cantidad de diagnósticos */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="font-medium">
                {diagnosticosCount === 0 ? (
                  <span className="text-gray-400">Sin diagnósticos</span>
                ) : diagnosticosCount === 1 ? (
                  <span className="text-success-600">1 diagnóstico</span>
                ) : (
                  <span className="text-success-600">{diagnosticosCount} diagnósticos</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
