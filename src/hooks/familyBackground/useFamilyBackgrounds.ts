// src/hooks/familyBackground/useFamilyBackgrounds.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

import {
  getFamilyBackgrounds,
  getFamilyBackgroundById,
  getFamilyBackgroundByPaciente,
  createFamilyBackground,
  updateFamilyBackground,
  deleteFamilyBackground,
} from "../../services/familyBackground/familyBackgroundService";

import type {
  IFamilyBackground,
  IFamilyBackgroundCreate,
  IFamilyBackgroundUpdate,
  IFamilyBackgroundListResponse,
  UseFamilyBackgroundsParams,
} from "../../types/familyBackground/IFamilyBackground";

import { logger } from "../../utils/logger";

// ============================================================================
// QUERY KEYS
// ============================================================================
export const FAMILY_BACKGROUND_QUERY_KEYS = {
  all: ["familyBackgrounds"] as const,
  lists: () => [...FAMILY_BACKGROUND_QUERY_KEYS.all, "list"] as const,
  list: (params?: UseFamilyBackgroundsParams) =>
    [
      ...FAMILY_BACKGROUND_QUERY_KEYS.lists(),
      params?.page ?? 1,
      params?.page_size ?? 20,
      params?.search ?? "",
      params?.paciente ?? "",
    ] as const,
  details: () => [...FAMILY_BACKGROUND_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...FAMILY_BACKGROUND_QUERY_KEYS.details(), id] as const,
  byPaciente: (pacienteId: string) =>
    [...FAMILY_BACKGROUND_QUERY_KEYS.all, "paciente", pacienteId] as const,
};

// Helper: invalidar todas las listas
const invalidateBackgroundLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === "familyBackgrounds" && key[1] === "list";
    },
  });
};
// ============================================================================
// TIPOS DE RETORNO - CORREGIDO
// ============================================================================

export interface UseFamilyBackgroundsReturn {
  backgrounds: IFamilyBackground[];
  pagination:
    | {
        count: number;
        next: string | null;
        previous: string | null;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removeBackground: (id: string) => Promise<void>; //  Promise<void>
  isDeleting: boolean;
}

// ============================================================================
// LISTAR ANTECEDENTES FAMILIARES - CORREGIDO
// ============================================================================

export const useFamilyBackgrounds = (
  params?: UseFamilyBackgroundsParams
): UseFamilyBackgroundsReturn => {
  const queryClient = useQueryClient();

  const query = useQuery<IFamilyBackgroundListResponse>({
    queryKey: FAMILY_BACKGROUND_QUERY_KEYS.list(params),
    queryFn: () => getFamilyBackgrounds(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  //  CORREGIDO: Wrapper para return Promise<void>
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFamilyBackground(id),
    onSuccess: (_, id) => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes familiares eliminados", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar antecedentes familiares", error);
    },
  });

  //  Wrapper para transformar Promise<{id}> → Promise<void>
  const removeBackground: (id: string) => Promise<void> = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const responseData = query.data?.data;
  const backgrounds = responseData?.results ?? [];
  const count = responseData?.count ?? 0;
  const pageSize = params?.page_size ?? 20;

  const pagination = responseData
    ? {
        count,
        next: responseData.next,
        previous: responseData.previous,
        page: params?.page ?? 1,
        page_size: pageSize,
        total_pages: Math.ceil(count / pageSize),
        has_next: !!responseData.next,
        has_previous: !!responseData.previous,
      }
    : undefined;

  return {
    backgrounds,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | undefined)?.message ?? null,
    refetch: query.refetch,
    removeBackground, //  Ahora es Promise<void>
    isDeleting: deleteMutation.isPending,
  };
};

// ============================================================================
// OBTENER ANTECEDENTES FAMILIARES POR ID
// ============================================================================

export const useFamilyBackground = (id: string) => {
  return useQuery<IFamilyBackground>({
    queryKey: FAMILY_BACKGROUND_QUERY_KEYS.detail(id),
    queryFn: () => getFamilyBackgroundById(id),
    enabled: !!id,
  });
};

// ============================================================================
// OBTENER ANTECEDENTES FAMILIARES POR PACIENTE - CORREGIDO
// ============================================================================

export const useFamilyBackgroundByPaciente = (pacienteId: string) => {
  return useQuery<IFamilyBackground>({
    queryKey: FAMILY_BACKGROUND_QUERY_KEYS.byPaciente(pacienteId),
    queryFn: () => getFamilyBackgroundByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
};

// ============================================================================
// CREAR ANTECEDENTES FAMILIARES
// ============================================================================

export const useCreateFamilyBackground = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backgroundData: IFamilyBackgroundCreate) =>
      createFamilyBackground(backgroundData),
    onSuccess: () => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes familiares creados, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al crear antecedentes familiares", error);
    },
  });
};

// ============================================================================
// ACTUALIZAR ANTECEDENTES FAMILIARES - CORREGIDO
// ============================================================================

export const useUpdateFamilyBackground = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IFamilyBackground,
    Error,
    { id: string; data: IFamilyBackgroundUpdate }
  >({
    mutationFn: ({ id, data }) => updateFamilyBackground(id, data),
    onSuccess: (_, variables) => {
      invalidateBackgroundLists(queryClient);
      queryClient.invalidateQueries({
        queryKey: FAMILY_BACKGROUND_QUERY_KEYS.detail(variables.id),
      });
      // Invalidar también el query por paciente
      const background = queryClient.getQueryData<IFamilyBackground>(
        FAMILY_BACKGROUND_QUERY_KEYS.detail(variables.id)
      );
      if (background?.paciente) {
        //  CORREGIDO: Asegurar que sea string
        const pacienteId = typeof background.paciente === 'string' 
          ? background.paciente 
          : background.paciente.id;
        queryClient.invalidateQueries({
          queryKey: FAMILY_BACKGROUND_QUERY_KEYS.byPaciente(pacienteId),
        });
      }
      logger.info("✅ Antecedentes familiares actualizados", {
        id: variables.id,
      });
    },
    onError: (error) => {
      logger.error("❌ Error al actualizar antecedentes familiares", error);
    },
  });
};

// ============================================================================
// ELIMINAR ANTECEDENTES FAMILIARES
// ============================================================================

export const useDeleteFamilyBackground = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFamilyBackground(id),
    onSuccess: (_, id) => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes familiares eliminados", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar antecedentes familiares", error);
    },
  });
};
