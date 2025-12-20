/**
 * ============================================================================
 * HOOK: useUsers
 * ============================================================================
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
} from '../../services/user/userService';
import type {
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserListResponse,
  IUserPagination,
} from '../../types/user/IUser';
import { logger } from '../../utils/logger';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: UseUsersParams) => 
    [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
};

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

export interface UseUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  [key: string]: unknown;
}

interface UseUsersReturn {
  users: IUser[];
  pagination: IUserPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removeUser: (id: string) => Promise<void>;
  isDeleting: boolean;
}

// ============================================================================
// LISTAR USUARIOS
// ============================================================================

export const useUsers = (params?: UseUsersParams): UseUsersReturn => {
  const queryClient = useQueryClient();

  const query = useQuery<IUserListResponse>({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      logger.info('✅ Usuario eliminado, actualizando lista');
    },
    onError: (error) => {
      logger.error('❌ Error al eliminar usuario', error);
    },
  });

  // ✅ EXTRACCIÓN CORRECTA: data.data.results (no data.data)
  const responseData = query.data?.data;
  const users = responseData?.results ?? [];
  const count = responseData?.count ?? 0;
  const pageSize = params?.page_size ?? 20;

  // ✅ Construir metadata de paginación
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
    error: query.error?.message ?? null,
    refetch: query.refetch,
    removeUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

// ============================================================================
// OBTENER USUARIO POR ID
// ============================================================================

export const useUser = (id: string) => {
  return useQuery<IUser>({
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

  return useMutation<IUser, Error, IUserCreate>({
    mutationFn: (userData: IUserCreate) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      logger.info('✅ Usuario creado, actualizando lista');
    },
    onError: (error) => {
      logger.error('❌ Error al crear usuario', error);
    },
  });
};

// ============================================================================
// ACTUALIZAR USUARIO
// ============================================================================

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IUser, Error, { id: string; data: IUserUpdate }>({
    mutationFn: ({ id, data }: { id: string; data: IUserUpdate }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ 
        queryKey: USER_QUERY_KEYS.detail(variables.id) 
      });
      logger.info('✅ Usuario actualizado', { id: variables.id });
    },
    onError: (error) => {
      logger.error('❌ Error al actualizar usuario', error);
    },
  });
};

// ============================================================================
// ELIMINAR USUARIO
// ============================================================================

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      logger.info('✅ Usuario eliminado', { id });
    },
    onError: (error) => {
      logger.error('❌ Error al eliminar usuario', error);
    },
  });
};



export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<IUser, Error, string>({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(id) });
      logger.info('✅ Usuario reactivado', { id });
    },
    onError: (error) => {
      logger.error('❌ Error al reactivar usuario', error);
    },
  });
}