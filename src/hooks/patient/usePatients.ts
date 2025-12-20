import { useState, useEffect, useCallback } from 'react';
import type {
  IPaciente,
  IPacienteCreate,
  IPacienteUpdate,
  IPacientePagination,
  UsePacientesParams,
} from '../../types/patient/IPatient';
import {
  createPaciente,
  deletePaciente,
  getPacientes,
  togglePacienteStatus,
  updatePaciente,
} from '../../services/patient/patientService';

export const usePacientes = (initialParams: UsePacientesParams = {}) => {
  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<IPacientePagination>({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);

  const fetchPacientes = useCallback(
    async (params: UsePacientesParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPacientes(params); // IPacienteListResponse
        const { count, next, previous, results } = response.data;

        setPacientes(results);

        setPagination({
          count,
          next,
          previous,
          page: params.page || 1,
          page_size: params.page_size || 10,
          total_pages: Math.ceil(count / (params.page_size || 10)),
          has_next: !!next,
          has_previous: !!previous,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPacientes(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    fetchPacientes(initialParams);
  }, [fetchPacientes, initialParams]);

  const createPacienteHandler = async (data: IPacienteCreate): Promise<IPaciente> => {
    const paciente = await createPaciente(data);
    refetch();
    return paciente;
  };

  const updatePacienteHandler = async (
    id: string,
    data: IPacienteUpdate
  ): Promise<IPaciente> => {
    const paciente = await updatePaciente(id, data);
    refetch();
    return paciente;
  };

  const deletePacienteHandler = async (id: string): Promise<void> => {
    await deletePaciente(id);
    refetch();
  };

  const togglePacienteStatusHandler = async (id: string): Promise<IPaciente> => {
    const paciente = await togglePacienteStatus(id);
    refetch();
    return paciente;
  };

  return {
    pacientes,
    loading,
    error,
    pagination,
    selectedPaciente,
    setSelectedPaciente,
    fetchPacientes,
    refetch,
    createPaciente: createPacienteHandler,
    updatePaciente: updatePacienteHandler,
    deletePaciente: deletePacienteHandler,
    togglePacienteStatus: togglePacienteStatusHandler,
  };
};
