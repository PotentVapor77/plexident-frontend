// src/hooks/odontogram/useIndicadoresSaludBucal.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IndicadoresSaludBucalService } from "../../services/odontogram/odontogramaService";
import type {
  IndicadoresSaludBucalCreatePayload,
  IndicadoresSaludBucalUpdatePayload
} from "../../core/types/odontograma.types";
import type {
  BackendIndicadoresSaludBucal,
  PaginatedResponse
} from "../../types/odontogram/typeBackendOdontograma";

// ============================================================================
// QUERY KEYS
// ============================================================================

const indicadoresKey = (
  pacienteId: string | null,
  page: number,
  pageSize: number,
  search: string
) => [
  "indicadores-salud-bucal",
  pacienteId || "all", 
  page,
  pageSize,
  search,
] as const;

const indicadoresBaseKey = (pacienteId: string | null) => [
  "indicadores-salud-bucal",
  pacienteId || "all",
] as const;

// ============================================================================
// INTERFACE OPCIONES
// ============================================================================

interface UseIndicadoresOptions {
  page: number;
  page_size: number;
  search?: string;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useIndicadoresSaludBucal = (
  pacienteId: string | null, // ✅ Ahora acepta null
  options: UseIndicadoresOptions
) => {
  const { page, page_size, search = "" } = options;

  console.log('[useIndicadoresSaludBucal] Hook called with:', {
    pacienteId,
    page,
    page_size,
    search,
  });

  const query = useQuery<PaginatedResponse<BackendIndicadoresSaludBucal>>({
    queryKey: indicadoresKey(pacienteId, page, page_size, search),
    queryFn: () => {
      console.log('[useIndicadoresSaludBucal] queryFn ejecutando con:', {
        pacienteId,
        page,
        page_size,
        search,
      });
      return IndicadoresSaludBucalService.listByPaciente(
        pacienteId, 
        page,
        page_size,
        false, 
        search
      );
    },
    staleTime: 30000,
  });

  console.log('[useIndicadoresSaludBucal] Query state:', {
    isLoading: query.isLoading,
    isError: query.isError,
    dataCount: query.data?.count,
    resultsLength: query.data?.results?.length ?? 0,
  });

  return {
    indicadores: query.data?.results ?? [],
    pagination: query.data
      ? {
          count: query.data.count,
          page,
          page_size,
          total_pages: Math.ceil(query.data.count / page_size),
          has_next: !!query.data.next,
          has_previous: !!query.data.previous,
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || null,
  };
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreateIndicadoresSaludBucal = (pacienteId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IndicadoresSaludBucalCreatePayload) =>
      IndicadoresSaludBucalService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: indicadoresBaseKey(pacienteId),
      });
    },
  });
};

export const useUpdateIndicadoresSaludBucal = (pacienteId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IndicadoresSaludBucalUpdatePayload;
    }) => IndicadoresSaludBucalService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: indicadoresBaseKey(pacienteId),
      });
    },
  });
};

export const useDeleteIndicadoresSaludBucal = (pacienteId: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => IndicadoresSaludBucalService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: indicadoresBaseKey(pacienteId),
      });
    },
  });
};
