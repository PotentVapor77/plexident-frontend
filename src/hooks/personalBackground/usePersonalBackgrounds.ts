// src/hooks/personalBackground/usePersonalBackgrounds.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

import {
  getPersonalBackgrounds,
  getPersonalBackgroundById,
  getPersonalBackgroundByPaciente,
  createPersonalBackground,
  updatePersonalBackground,
  deletePersonalBackground,
} from "../../services/personalBackground/personalBackgroundService";

import type {
  IPersonalBackground,
  IPersonalBackgroundCreate,
  IPersonalBackgroundUpdate,
  IPersonalBackgroundListResponse,
  UsePersonalBackgroundsParams,
} from "../../types/personalBackground/IPersonalBackground";

import { logger } from "../../utils/logger";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const PERSONAL_BACKGROUND_QUERY_KEYS = {
  all: ["personalBackgrounds"] as const,
  lists: () => [...PERSONAL_BACKGROUND_QUERY_KEYS.all, "list"] as const,
  list: (params?: UsePersonalBackgroundsParams) =>
    [
      ...PERSONAL_BACKGROUND_QUERY_KEYS.lists(),
      params?.page ?? 1,
      params?.page_size ?? 20,
      params?.search ?? "",
      params?.paciente ?? "",
    ] as const,
  details: () => [...PERSONAL_BACKGROUND_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...PERSONAL_BACKGROUND_QUERY_KEYS.details(), id] as const,
  byPaciente: (pacienteId: string) =>
    [...PERSONAL_BACKGROUND_QUERY_KEYS.all, "paciente", pacienteId] as const,
};

// Helper: invalidar todas las listas
const invalidateBackgroundLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === "personalBackgrounds" && key[1] === "list";
    },
  });
};

// ============================================================================
// TIPOS DE RETORNO - CORREGIDO
// ============================================================================

export interface UsePersonalBackgroundsReturn {
  backgrounds: IPersonalBackground[];
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
  removeBackground: (id: string) => Promise<void>; // ✅ Promise<void>
  isDeleting: boolean;
}

// ============================================================================
// LISTAR ANTECEDENTES PERSONALES - CORREGIDO
// ============================================================================

export const usePersonalBackgrounds = (
  params?: UsePersonalBackgroundsParams
): UsePersonalBackgroundsReturn => {
  const queryClient = useQueryClient();

  const query = useQuery<IPersonalBackgroundListResponse>({
    queryKey: PERSONAL_BACKGROUND_QUERY_KEYS.list(params),
    queryFn: () => getPersonalBackgrounds(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ✅ CORREGIDO: Wrapper para return Promise<void>
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePersonalBackground(id),
    onSuccess: (_, id) => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes personales eliminados", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar antecedentes personales", error);
    },
  });

  // ✅ Wrapper para transformar Promise<{id}> → Promise<void>
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
    removeBackground, // ✅ Ahora es Promise<void>
    isDeleting: deleteMutation.isPending,
  };
};

// ============================================================================
// OBTENER ANTECEDENTES PERSONALES POR ID
// ============================================================================

export const usePersonalBackground = (id: string) => {
  return useQuery<IPersonalBackground>({
    queryKey: PERSONAL_BACKGROUND_QUERY_KEYS.detail(id),
    queryFn: () => getPersonalBackgroundById(id),
    enabled: !!id,
  });
};

// ============================================================================
// OBTENER ANTECEDENTES PERSONALES POR PACIENTE - CORREGIDO
// ============================================================================

export const usePersonalBackgroundByPaciente = (pacienteId: string) => {
  return useQuery<IPersonalBackground>({
    queryKey: PERSONAL_BACKGROUND_QUERY_KEYS.byPaciente(pacienteId),
    queryFn: () => getPersonalBackgroundByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
};

// ============================================================================
// CREAR ANTECEDENTES PERSONALES
// ============================================================================

export const useCreatePersonalBackground = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backgroundData: IPersonalBackgroundCreate) =>
      createPersonalBackground(backgroundData),
    onSuccess: () => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes personales creados, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al crear antecedentes personales", error);
    },
  });
};

// ============================================================================
// ACTUALIZAR ANTECEDENTES PERSONALES - CORREGIDO
// ============================================================================

export const useUpdatePersonalBackground = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPersonalBackground,
    Error,
    { id: string; data: IPersonalBackgroundUpdate }
  >({
    mutationFn: ({ id, data }) => updatePersonalBackground(id, data),
    onSuccess: (_, variables) => {
      invalidateBackgroundLists(queryClient);
      queryClient.invalidateQueries({
        queryKey: PERSONAL_BACKGROUND_QUERY_KEYS.detail(variables.id),
      });
      // Invalidar también el query por paciente
      const background = queryClient.getQueryData<IPersonalBackground>(
        PERSONAL_BACKGROUND_QUERY_KEYS.detail(variables.id)
      );
      if (background?.paciente) {
        // ✅ CORREGIDO: Asegurar que sea string
        const pacienteId = typeof background.paciente === 'string' 
          ? background.paciente 
          : background.paciente.id;
        queryClient.invalidateQueries({
          queryKey: PERSONAL_BACKGROUND_QUERY_KEYS.byPaciente(pacienteId),
        });
      }
      logger.info("✅ Antecedentes personales actualizados", {
        id: variables.id,
      });
    },
    onError: (error) => {
      logger.error("❌ Error al actualizar antecedentes personales", error);
    },
  });
};

// ============================================================================
// ELIMINAR ANTECEDENTES PERSONALES
// ============================================================================

export const useDeletePersonalBackground = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePersonalBackground(id),
    onSuccess: (_, id) => {
      invalidateBackgroundLists(queryClient);
      logger.info("✅ Antecedentes personales eliminados", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar antecedentes personales", error);
    },
  });
};
