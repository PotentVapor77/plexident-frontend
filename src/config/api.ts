/**
 * ============================================================================
 * API CONFIGURATION - ✅ CORREGIDO
 * ============================================================================
 */

// Base URL desde variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

//  YA NO NECESITAMOS STORAGE_KEYS PARA TOKENS
export const STORAGE_KEYS = {
  theme: 'plexident_theme',
  sidebar: 'plexident_sidebar_collapsed',
} as const;

// Endpoints del API
export const ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/refresh/',
    me: '/auth/me/',
    register: '/auth/register/',
    passwordReset: '/auth/password-reset/',
    passwordResetConfirm: '/auth/password-reset-confirm/',
  },
  users: {
    base: '/users/usuarios/',
    byId: (id: string) => `/users/usuarios/${id}/`,

  },
  patients: {
    base: '/patients/pacientes/',
    byId: (id: string) => `/patients/pacientes/${id}/`,
  },

  

   // ============================================================================
  // ANTECEDENTES PERSONALES (Relacionado OneToOne con Patient)
  // ============================================================================
  personalBackgrounds: {
    base: '/patients/antecedentes-personales/',
    byId: (id: string) => `/patients/antecedentes-personales/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/antecedentes-personales/?paciente=${pacienteId}`,
  },


  
   // ============================================================================
  // ANTECEDENTES Fammiliares (Relacionado OneToOne con Patient)
  // ============================================================================
  familyBackgrounds: {
    base: '/patients/antecedentes-familiares/',
    byId: (id: string) => `/patients/antecedentes-familiares/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/antecedentes-familiares/?paciente=${pacienteId}`,
  },

     // ============================================================================
  // signo vitales
  // ============================================================================
  vitalSigns: {
    base: '/patients/constantes-vitales/',
    byId: (id: string) => `/patients/constantes-vitales/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/constantes-vitales/?paciente=${pacienteId}`,
  },

   stomatognathicExam: {
    base: '/patients/examen-estomatognatico/',
    byId: (id: string) => `/patients/examen-estomatognatico/${id}/`,
    byPaciente: (pacienteId: string) => `/patients/examen-estomatognatico/by-paciente/${pacienteId}/`,
    resumenPatologias: (id: string) => `/patients/examen-estomatognatico/${id}/resumen_patologias/`,
  },

   // ============================================================================
  // CITAS / APPOINTMENTS
  // ============================================================================
    appointments: {
    citas: {
      base: '/appointment/citas/',
      byId: (id: string) => `/appointment/citas/${id}/`,
      porOdontologo: (odontologoId: string) => `/appointment/citas/por-odontologo/${odontologoId}/`,
      porSemana: '/appointment/citas/por-semana/',
      porPaciente: (pacienteId: string) => `/appointment/citas/by-paciente/${pacienteId}/`,
      cancelar: (id: string) => `/appointment/citas/${id}/cancelar/`,
      reprogramar: (id: string) => `/appointment/citas/${id}/reprogramar/`,
      cambiarEstado: (id: string) => `/appointment/citas/${id}/cambiar-estado/`,
      horariosDisponibles: '/appointment/citas/horarios-disponibles/',
    },
    horarios: {
      base: '/appointment/horarios/',
      byId: (id: string) => `/appointment/horarios/${id}/`,
      porOdontologo: (odontologoId: string) => `/appointment/horarios/por-odontologo/${odontologoId}/`,
    },
    recordatorios: {
      base: '/appointment/recordatorio/',
      byId: (id: string) => `/appointment/recordatorio/${id}/`,
    },
  },


  
} as const;

// Configuración de paginación
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// ✅ CORREGIDO: Timeouts razonables
export const TIMEOUTS = {
  api: 10000,        // 10 segundos
  fileUpload: 30000, // 30 segundos
} as const;
