// src/core/hooks/useDiagnosticosCIE.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  SincronizarDiagnosticosPayload,
  DiagnosticoCIEUpdatePayload,
} from "../../types/clinicalRecords/typeBackendClinicalRecord";
import clinicalRecordService from "../../services/clinicalRecord/clinicalRecordService";
import diagnosticosCieService from "../../services/clinicalRecord/diagnosticosCieService";

export const diagnosticosCIEKeys = {
  all: ["diagnosticos-cie"] as const,
  byPaciente: (pacienteId: string) =>
    ["diagnosticos-cie", "by-paciente", pacienteId] as const,
  getAvailable: (pacienteId: string, tipo_carga: "nuevos" | "todos") =>
    ["diagnosticos-cie", "available", pacienteId, tipo_carga] as const,
  byRecord: (historialId: string) =>
    ["diagnosticos-cie", "by-record", historialId] as const,
};

/**
 * Hook para obtener diagnósticos CIE disponibles para un paciente
 */
export function useDiagnosticosCIEAvailable(
    pacienteId: string | null,
    tipocarga: "nuevos" | "todos" = "nuevos", 
) {
    return useQuery({
        queryKey: diagnosticosCIEKeys.getAvailable(pacienteId!, tipocarga),
        queryFn: () => diagnosticosCieService.getAvailable(pacienteId!, tipocarga),
        enabled: !!pacienteId,
        staleTime: 30000,
    });
}

/**
 * Hook para obtener diagnósticos CIE de un historial específico
 */
export function useDiagnosticosCIEByRecord(historialId: string | null) {
  return useQuery({
    queryKey: diagnosticosCIEKeys.byRecord(historialId!),
    queryFn: async () => {
      if (!historialId) throw new Error("Historial ID requerido");
      
      try {
        // Llamar directamente al servicio
        const response = await clinicalRecordService.getDiagnosticsByRecord(historialId);
        return response;
      } catch (error: any) {
        console.log('[useDiagnosticosCIEByRecord] Error obteniendo diagnósticos:', {
          status: error.response?.status,
          message: error.message
        });

        // Si es 404, devolver estructura vacía
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Este historial no tiene diagnósticos CIE-10 cargados',
            disponible: false,
            tipo_carga: null,
            total_diagnosticos: 0,
            diagnosticos: [],
          };
        }
        
        // Para otros errores, relanzar
        throw error;
      }
    },
    enabled: !!historialId,
    staleTime: 30000,
  });
}
/**
 * Hook para cargar diagnósticos CIE a un historial (reemplaza todos)
 */
export function useLoadDiagnosticosCIEToRecord(historialId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { 
      tipocarga: "nuevos" | "todos"; 
      diagnosticos: Array<{ 
        diagnostico_dental_id: string; 
        tipo_cie?: "PRE" | "DEF" 
      }> 
    }) =>
      diagnosticosCieService.loadToRecord(historialId, payload), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.all });
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.byRecord(historialId) });
    },
  });
}

/**
 * Hook para eliminar TODOS los diagnósticos CIE de un historial
 */
export function useDeleteAllDiagnosticosCIEFromRecord(historialId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      clinicalRecordService.deleteAllDiagnosticsFromRecord(historialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.byRecord(historialId) });
    },
  });
}

/**
 * Hook para eliminar un diagnóstico CIE individual
 */
export function useDeleteDiagnosticoCIEIndividual(historialId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (diagnosticoId: string) =>
      clinicalRecordService.deleteDiagnosticIndividual(historialId, diagnosticoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.byRecord(historialId) });
    },
  });
}

/**
 * Hook para actualizar tipo CIE (PRE/DEF) de un diagnóstico individual
 */
export function useUpdateDiagnosticoCIEType(historialId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { diagnosticoId: string; payload: DiagnosticoCIEUpdatePayload }) =>
      clinicalRecordService.updateDiagnosticType(historialId, params.diagnosticoId, params.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.byRecord(historialId) });
    },
  });
}

/**
 * Hook para sincronizar diagnósticos CIE (mantener solo los especificados)
 */
export function useSyncDiagnosticosCIEInRecord(historialId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SincronizarDiagnosticosPayload) =>
      clinicalRecordService.syncDiagnosticsInRecord(historialId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosCIEKeys.byRecord(historialId) });
    },
  });
}

/**
 * Hook para obtener y gestionar diagnósticos CIE (hook compuesto)
 */
export function useDiagnosticosCIEManager(historialId: string | null, pacienteId?: string | null) {
  const disponibleQuery = useDiagnosticosCIEAvailable(pacienteId || null);
  const enHistorialQuery = useDiagnosticosCIEByRecord(historialId);
  
  const loadMutation = useLoadDiagnosticosCIEToRecord(historialId!);
  const deleteAllMutation = useDeleteAllDiagnosticosCIEFromRecord(historialId!);
  const deleteIndividualMutation = useDeleteDiagnosticoCIEIndividual(historialId!);
  const updateTypeMutation = useUpdateDiagnosticoCIEType(historialId!);
  const syncMutation = useSyncDiagnosticosCIEInRecord(historialId!);

  return {
    // Queries
    diagnosticosDisponibles: disponibleQuery.data,
    diagnosticosEnHistorial: enHistorialQuery.data,
    isLoadingDisponibles: disponibleQuery.isLoading,
    isLoadingEnHistorial: enHistorialQuery.isLoading,
    
    // Mutations
    loadToRecord: loadMutation.mutateAsync,
    deleteAllFromRecord: deleteAllMutation.mutateAsync,
    deleteIndividual: deleteIndividualMutation.mutateAsync,
    updateType: updateTypeMutation.mutateAsync,
    syncInRecord: syncMutation.mutateAsync,
    
    // Estados de carga
    isAdding: loadMutation.isPending,
    isDeleting: deleteAllMutation.isPending,
    isUpdatingType: updateTypeMutation.isPending,
    isSyncing: syncMutation.isPending,
    
    // Refetch
    refetchDisponibles: disponibleQuery.refetch,
    refetchEnHistorial: enHistorialQuery.refetch,
  };
}

export default {
  useDiagnosticosCIEAvailable,
  useDiagnosticosCIEByRecord,
  useLoadDiagnosticosCIEToRecord,
  useDeleteAllDiagnosticosCIEFromRecord,
  useDeleteDiagnosticoCIEIndividual,
  useUpdateDiagnosticoCIEType,
  useSyncDiagnosticosCIEInRecord,
  useDiagnosticosCIEManager,
};