// src/types/backgrounds/IBackground.ts

import type { IAntecedenteCombinado } from "../../hooks/backgrounds/useBackgrounds";

// ============================================================================
// ANTECEDENTES PERSONALES
// ============================================================================
export interface IAntecedentePersonal {
  id: string;
  paciente: string;
  activo: boolean; 

  // Alergias
  alergia_antibiotico: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia: string;
  alergia_anestesia_otro?: string;

  // Condiciones médicas
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

  // Información adicional
  otros_antecedentes_personales?: string;
  habitos?: string;
  observaciones?: string;

  // Metadata
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface IAntecedentePersonalCreate {
  
  paciente: string;
  activo?: boolean; 
  alergia_antibiotico: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia: string;
  alergia_anestesia_otro?: string;
  hemorragias: string;
  hemorragias_detalle?: string;
  vih_sida?: string;
  vih_sida_otro?: string;
  tuberculosis?: string;
  tuberculosis_otro?: string;
  asma?: string;
  asma_otro?: string;
  diabetes?: string;
  diabetes_otro?: string;
  hipertension_arterial?: string;
  hipertension_arterial_otro?: string;
  enfermedad_cardiaca?: string;
  enfermedad_cardiaca_otro?: string;
  otros_antecedentes_personales?: string;
  habitos?: string;
  observaciones?: string;
}

// ✅ CORRECCIÓN: Usar type alias en lugar de interface vacía
export type IAntecedentePersonalUpdate = Partial<IAntecedentePersonalCreate>;

// ============================================================================
// ANTECEDENTES FAMILIARES
// ============================================================================
export interface IAntecedenteFamiliar {
  id: string;
  paciente: string;
  activo: boolean;

  cardiopatia_familiar: string;
  cardiopatia_familiar_otro?: string;
  hipertension_arterial_familiar: string;
  hipertension_arterial_familiar_otro?: string;
  enfermedad_vascular_familiar: string;
  enfermedad_vascular_familiar_otro?: string;
  endocrino_metabolico_familiar: string;
  endocrino_metabolico_familiar_otro?: string;
  cancer_familiar: string;
  cancer_familiar_otro?: string;
  tipo_cancer?: string;
  tipo_cancer_otro?: string;
  tuberculosis_familiar: string;
  tuberculosis_familiar_otro?: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar: string;
  enfermedad_infecciosa_familiar_otro?: string;
  malformacion_familiar: string;
  malformacion_familiar_otro?: string;
  otros_antecedentes_familiares?: string;

  // Metadata
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface IAntecedenteFamiliarCreate {
  paciente: string;
   activo?: boolean;
  cardiopatia_familiar?: string;
  cardiopatia_familiar_otro?: string;
  hipertension_arterial_familiar?: string;
  hipertension_arterial_familiar_otro?: string;
  enfermedad_vascular_familiar?: string;
  enfermedad_vascular_familiar_otro?: string;
  endocrino_metabolico_familiar?: string;
  endocrino_metabolico_familiar_otro?: string;
  cancer_familiar?: string;
  cancer_familiar_otro?: string;
  tipo_cancer?: string;
  tipo_cancer_otro?: string;
  tuberculosis_familiar?: string;
  tuberculosis_familiar_otro?: string;
  enfermedad_mental_familiar?: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar?: string;
  enfermedad_infecciosa_familiar_otro?: string;
  malformacion_familiar?: string;
  malformacion_familiar_otro?: string;
  otros_antecedentes_familiares?: string;
}

// ✅ CORRECCIÓN: Usar type alias en lugar de interface vacía
export type IAntecedenteFamiliarUpdate = Partial<IAntecedenteFamiliarCreate>;

// ============================================================================
// ANTECEDENTES COMPLETOS (Combinados)
// ============================================================================
export interface IAntecedente {
  personales?: IAntecedentePersonal;
  familiares?: IAntecedenteFamiliar;
}

// ============================================================================
// ERRORES Y FILTROS
// ============================================================================
export interface IAntecedenteError {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface IAntecedenteFilters {
  paciente?: string;
  activo?: boolean;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface IAntecedentePagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}


export type IAntecedenteUnificado = IAntecedenteCombinado; 