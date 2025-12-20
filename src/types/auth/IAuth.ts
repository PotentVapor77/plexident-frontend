/**
 * ============================================================================
 * TYPES: Autenticación
 * ============================================================================
 */

import type { IUser } from '../user/IUser';

// Credenciales de login
export interface ILoginCredentials {
  username: string;
  password: string;
}

// Respuesta del login
export interface ILoginResponse {
  success: boolean;
  message: string;
  user: IUser;
  // NO incluimos tokens porque se manejan con cookies
}

// Estado de autenticación
export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Datos de registro
export interface IRegisterData {
  username: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
}

// Error de autenticación
export interface IAuthError {
  success: false;
  error_type?: string;
  message: string;
  errors?: Record<string, string[]>;
}
