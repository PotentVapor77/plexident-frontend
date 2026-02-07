// src/services/parameters/parametersService.ts

import { ENDPOINTS } from '../../config/api';
import api from '../api/axiosInstance';
import type {
  IHorario,
  IHorarioBulkUpdate,
  IBulkUpdateResponse,
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

const parametersService = {
  // ============================================================================
  // HORARIOS (RF-07.1)
  // ============================================================================
  
  /**
   * ✅ CORREGIDO: Obtener todos los horarios de la semana
   */
  getHorarios: async (): Promise<IHorario[]> => {
    const response = await api.get(ENDPOINTS.parameters.horarios.base);
    
    // Normalizar diferentes estructuras de respuesta del backend
    const data = response.data;
    
    // Si tiene estructura: { data: { results: [...] } }
    if (data?.data?.results) {
      return data.data.results;
    }
    
    // Si tiene estructura: { data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Si viene directo como array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Si tiene results directo
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    console.warn('Estructura de respuesta inesperada:', data);
    return [];
  },

  /**
   * Obtener horario por ID
   */
  getHorarioById: async (id: string): Promise<IHorario> => {
    const response = await api.get(ENDPOINTS.parameters.horarios.byId(id));
    return response.data?.data || response.data;
  },

  /**
   * ✅ CORREGIDO: Actualización masiva de horarios
   */
 bulkUpdateHorarios: async (data: IHorarioBulkUpdate): Promise<IBulkUpdateResponse> => {
  // ✅ IMPORTANTE: Mantener los IDs que vienen del formulario
  const cleanData = {
    horarios: data.horarios.map(h => ({
      id: h.id, // ← MANTENER EL ID SI EXISTE
      dia_semana: h.dia_semana,
      activo: h.activo,
      apertura: h.apertura.substring(0, 5), // Formato HH:MM
      cierre: h.cierre.substring(0, 5),
    }))
  };
  
  
  try {
    const response = await api.post(ENDPOINTS.parameters.horarios.bulkUpdate, cleanData);
    return response.data?.data || response.data;
  } catch (error: any) {
    
    // ✅ MEJORAR LOGS DE ERROR
    if (error.response) {
      
      // Extraer mensaje específico del backend
      let errorMessage = 'Error en los datos enviados';
      if (error.response.data?.errors) {
        errorMessage = JSON.stringify(error.response.data.errors);
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
},

  /**
   * Actualizar un horario individual
   */
  updateHorario: async (id: string, data: Partial<IHorario>): Promise<IHorario> => {
    const response = await api.patch(ENDPOINTS.parameters.horarios.byId(id), data);
    return response.data?.data || response.data;
  },

  // ============================================================================
  // DIAGNÓSTICOS (RF-07.2)
  // ============================================================================
  
  /**
   * Obtener todos los diagnósticos
   */
  getDiagnosticos: async (params?: {
    search?: string;
    categoria?: string;
  }): Promise<IDiagnostico[]> => {
    const response = await api.get(ENDPOINTS.parameters.diagnosticos.base, { params });
    const data = response.data;
    
    if (data?.data?.results) return data.data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    
    return [];
  },

  /**
   * Obtener diagnóstico por ID
   */
  getDiagnosticoById: async (id: string): Promise<IDiagnostico> => {
    const response = await api.get(ENDPOINTS.parameters.diagnosticos.byId(id));
    return response.data?.data || response.data;
  },

  /**
   * Crear diagnóstico
   */
  createDiagnostico: async (data: IDiagnosticoCreate): Promise<IDiagnostico> => {
    const response = await api.post(ENDPOINTS.parameters.diagnosticos.base, data);
    return response.data?.data || response.data;
  },

  /**
   * Actualizar diagnóstico
   */
  updateDiagnostico: async (id: string, data: IDiagnosticoUpdate): Promise<IDiagnostico> => {
    const response = await api.patch(ENDPOINTS.parameters.diagnosticos.byId(id), data);
    return response.data?.data || response.data;
  },

  /**
   * Eliminar (desactivar) diagnóstico
   */
  deleteDiagnostico: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.parameters.diagnosticos.byId(id));
  },

  // ============================================================================
  // MEDICAMENTOS (RF-07.3)
  // ============================================================================
  
  /**
   * Obtener todos los medicamentos
   */
  getMedicamentos: async (params?: {
    search?: string;
    categoria?: string;
    via_administracion?: string;
  }): Promise<IMedicamento[]> => {
    const response = await api.get(ENDPOINTS.parameters.medicamentos.base, { params });
    const data = response.data;
    
    if (data?.data?.results) return data.data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    
    return [];
  },

  /**
   * Obtener medicamento por ID
   */
  getMedicamentoById: async (id: string): Promise<IMedicamento> => {
    const response = await api.get(ENDPOINTS.parameters.medicamentos.byId(id));
    return response.data?.data || response.data;
  },

  /**
   * Crear medicamento
   */
  createMedicamento: async (data: IMedicamentoCreate): Promise<IMedicamento> => {
    const response = await api.post(ENDPOINTS.parameters.medicamentos.base, data);
    return response.data?.data || response.data;
  },

  /**
   * Actualizar medicamento
   */
  updateMedicamento: async (id: string, data: IMedicamentoUpdate): Promise<IMedicamento> => {
    const response = await api.patch(ENDPOINTS.parameters.medicamentos.byId(id), data);
    return response.data?.data || response.data;
  },

  /**
   * Eliminar (desactivar) medicamento
   */
  deleteMedicamento: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.parameters.medicamentos.byId(id));
  },

  // ============================================================================
  // SEGURIDAD (RF-07.4 y RF-07.5)
  // ============================================================================
  
  /**
   * Obtener configuración de seguridad
   */
  getConfiguracionSeguridad: async (): Promise<IConfiguracionSeguridad> => {
    const response = await api.get(ENDPOINTS.parameters.seguridad);
    return response.data?.data || response.data;
  },

  /**
   * Actualizar configuración de seguridad
   */
  updateConfiguracionSeguridad: async (
    data: IConfiguracionSeguridadUpdate
  ): Promise<IConfiguracionSeguridad> => {
    const response = await api.patch(ENDPOINTS.parameters.seguridad, data);
    return response.data?.data || response.data;
  },

  // ============================================================================
  // NOTIFICACIONES (RF-07.7)
  // ============================================================================
  
  /**
   * Obtener configuración de notificaciones
   */
  getConfiguracionNotificaciones: async (): Promise<IConfiguracionNotificaciones> => {
    const response = await api.get(ENDPOINTS.parameters.notificaciones.base);
    return response.data?.data || response.data;
  },

  /**
   * Actualizar configuración de notificaciones
   */
  updateConfiguracionNotificaciones: async (
    data: IConfiguracionNotificacionesUpdate
  ): Promise<IConfiguracionNotificaciones> => {
    const response = await api.patch(ENDPOINTS.parameters.notificaciones.base, data);
    return response.data?.data || response.data;
  },

  /**
   * Enviar email de prueba
   */
  testEmail: async (data: ITestEmailRequest): Promise<{ message: string }> => {
    const response = await api.post(ENDPOINTS.parameters.notificaciones.testEmail, data);
    return response.data?.data || response.data;
  },

  /**
   * Enviar SMS de prueba
   */
  testSms: async (data: ITestSmsRequest): Promise<{ message: string }> => {
    const response = await api.post(ENDPOINTS.parameters.notificaciones.testSms, data);
    return response.data?.data || response.data;
  },
};

export default parametersService;
