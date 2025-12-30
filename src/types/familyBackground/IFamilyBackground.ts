// src/types/familyBackground/IFamilyBackground.ts

import type { IPacienteBasico } from "../personalBackground/IPersonalBackground";

// ============================================================================
// CHOICES - ANTECEDENTES FAMILIARES
// ============================================================================

export const FAMILIAR_MEMBER_CHOICES = [
  ["PADRE", "Padre"],
  ["MADRE", "Madre"],
  ["HERMANOS", "Hermanos"],
  ["ABUELOS", "Abuelos"],
  ["NO", "No hay antecedentes"],
] as const;

export type FamiliarMemberType = typeof FAMILIAR_MEMBER_CHOICES[number][0];

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface IFamilyBackground {
  id: string;
  paciente: string | IPacienteBasico;
  
  // Campos con choices
  cardiopatia_familiar: FamiliarMemberType;
  hipertension_arterial_familiar: FamiliarMemberType;
  enfermedad_vascular_familiar: FamiliarMemberType;
  cancer_familiar: FamiliarMemberType;
  enfermedad_mental_familiar: FamiliarMemberType;
  
  // Campos booleanos
  endocrino_metabolico_familiar: boolean;
  tuberculosis_familiar: boolean;
  enfermedad_infecciosa_familiar: boolean;
  malformacion_familiar: boolean;
  
  // Campo texto
  otros_antecedentes_familiares: string;
  
  // Metadata
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IFamilyBackgroundCreate {
  paciente: string;
  cardiopatia_familiar?: FamiliarMemberType;
  hipertension_arterial_familiar?: FamiliarMemberType;
  enfermedad_vascular_familiar?: FamiliarMemberType;
  cancer_familiar?: FamiliarMemberType;
  enfermedad_mental_familiar?: FamiliarMemberType;
  endocrino_metabolico_familiar?: boolean;
  tuberculosis_familiar?: boolean;
  enfermedad_infecciosa_familiar?: boolean;
  malformacion_familiar?: boolean;
  otros_antecedentes_familiares?: string;
}

export interface IFamilyBackgroundUpdate {
  cardiopatia_familiar?: FamiliarMemberType;
  hipertension_arterial_familiar?: FamiliarMemberType;
  enfermedad_vascular_familiar?: FamiliarMemberType;
  cancer_familiar?: FamiliarMemberType;
  enfermedad_mental_familiar?: FamiliarMemberType;
  endocrino_metabolico_familiar?: boolean;
  tuberculosis_familiar?: boolean;
  enfermedad_infecciosa_familiar?: boolean;
  malformacion_familiar?: boolean;
  otros_antecedentes_familiares?: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface IFamilyBackgroundListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: IFamilyBackground[];
  };
}

export interface IFamilyBackgroundSingleResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: IFamilyBackground;
}

export interface UseFamilyBackgroundsParams {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
  activo?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getFamiliarMemberLabel = (value: FamiliarMemberType): string => {
  const found = FAMILIAR_MEMBER_CHOICES.find(([v]) => v === value);
  return found ? found[1] : value;
};

export const contarAntecedentesActivos = (background: IFamilyBackground): number => {
  let count = 0;
  
  if (background.cardiopatia_familiar !== "NO") count++;
  if (background.hipertension_arterial_familiar !== "NO") count++;
  if (background.enfermedad_vascular_familiar !== "NO") count++;
  if (background.cancer_familiar !== "NO") count++;
  if (background.enfermedad_mental_familiar !== "NO") count++;
  if (background.endocrino_metabolico_familiar) count++;
  if (background.tuberculosis_familiar) count++;
  if (background.enfermedad_infecciosa_familiar) count++;
  if (background.malformacion_familiar) count++;
  if (background.otros_antecedentes_familiares?.trim()) count++;
  
  return count;
};

export const tieneAntecedentesCriticos = (background: IFamilyBackground): boolean => {
  return (
    background.cardiopatia_familiar !== "NO" ||
    background.hipertension_arterial_familiar !== "NO" ||
    background.cancer_familiar !== "NO"
  );
};

