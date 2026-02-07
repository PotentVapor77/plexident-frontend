// src/hooks/clinicalRecord/usePlanTratamientoMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clinicalRecordService from "../../services/clinicalRecord/clinicalRecordService";
import { clinicalRecordKeys } from "./useClinicalRecords";

/**
 * Hook para asociar plan de tratamiento a un historial
 */
export function useAsociarPlanTratamiento(historialId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (planId: string) => 
      clinicalRecordService.asociarPlanTratamiento(historialId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: clinicalRecordKeys.detail(historialId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...clinicalRecordKeys.detail(historialId), 'plan-tratamiento'] 
      });
    },
  });
}

/**
 * Hook para desasociar plan de tratamiento de un historial
 */
export function useDesasociarPlanTratamiento(historialId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => 
      clinicalRecordService.desasociarPlanTratamiento(historialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: clinicalRecordKeys.detail(historialId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...clinicalRecordKeys.detail(historialId), 'plan-tratamiento'] 
      });
    },
  });
}