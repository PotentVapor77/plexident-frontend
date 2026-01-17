// src/types/patient/IAnamnesis.ts

export interface IAnamnesis {
  id: string;
  paciente: string;
  paciente_nombre: string;

  
  // Alergias
  tiene_alergias: boolean;
  alergias_detalle?: string;
  
  // Antecedentes
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  
  // Problemas de coagulación
  problemas_coagulacion: boolean;
  problemas_coagulacion_detalle?: string;
  
  // Problemas con anestésicos
  problemas_anestesicos: boolean;
  problemas_anestesicos_detalle?: string;
  
  // Medicamentos
  toma_medicamentos: boolean;
  medicamentos_actuales?: string;
  
  // Hábitos y otros
  habitos?: string;
  otros?: string;
  
  // Metadata
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IAnamnesisCreate {
  paciente: string;
  tiene_alergias: boolean;
  alergias_detalle?: string;
  antecedentes_personales?: string;
  antecedentes_familiares?: string;
  problemas_coagulacion: boolean;
  problemas_coagulacion_detalle?: string;
  problemas_anestesicos: boolean;
  problemas_anestesicos_detalle?: string;
  toma_medicamentos: boolean;
  medicamentos_actuales?: string;
  habitos?: string;
  otros?: string;
}

export interface IAnamnesisUpdate extends Partial<IAnamnesisCreate> {
  activo?: boolean;
}

export interface IAnamnesisError {
  message?: string;
  [key: string]: string[] | string | undefined;
}
