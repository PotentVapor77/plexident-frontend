// src/types/consultations/IConsultation.ts

export interface IConsultation {
  id: string;
  paciente: string;
  paciente_nombre: string;
  
  fecha_consulta: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  observaciones?: string;
  
  // Metadata
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IConsultationCreate {
  paciente: string;
  fecha_consulta: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  observaciones?: string;
}

export interface IConsultationUpdate extends Partial<IConsultationCreate> {
  activo?: boolean;
}

export interface IConsultationError {
  message?: string;
  [key: string]: string[] | string | undefined;
}