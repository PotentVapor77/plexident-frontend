// src/core/types/typePDF.ts

/**
 * Tipos para el módulo de generación de PDF de historiales clínicos
 */

/**
 * Parámetros para la generación de PDF
 */
export interface PDFGenerationParams {
  /** ID del historial clínico */
  historialId: string;
  /** Lista de secciones a incluir (opcional - si no se especifica, se incluyen todas) */
  secciones?: string[];
  /** Si es true, fuerza la descarga; si es false, abre en el navegador */
  descarga?: boolean;
  /** Nombre del paciente (para el nombre del archivo) */
  pacienteNombre?: string;
  /** Número de historia clínica (para el nombre del archivo) */
  numeroHistoria?: string;
}

/**
 * Respuesta del servicio de PDF
 */
export interface PDFServiceResponse {
  success: boolean;
  message?: string;
  blob?: Blob;
  error?: string;
}

/**
 * Catálogo de secciones disponibles
 */
export interface SeccionesDisponiblesResponse {
  secciones: Record<string, string>;
}

/**
 * Opciones de visualización del PDF
 */
export type PDFViewMode = 'download' | 'preview';

/**
 * Estado de la generación del PDF
 */
export interface PDFGenerationState {
  isLoading: boolean;
  error: string | null;
  progress: number | null;
}

/**
 * Props para el botón de PDF
 */
export interface PDFDownloadButtonProps {
  /** ID del historial clínico */
  historialId: string;
  /** Nombre del paciente para el archivo */
  pacienteNombre?: string;
  /** Número de historia clínica */
  numeroHistoria?: string;
  /** Modo de visualización: descarga o previsualización */
  mode?: PDFViewMode;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Texto del botón (por defecto: "PDF") */
  text?: string;
  /** Callback después de generar el PDF */
  onSuccess?: () => void;
  /** Callback en caso de error */
  onError?: (error: string) => void;
  /** Secciones específicas a incluir (opcional) */
  secciones?: string[];
}