// src/hooks/clinicalRecord/usePlanTratamientoManagement.ts
import { useState, useCallback } from 'react';
import { 
  usePlanTratamientoByHistorial, 
  usePlanesTratamientoPaciente,
  useSesionesByHistorial ,
  
} from './useClinicalRecords';
import { useAsociarPlanTratamiento, useDesasociarPlanTratamiento } from './usePlanTratamientoMutations';

export const usePlanTratamientoManagement = (
  historialId: string | null,
  pacienteId: string | null,
  historialEstado: 'BORRADOR' | 'ABIERTO' | 'CERRADO',

) => {
  const [mostrarSelectorPlanes, setMostrarSelectorPlanes] = useState(false);
  
  // Queries
  const {
    data: planActual,
    isLoading: cargandoPlan,
  } = usePlanTratamientoByHistorial(historialId);
  
  const {
    data: planesDisponibles = [],
    isLoading: cargandoPlanes,
    refetch: refetchPlanes
  } = usePlanesTratamientoPaciente(pacienteId);
  
  const {
    data: sesiones = [],
    isLoading: cargandoSesiones
  } = useSesionesByHistorial(historialId);
  
  // Mutations
  const asociarMutation = useAsociarPlanTratamiento(historialId!);
  const desasociarMutation = useDesasociarPlanTratamiento(historialId!);
  
  // Funciones
  const handleRecargarPlanes = useCallback(() => {
    if (historialEstado === 'BORRADOR' && pacienteId) {
      refetchPlanes();
      setMostrarSelectorPlanes(true);
    }
  }, [historialEstado, pacienteId, refetchPlanes]);
  
  const handleAsociarPlan = useCallback(async (planId: string) => {
    if (historialId && historialEstado !== 'CERRADO') {
      await asociarMutation.mutateAsync(planId);
      setMostrarSelectorPlanes(false);
    }
  }, [historialId, historialEstado, asociarMutation]);
  
  const handleDesasociarPlan = useCallback(async () => {
    if (historialId && historialEstado !== 'CERRADO') {
      await desasociarMutation.mutateAsync();
    }
  }, [historialId, historialEstado, desasociarMutation]);
  
  return {
    // Estado
    planActual,
    planesDisponibles,
    sesiones,
    mostrarSelectorPlanes,
    cargandoPlan,
    cargandoPlanes,
    cargandoSesiones,
    
    // Funciones
    handleRecargarPlanes,
    handleAsociarPlan,
    handleDesasociarPlan,
    setMostrarSelectorPlanes,
    
    // Estados de mutaciones
    asociando: asociarMutation.isPending,
    desasociando: desasociarMutation.isPending,
    
    // Control de UI
    puedeModificar: historialEstado !== 'CERRADO',
    puedeRecargar: historialEstado === 'BORRADOR' && !!pacienteId,
    tienePlan: !!planActual,
    tienePlanesDisponibles: planesDisponibles.length > 0,
  };
};