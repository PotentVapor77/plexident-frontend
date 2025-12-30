

// ============================================================================
// TIPOS ENUMERADOS
// ============================================================================

export const SEXOS = [
  ['M', 'Masculino'],
  ['F', 'Femenino'],
] as const;

export type Sexo = typeof SEXOS[number][0]; // "M" | "F"

export const CONDICION_EDAD = [
  ['H', 'Horas'],
  ['D', 'Días'],
  ['M', 'Meses'],
  ['A', 'Años'],
] as const;

export type CondicionEdad = typeof CONDICION_EDAD[number][0]; // "H" | "D" | "M" | "A"

export const EMBARAZADA_CHOICES = [
  ['SI', 'Sí'],
  ['NO', 'No'],
] as const;

export type Embarazada = typeof EMBARAZADA_CHOICES[number][0] | null; // "SI" | "NO" | null

// ============================================================================
// MODELO PRINCIPAL
// ============================================================================


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

// ============================================================================
// DATOS PARA CREAR UN PACIENTE
// ============================================================================

export interface IPacienteCreate {
  nombres: string;
  apellidos: string;
  sexo: Sexo;
  edad: number;
  condicion_edad: CondicionEdad;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  embarazada?: Embarazada;
  motivo_consulta?: string;
  enfermedad_actual?: string;
}

// ============================================================================
// DATOS PARA ACTUALIZAR UN PACIENTE
// ============================================================================

export interface IPacienteUpdate {
  nombres: string;
  apellidos: string;
  sexo: Sexo;
  edad: number;
  condicion_edad: CondicionEdad;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  embarazada?: Embarazada;
  motivo_consulta?: string;
  enfermedad_actual?: string;
  activo?: boolean;
}

// ============================================================================
// PAGINACIÓN Y RESPUESTAS
// ============================================================================

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
 * Formato de respuesta de la API para lista paginada (igual a IUserListResponse)
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

/**
 * Formato de respuesta de la API para un solo paciente
 */
export interface IPacienteSingleResponse {
  success: boolean;
  message: string;
  data: IPaciente;
}

// ============================================================================
// ERROR TIPADO (igual a IUserError)
// ============================================================================

export interface IPacienteError {
  success: false;
  error_type: string;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

export const validatePaciente = (data: unknown): IPaciente => {
  const paciente = data as IPaciente;
  
  if (!paciente.id || !paciente.nombres || !paciente.apellidos || !paciente.cedula_pasaporte) {
    throw new Error('Datos de paciente inválidos');
  }

  return paciente;
};

// ============================================================================
// PARÁMETROS PARA HOOKS
// ============================================================================

export interface UsePacientesParams {
  page?: number;
  page_size?: number;
  search?: string;
  activo?: boolean;
  [key: string]: unknown;
}

// ============================================================================
// HELPERS DE ETIQUETAS
// ============================================================================

export const getSexoLabel = (sexo: Sexo): string => {
  const found = SEXOS.find(([value]) => value === sexo);
  return found ? found[1] : sexo;
};

export const getCondicionEdadLabel = (condicion: CondicionEdad): string => {
  const found = CONDICION_EDAD.find(([value]) => value === condicion);
  return found ? found[1] : condicion;
};

export const getEmbarazadaLabel = (embarazada: Embarazada): string => {
  if (embarazada === null) return 'No especificado';
  const found = EMBARAZADA_CHOICES.find(([value]) => value === embarazada);
  return found ? found[1] : embarazada;
};
