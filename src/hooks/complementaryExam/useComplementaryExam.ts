// src/hooks/complementaryExam/useComplementaryExam.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  IComplementaryExamCreate,
  IComplementaryExamUpdate,
  IComplementaryExamFilters,
} from '../../types/complementaryExam/IComplementaryExam';
import {
  getComplementaryExams,
  getComplementaryExamById,
  createComplementaryExam,
  updateComplementaryExam,
  deleteComplementaryExam,
} from '../../services/complementaryExam/complementaryExamService';

// ============================================================================
// HOOKS PARA EXAMENES COMPLEMENTARIOS
// ============================================================================

export const useComplementaryExams = (filters?: IComplementaryExamFilters) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['complementary-exams', filters],
    queryFn: () => getComplementaryExams(filters),
    staleTime: 5 * 60 * 1000,
  });

  return {
    complementaryExams: data?.results || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useComplementaryExamById = (id: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['complementary-exam', id],
    queryFn: () => getComplementaryExamById(id),
    enabled: !!id,
  });

  return {
    complementaryExam: data,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useCreateComplementaryExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IComplementaryExamCreate) => createComplementaryExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complementary-exams'] });
    },
  });
};

export const useUpdateComplementaryExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IComplementaryExamUpdate }) =>
      updateComplementaryExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complementary-exams'] });
      queryClient.invalidateQueries({ queryKey: ['complementary-exam', variables.id] });
    },
  });
};

export const useDeleteComplementaryExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteComplementaryExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complementary-exams'] });
    },
  });
};
