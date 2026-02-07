// src/types/complementaryExam/IComplementaryExam.ts

import type { IPaciente } from '../patient/IPatient';

export type PedidoExamenesType = 'SI' | 'NO';
export type InformeExamenesType = 
  | 'NINGUNO'
  | 'BIOMETRIA'
  | 'QUIMICA_SANGUINEA'
  | 'RAYOS_X'
  | 'OTROS';

export interface IComplementaryExam {
  id: string;
  paciente: string | IPaciente;
  
  // Pedido de exámenes
  pedido_examenes: PedidoExamenesType;
  pedido_examenes_detalle: string;
  
  // Informe de exámenes
  informe_examenes: InformeExamenesType;
  informe_examenes_detalle: string;
  
  // Metadata
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  
  // Campos calculados del backend
  tiene_pedido_examenes_pendiente?: boolean;
  tiene_informe_examenes_completado?: boolean;
  resumen_examenes_complementarios?: string;
  estado_examenes?: 'completado' | 'pendiente' | 'no_solicitado';
}

export interface IComplementaryExamCreate {
  paciente: string;
  pedido_examenes: PedidoExamenesType;
  pedido_examenes_detalle?: string;
  informe_examenes: InformeExamenesType;
  informe_examenes_detalle?: string;
  activo?: boolean;
}

export interface IComplementaryExamUpdate {
  paciente?: string;
  pedido_examenes?: PedidoExamenesType;
  pedido_examenes_detalle?: string;
  informe_examenes?: InformeExamenesType;
  informe_examenes_detalle?: string;
  activo?: boolean;
}

export interface IComplementaryExamFilters {
  paciente?: string;
  pedido_examenes?: PedidoExamenesType;
  informe_examenes?: InformeExamenesType;
  activo?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface IComplementaryExamPagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

// Constantes para los select
export const PEDIDO_EXAMENES_OPTIONS = [
  { value: 'NO', label: 'No' },
  { value: 'SI', label: 'Sí' },
] as const;

export const INFORME_EXAMENES_OPTIONS = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'BIOMETRIA', label: 'BIOMETRIA' },
  { value: 'QUIMICA_SANGUINEA', label: 'QUIMICA SANGUINEA' },
  { value: 'RAYOS_X', label: 'RAYOS X' },
  { value: 'OTROS', label: 'Otros' },
] as const;


export interface IComplementaryExamPagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}