// src/hooks/patient/usePatients.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

import {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
} from "../../services/patient/patientService";

import type {
  IPaciente,
  IPacienteCreate,
  IPacienteUpdate,
  IPacienteListResponse,  // ← AÑADIDO
  IPacientePagination,
  UsePacientesParams,
} from "../../types/patient/IPatient";

import { logger } from "../../utils/logger";

// ============================================================================
// QUERY KEYS
// ============================================================================


export const PATIENT_QUERY_KEYS = {
  all: ["patients"] as const,
  lists: () => [...PATIENT_QUERY_KEYS.all, "list"] as const,
  list: (params?: UsePacientesParams) =>
    [
      ...PATIENT_QUERY_KEYS.lists(),
      params?.page ?? 1,
      params?.page_size ?? 20,
      params?.search ?? "",
    ] as const,
  details: () => [...PATIENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PATIENT_QUERY_KEYS.details(), id] as const,
};

// Helper: invalidar todas las listas de pacientes
const invalidatePatientLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === "patients" && key[1] === "list";
    },
  });
};

// ============================================================================
// TIPOS DE RETORNO
// ============================================================================

export interface UsePacientesReturn {
  pacientes: IPaciente[];
  pagination: IPacientePagination | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  removePaciente: (id: string) => Promise<void>;
  isDeleting: boolean;
}

// ============================================================================
// LISTAR PACIENTES
// ============================================================================

export const usePacientes = (params?: UsePacientesParams): UsePacientesReturn => {
  const queryClient = useQueryClient();

  // ✅ Ahora query.data es de tipo IPacienteListResponse
  const query = useQuery<IPacienteListResponse>({
    queryKey: PATIENT_QUERY_KEYS.list(params),
    queryFn: () => getPacientes(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaciente(id),
    onSuccess: () => {
      invalidatePatientLists(queryClient);
      logger.info("✅ Paciente eliminado, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar paciente", error);
    },
  });

  // ✅ IPacienteListResponse: la paginación está en .data
  const responseData = query.data?.data;
  const pacientes = responseData?.results ?? [];
  const count = responseData?.count ?? 0;
  const pageSize = params?.page_size ?? 20;

  const pagination: IPacientePagination | undefined = responseData
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
    pacientes,
    pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | undefined)?.message ?? null,
    refetch: query.refetch,
    removePaciente: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

// ============================================================================
// OBTENER PACIENTE POR ID
// ============================================================================

export const usePaciente = (id: string) => {
  return useQuery<IPaciente>({  // ← Tipado explícito
    queryKey: PATIENT_QUERY_KEYS.detail(id),
    queryFn: () => getPacienteById(id),
    enabled: !!id,
  });
};

// ============================================================================
// CREAR PACIENTE
// ============================================================================

export const useCreatePaciente = () => {
  const queryClient = useQueryClient();

  return useMutation<IPaciente, Error, IPacienteCreate>({  // ← Tipado explícito
    mutationFn: (pacienteData: IPacienteCreate) => createPaciente(pacienteData),
    onSuccess: () => {
      invalidatePatientLists(queryClient);
      logger.info("✅ Paciente creado, actualizando lista");
    },
    onError: (error) => {
      logger.error("❌ Error al crear paciente", error);
    },
  });
};

// ============================================================================
// ACTUALIZAR PACIENTE
// ============================================================================

export const useUpdatePaciente = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPaciente,  // TData - lo que retorna
    Error,      // TError
    { id: string; data: IPacienteUpdate }  // TVariables
  >({
    mutationFn: ({ id, data }: { id: string; data: IPacienteUpdate }) =>
      updatePaciente(id, data),
    onSuccess: (_, variables) => {
      invalidatePatientLists(queryClient);
      queryClient.invalidateQueries({
        queryKey: PATIENT_QUERY_KEYS.detail(variables.id),
      });
      logger.info("✅ Paciente actualizado", { id: variables.id });
    },
    onError: (error) => {
      logger.error("❌ Error al actualizar paciente", error);
    },
  });
};

// ============================================================================
// ELIMINAR PACIENTE
// ============================================================================

export const useDeletePaciente = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({  // ← Tipado explícito
    mutationFn: (id: string) => deletePaciente(id),
    onSuccess: (_, id) => {
      invalidatePatientLists(queryClient);
      logger.info("✅ Paciente eliminado", { id });
    },
    onError: (error) => {
      logger.error("❌ Error al eliminar paciente", error);
    },
  });
};
