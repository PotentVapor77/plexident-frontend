// hooks/vitalSigns/useVitalSigns.ts

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  getVitalSigns,
  getVitalSignsById,
  getVitalSignsByPaciente,
  createVitalSigns,
  updateVitalSigns,
  deleteVitalSigns,
} from '../../services/vitalSigns/vitalSignsService';
import type {
  IVitalSigns,
  IVitalSignsCreate,
  IVitalSignsUpdate,
  IVitalSignsListResponse,
} from '../../types/vitalSigns/IVitalSigns';
import { logger } from '../../utils/logger';

export const VITALSIGNS_QUERY_KEYS = {
  all: ['vitalSigns'] as const,
  lists: (params?: UseVitalSignsParams) => [
    ...VITALSIGNS_QUERY_KEYS.all,
    'list',
    params?.page ?? 1,
    params?.pageSize ?? 20,
    params?.search ?? '',
    params?.paciente ?? '',
    params?.activo ?? null,
  ] as const,
  details: (id: string) => [...VITALSIGNS_QUERY_KEYS.all, 'detail', id] as const,
  byPaciente: (pacienteId: string) => [...VITALSIGNS_QUERY_KEYS.all, 'paciente', pacienteId] as const,
} as const;

const invalidateVitalSignsLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === 'vitalSigns' && key[1] === 'list';
    },
  });
};

export interface UseVitalSignsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  paciente?: string;
  activo?: boolean;
}

export interface UseVitalSignsReturn {
  vitalSigns: IVitalSigns[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removeVitalSign: (id: string) => Promise<void>;
  isDeleting: boolean;
}

// Listar signos vitales
export const useVitalSigns = (params?: UseVitalSignsParams): UseVitalSignsReturn => {
  const queryClient = useQueryClient();
  const query = useQuery<IVitalSignsListResponse>({
    queryKey: VITALSIGNS_QUERY_KEYS.lists(params),
    queryFn: () => getVitalSigns({
      page: params?.page,
      page_size: params?.pageSize,  
      search: params?.search,
      paciente: params?.paciente,
      ...(params?.activo !== undefined && { activo: params.activo }),
    } as Parameters<typeof getVitalSigns>[0]),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVitalSigns(id),
    onSuccess: (_, id) => {
      invalidateVitalSignsLists(queryClient);
      logger.info('Signos vitales eliminados', { id });
    },
    onError: (error) => {
      logger.error('Error al eliminar signos vitales', error);
    },
  });

  const removeVitalSign = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const responseData = query.data?.data;
  const vitalSigns = responseData?.results ?? [];
  const count = responseData?.count ?? 0;
  const pageSize = params?.pageSize ?? 20;
  const pagination = responseData
    ? {
        count,
        next: responseData.next,
        previous: responseData.previous,
        page: params?.page ?? 1,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
        hasNext: !!responseData.next,
        hasPrevious: !!responseData.previous,
      }
    : undefined;

  return {
    vitalSigns,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error)?.message ?? null,
    refetch: query.refetch,
    removeVitalSign,
    isDeleting: deleteMutation.isPending,
  };
};

// Obtener signos vitales por ID
export const useVitalSign = (id: string) => {
  return useQuery<IVitalSigns>({
    queryKey: VITALSIGNS_QUERY_KEYS.details(id),
    queryFn: () => getVitalSignsById(id),
    enabled: !!id,
  });
};

// Obtener signos vitales por paciente
export const useVitalSignsByPaciente = (pacienteId: string) => {
  return useQuery<IVitalSigns>({
    queryKey: VITALSIGNS_QUERY_KEYS.byPaciente(pacienteId),
    queryFn: () => getVitalSignsByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
};

// Crear signos vitales
export const useCreateVitalSigns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vitalData: IVitalSignsCreate) => createVitalSigns(vitalData),
    onSuccess: () => {
      invalidateVitalSignsLists(queryClient);
      logger.info('Signos vitales creados, actualizando lista');
    },
    onError: (error) => {
      logger.error('Error al crear signos vitales', error);
    },
  });
};

// Actualizar signos vitales
export const useUpdateVitalSigns = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IVitalSigns,
    Error,
    { id: string; data: IVitalSignsUpdate }
  >({
    mutationFn: ({ id, data }) => updateVitalSigns(id, data),
    onSuccess: (_, variables) => {
      invalidateVitalSignsLists(queryClient);
      queryClient.invalidateQueries({ queryKey: VITALSIGNS_QUERY_KEYS.details(variables.id) });
      
      // Invalidar también por paciente
      const background = queryClient.getQueryData<IVitalSigns>(VITALSIGNS_QUERY_KEYS.details(variables.id));
      if (background?.paciente) {
        const pacienteId = typeof background.paciente === 'string' 
          ? background.paciente 
          : background.paciente.id;
        queryClient.invalidateQueries({ queryKey: VITALSIGNS_QUERY_KEYS.byPaciente(pacienteId) });
      }
      
      logger.info('Signos vitales actualizados', { id: variables.id });
    },
    onError: (error) => {
      logger.error('Error al actualizar signos vitales', error);
    },
  });
};