// src/hooks/stomatognathicExam/useStomatognathicExam.ts

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  getStomatognathicExams,
  getStomatognathicExamById,
  getStomatognathicExamByPaciente,
  createStomatognathicExam,
  updateStomatognathicExam,
  deleteStomatognathicExam,
} from '../../services/stomatognathicExam/stomatognathicExamService';
import type {
  IStomatognathicExam,
  IStomatognathicExamCreate,
  IStomatognathicExamUpdate,
} from '../../types/stomatognathicExam/IStomatognathicExam';
import { logger } from '../../utils/logger';

export const STOMATOGNATHIC_QUERY_KEYS = {
  all: ['stomatognathicExam'] as const,
  lists: (params?: UseStomatognathicExamParams) => [
    ...STOMATOGNATHIC_QUERY_KEYS.all,
    'list',
    params?.page ?? 1,
    params?.pageSize ?? 20,
    params?.search ?? '',
    params?.paciente ?? '',
  ] as const,
  details: (id: string) => [...STOMATOGNATHIC_QUERY_KEYS.all, 'detail', id] as const,
  byPaciente: (pacienteId: string) => [...STOMATOGNATHIC_QUERY_KEYS.all, 'paciente', pacienteId] as const,
} as const;

const invalidateStomatognathicExamLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === 'stomatognathicExam' && key[1] === 'list';
    },
  });
};

export interface UseStomatognathicExamParams {
  page?: number;
  pageSize?: number;
  search?: string;
  paciente?: string;
}

export interface UseStomatognathicExamReturn {
  exams: IStomatognathicExam[];
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
  removeExam: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export const useStomatognathicExams = (params?: UseStomatognathicExamParams): UseStomatognathicExamReturn => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: STOMATOGNATHIC_QUERY_KEYS.lists(params),
    queryFn: () => getStomatognathicExams(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStomatognathicExam(id),
    onSuccess: (_, id) => {
      invalidateStomatognathicExamLists(queryClient);
      logger.info('Examen estomatognático eliminado', { id });
    },
    onError: (error) => {
      logger.error('Error al eliminar examen estomatognático', error);
    },
  });

  const removeExam = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const responseData = query.data?.data;
  const exams = responseData?.results ?? [];
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
    exams,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error)?.message ?? null,
    refetch: query.refetch,
    removeExam,
    isDeleting: deleteMutation.isPending,
  };
};

export const useStomatognathicExam = (id: string) => {
  return useQuery({
    queryKey: STOMATOGNATHIC_QUERY_KEYS.details(id),
    queryFn: () => getStomatognathicExamById(id),
    enabled: !!id,
  });
};

export const useStomatognathicExamByPaciente = (pacienteId: string) => {
  return useQuery({
    queryKey: STOMATOGNATHIC_QUERY_KEYS.byPaciente(pacienteId),
    queryFn: () => getStomatognathicExamByPaciente(pacienteId),
    enabled: !!pacienteId,
  });
};

export const useCreateStomatognathicExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examData: IStomatognathicExamCreate) => createStomatognathicExam(examData),
    onSuccess: () => {
      invalidateStomatognathicExamLists(queryClient);
      logger.info('Examen estomatognático creado, actualizando lista');
    },
    onError: (error) => {
      logger.error('Error al crear examen estomatognático', error);
    },
  });
};

export const useUpdateStomatognathicExam = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IStomatognathicExam,
    Error,
    { id: string; data: IStomatognathicExamUpdate }
  >({
    mutationFn: ({ id, data }) => updateStomatognathicExam(id, data),
    onSuccess: (_, variables) => {
      invalidateStomatognathicExamLists(queryClient);
      queryClient.invalidateQueries({ queryKey: STOMATOGNATHIC_QUERY_KEYS.details(variables.id) });
      logger.info('Examen estomatognático actualizado', { id: variables.id });
    },
    onError: (error) => {
      logger.error('Error al actualizar examen estomatognático', error);
    },
  });
};
