// Tipos de rol
export type Rol = "Administrador" | "Odontologo" | "Asistente";

// Modelo principal
export interface IUser {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: Rol;
  is_active: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
  creado_por?: string;
  actualizado_por?: string;
  activo?: boolean;
}

// Datos para crear un usuario (lo que espera createUser)
export interface ICreateUserData {
  nombres: string;
  apellidos: string;
  username?: string;
  telefono: string;
  correo: string;
  rol: Rol;
  password: string;
  is_active?: boolean;
}

export interface IUpdateUserData {
  nombres: string;      
  apellidos: string;    
  telefono: string;     
  correo: string;       
  rol: Rol;            
  is_active: boolean;     
  password?: string;   
}


// Paginación y respuestas
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

// Error tipado (aquí quitamos el Record sin tipo)
export interface IUserError {
  success: false;
  error_type: string;
  message: string;
  errors?: Record<string, string[] | string>;
}

// Validación
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

