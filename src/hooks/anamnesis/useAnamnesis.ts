// src/hooks/patient/useAnamnesis.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anamnesisService } from '../../services/anamnesis/anamnesisService';
import type { IAnamnesisCreate, IAnamnesisUpdate } from '../../types/anamnesis/IAnamnesis';


const QUERY_KEY = 'anamnesis-general';

/**
 * Hook para obtener todas las anamnesis con paginación
 */
export const useAnamnesis = (params?: {
  search?: string;
  paciente?: string;
  activo?: boolean;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => anamnesisService.getAll(params),
  });
};

/**
 * Hook para obtener anamnesis por ID
 */
export const useAnamnesisById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => anamnesisService.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para obtener anamnesis por paciente
 */
export const useAnamnesisByPaciente = (pacienteId: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'paciente', pacienteId],
    queryFn: () => anamnesisService.getByPaciente(pacienteId),
    enabled: enabled && !!pacienteId,
    retry: false, // No reintentar si no existe
  });
};

/**
 * Hook para crear anamnesis
 */
export const useCreateAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAnamnesisCreate) => anamnesisService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * Hook para actualizar anamnesis (PUT completo)
 */
export const useUpdateAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IAnamnesisUpdate }) =>
      anamnesisService.update(id, data),
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
export const usePartialUpdateAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAnamnesisUpdate> }) =>
      anamnesisService.partialUpdate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'paciente'] });
    },
  });
};

/**
 * Hook para eliminar anamnesis (soft delete)
 */
export const useDeleteAnamnesis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => anamnesisService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * Hook para obtener resumen de condiciones
 */
export const useResumen = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'resumen'],
    queryFn: () => anamnesisService.getResumen(id),
    enabled: enabled && !!id,
  });
};