// src/hooks/odontogram/useTreatmentSession.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '../../services/treatmentPlan/treatmentPlanService';
import type {
  PaginatedResponse,
  SesionTratamientoCreatePayload,
  SesionTratamientoUpdatePayload,
} from '../../core/types/treatmentPlan.types';
import type {
  SesionTratamientoListResponse,
  SesionTratamientoDetailResponse,
  EstadoSesion,
} from '../../types/treatmentPlan/typeBackendTreatmentPlan';

// ============================================================================
// QUERY KEYS
// ============================================================================

const sesionKeys = {
  all: ['sesiones-tratamiento'] as const,
  lists: () => [...sesionKeys.all, 'list'] as const,
  list: (planId: string | null, page: number, pageSize: number, pacienteId?: string, estado?: EstadoSesion) =>
    [...sesionKeys.lists(), planId || 'all', page, pageSize, pacienteId || 'all', estado || 'all'] as const,
  details: () => [...sesionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sesionKeys.details(), id] as const,
};

// ============================================================================
// HOOK PRINCIPAL: Listar Sesiones de Tratamiento
// ============================================================================

export const useSesionesTratamiento = (
  planId: string | undefined | null,
  page: number = 1,
  pageSize: number = 20,
  pacienteId?: string,
  estado?: EstadoSesion
) => {
  console.log('[useSesionesTratamiento] Hook called with:', {
    planId,
    page,
    pageSize,
    pacienteId,
    estado,
  });

  const normalizedPlanId = planId ?? null;
  
  const query = useQuery<PaginatedResponse<SesionTratamientoListResponse>>({
    queryKey: sesionKeys.list(normalizedPlanId, page, pageSize, pacienteId, estado),
    queryFn: () =>
      sessionService.getSessions({
        plan_id: normalizedPlanId || undefined, 
        paciente_id: pacienteId,
        estado,
        page,
        page_size: pageSize,
      }),
    staleTime: 30000,
  });

  console.log('[useSesionesTratamiento] Query state:', {
    isLoading: query.isLoading,
    isError: query.isError,
    dataCount: query.data?.count,
    resultsLength: query.data?.results?.length ?? 0,
  });

  return {
    sesiones: query.data?.results ?? [],
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
// HOOK: Obtener Sesión por ID (Detalle)
// ============================================================================

export const useSesionTratamiento = (sesionId: string | null) => {
  return useQuery<SesionTratamientoDetailResponse>({
    queryKey: sesionKeys.detail(sesionId!),
    queryFn: () => sessionService.getSessionById(sesionId!),
    enabled: !!sesionId,
    staleTime: 30000,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para crear una sesión de tratamiento
 */
export const useCreateSesionTratamiento = (planId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SesionTratamientoCreatePayload) =>
      sessionService.createSession(payload),
    onSuccess: () => {
      console.log('[useCreateSesionTratamiento] Sesión creada exitosamente');
      // Invalida la lista de sesiones
      qc.invalidateQueries({
        queryKey: sesionKeys.lists(),
      });
      // Invalida el detalle del plan (para actualizar estadísticas)
      qc.invalidateQueries({
        queryKey: ['planes-tratamiento', 'detail', planId],
      });
    },
    onError: (error) => {
      console.error('[useCreateSesionTratamiento] Error al crear sesión:', error);
    },
  });
};

/**
 * Hook para actualizar una sesión de tratamiento
 */
export const useUpdateSesionTratamiento = (sesionId: string, planId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SesionTratamientoUpdatePayload) =>
      sessionService.updateSession(sesionId, payload),
    onSuccess: () => {
      console.log('[useUpdateSesionTratamiento] Sesión actualizada exitosamente');
      // Invalida el detalle de la sesión
      qc.invalidateQueries({
        queryKey: sesionKeys.detail(sesionId),
      });
      // Invalida la lista de sesiones
      qc.invalidateQueries({
        queryKey: sesionKeys.lists(),
      });
      // Invalida el detalle del plan
      qc.invalidateQueries({
        queryKey: ['planes-tratamiento', 'detail', planId],
      });
    },
    onError: (error) => {
      console.error('[useUpdateSesionTratamiento] Error al actualizar sesión:', error);
    },
  });
};

/**
 * Hook para eliminar una sesión de tratamiento (borrado lógico)
 */
export const useDeleteSesionTratamiento = (planId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sesionId: string) => 
      sessionService.updateSession(sesionId, { estado: 'cancelada' }),
    onSuccess: () => {
      console.log('[useDeleteSesionTratamiento] Sesión eliminada exitosamente');
      // Invalida la lista de sesiones
      qc.invalidateQueries({
        queryKey: sesionKeys.lists(),
      });
      // Invalida el detalle del plan
      qc.invalidateQueries({
        queryKey: ['planes-tratamiento', 'detail', planId],
      });
    },
    onError: (error) => {
      console.error('[useDeleteSesionTratamiento] Error al eliminar sesión:', error);
    },
  });
};

/**
 * Hook para completar una sesión de tratamiento
 */
export const useCompletarSesion = (sesionId: string, planId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => sessionService.completeSession(sesionId),
    onSuccess: () => {
      console.log('[useCompletarSesion] Sesión completada exitosamente');
      // Invalida el detalle de la sesión
      qc.invalidateQueries({
        queryKey: sesionKeys.detail(sesionId),
      });
      // Invalida la lista de sesiones
      qc.invalidateQueries({
        queryKey: sesionKeys.lists(),
      });
      // Invalida el detalle del plan
      qc.invalidateQueries({
        queryKey: ['planes-tratamiento', 'detail', planId],
      });
    },
    onError: (error) => {
      console.error('[useCompletarSesion] Error al completar sesión:', error);
    },
  });
};

/**
 * Hook para firmar una sesión de tratamiento
 */
export const useFirmarSesion = (sesionId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (firmaDigital: string) => 
      sessionService.signSession(sesionId, firmaDigital),
    onSuccess: () => {
      console.log('[useFirmarSesion] Sesión firmada exitosamente');
      // Invalida el detalle de la sesión
      qc.invalidateQueries({
        queryKey: sesionKeys.detail(sesionId),
      });
      // Invalida la lista de sesiones
      qc.invalidateQueries({
        queryKey: sesionKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('[useFirmarSesion] Error al firmar sesión:', error);
    },
  });
};
