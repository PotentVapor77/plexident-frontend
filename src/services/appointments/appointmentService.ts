// frontend/src/services/appointments/appointmentService.ts

import { ENDPOINTS } from '../../config/api';
import type {
  ICita,
  ICitaCreate,
  EstadoCita,
} from '../../types/appointments/IAppointment';
import api from '../api/axiosInstance';

const appointmentService = {
  // Obtener todas las citas con filtros
  getAllCitas: async (params?: {
    search?: string;
    odontologo?: string;
    paciente?: string;
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    tipo_consulta?: string;
    activo?: boolean;
  }): Promise<unknown> => {
    try {
      const queryParams = new URLSearchParams();
      const paramsWithDefaults = {
        activo: true,
        ...params
      };

      if (paramsWithDefaults) {
        Object.entries(paramsWithDefaults).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${ENDPOINTS.appointments.citas.base}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      console.log('📡 getAllCitas - URL:', url);
      const response = await api.get(url);
      console.log('📦 getAllCitas - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getAllCitas - Error:', error);
      throw error;
    }
  },

  // Obtener citas por semana
  getCitasBySemana: async (fecha_inicio: string, odontologoId?: string): Promise<unknown> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('fecha_inicio', fecha_inicio);
      queryParams.append('activo', 'true');

      if (odontologoId) {
        queryParams.append('odontologo', odontologoId);
      }

      const url = `${ENDPOINTS.appointments.citas.porSemana}?${queryParams.toString()}`;
      console.log('📡 getCitasBySemana - URL:', url);
      const response = await api.get(url);
      console.log('📦 getCitasBySemana - Respuesta completa:', response.data);

      const data = response.data;
      if (data.success === false || (data.status_code && data.status_code !== 200)) {
        console.warn('⚠️ API devolvió estado no exitoso:', data);
        return [];
      }

      return data;
    } catch (error) {
      console.error('❌ getCitasBySemana - Error:', error);
      throw error;
    }
  },

  // Obtener citas por odontólogo y fecha
  getCitasByOdontologo: async (odontologoId: string, fecha: string): Promise<unknown> => {
    try {
      const url = `${ENDPOINTS.appointments.citas.porOdontologo(odontologoId)}?fecha=${fecha}&activo=true`;
      console.log('📡 getCitasByOdontologo - URL:', url);
      const response = await api.get(url);
      console.log('📦 getCitasByOdontologo - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getCitasByOdontologo - Error:', error);
      throw error;
    }
  },

  // Crear una nueva cita
  createCita: async (data: ICitaCreate): Promise<ICita> => {
    try {
      console.log('📝 createCita - Datos:', data);
      const response = await api.post(ENDPOINTS.appointments.citas.base, data);
      console.log('✅ createCita - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ createCita - Error:', error);
      throw error;
    }
  },

  // Obtener horarios disponibles
  getHorariosDisponibles: async (
    odontologo: string,
    fecha: string,
    duracion: number
  ): Promise<unknown> => {
    try {
      if (duracion < 15) {
        console.warn(`⚠️ Duración (${duracion}) menor a 15 minutos. No se enviará la solicitud.`);
        throw new Error('La duración mínima es de 15 minutos');
      }

      const data = {
        odontologo,
        fecha,
        duracion
      };

      console.log('📡 getHorariosDisponibles - Datos:', data);
      const response = await api.post(ENDPOINTS.appointments.citas.horariosDisponibles, data);
      console.log('📦 getHorariosDisponibles - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getHorariosDisponibles - Error:', error);
      throw error;
    }
  },

  // Actualizar cita (método general - NO usar para reprogramar)
  updateCita: async (id: string, data: Partial<ICita>): Promise<ICita> => {
    try {
      console.log('📝 updateCita - ID:', id, 'Data:', data);
      const response = await api.patch(ENDPOINTS.appointments.citas.byId(id), data);
      console.log('✅ updateCita - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ updateCita - Error:', error);
      throw error;
    }
  },

// Reprogramar cita
reprogramarCita: async (
  id: string,
  nueva_fecha: string,
  nueva_hora_inicio: string
): Promise<ICita> => {
  try {
    
    const response = await api.post(
      ENDPOINTS.appointments.citas.reprogramar(id),
      {
        nueva_fecha,
        nueva_hora_inicio
      }
    );
    
    const citaReprogramada = response.data;
    
  
    return citaReprogramada;
  } catch (error) {
    console.error('❌ reprogramarCita - Error:', error);
    throw error;
  }
},

  // Eliminar cita
  deleteCita: async (id: string): Promise<void> => {
    try {
      console.log('🗑️ deleteCita - ID:', id);
      await api.delete(ENDPOINTS.appointments.citas.byId(id));
      console.log('✅ deleteCita - Cita eliminada');
    } catch (error) {
      console.error('❌ deleteCita - Error:', error);
      throw error;
    }
  },

  // Cancelar cita
  cancelCita: async (id: string, motivo?: string): Promise<ICita> => {
    try {
      console.log('❌ cancelCita - ID:', id, 'Motivo:', motivo);
      const data = motivo ? { motivo_cancelacion: motivo } : {};
      const response = await api.post(ENDPOINTS.appointments.citas.cancelar(id), data);
      console.log('✅ cancelCita - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ cancelCita - Error:', error);
      throw error;
    }
  },

  // Cambiar estado de cita
  cambiarEstadoCita: async (id: string, estado: EstadoCita): Promise<ICita> => {
    try {
      console.log('🔄 cambiarEstadoCita - ID:', id, 'Estado:', estado);
      const response = await api.patch(ENDPOINTS.appointments.citas.cambiarEstado(id), { estado });
      console.log('✅ cambiarEstadoCita - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ cambiarEstadoCita - Error:', error);
      throw error;
    }
  },
};

export default appointmentService;
