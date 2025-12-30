/**
 * ============================================================================
 * API TYPES & ERROR HANDLING
 * ============================================================================
 * Tipos centralizados y manejo de errores personalizado
 */
// src/types/api.ts
import { AxiosError } from 'axios';

// ============================================================================
// RESPUESTAS DEL API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// CREDENCIALES Y AUTH
// ============================================================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    nombres: string;
    apellidos: string;
    username: string;
    correo: string;
    rol: 'admin' | 'odontologo' | 'asistente';
    is_active: boolean;
  };
}

// ============================================================================
// ERRORES DEL BACKEND
// ============================================================================

export interface BackendErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  detail?: string;
}

export type ApiErrorType = AxiosError<BackendErrorResponse>;

// ============================================================================
// CLASE DE ERROR PERSONALIZADA
// ============================================================================

export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly data?: BackendErrorResponse;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    data?: BackendErrorResponse,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.originalError = originalError;
  }

  isStatus(code: number): boolean {
    return this.statusCode === code;
  }

  isValidationError(): boolean {
    return this.statusCode === 400 && !!this.data?.errors;
  }

  getFieldErrors(): Record<string, string> | null {
    if (!this.data?.errors) return null;

    const fieldErrors: Record<string, string> = {};
    Object.keys(this.data.errors).forEach((key) => {
      fieldErrors[key] = this.data!.errors![key][0] || 'Error de validación';
    });

    return fieldErrors;
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  isNetworkError(): boolean {
    return this.statusCode === undefined || this.statusCode === 0;
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(error: unknown): error is ApiErrorType {
  return (error as ApiErrorType).isAxiosError === true;
}

export function isCustomApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// ============================================================================
// HELPERS DE EXTRACCIÓN DE MENSAJES
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (isCustomApiError(error)) {
    return error.message;
  }

  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'Error de conexión con el servidor'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

export function createApiError(error: unknown): ApiError {
  if (isCustomApiError(error)) {
    return error;
  }

  if (isApiError(error)) {
    return new ApiError(
      getErrorMessage(error),
      error.response?.status,
      error.response?.data,
      error
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, undefined, error);
  }

  return new ApiError('Error desconocido', undefined, undefined, error);
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  const apiError = isCustomApiError(error) ? error : createApiError(error);

  if (apiError.isNetworkError()) {
    return 'No se puede conectar al servidor. Verifica tu conexión a internet.';
  }

  if (apiError.isAuthError()) {
    if (apiError.statusCode === 401) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    return 'No tienes permisos para realizar esta acción.';
  }

  if (apiError.isStatus(404)) {
    return 'El recurso solicitado no fue encontrado.';
  }

  if (apiError.isStatus(429)) {
    return 'Demasiadas solicitudes. Por favor, espera un momento.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Error del servidor. Por favor, intenta más tarde.';
  }

  return apiError.message;
}
