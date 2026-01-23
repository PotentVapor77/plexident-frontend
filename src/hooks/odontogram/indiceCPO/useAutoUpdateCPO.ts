// src/hooks/odontogram/useAutoUpdateCPO.ts (CORREGIDO)
import { useState, useEffect, useCallback, useRef } from 'react';
import type { OdontogramaData } from '../../../components/odontogram';
import { CPOService, type CPOIndices } from '../../../services/odontogram/cpoService';

export const useAutoUpdateCPO = (
  odontogramaData: OdontogramaData,
  categorias: any[] | null
) => {
  const [indices, setIndices] = useState<CPOIndices>({ C: 0, P: 0, O: 0, total: 0 });
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const prevDataHashRef = useRef<string>('');

  // Función para calcular índices
  const calculateIndices = useCallback(() => {
    if (!categorias || !odontogramaData || Object.keys(odontogramaData).length === 0) {
      setIndices({ C: 0, P: 0, O: 0, total: 0 });
      return;
    }

    // Crear hash de los datos
    const dataHash = JSON.stringify({
      data: odontogramaData,
      catsLength: categorias.length
    });
    
    // Solo recalcular si los datos realmente cambiaron
    if (dataHash === prevDataHashRef.current) {
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Usar requestAnimationFrame para no bloquear el UI
      const timer = setTimeout(() => {
        const newIndices = CPOService.calculateLocalIndices(odontogramaData, categorias);
        setIndices(newIndices);
        setLastUpdate(new Date());
        prevDataHashRef.current = dataHash;
        setIsCalculating(false);
      }, 100); // Aumentado ligeramente para mejor performance

      return () => clearTimeout(timer);
    } catch (err: any) {
      console.error('Error calculando índices CPO:', err);
      setError(err.message || 'Error calculando índices');
      setIsCalculating(false);
    }
  }, [odontogramaData, categorias]); 

  // Calcular automáticamente cuando cambian los datos
  useEffect(() => {
    const cleanup = calculateIndices();
    return () => {
      if (cleanup) cleanup();
    };
  }, [calculateIndices]);

  return {
    indices,
    isCalculating,
    lastUpdate,
    error,
    refresh: () => {
      prevDataHashRef.current = ''; // Forzar recálculo
      calculateIndices();
    },
  };
};