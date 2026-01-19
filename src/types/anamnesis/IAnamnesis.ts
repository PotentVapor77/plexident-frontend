// src/types/patient/IAnamnesis.ts

export interface IAnamnesis {
  id: string;
  paciente: string;
  paciente_nombre: string;
  paciente_cedula?: string; // ✅ NUEVO

  // ========== ANTECEDENTES PERSONALES ==========
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  
  // Hemorragias / Problemas de coagulación (✅ CAMBIADO)
  hemorragias: string; // 'SI' o 'NO'
  hemorragias_detalle: string; // ✅ NUEVO: detalle de hemorragias
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension_arterial: string; // ✅ CAMBIADO
  hipertension_arterial_otro: string; // ✅ CAMBIADO
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro: string; // ✅ CAMBIADO
  otro_antecedente_personal: string; // ✅ NUEVO
  
  // ========== ANTECEDENTES FAMILIARES ==========
  
  // Antecedentes familiares completos
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  enfermedad_cerebrovascular_familiar: string; // ✅ NUEVO
  enfermedad_cerebrovascular_familiar_otro: string; // ✅ NUEVO
  endocrino_metabolico_familiar: string; // ✅ NUEVO
  endocrino_metabolico_familiar_otro: string; // ✅ NUEVO
  cancer_familiar: string;
  cancer_familiar_otro: string;
  tuberculosis_familiar: string; // ✅ NUEVO
  tuberculosis_familiar_otro: string; // ✅ NUEVO
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  enfermedad_infecciosa_familiar: string; // ✅ NUEVO
  enfermedad_infecciosa_familiar_otro: string; // ✅ NUEVO
  malformacion_familiar: string; // ✅ NUEVO
  malformacion_familiar_otro: string; // ✅ NUEVO
  otro_antecedente_familiar: string; // ✅ NUEVO
  
  // ========== HÁBITOS Y OBSERVACIONES ==========
  habitos: string;
  observaciones: string;
  
  // ========== METADATA ==========
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IAnamnesisCreate {
  paciente: string;
  
  // ========== ANTECEDENTES PERSONALES ==========
  alergia_antibiotico: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia: string;
  alergia_anestesia_otro?: string;
  
  hemorragias: string; // ✅ CAMBIADO
  hemorragias_detalle?: string; // ✅ NUEVO
  
  vih_sida: string;
  vih_sida_otro?: string;
  tuberculosis: string;
  tuberculosis_otro?: string;
  asma: string;
  asma_otro?: string;
  diabetes: string;
  diabetes_otro?: string;
  hipertension_arterial: string; // ✅ CAMBIADO
  hipertension_arterial_otro?: string; // ✅ CAMBIADO
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro?: string; // ✅ CAMBIADO
  otro_antecedente_personal?: string; // ✅ NUEVO
  
  // ========== ANTECEDENTES FAMILIARES ==========
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro?: string;
  hipertension_familiar: string;
  hipertension_familiar_otro?: string;
  enfermedad_cerebrovascular_familiar: string; // ✅ NUEVO
  enfermedad_cerebrovascular_familiar_otro?: string; // ✅ NUEVO
  endocrino_metabolico_familiar: string; // ✅ NUEVO
  endocrino_metabolico_familiar_otro?: string; // ✅ NUEVO
  cancer_familiar: string;
  cancer_familiar_otro?: string;
  tuberculosis_familiar: string; // ✅ NUEVO
  tuberculosis_familiar_otro?: string; // ✅ NUEVO
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar: string; // ✅ NUEVO
  enfermedad_infecciosa_familiar_otro?: string; // ✅ NUEVO
  malformacion_familiar: string; // ✅ NUEVO
  malformacion_familiar_otro?: string; // ✅ NUEVO
  otro_antecedente_familiar?: string; // ✅ NUEVO
  
  // ========== HÁBITOS Y OBSERVACIONES ==========
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

export type Hemorragias = 'SI' | 'NO'; // ✅ CAMBIADO

export type VihSida = 
  | 'NEGATIVO'
  | 'POSITIVO_TRATADO'
  | 'POSITIVO_NO_TRATADO'
  | 'NO_SABE'
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

// ✅ NUEVOS TIPOS
export type EnfermedadCerebrovascular = 
  | 'NO'
  | 'ACCIDENTE_CEREBROVASCULAR'
  | 'ICTUS'
  | 'ANEURISMA'
  | 'DEMENCIA_VASCULAR'
  | 'OTRO';

export type EndocrinoMetabolico = 
  | 'NO'
  | 'TIROIDES'
  | 'OBESIDAD'
  | 'DISLIPIDEMIA'
  | 'SINDROME_METABOLICO'
  | 'OTRO';

export type EnfermedadInfecciosa = 
  | 'NO'
  | 'HEPATITIS'
  | 'COVID'
  | 'NEUMONIA'
  | 'INFECCION_URINARIA'
  | 'OTRO';

export type Malformacion = 
  | 'NO'
  | 'CARDIACA'
  | 'NEURAL'
  | 'ESQUELETICA'
  | 'FACIAL'
  | 'OTRO';