// frontend/src/services/appointments/scheduleService.ts

import api from '../api/axiosInstance';
import { ENDPOINTS } from '../../config/api';
import type {
  IHorarioAtencion,
  IHorarioAtencionCreate,
  IHorarioAtencionUpdate,
} from '../../types/appointments/IAppointment';

const scheduleService = {
  // ✅ OBTENER TODOS LOS HORARIOS
  getAll: async (params?: {
    odontologo?: string;
    activo?: boolean;
    dia_semana?: number;
  }): Promise<IHorarioAtencion[]> => {
    try {
      console.log('🔄 Fetching horarios con params:', params);
      const response = await api.get(ENDPOINTS.appointment.horarios.base, { params });
      console.log('✅ Response data:', response.data);

      // ✅ CORRECCIÓN: Manejar correctamente la estructura anidada
      
      // Caso 1: Array directo
      if (Array.isArray(response.data)) {
        console.log('📦 Caso 1: Array directo');
        return response.data;
      }

      // Caso 2: { data: { results: [...] } } ← TU CASO
      if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
        console.log('📦 Caso 2: data.data.results');
        return response.data.data.results;
      }

      // Caso 3: { data: [...] }
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('📦 Caso 3: data.data array');
        return response.data.data;
      }

      // Caso 4: { results: [...] }
      if (response.data?.results && Array.isArray(response.data.results)) {
        console.log('📦 Caso 4: results directo');
        return response.data.results;
      }

      console.warn('⚠️ Estructura de respuesta no reconocida:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching horarios:', error);
      throw error;
    }
  },

  // ✅ OBTENER HORARIOS POR ODONTÓLOGO
  getByOdontologo: async (odontologoId: string): Promise<IHorarioAtencion[]> => {
    try {
      const response = await api.get(
        ENDPOINTS.appointment.horarios.porOdontologo(odontologoId)
      );
      
      // Aplicar la misma lógica
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.data?.results) return response.data.data.results;
      if (response.data?.results) return response.data.results;
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching horarios por odontólogo:', error);
      throw error;
    }
  },

  // ✅ OBTENER UN HORARIO POR ID
  getById: async (id: string): Promise<IHorarioAtencion> => {
    try {
      const response = await api.get(ENDPOINTS.appointment.horarios.byId(id));
      
      // Para un solo elemento, puede estar en data.data o directamente en data
      if (response.data?.data && !Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching horario:', error);
      throw error;
    }
  },

  // ✅ CREAR HORARIO
  create: async (data: IHorarioAtencionCreate): Promise<IHorarioAtencion> => {
    try {
      console.log('📝 Creando horario:', data);
      const response = await api.post(ENDPOINTS.appointment.horarios.base, data);
      console.log('✅ Horario creado:', response.data);
      
      // Extraer el horario creado
      if (response.data?.data && !Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating horario:', error);
      throw error;
    }
  },

  // ✅ ACTUALIZAR HORARIO
  update: async (
    id: string,
    data: IHorarioAtencionUpdate
  ): Promise<IHorarioAtencion> => {
    try {
      console.log('📝 Actualizando horario:', id, data);
      const response = await api.patch(
        ENDPOINTS.appointment.horarios.byId(id),
        data
      );
      console.log('✅ Horario actualizado:', response.data);
      
      // Extraer el horario actualizado
      if (response.data?.data && !Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating horario:', error);
      throw error;
    }
  },

  // ✅ ELIMINAR HORARIO
  delete: async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Eliminando horario:', id);
      await api.delete(ENDPOINTS.appointment.horarios.byId(id));
      console.log('✅ Horario eliminado');
    } catch (error) {
      console.error('❌ Error deleting horario:', error);
      throw error;
    }
  },

  // ✅ ACTIVAR/DESACTIVAR HORARIO
  toggleActive: async (id: string, activo: boolean): Promise<IHorarioAtencion> => {
    try {
      const response = await api.patch(
        ENDPOINTS.appointment.horarios.byId(id),
        { activo }
      );
      
      // Extraer el horario actualizado
      if (response.data?.data && !Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling horario:', error);
      throw error;
    }
  },

  // ✅ VERIFICAR HORARIOS EXISTENTES
  checkExisting: async (
    odontologoId: string,
    diaSemana: number
  ): Promise<IHorarioAtencion[]> => {
    try {
      const response = await api.get(ENDPOINTS.appointment.horarios.base, {
        params: {
          odontologo: odontologoId,
          dia_semana: diaSemana,
          activo: true,
        },
      });
      
      // Aplicar la misma lógica de extracción
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.data?.results) return response.data.data.results;
      if (response.data?.results) return response.data.results;
      
      return [];
    } catch (error) {
      console.error('❌ Error checking existing horarios:', error);
      throw error;
    }
  },
};

export default scheduleService;
