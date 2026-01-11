// src/hooks/odontogram/useTreatmentPlan.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentPlanService } from '../../services/treatmentPlan/treatmentPlanService';
import type {
  PlanTratamientoCreatePayload,
  PlanTratamientoUpdatePayload,
  PaginatedResponse,
} from '../../core/types/treatmentPlan.types';
import type {
  PlanTratamientoListResponse,
  PlanTratamientoDetailResponse,
  DiagnosticosDisponiblesResponse,
} from '../../types/treatmentPlan/typeBackendTreatmentPlan';

// ============================================================================
// QUERY KEYS
// ============================================================================

const planKeys = {
  all: ['planes-tratamiento'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (pacienteId: string | null, page: number, pageSize: number, search: string) =>
    [...planKeys.lists(), pacienteId || 'all', page, pageSize, search] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  diagnosticos: (id: string) => [...planKeys.detail(id), 'diagnosticos'] as const,
};

// ============================================================================
// HOOK PRINCIPAL: Listar Planes de Tratamiento
// ============================================================================

export const usePlanesTratamiento = (
  pacienteId: string | undefined | null,
  page: number = 1,
  pageSize: number = 10,
  search: string = ''
) => {
  console.log('[usePlanesTratamiento] Hook called with:', {
    pacienteId,
    page,
    pageSize,
    search,
  });
  const normalizedPacienteId = pacienteId ?? null;

  const query = useQuery<PaginatedResponse<PlanTratamientoListResponse>>({
    queryKey: planKeys.list(normalizedPacienteId, page, pageSize, search),
    queryFn: () =>
      treatmentPlanService.getPlanes({
        page,
        page_size: pageSize,
        paciente_id: normalizedPacienteId,
        search,
      }),
    staleTime: 30000, // 30 segundos
  });

  console.log('[usePlanesTratamiento] Query state:', {
    isLoading: query.isLoading,
    isError: query.isError,
    dataCount: query.data?.count,
    resultsLength: query.data?.results?.length ?? 0,
  });

  return {
    planes: query.data?.results ?? [],
    pagination: query.data
      ? {
          count: query.data.count,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(query.data.count / pageSize),
          has_next: !!query.data.next,
          has_previous: !!query.data.previous,
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};

// ============================================================================
// HOOK: Obtener Plan por ID (Detalle)
// ============================================================================

export const usePlanTratamiento = (planId: string | null) => {
  return useQuery<PlanTratamientoDetailResponse>({
    queryKey: planKeys.detail(planId!),
    queryFn: () => treatmentPlanService.getPlanById(planId!),
    enabled: !!planId,
    staleTime: 30000,
  });
};

// ============================================================================
// HOOK: Obtener Diagnósticos Disponibles del Odontograma
// ============================================================================

export const useDiagnosticosDisponibles = (planId: string | null) => {
  return useQuery<DiagnosticosDisponiblesResponse>({
    queryKey: planKeys.diagnosticos(planId!),
    queryFn: () => treatmentPlanService.getDiagnosticosDisponibles(planId!),
    enabled: !!planId,
    staleTime: 60000, // 1 minuto
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para crear un plan de tratamiento
 */
export const useCreatePlanTratamiento = (pacienteId: string | null) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlanTratamientoCreatePayload) =>
      treatmentPlanService.createPlan(payload),
    onSuccess: () => {
      console.log('[useCreatePlanTratamiento] Plan creado exitosamente');
      // Invalida todas las listas de planes
      qc.invalidateQueries({
        queryKey: planKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('[useCreatePlanTratamiento] Error al crear plan:', error);
    },
  });
};

/**
 * Hook para actualizar un plan de tratamiento
 */
export const useUpdatePlanTratamiento = (planId: string, pacienteId: string | null) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlanTratamientoUpdatePayload) =>
      treatmentPlanService.updatePlan(planId, payload),
    onSuccess: () => {
      console.log('[useUpdatePlanTratamiento] Plan actualizado exitosamente');
      // Invalida el detalle del plan específico
      qc.invalidateQueries({
        queryKey: planKeys.detail(planId),
      });
      // Invalida la lista de planes
      qc.invalidateQueries({
        queryKey: planKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('[useUpdatePlanTratamiento] Error al actualizar plan:', error);
    },
  });
};

/**
 * Hook para eliminar un plan de tratamiento (borrado lógico)
 */
export const useDeletePlanTratamiento = (pacienteId: string | null) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => treatmentPlanService.deletePlan(planId),
    onSuccess: () => {
      console.log('[useDeletePlanTratamiento] Plan eliminado exitosamente');
      // Invalida la lista de planes
      qc.invalidateQueries({
        queryKey: planKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('[useDeletePlanTratamiento] Error al eliminar plan:', error);
    },
  });
};
