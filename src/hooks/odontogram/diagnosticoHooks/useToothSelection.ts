// src/hooks/odontogram/diagnosticoHooks/useToothSelection.ts

import { useMemo } from 'react';
import type { DiagnosticoEntry, OdontogramaData } from '../../../core/types/odontograma.types';
import type { ToothInfo, UseToothSelectionReturn } from '../../../core/types/diagnostic.types';
import { getToothTranslationByFdi } from '../../../core/utils/toothTraslations';
import { isToothBlockedByAbsence } from '../../../core/domain/diagnostic/blockingRules';
import { groupDiagnostics } from '../../../core/utils/groupDiagnostics';


// ============================================================================
// INTERFACES
// ============================================================================

interface UseToothSelectionProps {
  selectedTooth: string | null;
  odontogramaData: OdontogramaData;
  currentRootGroup?: string | null;
}

// ============================================================================
// HOOK: useToothSelection
// ============================================================================

export const useToothSelection = ({
  selectedTooth,
  odontogramaData,
  currentRootGroup,
}: UseToothSelectionProps): UseToothSelectionReturn => {

  // ============================================================================
  // INFORMACIÓN DEL DIENTE
  // ============================================================================

  const toothInfo = useMemo((): ToothInfo | null => {
    if (!selectedTooth) return null;

    const translation = getToothTranslationByFdi(selectedTooth);

    return {
      numero: translation.numero,
      nombre: translation.nombre,
      fdi: String(translation.numero),
    };
  }, [selectedTooth]);

  // ============================================================================
  // ESTADO DE BLOQUEO
  // ============================================================================

  const isBlocked = useMemo((): boolean => {
    if (!selectedTooth || !odontogramaData[selectedTooth]) {
      return false;
    }

    const toothData = odontogramaData[selectedTooth];
    const allDiagnoses = Object.values(toothData).flat() as DiagnosticoEntry[];

    return isToothBlockedByAbsence(allDiagnoses);
  }, [selectedTooth, odontogramaData]);

  // ============================================================================
  // DIAGNÓSTICOS DEL DIENTE
  // ============================================================================

  /**
   * Obtener y agrupar diagnósticos aplicados al diente seleccionado
   */
  const diagnosticos = useMemo(() => {
    if (!selectedTooth || !odontogramaData[selectedTooth]) {
      return [];
    }

    const toothData = odontogramaData[selectedTooth];

    // 1. Recopilar todos los diagnósticos del diente
    const allDiagnoses: Array<DiagnosticoEntry & { superficieId: string }> = [];

    Object.entries(toothData).forEach(([surfaceId, entries]) => {
      (entries as DiagnosticoEntry[]).forEach((entry) => {
        allDiagnoses.push({
          ...entry,
          superficieId: surfaceId,
        });
      });
    });

    // 2. Si no hay diagnósticos, retornar array vacío
    if (allDiagnoses.length === 0) {
      return [];
    }
    console.log('[useToothSelection] Calling groupDiagnostics with rootType:', currentRootGroup);
    // 3. Agrupar diagnósticos idénticos por superficie
    const grouped = groupDiagnostics(allDiagnoses, currentRootGroup);

    // 4. Ordenar por prioridad (ALTA -> INFORMATIVA)
    const priorityOrder: Record<string, number> = {
      ALTA: 5,
      ESTRUCTURAL: 4,
      MEDIA: 3,
      BAJA: 2,
      INFORMATIVA: 1,
    };

    return grouped.sort((a, b) => {
      const priorityA = priorityOrder[a.prioridadKey] || 999;
      const priorityB = priorityOrder[b.prioridadKey] || 999;
      return priorityA - priorityB;
    });
  }, [selectedTooth, odontogramaData, currentRootGroup]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    toothInfo,
    isBlocked,
    diagnosticos,
  };
};
