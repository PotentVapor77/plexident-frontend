// src/types/odontograma.ts
export const ODONTO_COLORS = {
  PATOLOGIA: { color: 'bg-red-500', hover: 'hover:bg-red-600', fill: '#ef4444', priority: 1 },
  ANOMALIA: { color: 'bg-gray-700', hover: 'hover:bg-gray-800', fill: '#1f2937', priority: 2 },
  ENDODONCIA: { color: 'bg-yellow-600', hover: 'hover:bg-yellow-700', fill: '#ca8a04', priority: 3 },
  REALIZADO: { color: 'bg-sky-500', hover: 'hover:bg-sky-600', fill: '#0ea5e9', priority: 4 },
  AUSENCIA: { color: 'bg-black', hover: 'hover:bg-gray-900', fill: '#000000', priority: 5 },
  SELECCIONADO_UI: { color: 'bg-blue-500', hover: 'hover:bg-blue-600', fill: '#3b82f6', priority: 6 },
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

export type PrioridadKey = 'ALTA' | 'MEDIA' | 'BAJA' | 'ESTRUCTURAL' | 'INFORMATIVA';
export type AreaAfectada = 'corona' | 'raiz' | 'general';

export type TipoDiagnostico =
  | 'Patología Activa'
  | 'Restauración'
  | 'Tratamiento de Conductos'
  | 'Ausencia'
  | 'Anomalía';

export type OpcionSecundaria = {
  key: string;
  nombre: string;
};

export type DiagnosticoItem = {
  opciones_secundarias?: any;
  id: string;
  nombre: string;
  siglas: string;
  simboloColor: OdontoColorKey;
  categoria: TipoDiagnostico; // antes tipo_diagnostico
  areas_afectadas: AreaAfectada[]; // antes afecta_area
  atributos_clinicos?: {
      // includes(arg0: string): unknown; <-- ¡ELIMINADO!
      material_restauracion?: OpcionSecundaria[];
      estado_restauracion?: OpcionSecundaria[];
      erupcion?: OpcionSecundaria[];
      movilidad?: OpcionSecundaria[];
      estado_procedimiento?: OpcionSecundaria[];
      priorityKey?: PrioridadKey;
  }; // antes opcionesSecundarias
};
export type DiagnosticoCategory = {
  id: TipoDiagnostico;
  nombre: string;
  colorKey: OdontoColorKey;
  prioridadKey: PrioridadKey;
  diagnosticos: DiagnosticoItem[]; 
};

// Mantener tipos de entrada y estructuras para UI/backend
export type DiagnosticoEntry = {
  id: string;
  procedimientoId: string;
  colorHex: string;
  priority: number;
  siglas: string;
  nombre: string;
  areas_afectadas: AreaAfectada[];
  secondaryOptions: Record<string, string>;
  descripcion: string;
  superficieId?: string;
  prioridadKey: PrioridadKey;
};
export type OdontogramaData = Record<string, Record<string, DiagnosticoEntry[]>>;

export type DienteGlobalData = Record<
  string,
  { ausente: boolean; dominanteColor: string | null }
>;
export type RootGroupKey =
  | "molar_superior"
  | "molar_inferior"
  | "premolar"
  | "anterior";