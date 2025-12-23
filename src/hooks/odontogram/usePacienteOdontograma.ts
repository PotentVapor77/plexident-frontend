// src/hooks/odontogram/usePacienteOdontograma.ts
import { useState, useEffect } from 'react';
import { usePacienteActivo } from '../../context/PacienteContext';

import { mapearOdontogramaBackendToFrontend } from '../../mappers/odontogramaMapper';
import type { OdontogramaData } from '../../core/types/typeOdontograma';
import { obtenerOdontogramaPaciente } from '../../services/odontogram/odontogramaService';

export const usePacienteOdontograma = () => {
  const { pacienteActivo, setPacienteActivo } = usePacienteActivo();
  const [isLoading, setIsLoading] = useState(false);
  const [odontogramaData, setOdontogramaData] = useState<OdontogramaData>({});
  const [error, setError] = useState<string | null>(null);

  // Cargar odontograma cuando cambia el paciente
  useEffect(() => {
    if (!pacienteActivo?.id) {
      setOdontogramaData({});
      setError(null);
      return;
    }

    const loadOdontograma = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtener odontograma del backend
        const backendData = await obtenerOdontogramaPaciente(pacienteActivo.id);
        
        // ✅ Usar tu mapper existente para convertir al formato del frontend
        const frontendData = mapearOdontogramaBackendToFrontend(backendData);
        
        setOdontogramaData(frontendData);
        
        console.log('✅ Odontograma cargado:', {
          paciente: pacienteActivo.nombres,
          totalDientes: Object.keys(frontendData).length,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar odontograma';
        setError(errorMsg);
        console.error('❌ Error cargando odontograma:', err);
        setOdontogramaData({});
      } finally {
        setIsLoading(false);
      }
    };

    loadOdontograma();
  }, [pacienteActivo?.id]);

  return {
    pacienteActivo,
    setPacienteActivo,
    odontogramaData,
    setOdontogramaData,
    isLoading,
    error,
    hasPaciente: !!pacienteActivo,
  };
};
