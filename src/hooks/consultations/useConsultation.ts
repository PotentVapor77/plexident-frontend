// src/hooks/consultation/useConsultation.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { IConsultationCreate, IConsultationUpdate } from '../../types/consultations/IConsultation';
import { consultationService } from '../../services/consultations/consultationService';

const QUERY_KEY = 'consultations-general';

/**
 * Hook para obtener todas las consultas con paginación
 */
export const useConsultations = (params?: {
  search?: string;
  paciente?: string;
  activo?: boolean;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => consultationService.getAll(params),
  });
};

/**
 * Hook para obtener consulta por ID
 */
export const useConsultationById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => consultationService.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para obtener consultas por paciente
 */
export const useConsultationsByPaciente = (pacienteId: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'paciente', pacienteId],
    queryFn: () => consultationService.getByPaciente(pacienteId),
    enabled: enabled && !!pacienteId,
    retry: false,
  });
};

/**
 * Hook para crear consulta
 */
export const useCreateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IConsultationCreate) => consultationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * Hook para actualizar consulta (PUT completo)
 */
export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IConsultationUpdate }) =>
      consultationService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'paciente'] });
    },
  });
};

/**
 * Hook para actualización parcial (PATCH)
 */
export const usePartialUpdateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IConsultationUpdate> }) =>
      consultationService.partialUpdate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'paciente'] });
    },
  });
};

/**
 * Hook para eliminar consulta (soft delete)
 */
export const useDeleteConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => consultationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};