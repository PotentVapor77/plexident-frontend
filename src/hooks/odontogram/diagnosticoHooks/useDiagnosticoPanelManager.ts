// src/hooks/odontogram/diagnosticoHooks/useDiagnosticoPanelManager.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { IPaciente } from '../../../types/patient/IPatient';
import type {
  DiagnosticoPanelState,
  PrincipalArea,
  UseDiagnosticoPanelManagerReturn,
} from '../../../core/types/diagnostic.types';
import { useToothSelection } from './useToothSelection';
import type { AreaAfectada, OdontoColorKey } from '../../../core/types/odontograma.types';
import { useGuardarOdontogramaCompleto } from '../useGuardarOdontogramaCompleto';
import { isToothBlockedByAbsence } from '../../../core/domain/diagnostic/blockingRules';
import type { DiagnosticoEntry } from '../../../core/types/odontograma.types';
import { useNotification } from '../../../context/notifications/NotificationContext';


// ============================================================================
// INTERFACES
// ============================================================================

interface UseDiagnosticoPanelManagerProps {
  selectedTooth: string | null;
  odontogramaDataHook: any;
  pacienteActivoId?: IPaciente;
  onRootGroupChange?: (group: string | null) => void;
  onCompleteSave?: (snapshotId: string) => Promise<void>;
}

// ============================================================================
// HOOK PRINCIPAL: useDiagnosticoPanelManager
// ============================================================================

export const useDiagnosticoPanelManager = ({
  selectedTooth,
  odontogramaDataHook,
  onRootGroupChange,
  onCompleteSave,
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
  // HOOK DE NOTIFICACIONES DEL SISTEMA
  // ============================================================================
  const { notify } = useNotification();
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  const [showDiagnosticoSelect, setShowDiagnosticoSelect] = useState(false);
  const [currentArea, setCurrentArea] = useState<PrincipalArea>(null);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [currentRootGroup, setCurrentRootGroup] = useState<string | null>(null);
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
  //=============================================================================

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

    if (selectedSurfaces.length === 0) {
      return;
    }

    const hasCorona = selectedSurfaces.some(s => s.startsWith('cara_'));
    const hasRaiz = selectedSurfaces.some(s => s.startsWith('raiz:'));

    console.log('[Manager] Area detection:', { hasCorona, hasRaiz });

    if (hasCorona && !hasRaiz) {
      setCurrentArea('corona');
    } else if (hasRaiz && !hasCorona) {
      setCurrentArea('raiz');
    } else if (hasCorona && hasRaiz) {
      setCurrentArea('corona');
    }
  }, [selectedSurfaces]);

  // ============================================================================
  // HANDLERS: Gestión de Diagnóstico
  // ============================================================================

  const handleAddDiagnostico = useCallback(() => {
    if (!selectedTooth) {
      notify({ 
        type: 'warning',
        title: 'Selección requerida',
        message: 'Debes seleccionar un diente primero',
      });
      return;
    }

    if (isBlocked) {
      notify({ 
        type: 'error',
        title: 'Diente bloqueado',
        message: 'Este diente está marcado como ausente o perdido',
      });
      return;
    }

    setShowDiagnosticoSelect(true);
  }, [selectedTooth, isBlocked, notify]);

  const handleCancelDiagnostico = useCallback(() => {
    setShowDiagnosticoSelect(false);
    setCurrentArea(null);
    setSelectedSurfaces([]);
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
        notify({
          type: 'error',
          title: 'Error',
          message: 'No hay diente seleccionado',
        });
        return;
      }

      try {
        const toothData = odontogramaData[selectedTooth];
        const hasAbsence =
          toothData &&
          isToothBlockedByAbsence(
            Object.values(toothData).flat() as DiagnosticoEntry[]
          );

        let surfacesToApply: string[] = [];

        // Solo se considera diagnóstico de diente completo
        // cuando las áreas son EXACTAMENTE ['general']
        const isPureToothLevel =
          areas.length === 1 && areas.includes('general');

        if (isPureToothLevel) {
          surfacesToApply = ['general'];
        } else {
          if (selectedSurfaces.length === 0) {
            notify({
              type: 'warning',
              title: 'Selección requerida',
              message: 'Debes seleccionar al menos una superficie',
            });
            return;
          }

          const requiresCorona = areas.includes('corona');
          const requiresRaiz = areas.includes('raiz');
          const hasCoronaSurface = selectedSurfaces.some(s =>
            s.startsWith('cara')
          );
          const hasRaizSurface = selectedSurfaces.some(s =>
            s.startsWith('raiz')
          );

          if (requiresCorona && !hasCoronaSurface) {
            notify({ 
              type: 'warning',
              title: 'Área requerida',
              message:
                'Este diagnóstico requiere seleccionar superficies de corona',
            });
            return;
          }

          if (requiresRaiz && !hasRaizSurface) {
            notify({
              type: 'warning',
              title: 'Área requerida',
              message:
                'Este diagnóstico requiere seleccionar superficies de raíz',
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
          notify({
            type: 'info',
            title: 'Diagnóstico de ausencia eliminado',
            message: `Pieza ${toothInfo?.numero}: El estado de "ausente" fue removido automáticamente.`,
            duration: 6000,
          });
        } else {
          notify({ 
            type: 'success',
            title: 'Diagnóstico aplicado',
            message: `Pieza ${toothInfo?.numero} actualizada correctamente.`,
          });
        }

        handleCancelDiagnostico();
      } catch (error) {
        console.error(
          '[DiagnosticoPanelManager] Error al aplicar diagnóstico:',
          error
        );
        notify({ 
          type: 'error',
          title: 'Error al aplicar',
          message:
            error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    },
    [
      selectedTooth,
      selectedSurfaces,
      toothInfo,
      odontogramaData,
      notify,
      handleCancelDiagnostico,
      applyDiagnostico,
    ]
  );

  const handleRemoveDiagnostico = useCallback(
    (id: string, superficieId: string) => {
      if (!selectedTooth) {
        notify({
          type: 'error',
          title: 'Error',
          message: 'No hay diente seleccionado',
        });
        return;
      }

      try {
        removeDiagnostico(selectedTooth, superficieId, id);
        notify({ 
          type: 'success',
          title: 'Diagnóstico eliminado',
          message: 'El diagnóstico ha sido eliminado correctamente',
        });
      } catch (error) {
        console.error('[DiagnosticoPanelManager] Error al eliminar diagnóstico:', error);
        notify({ 
          type: 'error',
          title: 'Error al eliminar',
          message: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    },
    [selectedTooth, removeDiagnostico, notify]
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
      notify({ 
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

      console.log('[SAVE] Resultado del guardado:', resultado);

      // VERIFICAR SI HUBO CAMBIOS REALES
      if (resultado.diagnosticos_guardados === 0) {
        // Mostrar notificación informativa cuando NO hay cambios
        notify({ 
          type: 'info',
          title: 'Sin cambios',
          message: 'El odontograma ya está actualizado. No se detectaron cambios nuevos.',
          duration: 3000,
        });
        
        // Solo notificar si hay errores
        if (resultado.errores && resultado.errores.length > 0) {
          resultado.errores.forEach((error) => {
            notify({ // 👈 Usar notify del sistema
              type: 'warning',
              title: 'Advertencia',
              message: error,
              duration: 3000,
            });
          });
        }
        
        // IMPORTANTE: Retornar para no mostrar notificación de éxito
        return resultado;
      }

      // Si hubo cambios reales, mostrar notificación de éxito
      notify({ // 👈 Usar notify del sistema
        type: 'success',
        title: 'Guardado exitoso',
        message: `${resultado.diagnosticos_guardados} diagnósticos guardados en ${resultado.dientes_procesados.length} dientes`,
        duration: 3000,
      });

      const snapshotId = resultado.snapshot_id;

      if (snapshotId && onCompleteSave) {
        await onCompleteSave(snapshotId);
      }
      
      // Advertencias si existen
      if (resultado.errores && resultado.errores.length > 0) {
        resultado.errores.forEach((error) => {
          notify({
            type: 'warning',
            title: 'Advertencia',
            message: error,
            duration: 3000,
          });
        });
      }

      return resultado;
      
    } catch (error) {
      console.error('[SAVE] Error al guardar:', error);

      notify({ 
        type: 'error',
        title: 'Error al guardar',
        message: error instanceof Error ? error.message : 'Error desconocido',
        duration: 3000,
      });
      
      throw error; 
    }
  }, [odontogramaDataHook, guardarCompleto, hasPacienteActivo, notify, onCompleteSave, odontogramaData]);

  const handleClearAll = useCallback(() => {
    if (!selectedTooth) {
      notify({
        type: 'warning',
        title: 'Selección requerida',
        message: 'Debes seleccionar un diente primero',
      });
      return;
    }

    if (diagnosticos.length === 0) {
      notify({
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

      notify({ // 👈 Usar notify del sistema
        type: 'success',
        title: 'Limpieza completa',
        message: `Se eliminaron ${diagnosticos.length} diagnósticos del diente ${toothInfo?.numero || ''}`,
      });
    } catch (error) {
      console.error('[DiagnosticoPanelManager] Error al limpiar diagnósticos:', error);
      notify({ // 👈 Usar notify del sistema
        type: 'error',
        title: 'Error al limpiar',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [selectedTooth, diagnosticos, toothInfo, removeDiagnostico, notify]);

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
  };
};