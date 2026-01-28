// src/types/anamnesis/IAnamnesis.ts

export interface IAnamnesis {
  id: string;
  paciente: string;
  paciente_nombre: string;
  paciente_cedula?: string; 
  
  // ========== ANTECEDENTES PERSONALES ==========
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  
  // Hemorragias / Problemas de coagulación 
  hemorragias: string; 
  hemorragias_detalle: string; 
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension_arterial: string; 
  hipertension_arterial_otro: string; 
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro: string; 
  otro_antecedente_personal: string; 
  
  // ========== ANTECEDENTES FAMILIARES ==========
  
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  enfermedad_cerebrovascular_familiar: string;
  enfermedad_cerebrovascular_familiar_otro: string; 
  endocrino_metabolico_familiar: string;
  endocrino_metabolico_familiar_otro: string; 
  cancer_familiar: string;
  cancer_familiar_otro: string;
  tuberculosis_familiar: string; 
  tuberculosis_familiar_otro: string; 
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  enfermedad_infecciosa_familiar: string; 
  enfermedad_infecciosa_familiar_otro: string; 
  malformacion_familiar: string;
  malformacion_familiar_otro: string; 
  otro_antecedente_familiar: string; 

  // ========== EXÁMENES COMPLEMENTARIOS ==========
  pedido_examenes_complementarios: string;
  pedido_examenes_complementarios_detalle: string;
  informe_examenes: string;
  informe_examenes_detalle: string;
  
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
  
  hemorragias: string;
  hemorragias_detalle?: string; 
  
  vih_sida: string;
  vih_sida_otro?: string;
  tuberculosis: string;
  tuberculosis_otro?: string;
  asma: string;
  asma_otro?: string;
  diabetes: string;
  diabetes_otro?: string;
  hipertension_arterial: string; 
  hipertension_arterial_otro?: string; 
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro?: string; 
  otro_antecedente_personal?: string; 
  
  // ========== ANTECEDENTES FAMILIARES ==========
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro?: string;
  hipertension_familiar: string;
  hipertension_familiar_otro?: string;
  enfermedad_cerebrovascular_familiar: string; 
  enfermedad_cerebrovascular_familiar_otro?: string; 
  endocrino_metabolico_familiar: string;
  endocrino_metabolico_familiar_otro?: string; 
  cancer_familiar: string;
  cancer_familiar_otro?: string;
  tuberculosis_familiar: string; 
  tuberculosis_familiar_otro?: string; 
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar: string; 
  enfermedad_infecciosa_familiar_otro?: string; 
  malformacion_familiar: string; 
  malformacion_familiar_otro?: string; 
  otro_antecedente_familiar?: string; 
  
  // ========== EXÁMENES COMPLEMENTARIOS ==========
  pedido_examenes_complementarios: string;
  pedido_examenes_complementarios_detalle?: string;
  informe_examenes: string;
  informe_examenes_detalle?: string;
  
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

export type Hemorragias = 'SI' | 'NO';

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

export type InformeExamenes = 
  | 'NINGUNO'
  | 'BIOMETRIA'
  | 'QUIMICA_SANGUINEA'
  | 'RAYOS_X'
  | 'OTROS';

export type PedidoExamenes = 'SI' | 'NO';

export type TuberculosisPersonal = 
  | 'NO'
  | 'TRATADA_CURADA'
  | 'ACTIVA_TRATAMIENTO'
  | 'ACTIVA_NO_TRATAMIENTO'
  | 'CONTACTO'
  | 'VACUNA_BCG'
  | 'OTRO';

export type Asma = 
  | 'NO'
  | 'LEVE_INTERMITENTE'
  | 'LEVE_PERSISTENTE'
  | 'MODERADA_PERSISTENTE'
  | 'GRAVE_PERSISTENTE'
  | 'INDUCIDA_EJERCICIO'
  | 'OTRO';

export type Diabetes = 
  | 'NO'
  | 'TIPO_1'
  | 'TIPO_2'
  | 'GESTACIONAL'
  | 'PREDIABETES'
  | 'LADA'
  | 'OTRO';

export type HipertensionArterial = 
  | 'NO'
  | 'CONTROLADA'
  | 'LIMITROFE'
  | 'NO_CONTROLADA'
  | 'RESISTENTE'
  | 'MALIGNA'
  | 'OTRO';

export type EnfermedadCardiaca = 
  | 'NO'
  | 'CARDIOPATIA_ISQUEMICA'
  | 'INSUFICIENCIA_CARDIACA'
  | 'ARRITMIA'
  | 'VALVULOPATIA'
  | 'CARDIOMIOPATIA'
  | 'OTRO';
