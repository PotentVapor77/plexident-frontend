// src/hooks/user/useUsers.ts
/**
 * ============================================================================
 * HOOK: useUsers
 * ============================================================================
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/user/userService";
import type {
  IUser,
  ICreateUserData,
  IUpdateUserData,
  IUserListResponse,
  IUserPagination,
} from "../../types/user/IUser";
import { logger } from "../../utils/logger";

// ============================================================================
// QUERY KEYS
// ============================================================================
export interface UseUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  list: (params?: UseUsersParams) =>
    [
      ...USER_QUERY_KEYS.lists(),
      params?.page ?? 1,
      params?.page_size ?? 20,
      params?.search ?? "",
    ] as const,
  details: () => [...USER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
};

// Helper: invalidar todas las listas de usuarios (cualquier page/search)
const invalidateUserLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === "users" && key[1] === "list";
    },
  });
};

// ============================================================================
// TIPOS DE RETORNO
// ============================================================================
export interface UseUsersReturn {
  users: IUser[];
  pagination: IUserPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removeUser: (id: string) => Promise<unknown>;
  isDeleting: boolean;
}

// ============================================================================
// LISTAR USUARIOS (ACTIVOS)
// ============================================================================
export const useUsers = (params?: UseUsersParams): UseUsersReturn => {
  const queryClient = useQueryClient();

  const query = useQuery<IUserListResponse>({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000,
    // equivalente a keepPreviousData en v5
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      invalidateUserLists(queryClient);
      logger.info("✅ Usuario eliminado, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar usuario", error);
    },
  });

  // ⚠️ IUserListResponse: la paginación está en .data
  const responseData = query.data?.data;
  const users = responseData?.results ?? [];
  const count = responseData?.count ?? 0;
  const pageSize = params?.page_size ?? 20;

  const pagination: IUserPagination | undefined = responseData
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
    users,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | undefined)?.message ?? null,
    refetch: query.refetch,
    removeUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

// ============================================================================
// OBTENER USUARIO POR ID
// ============================================================================
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

// ============================================================================
// CREAR USUARIO
// ============================================================================
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: ICreateUserData) => createUser(userData),
    onSuccess: () => {
      invalidateUserLists(queryClient);
      logger.info("✅ Usuario creado, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al crear usuario", error);
    },
  });
};

// ============================================================================
// ACTUALIZAR USUARIO
// ============================================================================
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateUserData }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      invalidateUserLists(queryClient);
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.detail(variables.id),
      });
      logger.info("✅ Usuario actualizado", { id: variables.id });
    },
    onError: (error) => {
      logger.error("❌ Error al actualizar usuario", error);
    },
  });
};

// ============================================================================
// ELIMINAR USUARIO
// ============================================================================
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, id) => {
      invalidateUserLists(queryClient);
      logger.info("✅ Usuario eliminado", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar usuario", error);
    },
  });
};
