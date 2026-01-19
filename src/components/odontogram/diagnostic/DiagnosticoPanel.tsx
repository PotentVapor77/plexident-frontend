// src/components/odontogram/diagnostic/DiagnosticoPanel.tsx

import React, { useCallback, useEffect, useMemo } from 'react';

import { usePacienteActivo } from '../../../context/PacienteContext';
import { useDiagnosticoPanelManager } from '../../../hooks/odontogram/diagnosticoHooks/useDiagnosticoPanelManager';
import { useCatalogoDiagnosticos } from '../../../hooks/odontogram/useCatalogoDiagnosticos';
import { useDiagnosticoSelect } from '../../../hooks/odontogram/useDiagnosticoSelect';
import { useToothRootType } from '../../../hooks/odontogram/useToothRootType';
// Componentes
import { SurfaceSelector } from '../3d/SuperficieSelector';
import { ActionButtons } from './panel/ActionButtons';
import { DiagnosticosList } from './panel/DiagnosticosList';
import { NotificationManager } from './panel/NotificationManager';
import { ToothInfoCard } from './panel/ToothInfoCard';
import { DiagnosticoSelectUI } from '../selection/DiagnosticoSelectUI';
// Utils
import { groupDentalSurfaces } from '../../../core/utils/groupDentalSurfaces';
import { SurfaceLabels } from './panel/SurfaceLabels';
import type { PendingFile } from '../../../services/clinicalFiles/clinicalFilesService';
import { useClinicalFiles } from '../../../hooks/clinicalFiles/useClinicalFiles';
import { useClinicalFilesContext } from '../../../context/ClinicalFilesContext';
// ============================================================================
// INTERFACES
// ============================================================================

type FilePanelProps = {
  pendingFiles: PendingFile[];
  addPendingFile: (file: File) => void;
  removePendingFile: (tempId: string) => void;
  uploadAllPendingFiles: () => Promise<void>;
  isUploading: boolean;
  isOpen: boolean;
  onClose: () => void;
};



interface DiagnosticoPanelProps {
  selectedTooth: string | null;
  odontogramaDataHook?: any;
  onRootGroupChange?: (group: string | null) => void;
  onOpenFileUpload?: () => void;
  filePanelProps?: FilePanelProps;
}

// ============================================================================
// COMPONENTE PRINCIPAL: DiagnosticoPanel
// ============================================================================

export const DiagnosticoPanel: React.FC<DiagnosticoPanelProps> = ({
  selectedTooth,
  odontogramaDataHook,
  onRootGroupChange,
}) => {
  const { pacienteActivo } = usePacienteActivo();
  const { uploadAllPendingFiles, hasPendingFiles } = useClinicalFilesContext();

  // ============================================================================
  // VALIDACIÓN INICIAL
  // ============================================================================

  if (!odontogramaDataHook) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-2">
          <p className="text-error-600 font-semibold">Error de inicialización</p>
          <p className="text-sm text-gray-500">
            El hook del odontograma no está disponible
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // HOOKS
  // ============================================================================

  // Hook principal del panel
  const {
    state,
    handleToothChange,
    handleAddDiagnostico,
    handleCancelDiagnostico,
    handleApplyDiagnostico,
    handleRemoveDiagnostico,
    handleSurfaceSelect,
    handleAreaChange,
    handleRootGroupChange,
    handleGuardarCompleto,
    handleClearAll,
    addNotification,
    notifications,
    removeNotification,
  } = useDiagnosticoPanelManager({
    selectedTooth,
    odontogramaDataHook,
    pacienteActivoId: pacienteActivo ?? undefined,
    onRootGroupChange,
    onCompleteSave: async (snapshotId: string) => {
      if (!pacienteActivo || !hasPendingFiles) return;
      await uploadAllPendingFiles(pacienteActivo.id, snapshotId);
    },

  });

  const handleRemoveIndividualSurface = useCallback((surfaceId: string) => {
    const newSurfaces = state.selectedSurfaces.filter(s => s !== surfaceId);
    handleSurfaceSelect(newSurfaces);
  }, [state.selectedSurfaces, handleSurfaceSelect]);


  // Hook del catálogo de diagnósticos
  const {
    categorias,
    isLoading: isCatalogLoading,
    error: catalogError,
  } = useCatalogoDiagnosticos();

  // Hook del tipo de raíz del diente
  const rootInfo = useToothRootType(selectedTooth);
  const grouped = useMemo(() =>
    groupDentalSurfaces(state.selectedSurfaces, rootInfo.type)
    , [state.selectedSurfaces, rootInfo.type]);

  // Hook del selector de diagnósticos
  const diagSelect = useDiagnosticoSelect({
    currentArea: state.currentArea,
    categorias,
    onApply: handleApplyDiagnostico,
    onCancel: handleCancelDiagnostico,
    onPreviewChange: odontogramaDataHook.setPreviewedDiagnostico || (() => { }),
    onPreviewOptionsChange: odontogramaDataHook.setAtributosClinicosTemporales || (() => { }),
  });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    handleToothChange(selectedTooth);
  }, [selectedTooth, handleToothChange]);

  // ============================================================================
  // ETIQUETAS DE SUPERFICIES SELECCIONADAS
  // ============================================================================



  // ============================================================================
  // ESTADO DE CARGA DEL CATÁLOGO
  // ============================================================================

  if (isCatalogLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Cargando catálogo</p>
            <p className="text-xs text-gray-500">Obteniendo datos del servidor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-50">
            <svg className="w-6 h-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-error-600">Error al cargar catálogo</p>
            <p className="text-xs text-gray-500">
              No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL - LAYOUT FLEX OPTIMIZADO
  // ============================================================================

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* ===== NOTIFICACIONES ===== */}
      <NotificationManager
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* ===== HEADER: Info del diente (FIJO) ===== */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <ToothInfoCard
          toothInfo={state.toothInfo}
          selectedTooth={state.selectedTooth}
          isBlocked={state.isToothBlocked}
          diagnosticosCount={state.diagnosticosAplicados.length}
        />
      </div>

      {/* ===== CONTENIDO PRINCIPAL (FLEX-GROW CON SCROLL) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {state.showDiagnosticoSelect && state.selectedTooth && !state.isToothBlocked ? (
          /* ========== MODO: AÑADIR DIAGNÓSTICO ========== */
          <div className="p-4 space-y-4">
            {/* Selector de superficies */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecciona áreas afectadas
              </h4>

              <SurfaceSelector
                selectedTooth={state.selectedTooth}
                selectedSurfaces={state.selectedSurfaces}
                onSurfaceSelect={handleSurfaceSelect}
                onAreaChange={handleAreaChange}
                onRootGroupChange={handleRootGroupChange}
                getPermanentColorForSurface={odontogramaDataHook.getPermanentColorForSurface}
                activeDiagnosisColor={diagSelect.diagnosticoSeleccionado?.simboloColor ?? null}

              />

              {/* Etiquetas inteligentes de superficies */}
              <SurfaceLabels
                selectedSurfaces={state.selectedSurfaces}
                groupedSurfaces={grouped}
                onRemoveSurface={handleRemoveIndividualSurface}
                selectedTooth={state.selectedTooth}
              //principalArea={state.currentArea}
              />
            </div>

            {/* Selector de diagnóstico */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecciona un diagnóstico
              </h4>

              <DiagnosticoSelectUI
                {...diagSelect}
                currentArea={state.currentArea}
              />
            </div>
          </div>
        ) : (
          /* ========== MODO: LISTA DE DIAGNÓSTICOS ========== */
          <div className="p-4">
            {state.selectedTooth ? (
              <DiagnosticosList
                diagnosticos={state.diagnosticosAplicados}
                onRemove={handleRemoveDiagnostico}
                addNotification={addNotification}
              />
            ) : (
              /* Estado vacío: Sin diente seleccionado */
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2 max-w-xs">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Selecciona un diente
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Haz clic en un diente del odontograma 3D para ver y gestionar diagnósticos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== FOOTER: Botones de acción (FIJO) ===== */}
      <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <ActionButtons
          selectedTooth={state.selectedTooth}
          isBlocked={state.isToothBlocked}
          showDiagnosticoForm={state.showDiagnosticoSelect}
          diagnosticosCount={state.diagnosticosAplicados.length}
          isSaving={state.isSaving}
          lastCompleteSave={state.lastCompleteSave}
          onAddDiagnostico={handleAddDiagnostico}
          onCancelDiagnostico={handleCancelDiagnostico}
          onSaveAll={handleGuardarCompleto}
          onClearAll={handleClearAll}
          diagnosticosAplicados={state.diagnosticosAplicados}
          addNotification={addNotification}
        />

      </div>
    </div>
  );
};
