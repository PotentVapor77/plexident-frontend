export interface IUser {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  telefono: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  activo: boolean;
  creado_por?: string;
  actualizado_por?: string;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface ICreateUserData {
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  password: string;
}

export interface IUpdateUserData {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  rol?: 'admin' | 'odontologo' | 'asistente';
  activo?: boolean;
}

export interface ILoginResponse {
  user: IUser;
  tokens: {
    access: string;
    refresh: string;
  };
}