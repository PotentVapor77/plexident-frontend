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

/**
 * Hook para obtener la lista de historiales clínicos
 */
export function useClinicalRecords(params: {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: string;
  paciente?: string;
  odontologo_responsable?: string;
  activo?: boolean;
}) {
  const queryResult = useQuery({
    queryKey: clinicalRecordKeys.list(params),
    queryFn: () => clinicalRecordService.getAll(params),
    staleTime: 30000, // 30 segundos
  });

  return {
    historiales: queryResult.data?.results || [],
    pagination: {
      count: queryResult.data?.count || 0,
      page: queryResult.data?.current_page || params.page || 1,
      total_pages: queryResult.data?.total_pages || 1,
      has_next: !!queryResult.data?.next,
      has_previous: !!queryResult.data?.previous,
    },
    isLoading: queryResult.isLoading,
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
    queryFn: () => clinicalRecordService.getInitialData(pacienteId!),
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