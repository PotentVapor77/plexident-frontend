// frontend/src/services/appointments/recordatorioService.ts

import { ENDPOINTS } from '../../config/api';
import type {
  IRecordatorioEnvio,
  IRecordatorioCita,
  IRecordatorioEstadisticas
} from '../../types/appointments/IAppointment';
import api from '../api/axiosInstance';
import { AxiosError, isAxiosError } from 'axios';


// Tipo para respuesta de error del servidor
interface IServerError {
  detail?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// Tipo para los filtros de recordatorios
interface IRecordatoriosFilters {
  cita?: string;
  tipo_recordatorio?: string;
  enviado_exitosamente?: boolean;
}

const recordatorioService = {
  // Enviar recordatorio para una cita
  enviarRecordatorio: async (
  citaId: string,
  data: IRecordatorioEnvio
): Promise<{ exito: boolean; mensaje: string; recordatorio: IRecordatorioCita | null }> => {
  try {

    if (!citaId || citaId.trim() === '') {
      return {
        exito: false,
        mensaje: 'ID de cita no válido',
        recordatorio: null,
      };
    }

    if (!data.tipo_recordatorio || !data.destinatario) {
      return {
        exito: false,
        mensaje: 'Faltan datos requeridos para enviar el recordatorio',
        recordatorio: null,
      };
    }

    const endpoint = ENDPOINTS.appointment.citas.enviarRecordatorio(citaId);

    const response = await api.post(endpoint, data);

    // ✅ Retorna el formato esperado
    return {
      exito: true,
      mensaje: 'Recordatorio enviado exitosamente',
      recordatorio: response.data.recordatorio || response.data,
    };
  } catch (error: unknown) {
    console.error('❌ enviarRecordatorio - Error:', error);

    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<IServerError>;
      const status = axiosError.response?.status;
      const errorData = axiosError.response?.data || {};

      // ✅ RETORNA en lugar de throw
      let mensajeError: string;

      switch (status) {
        case 400:
          mensajeError =
            errorData.message ||
            errorData.detail ||
            errorData.error ||
            'Datos inválidos enviados al servidor';
          break;
        case 401:
          mensajeError = 'No autorizado. Por favor, inicie sesión nuevamente.';
          break;
        case 403:
          mensajeError = 'No tiene permisos para enviar recordatorios';
          break;
        case 404:
          mensajeError = 'La cita no fue encontrada';
          break;
        case 500:
          mensajeError =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            'Error interno del servidor. Por favor, intente más tarde.';
          break;
        default:
          mensajeError =
            errorData.message ||
            errorData.detail ||
            errorData.error ||
            `Error ${status}: No se pudo enviar el recordatorio`;
      }

      // ✅ Retorna { exito: false } en lugar de throw
      return {
        exito: false,
        mensaje: mensajeError,
        recordatorio: null,
      };
    } else if (error instanceof Error) {
      return {
        exito: false,
        mensaje: `Error: ${error.message}`,
        recordatorio: null,
      };
    } else {
      return {
        exito: false,
        mensaje: 'Error desconocido al enviar recordatorio',
        recordatorio: null,
      };
    }
  }
},

  // Obtener estadísticas de recordatorios
  obtenerEstadisticas: async (): Promise<IRecordatorioEstadisticas> => {
    try {
      console.log('📊 obtenerEstadisticas - Solicitando estadísticas...');
      
      const response = await api.get<IRecordatorioEstadisticas>(
        ENDPOINTS.appointment.citas.estadisticasRecordatorios
      );
      
      console.log('✅ obtenerEstadisticas - Respuesta:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ obtenerEstadisticas - Error:', error);
      
      // Retornar estadísticas vacías en caso de error
      const estadisticasVacias: IRecordatorioEstadisticas = {
        total_enviados: 0,
        exitosos: 0,
        fallidos: 0,
        tasa_exito: 0,
        por_destinatario: {
          PACIENTE: 0,
          ODONTOLOGO: 0,
          AMBOS: 0
        },
        ultimos_recordatorios: []
      };
      
      return estadisticasVacias;
    }
  },

  // Obtener todos los recordatorios (con filtros opcionales)
  obtenerRecordatorios: async (params?: IRecordatoriosFilters): Promise<IRecordatorioCita[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${ENDPOINTS.appointment.recordatorios.base}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      
      console.log('📤 obtenerRecordatorios - URL:', url);
      const response = await api.get(url);
      
      console.log('✅ obtenerRecordatorios - Respuesta recibida');
      
      // Extraer datos de la respuesta
      const data = response.data as unknown;
      
      if (Array.isArray(data)) {
        return data as IRecordatorioCita[];
      }
      
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        if (Array.isArray(dataObj.results)) {
          return dataObj.results as IRecordatorioCita[];
        }
        
        if (Array.isArray(dataObj.data)) {
          return dataObj.data as IRecordatorioCita[];
        }
      }
      
      return [];
    } catch (error: unknown) {
      console.error('❌ obtenerRecordatorios - Error:', error);
      
      // Verificar si es error 404 usando type guard
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log('📭 No se encontraron recordatorios');
        }
      }
      
      return [];
    }
  },

  // Obtener recordatorios de una cita específica
  obtenerRecordatoriosPorCita: async (citaId: string): Promise<IRecordatorioCita[]> => {
    try {
      console.log('📤 obtenerRecordatoriosPorCita - Cita ID:', citaId);
      
      if (!citaId || citaId.trim() === '') {
        console.warn('⚠️ ID de cita vacío o inválido');
        return [];
      }
      
      const params = new URLSearchParams();
      params.append('cita', citaId);
      
      const url = `${ENDPOINTS.appointment.recordatorios.base}?${params.toString()}`;
      console.log('🌐 URL construida:', url);
      
      const response = await api.get(url);
      
      console.log('✅ obtenerRecordatoriosPorCita - Respuesta recibida');
      
      const data = response.data as unknown;
      
      if (Array.isArray(data)) {
        return data as IRecordatorioCita[];
      }
      
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        if (Array.isArray(dataObj.results)) {
          return dataObj.results as IRecordatorioCita[];
        }
        
        if (Array.isArray(dataObj.data)) {
          return dataObj.data as IRecordatorioCita[];
        }
      }
      
      return [];
    } catch (error: unknown) {
      console.error('❌ obtenerRecordatoriosPorCita - Error:', error);
      
      // Verificar si es error 404 usando type guard
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(`📭 No se encontraron recordatorios para la cita ${citaId}`);
        }
      }
      
      return [];
    }
  },

  // Verificar si una cita tiene recordatorios enviados
  verificarRecordatoriosEnviados: async (citaId: string): Promise<boolean> => {
    try {
      const recordatorios = await recordatorioService.obtenerRecordatoriosPorCita(citaId);
      
      // Verificar si hay algún recordatorio exitoso
      const tieneExitosos = recordatorios.some(recordatorio => 
        recordatorio.enviado_exitosamente === true
      );
      
      return tieneExitosos;
    } catch (error: unknown) {
      console.error('❌ verificarRecordatoriosEnviados - Error:', error);
      return false;
    }
  },

  // Obtener último recordatorio exitoso de una cita
  obtenerUltimoRecordatorioExitoso: async (citaId: string): Promise<IRecordatorioCita | null> => {
    try {
      const recordatorios = await recordatorioService.obtenerRecordatoriosPorCita(citaId);
      
      if (recordatorios.length === 0) {
        return null;
      }
      
      // Filtrar solo los exitosos y ordenar por fecha descendente
      const exitosos = recordatorios
        .filter((r: IRecordatorioCita) => r.enviado_exitosamente === true)
        .sort((a: IRecordatorioCita, b: IRecordatorioCita) => {
          try {
            const fechaA = a.fecha_envio ? new Date(a.fecha_envio).getTime() : 0;
            const fechaB = b.fecha_envio ? new Date(b.fecha_envio).getTime() : 0;
            return fechaB - fechaA;
          } catch {
            return 0;
          }
        });
      
      return exitosos.length > 0 ? exitosos[0] : null;
    } catch (error: unknown) {
      console.error('❌ obtenerUltimoRecordatorioExitoso - Error:', error);
      return null;
    }
  }
};

export default recordatorioService;