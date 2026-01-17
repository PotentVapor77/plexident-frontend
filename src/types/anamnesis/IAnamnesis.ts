// src/types/patient/IAnamnesis.ts

export interface IAnamnesis {
  id: string;
  paciente: string;
  paciente_nombre: string;

  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  
  // Problemas de coagulación
  problemas_coagulacion: string; // 'SI' o 'NO'
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension: string;
  hipertension_otro: string;
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otra: string;
  problemas_anestesicos: boolean;
  
  // Antecedentes familiares
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  diabetes_familiar: string;
  diabetes_familiar_otro: string;
  cancer_familiar: string;
  cancer_familiar_otro: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  
  // Hábitos y observaciones
  habitos: string;
  observaciones: string;
  
  // Metadata
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IAnamnesisCreate {
  paciente: string;
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia: string;
  alergia_anestesia_otro?: string;
  
  // Problemas de coagulación
  problemas_coagulacion: string;
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro?: string;
  tuberculosis: string;
  tuberculosis_otro?: string;
  asma: string;
  asma_otro?: string;
  diabetes: string;
  diabetes_otro?: string;
  hipertension: string;
  hipertension_otro?: string;
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otra?: string;
  problemas_anestesicos: boolean;
  
  // Antecedentes familiares
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro?: string;
  hipertension_familiar: string;
  hipertension_familiar_otro?: string;
  diabetes_familiar: string;
  diabetes_familiar_otro?: string;
  cancer_familiar: string;
  cancer_familiar_otro?: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro?: string;
  
  // Hábitos y observaciones
  habitos?: string;
  observaciones?: string;
}

export interface IAnamnesisUpdate extends Partial<IAnamnesisCreate> {
  activo?: boolean;
}

export interface IAnamnesisError {
  message?: string;
  [key: string]: string[] | string | undefined;
}

// Tipos para las opciones de selección
export type AlergiaAntibiotico = 
  | 'NO' 
  | 'PENICILINA' 
  | 'AMOXICILINA' 
  | 'CEFALEXINA' 
  | 'AZITROMICINA' 
  | 'CLARITROMICINA' 
  | 'OTRO';

export type AlergiaAnestesia = 
  | 'NO' 
  | 'LIDOCAINA' 
  | 'ARTICAINA' 
  | 'MEPIVACAINA' 
  | 'BUPIVACAINA' 
  | 'PRILOCAINA' 
  | 'OTRO';

export type ProblemasCoagulacion = 'SI' | 'NO';

export type VihSida = 
  | 'NEGATIVO'
  | 'POSITIVO TRATADO'
  | 'POSITIVO NO TRATADO'
  | 'NO SABE'
  | 'RESTRICCION'
  | 'INDETERMINADO'
  | 'OTRO';

export type FamiliarBase = 
  | 'NO'
  | 'PADRE'
  | 'MADRE'
  | 'ABUELOS'
  | 'HERMANOS'
  | 'TIO'
  | 'OTRO';