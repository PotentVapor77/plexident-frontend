import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { indicesCariesService } from "../../services/clinicalRecord/indicesCariesService";
import type { 
  IndicesCariesData, 
  LatestIndicesCariesResponse 
} from "../../types/clinicalRecords/typeBackendClinicalRecord";

// Query Keys
export const indicesCariesKeys = {
  all: ["indices-caries"] as const,
  byPaciente: (pacienteId: string) => 
    [...indicesCariesKeys.all, "paciente", pacienteId] as const,
  byHistorial: (historialId: string) =>
    [...indicesCariesKeys.all, "historial", historialId] as const,
};

/**
 * Hook para obtener últimos índices de un paciente
 */
export function useLatestIndicesCaries(pacienteId: string | null) {
  return useQuery<LatestIndicesCariesResponse>({
    queryKey: pacienteId ? indicesCariesKeys.byPaciente(pacienteId) : ["no-patient"],
    queryFn: () => indicesCariesService.getLatestByPaciente(pacienteId!),
    enabled: !!pacienteId,
    staleTime: 30000, // 30 segundos
    retry: 2,
  });
}

/**
 * Hook para obtener índices de un historial específico
 */
export function useIndicesCariesByHistorial(historialId: string | null) {
  return useQuery<IndicesCariesData | null>({
    queryKey: historialId ? indicesCariesKeys.byHistorial(historialId) : ["no-historial"],
    queryFn: () => indicesCariesService.getByHistorial(historialId!),
    enabled: !!historialId,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook para guardar índices en un historial
 */
export function useSaveIndicesCaries(historialId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (indicesData: Partial<IndicesCariesData>) =>
      indicesCariesService.saveToHistorial(historialId, indicesData),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: indicesCariesKeys.byHistorial(historialId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["clinical-records", "detail", historialId] 
      });
    },
  });
}

/**
 * Hook para actualizar índices de un historial
 */
export function useUpdateIndicesCaries(historialId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (indicesData: Partial<IndicesCariesData>) =>
      indicesCariesService.updateInHistorial(historialId, indicesData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: indicesCariesKeys.byHistorial(historialId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["clinical-records", "detail", historialId] 
      });
    },
  });
}