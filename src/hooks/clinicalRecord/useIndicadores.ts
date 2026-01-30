// src/hooks/clinicalRecord/useIndicadores.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { indicadoresSaludBucalService } from "../../services/clinicalRecord/indicadoresService";
import { clinicalRecordKeys } from "./useClinicalRecords";

export const indicadoresKeys = {
  all: ["indicadores-salud-bucal"] as const,
  byPaciente: (pacienteId: string) => 
    [...indicadoresKeys.all, "paciente", pacienteId] as const,
  byHistorial: (historialId: string) => 
    [...indicadoresKeys.all, "historial", historialId] as const,
  latest: (pacienteId: string) => 
    [...indicadoresKeys.byPaciente(pacienteId), "latest"] as const,
};

/**
 * Hook para obtener los últimos indicadores de un paciente
 */
export function useLatestIndicadores(pacienteId: string | null) {
  return useQuery({
    queryKey: indicadoresKeys.latest(pacienteId!),
    queryFn: () => indicadoresSaludBucalService.getLatestByPaciente(pacienteId!),
    enabled: !!pacienteId,
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para recargar indicadores (mutation)
 */
export function useRecargarIndicadores(pacienteId: string) {
  const queryClient = useQueryClient();
  
  return {
    recargar: async () => {
      const data = await indicadoresSaludBucalService.recargarIndicadores(pacienteId);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: indicadoresKeys.byPaciente(pacienteId) });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.initialData(pacienteId) });
      
      return data;
    },
  };
}

/**
 * Hook para obtener indicadores por historial
 */
export function useIndicadoresByHistorial(historialId: string | null) {
  return useQuery({
    queryKey: indicadoresKeys.byHistorial(historialId!),
    queryFn: () => indicadoresSaludBucalService.getByHistorial(historialId!),
    enabled: !!historialId,
  });
}