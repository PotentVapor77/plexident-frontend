// src/components/odontogram/typeOdontograma.ts

/**
 * Tipos específicos de UI del odontograma
 * Importa y transforma tipos del backend cuando sea necesario
 */

// ============================================================================
// CONSTANTES UI (Colores, estilos)
// ============================================================================

export const ODONTO_COLORS = {
  PATOLOGIA: { color: 'bg-red-500', hover: 'hover:bg-red-600', fill: '#ef4444', priority: 1 },
  ANOMALIA: { color: 'bg-gray-700', hover: 'hover:bg-gray-800', fill: '#1f2937', priority: 2 },
  ENDODONCIA: { color: 'bg-yellow-600', hover: 'hover:bg-yellow-700', fill: '#ca8a04', priority: 3 },
  REALIZADO: { color: 'bg-sky-500', hover: 'hover:bg-sky-600', fill: '#0ea5e9', priority: 4 },
  AUSENCIA: { color: 'bg-black', hover: 'hover:bg-gray-900', fill: '#000000', priority: 5 },
  SELECCIONADO_UI: { color: 'bg-blue-500', hover: 'hover:bg-blue-600', fill: '#6366f1', priority: 6 },
};

export const MATERIAL_COLORS = {
  Amalgama: { fill: '#4b5563', name: 'Amalgama' },
  Resina: { fill: '#34d399', name: 'Resina' },
  Ionómero: { fill: '#fcd34d', name: 'Ionómero' },
  Porcelana: { fill: '#f3f4f6', name: 'Porcelana' },
  Oro: { fill: '#f59e0b', name: 'Oro' },
  Cera: { fill: '#a16207', name: 'Cera' },
  Otro: { fill: '#3b82f6', name: 'Otro' },
};

export type OdontoColorKey = keyof typeof ODONTO_COLORS;
export type MaterialColorKey = keyof typeof MATERIAL_COLORS;

// ============================================================================
// TIPOS DE NEGOCIO (Frontend)
// ============================================================================

export type PrioridadKey = 'ALTA' | 'MEDIA' | 'BAJA' | 'ESTRUCTURAL' | 'INFORMATIVA';
export type AreaAfectada = 'corona' | 'raiz' | 'general';

export type TipoDiagnostico =
  | 'Patología Activa'
  | 'Restauración'
  | 'Tratamiento de Conductos'
  | 'Ausencia'
  | 'Anomalía';

export type RootGroupKey =
  | 'molar_superior'
  | 'molar_inferior'
  | 'premolar'
  | 'anterior';

// ============================================================================
// TIPOS DE ATRIBUTOS CLÍNICOS (Transformados para UI)
// ============================================================================

export type OpcionAtributoClinico = {
  key: string;
  label: string;
  prioridad?: number | null;
  orden: number;
};

export type AtributoClinicoDefinicion = {
  nombre: string;
  descripcion: string;
  tipo_input: 'select' | 'radio' | 'checkbox' | 'text';
  requerido: boolean;
  opciones: OpcionAtributoClinico[];
};

// ============================================================================
// TIPOS DE DIAGNÓSTICO (Para UI)
// ============================================================================

/**
 * Diagnóstico transformado para uso en UI
 * Viene del mapeo de DiagnosticoBackend
 */
export type DiagnosticoItem = {
  id: string;
  nombre: string;
  siglas: string;
  simboloColor: OdontoColorKey;
  categoria: TipoDiagnostico;
  prioridadKey: PrioridadKey;
  areasafectadas: AreaAfectada[];
  atributos_clinicos: Record<string, AtributoClinicoDefinicion>;
};

// Alias para compatibilidad
export type Diagnostico = DiagnosticoItem;

/**
 * Categoría de diagnósticos para UI
 */
export type DiagnosticoCategory = {
  id: TipoDiagnostico;
  nombre: string;
  colorKey: OdontoColorKey;
  prioridadKey: PrioridadKey;
  diagnosticos: DiagnosticoItem[];
};

// ============================================================================
// TIPOS DE ENTRADA (Para guardar diagnósticos)
// ============================================================================

/**
 * Entrada de diagnóstico aplicado a un diente
 * Se envía al backend y se guarda en el estado local
 */
export type DiagnosticoEntry = {
  id: string;
  procedimientoId: string;
  colorHex: string;
  priority: number;
  siglas: string;
  nombre: string;
  areasafectadas: AreaAfectada[];
  secondaryOptions: Record<string, any>;
  descripcion: string;
  superficieId?: string;
  prioridadKey: PrioridadKey;
};

// ============================================================================
// ESTRUCTURAS DE DATOS (Estado del odontograma)
// ============================================================================

/**
 * Estructura completa del odontograma en memoria
 * Formato: { "11": { "vestibular": [DiagnosticoEntry[]], ... }, ... }
 */
export type OdontogramaData = Record<string, Record<string, DiagnosticoEntry[]>>;

/**
 * Estado global de dientes (ausencia, color dominante)
 */
export type DienteGlobalData = Record<
  string,
  { ausente: boolean; dominanteColor: string | null }
>;
