/**
 * ============================================================================
 * TYPES: Usuario
 * ============================================================================
 */

/**
 * Tipos de rol del sistema
 */
export type Rol = "Administrador" | "Odontologo" | "Asistente";

/**
 * Modelo de Usuario del sistema
 */
export interface IUser {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: Rol; 
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
  creado_por?: string;
  actualizado_por?: string;
}

/**
 * Datos para crear un usuario
 */
export interface IUserCreate {
  nombres: string;
  apellidos: string;
  username?: string; // Opcional, se genera automáticamente
  telefono: string;
  correo: string;
  rol: Rol; 
  password: string;
  activo?: boolean;
}

/**
 * Datos para actualizar un usuario
 */
export interface IUserUpdate {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  rol?: Rol; // ✅ sin tilde
  password?: string;
  activo?: boolean;
}

// ============================================================================
// RESPUESTAS DE LA API
// ============================================================================

export interface IUserPagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface IUserListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IUser[];
  };
  errors: null;
}

export interface IUserSingleResponse {
  success: boolean;
  message: string;
  data: IUser;
}

export interface IUserError {
  success: false;
  error_type: string;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

export const validateUser = (data: unknown): IUser => {
  const user = data as IUser;

  if (!user.id || !user.username) {
    throw new Error("Datos de usuario inválidos");
  }

  return user;
};

export interface UseUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  [key: string]: unknown;
}
