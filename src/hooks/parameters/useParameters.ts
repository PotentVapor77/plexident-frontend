// src/hooks/parameters/useParameters.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import parametersService from '../../services/parameters/parametersService';
import type {
  IHorario,
  IHorarioBulkUpdate,
  IDiagnostico,
  IDiagnosticoCreate,
  IDiagnosticoUpdate,
  IMedicamento,
  IMedicamentoCreate,
  IMedicamentoUpdate,
  IConfiguracionSeguridad,
  IConfiguracionSeguridadUpdate,
  IConfiguracionNotificaciones,
  IConfiguracionNotificacionesUpdate,
  ITestEmailRequest,
  ITestSmsRequest,
} from '../../types/parameters/IParameters';

// ============================================================================
// HORARIOS (RF-07.1)
// ============================================================================

/**
 * Hook para obtener horarios
 */
export const useHorarios = () => {
  return useQuery<IHorario[], Error>({
    queryKey: ['horarios'],
    queryFn: parametersService.getHorarios,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para actualización masiva de horarios
 */
export const useBulkUpdateHorarios = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IHorarioBulkUpdate) => parametersService.bulkUpdateHorarios(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
};

/**
 * Hook para actualizar un horario individual
 */
export const useUpdateHorario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IHorario> }) =>
      parametersService.updateHorario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] });
    },
  });
};

// ============================================================================
// DIAGNÓSTICOS (RF-07.2)
// ============================================================================

/**
 * Hook para obtener diagnósticos
 */
export const useDiagnosticos = (params?: { search?: string; categoria?: string }) => {
  return useQuery<IDiagnostico[], Error>({
    queryKey: ['diagnosticos', params],
    queryFn: () => parametersService.getDiagnosticos(params),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener un diagnóstico por ID
 */
export const useDiagnosticoById = (id: string) => {
  return useQuery<IDiagnostico, Error>({
    queryKey: ['diagnostico', id],
    queryFn: () => parametersService.getDiagnosticoById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear diagnóstico
 */
export const useCreateDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IDiagnosticoCreate) => parametersService.createDiagnostico(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
    },
  });
};

/**
 * Hook para actualizar diagnóstico
 */
export const useUpdateDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IDiagnosticoUpdate }) =>
      parametersService.updateDiagnostico(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
      queryClient.invalidateQueries({ queryKey: ['diagnostico', variables.id] });
    },
  });
};

/**
 * Hook para eliminar diagnóstico
 */
export const useDeleteDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => parametersService.deleteDiagnostico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
    },
  });
};

// ============================================================================
// MEDICAMENTOS (RF-07.3)
// ============================================================================

/**
 * Hook para obtener medicamentos
 */
export const useMedicamentos = (params?: {
  search?: string;
  categoria?: string;
  via_administracion?: string;
}) => {
  return useQuery<IMedicamento[], Error>({
    queryKey: ['medicamentos', params],
    queryFn: () => parametersService.getMedicamentos(params),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener un medicamento por ID
 */
export const useMedicamentoById = (id: string) => {
  return useQuery<IMedicamento, Error>({
    queryKey: ['medicamento', id],
    queryFn: () => parametersService.getMedicamentoById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear medicamento
 */
export const useCreateMedicamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IMedicamentoCreate) => parametersService.createMedicamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
    },
  });
};

/**
 * Hook para actualizar medicamento
 */
export const useUpdateMedicamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IMedicamentoUpdate }) =>
      parametersService.updateMedicamento(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      queryClient.invalidateQueries({ queryKey: ['medicamento', variables.id] });
    },
  });
};

/**
 * Hook para eliminar medicamento
 */
export const useDeleteMedicamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => parametersService.deleteMedicamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
    },
  });
};

// ============================================================================
// SEGURIDAD (RF-07.4 y RF-07.5)
// ============================================================================

/**
 * Hook para obtener configuración de seguridad
 */
export const useConfiguracionSeguridad = () => {
  return useQuery<IConfiguracionSeguridad, Error>({
    queryKey: ['configuracion-seguridad'],
    queryFn: parametersService.getConfiguracionSeguridad,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para actualizar configuración de seguridad
 */
export const useUpdateConfiguracionSeguridad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IConfiguracionSeguridadUpdate) =>
      parametersService.updateConfiguracionSeguridad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-seguridad'] });
    },
  });
};

// ============================================================================
// NOTIFICACIONES (RF-07.7)
// ============================================================================

/**
 * Hook para obtener configuración de notificaciones
 */
export const useConfiguracionNotificaciones = () => {
  return useQuery<IConfiguracionNotificaciones, Error>({
    queryKey: ['configuracion-notificaciones'],
    queryFn: parametersService.getConfiguracionNotificaciones,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook para actualizar configuración de notificaciones
 */
export const useUpdateConfiguracionNotificaciones = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IConfiguracionNotificacionesUpdate) =>
      parametersService.updateConfiguracionNotificaciones(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-notificaciones'] });
    },
  });
};

/**
 * Hook para enviar email de prueba
 */
export const useTestEmail = () => {
  return useMutation({
    mutationFn: (data: ITestEmailRequest) => parametersService.testEmail(data),
  });
};

/**
 * Hook para enviar SMS de prueba
 */
export const useTestSms = () => {
  return useMutation({
    mutationFn: (data: ITestSmsRequest) => parametersService.testSms(data),
  });
};
