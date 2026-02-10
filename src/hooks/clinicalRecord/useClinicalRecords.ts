// src/hooks/clinicalRecord/useClinicalRecords.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clinicalRecordService from "../../services/clinicalRecord/clinicalRecordService";
import type { ApiListWrapper, ClinicalRecordClosePayload, ClinicalRecordCreatePayload, ClinicalRecordListResponse, ClinicalRecordReopenPayload, ClinicalRecordUpdatePayload } from "../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * ============================================================================
 * HOOKS - CLINICAL RECORDS
 * ============================================================================
 */

// Query Keys
export const clinicalRecordKeys = {
  all: ["clinical-records"] as const,
  lists: () => [...clinicalRecordKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...clinicalRecordKeys.lists(), filters] as const,
  details: () => [...clinicalRecordKeys.all, "detail"] as const,
  detail: (id: string) => [...clinicalRecordKeys.details(), id] as const,
  byPaciente: (pacienteId: string) =>
    [...clinicalRecordKeys.all, "by-paciente", pacienteId] as const,
  initialData: (pacienteId: string) =>
    [...clinicalRecordKeys.all, "initial-data", pacienteId] as const,
};
export interface ClinicalRecordSearchParams {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: string;
  paciente?: string;
  odontologo_responsable?: string;
  activo?: boolean;
  fecha_desde?: string; 
  fecha_hasta?: string; 
}
/**
 * Hook para obtener la lista de historiales clínicos
 */
export function useClinicalRecords(params: ClinicalRecordSearchParams) {
  const queryResult = useQuery({
    queryKey: clinicalRecordKeys.list(params),
    queryFn: () => clinicalRecordService.getAll(params),
    staleTime: 30000, // 30 segundos
    placeholderData: (previousData) => previousData,
  });

  return {
    historiales: queryResult.data?.results || [],
    pagination: {
      count: queryResult.data?.count || 0,
      page: queryResult.data?.current_page || params.page || 1,
      total_pages: queryResult.data?.total_pages || 1,
      has_next: !!queryResult.data?.next,
      has_previous: !!queryResult.data?.previous,
      page_size: queryResult.data?.page_size || params.page_size || 35, 
    },
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching, 
    isError: queryResult.isError,
    error: queryResult.error?.message || null,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook para obtener un historial clínico específico
 */
export function useClinicalRecord(id: string | null) {
  return useQuery({
    queryKey: clinicalRecordKeys.detail(id!),
    queryFn: () => clinicalRecordService.getById(id!),
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener historiales de un paciente
 */
export function useClinicalRecordsByPaciente(pacienteId: string | null) {
  const queryResult = useQuery<ApiListWrapper<ClinicalRecordListResponse[]>>({
    queryKey: clinicalRecordKeys.byPaciente(pacienteId!),
    queryFn: () => clinicalRecordService.getByPaciente(pacienteId!),
    enabled: !!pacienteId,
    staleTime: 30000,
  });

  return {
    historiales: queryResult.data?.data || [], 
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error?.message || null,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook para obtener datos iniciales de un paciente
 */
export function useClinicalRecordInitialData(pacienteId: string | null) {
  return useQuery({
    queryKey: clinicalRecordKeys.initialData(pacienteId!),
    queryFn: async () => {
      const data = await clinicalRecordService.getInitialData(pacienteId!);
      console.log("[HC][initialData] respuesta completa:", data);
      return data;
    },
    enabled: !!pacienteId,
    staleTime: 0, // Fresco como lechuga 
  });
}

/**
 * Hook para crear un historial clínico
 */
export function useCreateClinicalRecord(pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicalRecordCreatePayload) =>
      clinicalRecordService.create(payload),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId)
        });
      }
    },
  });
}

/**
 * Hook para actualizar un historial clínico
 */
export function useUpdateClinicalRecord(id: string, pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicalRecordUpdatePayload) =>
      clinicalRecordService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId)
        });
      }
    },
  });
}

/**
 * Hook para cerrar un historial clínico
 */
export function useCloseClinicalRecord(id: string, pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: ClinicalRecordClosePayload) =>
      clinicalRecordService.close(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId)
        });
      }
    },
  });
}

/**
 * Hook para reabrir un historial cerrado
 */
export function useReopenClinicalRecord(id: string, pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicalRecordReopenPayload) =>
      clinicalRecordService.reopen(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId)
        });
      }
    },
  });
}

/**
 * Hook para eliminar un historial clínico
 */
export function useDeleteClinicalRecord(pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicalRecordService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId)
        });
      }
    },
  });
}

export function usePlanTratamientoByHistorial(historialId: string | null) {
  return useQuery({
    queryKey: [...clinicalRecordKeys.detail(historialId!), 'plan-tratamiento'],
    queryFn: () => clinicalRecordService.getPlanTratamientoByHistorial(historialId!),
    enabled: !!historialId,
    staleTime: 60000,
  });
}

/**
 * Hook para obtener sesiones del plan
 */
export function useSesionesByHistorial(historialId: string | null) {
  return useQuery({
    queryKey: [...clinicalRecordKeys.detail(historialId!), 'sesiones-plan-tratamiento'],
    queryFn: () => clinicalRecordService.getSesionesByHistorial(historialId!),
    enabled: !!historialId,
    staleTime: 60000,
  });
}

/**
 * Hook para obtener planes activos del paciente
 */
export function usePlanesTratamientoPaciente(pacienteId: string | null) {
  return useQuery({
    queryKey: [...clinicalRecordKeys.all, 'planes-paciente', pacienteId!],
    queryFn: () => clinicalRecordService.getPlanesTratamientoPaciente(pacienteId!),
    enabled: !!pacienteId,
    staleTime: 30000,
  });
}

/**
 * Hook para obtener plan de tratamiento y sus sesiones
 */
export function usePlanTratamientoCompleto(historialId: string | null) {
  const queryPlan = usePlanTratamientoByHistorial(historialId);
  const querySesiones = useSesionesByHistorial(historialId);
  
  return {
    plan: queryPlan.data,
    sesiones: querySesiones.data,
    isLoading: queryPlan.isLoading || querySesiones.isLoading,
    isError: queryPlan.isError || querySesiones.isError,
    refetch: () => {
      queryPlan.refetch();
      querySesiones.refetch();
    }
  };
}

/**
 * Hook para obtener historial con plan de tratamiento completo
 */
export function useClinicalRecordCompleto(id: string | null) {
  const queryHistorial = useClinicalRecord(id);
  const queryPlanCompleto = usePlanTratamientoCompleto(id);
  
  return {
    historial: queryHistorial.data,
    plan: queryPlanCompleto.plan,
    sesiones: queryPlanCompleto.sesiones,
    isLoading: queryHistorial.isLoading || queryPlanCompleto.isLoading,
    isError: queryHistorial.isError || queryPlanCompleto.isError,
    refetch: () => {
      queryHistorial.refetch();
      queryPlanCompleto.refetch();
    }
  };
}

