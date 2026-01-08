// frontend/src/hooks/appointments/useSchedule.ts

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type {
  IHorarioAtencion,
  IHorarioAtencionCreate,
  IHorarioAtencionUpdate
} from '../../types/appointments/IAppointment';
import scheduleService from '../../services/appointments/scheduleService';

// ✅ Tipos para errores de API
interface ApiErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

interface ApiError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message: string;
}

// ✅ Tipos para respuestas de API
interface ApiResponseWithResults<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface ApiResponseWrapped<T> {
  data: T | ApiResponseWithResults<T>;
}

type ApiResponse<T> = T[] | ApiResponseWithResults<T> | ApiResponseWrapped<T>;

export const useSchedule = () => {
  const [horarios, setHorarios] = useState<IHorarioAtencion[]>([]);
  const [loading, setLoading] = useState(false);

  const extractHorarios = (response: ApiResponse<IHorarioAtencion>): IHorarioAtencion[] => {
    console.log('🔍 extractHorarios - Response completa:', response);

    // Caso 1: Array directo
    if (Array.isArray(response)) {
      return response;
    }

    // Caso 2: { results: [...] }
    if ('results' in response && Array.isArray(response.results)) {
      return response.results;
    }

    // Caso 3: { data: { results: [...] } }
    if ('data' in response) {
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        return data.results;
      }
    }

    console.warn('⚠️ No se pudo extraer horarios de:', response);
    return [];
  };

  const handleApiError = (error: unknown, defaultMessage: string): void => {
    console.error(`❌ ${defaultMessage}:`, error);

    const apiError = error as ApiError;

    if (apiError.response?.data) {
      console.error('📋 Error response data:', apiError.response.data);
      
      if (apiError.response.data.detail) {
        toast.error(`Error: ${apiError.response.data.detail}`);
        return;
      }
      
      if (apiError.response.data.non_field_errors) {
        toast.error(`Error: ${apiError.response.data.non_field_errors[0]}`);
        return;
      }
      
      // Procesar errores de campo
      const fieldErrors = Object.entries(apiError.response.data)
        .filter(([key]) => key !== 'detail' && key !== 'non_field_errors')
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${String(messages)}`;
        })
        .join(' | ');
      
      if (fieldErrors) {
        toast.error(`Errores: ${fieldErrors}`);
        return;
      }
      
      toast.error(defaultMessage);
      return;
    }
    
    if (apiError.message?.includes('HTML') || apiError.message?.includes('<')) {
      toast.error('Error de servidor. Por favor contacte al administrador.');
      return;
    }
    
    toast.error(defaultMessage);
  };

  const fetchHorarios = useCallback(async (params?: { odontologo?: string; activo?: boolean }) => {
    setLoading(true);
    try {
      console.log('🔄 Fetching horarios con params:', params);
      const response = await scheduleService.getAll(params);
      const horariosData = extractHorarios(response);
      console.log('✅ Horarios extraídos:', horariosData.length);
      setHorarios(horariosData);
      return horariosData;
    } catch (error: unknown) {
      handleApiError(error, 'Error al cargar horarios');
      setHorarios([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createHorario = async (data: IHorarioAtencionCreate): Promise<IHorarioAtencion> => {
    setLoading(true);
    try {
      console.log('📝 Creando horario:', JSON.stringify(data, null, 2));
      const newHorario = await scheduleService.create(data);
      console.log('✅ Horario creado:', newHorario);
      
      setHorarios((prev) => [...prev, newHorario]);
      toast.success('Horario creado exitosamente');
      
      return newHorario;
    } catch (error: unknown) {
      handleApiError(error, 'Error al crear horario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHorario = async (id: string, data: IHorarioAtencionUpdate): Promise<IHorarioAtencion> => {
    setLoading(true);
    try {
      console.log('📝 Actualizando horario:', id, JSON.stringify(data, null, 2));
      const updated = await scheduleService.update(id, data);
      console.log('✅ Horario actualizado:', updated);
      
      setHorarios((prev) => prev.map((h) => (h.id === id ? updated : h)));
      toast.success('Horario actualizado exitosamente');
      
      return updated;
    } catch (error: unknown) {
      handleApiError(error, 'Error al actualizar horario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHorario = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('🗑️ Eliminando horario:', id);
      await scheduleService.delete(id);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      toast.success('Horario eliminado exitosamente');
    } catch (error: unknown) {
      handleApiError(error, 'Error al eliminar horario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, activo: boolean): Promise<IHorarioAtencion> => {
    try {
      console.log(`🔄 Cambiando estado de horario ${id} a activo=${activo}`);
      return await updateHorario(id, { activo });
    } catch (error: unknown) {
      console.error('❌ Error en toggleActive:', error);
      throw error;
    }
  };

  return {
    horarios,
    loading,
    fetchHorarios,
    createHorario,
    updateHorario,
    deleteHorario,
    toggleActive,
  };
};
