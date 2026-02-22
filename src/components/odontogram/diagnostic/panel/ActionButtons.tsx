// src/components/odontograma/DiagnosticoPanel/components/ActionButtons.tsx

import React, { useState } from 'react';
import { type GroupedDiagnostic } from '../../../../core/utils/groupDiagnostics';
import { SaveSuccessOverlay } from '../../3d/SaveSuccessOverlay';
import type { ResultadoGuardado } from '../../../../services/odontogram/odontogramaService';
import { useNotification } from '../../../../context/notifications/NotificationContext';


// ============================================================================
// INTERFACES
// ============================================================================

interface ActionButtonsProps {
  /**
   * Indica si hay un diente seleccionado
   */
  selectedTooth: string | null;

  /**
   * Indica si el diente está bloqueado por ausencia
   */
  isBlocked: boolean;

  /**
   * Indica si está mostrando el formulario de diagnóstico
   */
  showDiagnosticoForm: boolean;

  /**
   * Cantidad de diagnósticos aplicados al diente actual
   */
  diagnosticosCount: number;

  /**
   * Estado de guardado
   */
  isSaving: boolean;

  /**
   * Timestamp del último guardado completo
   */
  lastCompleteSave: Date | null;

  /**
   * Callback para añadir diagnóstico
   */
  onAddDiagnostico: () => void;

  /**
   * Callback para cancelar formulario de diagnóstico
   */
  onCancelDiagnostico: () => void;

  /**
   * Callback para guardar todo el odontograma
   */
  onSaveAll: () => Promise<ResultadoGuardado | undefined> | undefined;

  /**
   * Callback para limpiar todos los diagnósticos del diente
   */
  onClearAll: () => void;
  
  refreshOdontograma: () => void;
  diagnosticosAplicados: GroupedDiagnostic[];
  
  /**
   * Callback para refrescar índices CPO
   */
  refreshCPOIndices?: () => Promise<void> | void;
}

// ============================================================================
// COMPONENTE: ActionButtons
// ============================================================================

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedTooth,
  isBlocked,
  showDiagnosticoForm,
  diagnosticosCount,
  isSaving,
  lastCompleteSave,
  onAddDiagnostico,
  onCancelDiagnostico,
  onSaveAll,
  onClearAll,
  refreshOdontograma,
  refreshCPOIndices,
}) => {
  // ============================================================================
  // HOOK DE NOTIFICACIONES GLOBAL
  // ============================================================================
  const { notify } = useNotification(); 
  
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isRefreshingCPO, setIsRefreshingCPO] = useState(false);

  const handleSaveAll = async () => {
    if (!canSave) return;

    try {
      setIsRefreshingCPO(true);
      
      // 1. Capturamos la respuesta del servicio
      const response = await onSaveAll(); 

      // Verificar si hubo cambios
      if (response && response.diagnosticos_guardados === 0) {
        // Ya no necesitamos la notificación aquí porque useDiagnosticoPanelManager
        // ya la maneja. Solo debemos evitar mostrar SaveSuccessOverlay
        console.log('[ActionButtons] Sin cambios detectados, no se muestra overlay');
        setIsRefreshingCPO(false);
        return; // Salimos sin mostrar el SaveSuccessOverlay
      }

      // Solo mostrar el overlay si hubo cambios reales
      if (response && response.diagnosticos_guardados > 0) {
        setShowSaveSuccess(true);
      }
      
      if (refreshCPOIndices) {
        try {
          await refreshCPOIndices();
          // Solo mostrar notificación de CPO si hubo cambios
          if (response && response.diagnosticos_guardados > 0) {
            notify({ // 👈 Usar notify global
              type: 'success',
              title: 'CPO actualizado',
              message: 'Índices CPO recalculados correctamente.',
            });
          }
        } catch (cpoError) {
          console.warn('[ActionButtons] Error al refrescar CPO:', cpoError);
          notify({ // 👈 Usar notify global
            type: 'warning',
            title: 'CPO no actualizado',
            message: 'El odontograma se guardó pero no se pudieron recalcular los índices CPO.',
          });
        }
      }
    } catch (error) {
      console.error('[ActionButtons] Error al guardar:', error);
      notify({ // 👈 Usar notify global
        type: 'error',
        title: 'Error al guardar',
        message: error instanceof Error 
          ? error.message 
          : 'No se pudo guardar el odontograma.',
      });
    } finally {
      setIsRefreshingCPO(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSaveSuccess(false);
    refreshOdontograma();
  };

  // ===========================================================================
  // Eliminar diagnóstico
  // ===========================================================================
  const handleClearTooth = async () => {
    if (!diagnosticosCount) return;

    const ok = window.confirm(
      `¿Deseas eliminar TODOS los diagnósticos de este diente (${diagnosticosCount})?\n\n` +
      `Los cambios se aplicarán cuando presiones "Guardar todo".`
    );

    if (!ok) return;

    try {
      // Solo limpiar el estado local
      onClearAll();

      notify({ // 👈 Usar notify global
        type: 'info',
        title: 'Diente limpiado',
        message: `Se eliminaron ${diagnosticosCount} diagnóstico(s) localmente. Presiona "Guardar todo" para confirmar.`,
      });

    } catch (error) {
      console.error('[ActionButtons] Error al limpiar diente:', error);
      notify({ // 👈 Usar notify global
        type: 'error',
        title: 'Error al limpiar',
        message: error instanceof Error
          ? error.message
          : 'No se pudo limpiar el diente. Intenta nuevamente.',
      });
    }
  };

  // ============================================================================
  // VALIDACIONES DE ESTADO
  // ============================================================================

  const canAddDiagnostico = selectedTooth && !isBlocked;
  const canClearDiagnosticos = selectedTooth && diagnosticosCount > 0 && !showDiagnosticoForm;
  const canSave = !isSaving && !isRefreshingCPO;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 p-4 shadow-lg">
      {/* Botones principales */}
      <div className="flex gap-3 mb-3">
        {/* BOTÓN 1: Añadir Diagnóstico / Cancelar */}
        {showDiagnosticoForm ? (
          <button
            onClick={onCancelDiagnostico}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-theme-xs"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </span>
          </button>
        ) : (
          <button
            onClick={onAddDiagnostico}
            disabled={!canAddDiagnostico}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-theme-sm ${
              canAddDiagnostico
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 hover:shadow-focus-ring'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={
              !selectedTooth
                ? 'Selecciona un diente primero'
                : isBlocked
                  ? 'Este diente está bloqueado'
                  : 'Añadir nuevo diagnóstico'
            }
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir diagnóstico
            </span>
          </button>
        )}

        {/* BOTÓN 2: Guardar Todo */}
        <button
          onClick={handleSaveAll}
          disabled={!canSave}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-theme-sm ${
            canSave
              ? 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 hover:shadow-focus-ring'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={
            isSaving ? 'Guardando...' : 
            isRefreshingCPO ? 'Actualizando CPO...' : 
            'Guardar todos los cambios al servidor y actualizar índices CPO'
          }
        >
          <span className="flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : isRefreshingCPO ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando CPO...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar todo
              </>
            )}
          </span>
        </button>
      </div>

      {/* Botón secundario: Limpiar diente */}
      {canClearDiagnosticos && (
        <button
          onClick={handleClearTooth}
          className="w-full py-2 px-4 rounded-lg border border-error-200 bg-error-50 text-sm font-medium text-error-700 hover:bg-error-100 active:bg-error-200 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar diente ({diagnosticosCount})
          </span>
        </button>
      )}

      {/* Indicador de último guardado */}
      {lastCompleteSave && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-success-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            Último guardado: {formatLastSaveTime(lastCompleteSave)}
          </span>
        </div>
      )}
      
      {/* Estado de CPO si está refrescando */}
      {isRefreshingCPO && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-brand-600">
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Actualizando índices CPO...</span>
        </div>
      )}
      
      <SaveSuccessOverlay
        isVisible={showSaveSuccess}
        onComplete={handleSuccessComplete}
      />
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea el timestamp del último guardado de forma amigable
 */
function formatLastSaveTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  // Menos de 1 minuto
  if (diffMinutes < 1) {
    return 'Hace un momento';
  }

  // Menos de 60 minutos
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  // Más de 1 hora: mostrar hora
  return date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}