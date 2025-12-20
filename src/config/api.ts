/**
 * ============================================================================
 * API CONFIGURATION - ✅ CORREGIDO
 * ============================================================================
 */

// Base URL desde variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ✅ YA NO NECESITAMOS STORAGE_KEYS PARA TOKENS
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
  },
  users: {
    base: '/users/',
    byId: (id: string) => `/users/${id}/`,
    toggleStatus: (id: string) => `/users/${id}/toggle-status/`,
  },
  patients: {
    base: '/patients/',
    byId: (id: string) => `/patients/${id}/`,
    toggleStatus: (id: string) => `/patients/${id}/toggle-status/`,
    search: '/patients/search/',
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
