// src/hooks/odontogram/diagnosticoHooks/useToothSelection.ts

import { useMemo } from 'react';
import type { DiagnosticoEntry, OdontogramaData } from '../../../core/types/odontograma.types';
import type { ToothInfo, UseToothSelectionReturn } from '../../../core/types/diagnostic.types';
import { getToothTranslationByFdi } from '../../../core/utils/toothTraslations';
import { isToothBlockedByAbsence } from '../../../core/domain/diagnostic/blockingRules';
import { groupDiagnostics } from '../../../core/utils/groupDiagnostics';

// ============================================================================
// UTILIDADES: Mapeo FDI → rootType
// ============================================================================

/**
 * Determina el tipo de raíz basado en el número FDI del diente
 */
export const getRootTypeByFDI = (fdi: string): string => {
  const num = parseInt(fdi);
  if (!num) return 'raiz_dental';
  
  // Molares superiores (16-17, 26-27) → 3 raíces
  if ([16,17,26,27].includes(num)) return 'raiz_molar_superior';
  // Molares inferiores (36-37, 46-47) → 2 raíces
  if ([36,37,46,47].includes(num)) return 'raiz_molar_inferior';
  // Premolares (14-15, 24-25, 34-35, 44-45) → 2 raíces
  if ([14,15,24,25,34,35,44,45].includes(num)) return 'raiz_premolar';
  // Caninos (13,23,33,43) → 1 raíz
  if ([13,23,33,43].includes(num)) return 'raiz_canino';
  // Incisivos (11-12,21-22,31-32,41-42) → 1 raíz
  if ([11,12,21,22,31,32,41,42].includes(num)) return 'raiz_incisivo';
  
  // Dientes de leche u otros → raíz genérica
  return 'raiz_dental';
};

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
  // ROOT TYPE DINÁMICO (FIX para recarga)
  // ============================================================================
  
  /**
   * Prioridad: currentRootGroup (UI) > rootType del diente (automático) > fallback
   */
  const effectiveRootType = useMemo((): string | null => {
    // 1. Si hay selección manual en UI, usarla
    if (currentRootGroup) {
      return currentRootGroup;
    }
    
    // 2. Si hay diente seleccionado, usar tipo automático
    if (selectedTooth) {
      return getRootTypeByFDI(selectedTooth);
    }
    
    // 3. Fallback
    return null;
  }, [selectedTooth, currentRootGroup]);

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
    
    console.log('[useToothSelection] Calling groupDiagnostics with rootType:', effectiveRootType);
    
    // 3. Agrupar diagnósticos idénticos por superficie (USANDO rootType correcto)
    const grouped = groupDiagnostics(allDiagnoses, effectiveRootType);

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
  }, [selectedTooth, odontogramaData, effectiveRootType]); // ← effectiveRootType en dependencias

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    toothInfo,
    isBlocked,
    diagnosticos,
  };
};
