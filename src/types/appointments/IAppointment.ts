// frontend/src/interfaces/IAppointment.ts

export interface IPaciente {
  id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  cedula_pasaporte: string;
  telefono: string;
  correo: string;
}

export interface IOdontologo {
  id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  correo: string;
}

export type VistaCalendario = 'day' | 'week' | 'month';

export type EstadoCita = 
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'ASISTIDA'
  | 'NO_ASISTIDA'
  | 'CANCELADA'
  | 'REPROGRAMADA'
  | 'EN_ATENCION';

export type TipoConsulta =
  | 'PRIMERA_VEZ'
  | 'CONTROL'
  | 'URGENCIA'
  | 'LIMPIEZA'
  | 'ORTODONCIA'
  | 'ENDODONCIA'
  | 'CIRUGIA'
  | 'PROTESIS'
  | 'OTRO';

export interface ICita {
  id: string;
  paciente: string;
  paciente_detalle: IPaciente;
  odontologo: string;
  odontologo_detalle: IOdontologo;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
  tipo_consulta: TipoConsulta;
  tipo_consulta_display: string;
  estado: EstadoCita;
  estado_display: string;
  motivo_consulta: string;
  observaciones: string;
  esta_vigente: boolean;
  puede_ser_cancelada: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface ICitaCreate {
  paciente: string;
  odontologo: string;
  fecha: string;
  hora_inicio: string;
  duracion: number;
  tipo_consulta: TipoConsulta;
  motivo_consulta: string;
  observaciones?: string;
}

export interface ICitaUpdate {
  odontologo?: string;
  fecha?: string;
  hora_inicio?: string;
  duracion?: number;
  tipo_consulta?: TipoConsulta;
  motivo_consulta?: string;
  observaciones?: string;
  estado?: EstadoCita;
}

export interface IHorarioDisponible {
  hora_inicio: string;
  hora_fin: string;
}

// ✅ NUEVOS TIPOS PARA HORARIOS DE ATENCION
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface IHorarioAtencion {
  id: string;
  odontologo: string;
  odontologo_detalle?: {
    id: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo: string;
  };
  dia_semana: DiaSemana;
  dia_semana_display?: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface IHorarioAtencionCreate {
  odontologo: string;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita: number;
  activo: boolean;
}

export interface IHorarioAtencionUpdate extends Partial<IHorarioAtencionCreate> {
  activo?: boolean;
}