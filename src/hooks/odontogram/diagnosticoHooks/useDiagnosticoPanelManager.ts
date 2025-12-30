// src/hooks/odontogram/diagnosticoHooks/useDiagnosticoPanelManager.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { IPaciente } from '../../../types/patient/IPatient';
import type {
  DiagnosticoPanelState,
  PrincipalArea,
  UseDiagnosticoPanelManagerReturn,
  Notification,
  NotificationOptions
} from '../../../core/types/diagnostic.types';
import { useToothSelection } from './useToothSelection';
import type { AreaAfectada, OdontoColorKey } from '../../../core/types/odontograma.types';
import { useGuardarOdontogramaCompleto } from '../useGuardarOdontogramaCompleto';
import { isToothBlockedByAbsence } from '../../../core/domain/diagnostic/blockingRules';
import type { DiagnosticoEntry } from '../../../core/types/odontograma.types';
// ============================================================================
// INTERFACES
// ============================================================================

interface UseDiagnosticoPanelManagerProps {
  selectedTooth: string | null;
  odontogramaDataHook: any;
  pacienteActivoId?: IPaciente;
  onRootGroupChange?: (group: string | null) => void;
}

// ============================================================================
// HOOK PRINCIPAL: useDiagnosticoPanelManager
// ============================================================================

export const useDiagnosticoPanelManager = ({
  selectedTooth,
  odontogramaDataHook,
  onRootGroupChange,
}: UseDiagnosticoPanelManagerProps): UseDiagnosticoPanelManagerReturn => {

  // ============================================================================
  // VALIDACIÓN INICIAL
  // ============================================================================

  if (!odontogramaDataHook) {
    throw new Error('[DiagnosticoPanelManager] odontogramaDataHook es requerido');
  }

  const {
    odontogramaData,
    applyDiagnostico,
    removeDiagnostico,
    loadFromBackend: _loadFromBackend,
  } = odontogramaDataHook;

  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  const [showDiagnosticoSelect, setShowDiagnosticoSelect] = useState(false);
  const [currentArea, setCurrentArea] = useState<PrincipalArea>(null);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [currentRootGroup, setCurrentRootGroup] = useState<string | null>(null);

  // Estado de guardado

  // Estado de notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Estado de carga de datos
  const [isLoadingData,] = useState(false);
  const [dataError,] = useState<string | null>(null);

  // ============================================================================
  // HOOK: useToothSelection
  // ============================================================================

  const { toothInfo, isBlocked, diagnosticos } = useToothSelection({
    selectedTooth,
    odontogramaData,
    currentRootGroup,
  });



  // ============================================================================
  // SISTEMA DE NOTIFICACIONES
  // ============================================================================

  const addNotification = useCallback((options: NotificationOptions) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      dismissible: true,
      duration: 5000,
      ...options,
    };
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============================================================================
  // HANDLERS: Gestión de Diente
  // ============================================================================

  const handleToothChange = useCallback((_toothId: string | null) => {
    setShowDiagnosticoSelect(false);
    setCurrentArea(null);
    setSelectedSurfaces([]);
    setCurrentRootGroup(null);
  }, []);

  // ============================================================================
  // HANDLERS: Gestión de Superficie
  // ============================================================================

  const handleSurfaceSelect = useCallback((surfaces: string[]) => {
    setSelectedSurfaces(surfaces);
  }, []);

  const handleRemoveIndividualSurface = useCallback((surfaceId: string) => {
    const newSurfaces = selectedSurfaces.filter(s => s !== surfaceId);
    setSelectedSurfaces(newSurfaces);
  }, [selectedSurfaces]);


  const handleAreaChange = useCallback((area: PrincipalArea) => {
    setCurrentArea(area);
  }, []);

  const handleRootGroupChange = useCallback(
    (group: string | null) => {
      console.log('[Manager] handleRootGroupChange:', group);
      setCurrentRootGroup(group);
      onRootGroupChange?.(group);
    },
    [onRootGroupChange]
  );
useEffect(() => {
  console.log('[Manager] Auto-detecting area from surfaces:', selectedSurfaces);
  
  if (selectedSurfaces.length > 0) {
    const hasCorona = selectedSurfaces.some(s => s.startsWith('cara'));
    const hasRaiz = selectedSurfaces.some(s => s.startsWith('raiz'));
    
    console.log('[Manager] Area detection:', { hasCorona, hasRaiz });
    
    if (hasCorona && !hasRaiz) {
      setCurrentArea('corona');
    } else if (hasRaiz && !hasCorona) {
      setCurrentArea('raiz');
    } else if (hasCorona && hasRaiz) {
      setCurrentArea('general');
    }
  } else {
    setCurrentArea(null);
  }
}, [selectedSurfaces]);
  // ============================================================================
  // HANDLERS: Gestión de Diagnóstico
  // ============================================================================

  const handleAddDiagnostico = useCallback(() => {
    if (!selectedTooth) {
      addNotification({
        type: 'warning',
        title: 'Selección requerida',
        message: 'Debes seleccionar un diente primero',
      });
      return;
    }

    if (isBlocked) {
      addNotification({
        type: 'error',
        title: 'Diente bloqueado',
        message: 'Este diente está marcado como ausente o perdido',
      });
      return;
    }

    setShowDiagnosticoSelect(true);
  }, [selectedTooth, isBlocked, addNotification]);

  const handleCancelDiagnostico = useCallback(() => {
    setShowDiagnosticoSelect(false);
    setCurrentArea(null);
    setSelectedSurfaces([]);
    //setCurrentRootGroup(null);
  }, []);

  const handleApplyDiagnostico = useCallback(
    (
      diagnosticoId: string,
      colorKey: OdontoColorKey,
      atributos: Record<string, any>,
      descripcion: string,
      areas: AreaAfectada[]
    ) => {
      if (!selectedTooth) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No hay diente seleccionado',
        });
        return;
      }

      try {
        const toothData = odontogramaData[selectedTooth];
        const hasAbsence = toothData && isToothBlockedByAbsence(
          Object.values(toothData).flat() as DiagnosticoEntry[]
        );

        // Determinar superficies
        let surfacesToApply: string[];
        const isGeneralDiagnosis = areas.includes('general');

        if (isGeneralDiagnosis) {
          surfacesToApply = ['general'];
        } else {
          if (selectedSurfaces.length === 0) {
            addNotification({
              type: 'warning',
              title: 'Selección requerida',
              message: 'Debes seleccionar al menos una superficie',
            });
            return;
          }

          const requiresCorona = areas.includes('corona');
          const requiresRaiz = areas.includes('raiz');
          const hasCoronaSurface = selectedSurfaces.some(s => s.startsWith('cara'));
          const hasRaizSurface = selectedSurfaces.some(s => s.startsWith('raiz'));

          if (requiresCorona && !hasCoronaSurface) {
            addNotification({
              type: 'warning',
              title: 'Área requerida',
              message: 'Este diagnóstico requiere seleccionar superficies de corona',
            });
            return;
          }

          if (requiresRaiz && !hasRaizSurface) {
            addNotification({
              type: 'warning',
              title: 'Área requerida',
              message: 'Este diagnóstico requiere seleccionar superficies de raíz',
            });
            return;
          }

          surfacesToApply = [...selectedSurfaces];
        }

        // Aplicar diagnóstico
        applyDiagnostico(
          selectedTooth,
          surfacesToApply,
          diagnosticoId,
          colorKey,
          atributos,
          descripcion,
          areas
        );

        if (hasAbsence) {
          addNotification({
            type: 'info',
            title: 'Diagnóstico de ausencia eliminado',
            message: `Pieza ${toothInfo?.numero}: El estado de "ausente" fue removido automáticamente.`,
            duration: 6000,
          });
        } else {
          addNotification({
            type: 'success',
            title: 'Diagnóstico aplicado',
            message: `Pieza ${toothInfo?.numero} actualizada correctamente.`,
          });
        }

        handleCancelDiagnostico();

      } catch (error) {
        console.error('[DiagnosticoPanelManager] Error al aplicar diagnóstico:', error);
        addNotification({
          type: 'error',
          title: 'Error al aplicar',
          message: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    },
    [
      selectedTooth,
      selectedSurfaces,
      toothInfo,
      odontogramaData,
      addNotification,
      handleCancelDiagnostico,
    ]
  );

  const handleRemoveDiagnostico = useCallback(
    (id: string, superficieId: string) => {
      if (!selectedTooth) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No hay diente seleccionado',
        });
        return;
      }

      try {
        removeDiagnostico(selectedTooth, superficieId, id); // ← usa hook
        addNotification({
          type: 'success',
          title: 'Diagnóstico eliminado',
          message: 'El diagnóstico ha sido eliminado correctamente',
        });
      } catch (error) {
        console.error('[DiagnosticoPanelManager] Error al eliminar diagnóstico:', error);
        addNotification({
          type: 'error',
          title: 'Error al eliminar',
          message: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    },
    [selectedTooth, removeDiagnostico, addNotification]
  );
  const {
    guardarCompleto,
    isSavingComplete,
    lastCompleteSave: lastCompleteSaveFromHook,
    hasPacienteActivo
  } = useGuardarOdontogramaCompleto();
  // ============================================================================
  // HANDLERS: Guardado Completo
  // ============================================================================

  const handleGuardarCompleto = useCallback(async () => {
    if (!odontogramaDataHook || !hasPacienteActivo) {
      addNotification({
        type: 'error',
        title: 'Error de guardado',
        message: 'No hay paciente activo o datos de odontograma disponibles',
      });
      return;
    }

    try {
      // Exportar datos del odontograma
      const rawData = odontogramaDataHook.exportData
        ? odontogramaDataHook.exportData()
        : odontogramaData;

      console.log('[SAVE] Guardando odontograma completo...', rawData);

      // El hook maneja: mapeo, guardado, recarga de datos, sincronización
      const resultado = await guardarCompleto(rawData);

      console.log('[SAVE] Guardado exitoso:', resultado);

      // Notificar éxito
      addNotification({
        type: 'success',
        title: 'Guardado exitoso',
        message: `${resultado.diagnosticos_guardados} diagnósticos guardados en ${resultado.dientes_procesados.length} dientes`,
        duration: 7000,
      });

      // Advertencias si existen
      if (resultado.errores && resultado.errores.length > 0) {
        resultado.errores.forEach((error) => {
          addNotification({
            type: 'warning',
            title: 'Advertencia',
            message: error,
            duration: 8000,
          });
        });
      }

    } catch (error) {
      console.error('[SAVE] Error al guardar:', error);

      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: error instanceof Error ? error.message : 'Error desconocido',
        duration: 10000,
      });
    }
  }, [odontogramaDataHook, guardarCompleto, hasPacienteActivo, addNotification]);

  const handleClearAll = useCallback(() => {
    if (!selectedTooth) {
      addNotification({
        type: 'warning',
        title: 'Selección requerida',
        message: 'Debes seleccionar un diente primero',
      });
      return;
    }

    if (diagnosticos.length === 0) {
      addNotification({
        type: 'info',
        title: 'Sin diagnósticos',
        message: 'Este diente no tiene diagnósticos para limpiar',
      });
      return;
    }

    try {
      diagnosticos.forEach(diag => {
        diag.diagnosticoIds.forEach(({ id, superficieId }) => {
          removeDiagnostico(selectedTooth, superficieId, id);
        });
      });

      addNotification({
        type: 'success',
        title: 'Limpieza completa',
        message: `Se eliminaron ${diagnosticos.length} diagnósticos del diente ${toothInfo?.numero || ''}`,
      });
    } catch (error) {
      console.error('[DiagnosticoPanelManager] Error al limpiar diagnósticos:', error);
      addNotification({
        type: 'error',
        title: 'Error al limpiar',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [selectedTooth, diagnosticos, toothInfo, removeDiagnostico, addNotification]);

  // ============================================================================
  // ESTADO COMPUTADO
  // ============================================================================

  const state = useMemo(
    (): DiagnosticoPanelState => ({
      selectedTooth,
      toothInfo,
      isToothBlocked: isBlocked,
      diagnosticosAplicados: diagnosticos,
      toothDiagnoses: selectedTooth ? odontogramaData[selectedTooth] || {} : {},
      showDiagnosticoSelect,
      currentArea,
      selectedSurfaces,
      currentRootGroup,
      isSaving: isSavingComplete,
      lastCompleteSave: lastCompleteSaveFromHook,
      isLoadingData,
      dataError,
    }),
    [
      selectedTooth,
      toothInfo,
      isBlocked,
      diagnosticos,
      odontogramaData,
      showDiagnosticoSelect,
      currentArea,
      selectedSurfaces,
      currentRootGroup,
      isSavingComplete,
      lastCompleteSaveFromHook,
      isLoadingData,
      dataError,
    ]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    state,
    handleToothChange,
    handleAddDiagnostico,
    handleCancelDiagnostico,
    handleApplyDiagnostico,
    handleRemoveDiagnostico,
    handleSurfaceSelect,
    handleAreaChange,
    handleRemoveIndividualSurface,
    handleRootGroupChange,
    handleGuardarCompleto,
    handleClearAll,
    addNotification,
    notifications,
    removeNotification,
  };
};
