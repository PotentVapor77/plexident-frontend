/**
 * ============================================================================
 * TYPES: Paciente
 * ============================================================================
 */

export const SEXOS = [
  ['M', 'Masculino'],
  ['F', 'Femenino'],
] as const;
export type Sexo = typeof SEXOS[number][0];

export const CONDICION_EDAD = [
  ['H', 'Horas'],
  ['D', 'Días'],
  ['M', 'Meses'],
  ['A', 'Años'],
] as const;
export type CondicionEdad = typeof CONDICION_EDAD[number][0];

export const EMBARAZADA_CHOICES = [
  ['SI', 'Sí'],
  ['NO', 'No'],
] as const;
export type Embarazada = typeof EMBARAZADA_CHOICES[number][0] | null;

export interface IPaciente {
  id: string;
  nombres: string;
  apellidos: string;
  sexo: Sexo;
  edad: number;
  condicion_edad: CondicionEdad;
  embarazada: Embarazada;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IPacienteCreate {
  nombres: string;
  apellidos: string;
  sexo: Sexo;
  edad: number;
  condicion_edad: CondicionEdad;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion?: string;
  correo?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  embarazada?: Embarazada;
  motivo_consulta?: string;
  enfermedad_actual?: string;
}

export interface IPacienteUpdate {
  nombres?: string;
  apellidos?: string;
  sexo?: Sexo;
  edad?: number;
  condicion_edad?: CondicionEdad;
  cedula_pasaporte?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  embarazada?: Embarazada;
  motivo_consulta?: string;
  enfermedad_actual?: string;
  activo?: boolean;
}

export interface IPacientePagination {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Formato de respuesta de la API (igual a tu IUserListResponse)
 */
export interface IPacienteListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IPaciente[];
  };
  errors: null;
}

export interface IPacienteSingleResponse {
  success: boolean;
  message: string;
  data: IPaciente;
}

export interface IPacienteError {
  success: false;
  error_type: string;
  message: string;
  errors?: Record<string, string[]>;
}

export interface UsePacientesParams {
  page?: number;
  page_size?: number;
  search?: string;
  [key: string]: unknown;
}

export const validatePaciente = (data: unknown): IPaciente => {
  const paciente = data as IPaciente;
  if (!paciente.id || !paciente.nombres || !paciente.apellidos || !paciente.cedula_pasaporte) {
    throw new Error('Datos de paciente inválidos');
  }
  return paciente;
};
