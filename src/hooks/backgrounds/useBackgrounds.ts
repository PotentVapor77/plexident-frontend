// src/hooks/backgrounds/useBackgrounds.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type {
  IAntecedenteFamiliarCreate,
  IAntecedenteFamiliarUpdate,
  IAntecedenteFilters,
  IAntecedentePersonalCreate,
  IAntecedentePersonalUpdate,
} from '../../types/backgrounds/IBackground';

import {
  getAllAntecedentesFamiliares,
  getAllAntecedentesPersonales,
  getAntecedentesFamiliares,
  getAntecedentesPersonales,
  createAntecedenteFamiliar,
  createAntecedentePersonal,
  deleteAntecedenteFamiliar,
  deleteAntecedentePersonal,
  desactivarAntecedentesPorIds,
  desactivarTodosAntecedentesPorPacienteId,
  getAntecedenteFamiliarById,
  getAntecedentePersonalById,
  updateAntecedenteFamiliar,
  updateAntecedentePersonal,
} from '../../services/backgrounds/backgroundsService';

export interface IAntecedenteCombinado {
  id: string;
  paciente: string;
  tipo: 'personal' | 'familiar';
  activo: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  personalId?: string;
  familiarId?: string;
  paciente_nombre?: string;
  paciente_cedula?: string;

  // Propiedades personales
  alergia_antibiotico?: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia?: string;
  alergia_anestesia_otro?: string;
  hemorragias?: string;
  hemorragias_detalle?: string;
  vih_sida?: string;
  vih_sida_otro?: string;
  tuberculosis?: string;
  tuberculosis_otro?: string;
  asma?: string;
  asma_otro?: string;
  diabetes?: string;
  diabetes_otro?: string;
  hipertension_arterial?: string;
  hipertension_arterial_otro?: string;
  enfermedad_cardiaca?: string;
  enfermedad_cardiaca_otro?: string;
  otros_antecedentes_personales?: string;
  habitos?: string;
  observaciones?: string;

  // Propiedades familiares
  cardiopatia_familiar?: string;
  cardiopatia_familiar_otro?: string;
  hipertension_arterial_familiar?: string;
  hipertension_arterial_familiar_otro?: string;
  enfermedad_vascular_familiar?: string;
  enfermedad_vascular_familiar_otro?: string;
  endocrino_metabolico_familiar?: string;
  endocrino_metabolico_familiar_otro?: string;
  cancer_familiar?: string;
  cancer_familiar_otro?: string;
  tipo_cancer?: string;
  tipo_cancer_otro?: string;
  tuberculosis_familiar?: string;
  tuberculosis_familiar_otro?: string;
  enfermedad_mental_familiar?: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar?: string;
  enfermedad_infecciosa_familiar_otro?: string;
  malformacion_familiar?: string;
  malformacion_familiar_otro?: string;
  otros_antecedentes_familiares?: string;
}

// ============================================================================
// HOOKS PARA ANTECEDENTES PERSONALES (CON PAGINACIÓN BACKEND)
// ============================================================================

export const useAntecedentesPersonales = (filters?: IAntecedenteFilters) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['antecedentes-personales', filters],
    queryFn: () => getAntecedentesPersonales(filters),
    staleTime: 5 * 60 * 1000,
  });

  return {
    antecedentesPersonales: data?.results || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useAntecedentePersonalById = (id: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['antecedente-personal', id],
    queryFn: () => getAntecedentePersonalById(id),
    enabled: !!id,
  });

  return {
    antecedentePersonal: data,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useCreateAntecedentePersonal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAntecedentePersonalCreate) => createAntecedentePersonal(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes', variables.paciente] });
    },
  });
};

export const useUpdateAntecedentePersonal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IAntecedentePersonalUpdate }) =>
      updateAntecedentePersonal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedente-personal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
      
      const pacienteId = variables.data.paciente;
      if (pacienteId) {
        queryClient.invalidateQueries({ queryKey: ['antecedentes', pacienteId] });
      }
    },
  });
};

export const useRemoveAntecedentePersonal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAntecedentePersonal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
    },
  });
};

// ============================================================================
// HOOKS PARA ANTECEDENTES FAMILIARES (CON PAGINACIÓN BACKEND)
// ============================================================================

export const useAntecedentesFamiliares = (filters?: IAntecedenteFilters) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['antecedentes-familiares', filters],
    queryFn: () => getAntecedentesFamiliares(filters),
    staleTime: 5 * 60 * 1000,
  });

  return {
    antecedentesFamiliares: data?.results || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useAntecedenteFamiliarById = (id: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['antecedente-familiar', id],
    queryFn: () => getAntecedenteFamiliarById(id),
    enabled: !!id,
  });

  return {
    antecedenteFamiliar: data,
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useCreateAntecedenteFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAntecedenteFamiliarCreate) => createAntecedenteFamiliar(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes', variables.paciente] });
    },
  });
};

export const useUpdateAntecedenteFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IAntecedenteFamiliarUpdate }) =>
      updateAntecedenteFamiliar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedente-familiar', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
      
      const pacienteId = variables.data.paciente;
      if (pacienteId) {
        queryClient.invalidateQueries({ queryKey: ['antecedentes', pacienteId] });
      }
    },
  });
};

export const useRemoveAntecedenteFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAntecedenteFamiliar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
    },
  });
};

// ============================================================================
// HOOK UNIFICADO PARA ANTECEDENTES (COMBINADO) - ✅ PAGINACIÓN POR GRUPOS
// ============================================================================

export const useAntecedentes = (filters?: IAntecedenteFilters) => {
  const {
    data: antecedentesPersonalesData,
    isLoading: isLoadingPersonales,
    isError: isErrorPersonales,
    error: errorPersonales
  } = useQuery({
    queryKey: ['antecedentes-personales-all', { 
      paciente: filters?.paciente, 
      activo: filters?.activo,
      search: filters?.search 
    }],
    queryFn: () => getAllAntecedentesPersonales({
      paciente: filters?.paciente,
      activo: filters?.activo,
      search: filters?.search,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: antecedentesFamiliaresData,
    isLoading: isLoadingFamiliares,
    isError: isErrorFamiliares,
    error: errorFamiliares
  } = useQuery({
    queryKey: ['antecedentes-familiares-all', { 
      paciente: filters?.paciente, 
      activo: filters?.activo,
      search: filters?.search 
    }],
    queryFn: () => getAllAntecedentesFamiliares({
      paciente: filters?.paciente,
      activo: filters?.activo,
      search: filters?.search,
    }),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ NUEVA LÓGICA: Agrupar primero, paginar después
  const { paginatedResults, pagination } = useMemo(() => {
    const combined: IAntecedenteCombinado[] = [];

    if (antecedentesPersonalesData?.results && Array.isArray(antecedentesPersonalesData.results)) {
      antecedentesPersonalesData.results.forEach(personal => {
        combined.push({
          ...personal,
          tipo: 'personal' as const,
        });
      });
    }

    if (antecedentesFamiliaresData?.results && Array.isArray(antecedentesFamiliaresData.results)) {
      antecedentesFamiliaresData.results.forEach(familiar => {
        combined.push({
          ...familiar,
          tipo: 'familiar' as const,
        });
      });
    }

    // Ordenar por fecha de creación descendente
    const sorted = combined.sort((a, b) => {
      const dateA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const dateB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      return dateB - dateA;
    });

    // ✅ PASO 1: Agrupar por paciente (ANTES de paginar)
    const grouped = new Map<string, IAntecedenteCombinado[]>();
    
    sorted.forEach((antecedente) => {
      const pacienteId = antecedente.paciente;
      if (!grouped.has(pacienteId)) {
        grouped.set(pacienteId, []);
      }
      grouped.get(pacienteId)!.push(antecedente);
    });

    // Convertir a array de grupos (cada grupo = 1 fila en la tabla)
    const groupedArray = Array.from(grouped.values());

    // ✅ PASO 2: Aplicar paginación sobre grupos (NO sobre antecedentes individuales)
    const page = filters?.page || 1;
    const pageSize = filters?.page_size || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedGroups = groupedArray.slice(startIndex, endIndex);
    
    // ✅ PASO 3: "Desagrupar" los grupos paginados para devolverlos como lista plana
    const paginatedFlat: IAntecedenteCombinado[] = [];
    paginatedGroups.forEach(group => {
      paginatedFlat.push(...group);
    });

    const totalGroups = groupedArray.length; // Total de PACIENTES (no antecedentes)
    const totalPages = Math.ceil(totalGroups / pageSize);

    return {
      paginatedResults: paginatedFlat,
      pagination: {
        total_count: totalGroups, // ✅ Contamos GRUPOS, no antecedentes individuales
        total_pages: totalPages,
        current_page: page,
        page_size: pageSize,
      },
    };
  }, [antecedentesPersonalesData, antecedentesFamiliaresData, filters?.page, filters?.page_size]);

  const isLoading = isLoadingPersonales || isLoadingFamiliares;
  const isError = isErrorPersonales || isErrorFamiliares;
  const error = errorPersonales?.toString() || errorFamiliares?.toString() || 'Error desconocido';

  return {
    antecedentes: paginatedResults, // ✅ Ya paginados por GRUPOS
    pagination,
    isLoading,
    isError,
    error,
  };
};

export const useAntecedentesByPaciente = (pacienteId?: string) => {
  return useAntecedentes({
    paciente: pacienteId,
    activo: true,
    page: 1,
    page_size: 100,
  });
};

// ============================================================================
// HOOKS PARA DESACTIVAR AMBOS ANTECEDENTES
// ============================================================================

export const useDesactivarTodosAntecedentesPorPaciente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pacienteId: string) => desactivarTodosAntecedentesPorPacienteId(pacienteId),
    onSuccess: (_, pacienteId) => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes', pacienteId] });
    },
  });
};

export const useDesactivarAntecedentesPorIds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personalId, familiarId }: { personalId: string; familiarId: string }) =>
      desactivarAntecedentesPorIds(personalId, familiarId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-personales-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes-familiares-all'] });
      queryClient.invalidateQueries({ queryKey: ['antecedentes'] });
    },
  });
};
