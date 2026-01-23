// src/hooks/odontogram/useCPOIndicesManager.ts (SIMPLIFICADO)
import { useState, useCallback, useEffect } from 'react';
import { useAutoUpdateCPO } from './useAutoUpdateCPO';
import type { OdontogramaData } from '../../../components/odontogram';
import { CPOService, type CPOIndices } from '../../../services/odontogram/cpoService';
import { useCatalogoDiagnosticos } from '../useCatalogoDiagnosticos';

export const useCPOIndicesManager = (
  pacienteId: string | null,
  odontogramaData: OdontogramaData
) => {
  const [savedIndices, setSavedIndices] = useState<CPOIndices | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  
  const { categorias } = useCatalogoDiagnosticos();
  
  // Usar el hook de auto-update simplificado
  const {
    indices: calculatedIndices,
    isCalculating,
    lastUpdate,
    error: calculationError,
    refresh: refreshCalculation,
  } = useAutoUpdateCPO(odontogramaData, categorias || []);

  // Cargar índices guardados del servidor
  const fetchSavedIndices = useCallback(async () => {
    if (!pacienteId) {
      setSavedIndices(null);
      return;
    }

    setLoadingSaved(true);
    setSavedError(null);

    try {
      const indices = await CPOService.getIndices(pacienteId);
      setSavedIndices(indices);
    } catch (err: any) {
      console.error('Error cargando índices CPO guardados:', err);
      setSavedError(err.message || 'Error al cargar índices guardados');
      setSavedIndices(null);
    } finally {
      setLoadingSaved(false);
    }
  }, [pacienteId]);

  // Cargar automáticamente cuando cambia el paciente
  useEffect(() => {
    fetchSavedIndices();
  }, [fetchSavedIndices]);

  // Determinar si hay cambios
  const hasChanges = savedIndices ? (
    calculatedIndices.C !== savedIndices.C ||
    calculatedIndices.P !== savedIndices.P ||
    calculatedIndices.O !== savedIndices.O ||
    calculatedIndices.total !== savedIndices.total
  ) : false;

  // Índices a mostrar
  const displayIndices = !hasChanges && savedIndices ? savedIndices : calculatedIndices;
  const isSaved = !hasChanges && savedIndices;
  const isCalculated = hasChanges && savedIndices;

  return {
    // Estados
    savedIndices,
    calculatedIndices,
    displayIndices,
    loadingSaved,
    isCalculating,
    lastUpdate,
    errors: {
      saved: savedError,
      calculation: calculationError,
    },

    // Estados derivados
    hasChanges,
    isSaved,
    isCalculated,

    // Funciones
    fetchSavedIndices,
    refreshCalculation,
    refreshAll: async () => {
      await fetchSavedIndices();
      refreshCalculation();
    },
  };
};