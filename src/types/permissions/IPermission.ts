// src/types/permissions/IPermission.ts

export interface IPermission {
  id?: string;  // UUID
  modelo: string;
  rol?: string;  // Opcional, para compatibilidad
  usuario_id?: string;  // Para permisos por usuario
  metodos_permitidos: string[];
}

export interface IUsuarioPermisos {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  rol: string;
  is_active: boolean;
  telefono: string;
}

// Respuesta para permisos por usuario
export interface IPermissionUserResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    success: boolean;
    data: IPermission[];
  };
  errors: null | undefined;
}

// Respuesta para lista de usuarios (estándar DRF pagination)
export interface IUsersListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IUsuarioPermisos[];
  };
  errors: null | undefined;
}