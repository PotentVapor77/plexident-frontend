// src/core/types/diagnostic.types.ts

import type { IPaciente } from "../../types/patient/IPatient";
import type { GroupedSurface } from "../utils/groupDentalSurfaces";
import type { GroupedDiagnostic } from "../utils/groupDiagnostics";
import type { AreaAfectada, DiagnosticoCategory, DiagnosticoEntry, OdontoColorKey, OdontogramaData } from "./odontograma.types";
/**
 * Props del componente DiagnosticoPanel (orquestador principal)
 */
export interface DiagnosticoPanelProps {
  selectedTooth: string | null;
  odontogramaDataHook?: any; // ReturnType<typeof useOdontogramaData>
  pacienteActivoId?: IPaciente;
  onRootGroupChange?: (group: string | null) => void;
}
export interface ToothInfo {
  numero: number;
  nombre: string;
  fdi: string;
}
export interface DiagnosticoPanelState {
  // Estado del diente seleccionado
  selectedTooth: string | null;
  toothInfo: ToothInfo | null;
  isToothBlocked: boolean;

  // Estado de diagnósticos
  diagnosticosAplicados: GroupedDiagnostic[];
  toothDiagnoses: Record<string, DiagnosticoEntry[]>;

  // Estado del formulario
  showDiagnosticoSelect: boolean;
  currentArea: PrincipalArea;
  selectedSurfaces: string[];
  currentRootGroup: string | null;

  // Estado de guardado
  isSaving: boolean;
  lastCompleteSave: Date | null;

  // Estado de carga de datos
  isLoadingData: boolean;
  dataError: string | null;

  // Files 
  
}

// ============================================================================
// TIPOS DE ÁREA Y SUPERFICIE
// ============================================================================

export type PrincipalArea = 'corona' | 'raiz' | 'general' | null;

// ============================================================================
// TIPOS DE NOTIFICACIONES (Reemplazo de TOAST)
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Milisegundos (por defecto: 5000)
  dismissible?: boolean;
  timestamp: Date;
}

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

// ============================================================================
// TIPOS DE HOOKS
// ============================================================================

/**
 * Return type del hook useDiagnosticoPanelManager
 */
export interface UseDiagnosticoPanelManagerReturn {
  // Estado
  state: DiagnosticoPanelState;

  // Handlers de diente
  handleToothChange: (toothId: string | null) => void;

  // Handlers de diagnóstico
  handleAddDiagnostico: () => void;
  handleCancelDiagnostico: () => void;
  handleApplyDiagnostico: (
    diagnosticoId: string,
    colorKey: OdontoColorKey,
    atributos: Record<string, string | string[]>,
    descripcion: string,
    areas: AreaAfectada[]
  ) => void;
  handleRemoveDiagnostico: (id: string, superficieId: string) => void;

  // Handlers de superficie
  handleSurfaceSelect: (surfaces: string[]) => void;
  handleAreaChange: (area: PrincipalArea) => void;
  handleRootGroupChange: (group: string | null) => void;

  // Handlers de guardado
  handleGuardarCompleto: () => Promise<void>;
  handleClearAll: () => void;

  // Utilidades
  addNotification: (options: NotificationOptions) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  handleRemoveIndividualSurface: (surfaceId: string) => void;
}

/**
 * Return type del hook useToothSelection
 */
export interface UseToothSelectionReturn {
  toothInfo: ToothInfo | null;
  isBlocked: boolean;
  diagnosticos: GroupedDiagnostic[];
}

// ============================================================================
// PROPS DE COMPONENTES UI
// ============================================================================

/**
 * Props del componente ToothInfoCard
 */
export interface ToothInfoCardProps {
  toothInfo: ToothInfo | null;
  selectedTooth: string | null;
  isBlocked: boolean;
  diagnosticosCount: number;
}

/**
 * Props del componente DiagnosticosList
 */
export interface DiagnosticosListProps {
  diagnosticos: GroupedDiagnostic[];
  selectedTooth: string | null;
  onRemove: (id: string, superficieId: string) => void;
  onMarkTreated?: (id: string) => void;
  addNotification: (options: NotificationOptions) => void;
}

/**
 * Props del componente ActionButtons
 */
export interface ActionButtonsProps {
  isSaving: boolean;
  lastCompleteSave: Date | null;
  hasDiagnosticos: boolean;
  selectedTooth: string | null;
  onSaveAll: () => Promise<void>;
  onClearAll: () => void;
  onCancel?: () => void;
}

/**
 * Props del componente NotificationManager
 */
export interface NotificationManagerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

/**
 * Props individuales de cada notificación
 */
export interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

// ============================================================================
// PROPS DE SECCIONES DEL PANEL
// ============================================================================

/**
 * Props de la sección de selección de superficie
 */
export interface SurfaceSectionProps {
  selectedTooth: string | null;
  selectedSurfaces: string[];
  onSurfaceSelect: (surfaces: string[]) => void;
  onAreaChange: (area: PrincipalArea) => void;
  onRootGroupChange: (group: string | null) => void;
  isBlocked: boolean;
  getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
  activeDiagnosisColor: string | null;
  groupedSurfaces: GroupedSurface[];
}

/**
 * Props de la sección de selección de diagnóstico
 */
export interface DiagnosticoSectionProps {
  selectedTooth: string | null;
  currentArea: PrincipalArea;
  categorias: DiagnosticoCategory[];
  onApply: (
    diagnosticoId: string,
    colorKey: OdontoColorKey,
    atributos: Record<string, string | string[]>,
    descripcion: string,
    areas: AreaAfectada[]
  ) => void;
  onCancel: () => void;
  onPreviewChange: (diagnosticoId: string | null) => void;
  onPreviewOptionsChange: (options: Record<string, string | string[]>) => void;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  message: string | null;
  missingArea: PrincipalArea;
}

// ============================================================================
// TIPOS DE ESTADO DE CARGA
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateData {
  state: LoadingState;
  error: string | null;
}

// ============================================================================
// TIPOS DE OPERACIONES
// ============================================================================

export interface SaveOperation {
  pacienteId: string;
  odontogramaData: OdontogramaData;
}

export interface SaveResult {
  success: boolean;
  message: string;
  savedCount?: number;
  errors?: string[];
}

// ============================================================================
// TIPOS DE EVENTOS
// ============================================================================

export interface DiagnosticoAppliedEvent {
  toothId: string;
  diagnosticoId: string;
  surfaces: string[];
  timestamp: Date;
}

export interface DiagnosticoRemovedEvent {
  toothId: string;
  diagnosticoId: string;
  superficieId: string;
  timestamp: Date;
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface PanelConfiguration {
  autoSave: boolean;
  autoSaveDelay: number;
  showNotifications: boolean;
  notificationDuration: number;
  confirmOnDelete: boolean;
  confirmOnClear: boolean;
}

// ============================================================================
// TIPOS PARA PREVIEW DE DIAGNÓSTICO
// ============================================================================

export interface DiagnosticoPreview {
  diagnosticoId: string | null;
  colorHex: string | null;
  secondaryOptions: Record<string, string | string[]>;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 segundos
export const MAX_NOTIFICATIONS = 5;

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-800',
  },
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isPrincipalArea(value: any): value is PrincipalArea {
  return value === null || ['corona', 'raiz', 'general'].includes(value);
}

export function isNotificationType(value: any): value is NotificationType {
  return ['success', 'error', 'warning', 'info'].includes(value);
}

export function isValidNotification(value: any): value is Notification {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'title' in value &&
    'message' in value &&
    isNotificationType(value.type)
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type NotificationWithoutId = Omit<Notification, 'id' | 'timestamp'>;
export type PartialPanelState = Partial<DiagnosticoPanelState>;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  DEFAULT_NOTIFICATION_DURATION,
  MAX_NOTIFICATIONS,
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
};
