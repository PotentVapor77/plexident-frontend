import { AlertCircle, AlertTriangle, ArrowLeftRight, Ban, CheckCircle, CheckCircle2, Crown, Disc, Layers, Link2, MinusCircle, ShieldAlert, ShieldCheck, SmilePlus, XCircle } from 'lucide-react';
import React from 'react';


export interface DiagnosticIcon {
  key: string;
  Icon: React.FC<any>;
  color: string;
  priority: 1 | 2 | 3 | 4 | 5;
  form033: string;
  tooltip: string;
  categoria: string;
}

export const DIAGNOSTIC_ICONS: Record<string, DiagnosticIcon> = {
  // 🔴 PRIORIDAD 5 (CRÍTICA) - Rojo #EF4444
  caries: {
    key: 'caries',
    Icon: AlertCircle,
    color: '#EF4444',
    priority: 5,
    form033: '◉ Rojo',
    tooltip: 'Caries activa',
    categoria: 'patologia_activa'
  },
  extraccion_indicada: {
    key: 'extraccion_indicada',
    Icon: XCircle,
    color: '#EF4444',
    priority: 5,
    form033: '⊗ Roja',
    tooltip: 'Extracción indicada',
    categoria: 'patologia_activa'
  },
  endodoncia_indicada: {
    key: 'endodoncia_indicada',
    Icon: AlertTriangle,
    color: '#EF4444',
    priority: 5,
    form033: '▲ Rojo',
    tooltip: 'Endodoncia por realizar',
    categoria: 'patologia_activa'
  },

  // 🟠 PRIORIDAD 4 (ALTA) - Naranja #F97316
  perdida_otra_causa: {
    key: 'perdida_otra_causa',
    Icon: AlertCircle,
    color: '#F97316',
    priority: 4,
    form033: '_ Rojo',
    tooltip: 'Pérdida otra causa',
    categoria: 'patologia_activa'
  },
  protesis_fija_indicada: {
    key: 'protesis_fija_indicada',
    Icon: Link2,
    color: '#F97316',
    priority: 4,
    form033: '¨---¨ Rojo',
    tooltip: 'Prótesis fija indicada',
    categoria: 'patologia_activa'
  },
  protesis_removible_indicada: {
    key: 'protesis_removible_indicada',
    Icon: SmilePlus,
    color: '#F97316',
    priority: 4,
    form033: '(-----) Rojo',
    tooltip: 'Prótesis removible indicada',
    categoria: 'patologia_activa'
  },
  corona_indicada: {
    key: 'corona_indicada',
    Icon: Crown,
    color: '#F97316',
    priority: 4,
    form033: 'ª Rojo',
    tooltip: 'Corona indicada',
    categoria: 'patologia_activa'
  },
  protesis_total_indicada: {
    key: 'protesis_total_indicada',
    Icon: Layers,
    color: '#F97316',
    priority: 4,
    form033: '═ Rojo',
    tooltip: 'Prótesis total indicada',
    categoria: 'patologia_activa'
  },

  // 🟡 PRIORIDAD 3 (MEDIA) - Amarillo #EAB308
  sellante_necesario: {
    key: 'sellante_necesario',
    Icon: ShieldAlert,
    color: '#EAB308',
    priority: 3,
    form033: 'U Rojo',
    tooltip: 'Sellante necesario',
    categoria: 'patologia_activa'
  },
  movilidad_dental: {
    key: 'movilidad_dental',
    Icon: ArrowLeftRight,
    color: '#EAB308',
    priority: 3,
    form033: 'M Rojo',
    tooltip: 'Movilidad dental',
    categoria: 'patologia_activa'
  },
  recesion_gingival: {
    key: 'recesion_gingival',
    Icon: AlertCircle,
    color: '#EAB308',
    priority: 3,
    form033: 'R Rojo',
    tooltip: 'Recesión gingival',
    categoria: 'patologia_activa'
  },

  // 🔵 PRIORIDAD 2-4 (INFORMATIVA) - Azul #3B82F6
  extraccion_otra_causa: {
    key: 'extraccion_otra_causa',
    Icon: MinusCircle,
    color: '#3B82F6',
    priority: 4,
    form033: 'X Azul',
    tooltip: 'Extracción',
    categoria: 'tratamiento_realizado'
  },
  sellante_realizado: {
    key: 'sellante_realizado',
    Icon: ShieldCheck,
    color: '#3B82F6',
    priority: 2,
    form033: 'U Azul',
    tooltip: 'Sellante realizado',
    categoria: 'tratamiento_realizado'
  },
  endodoncia_realizada: {
    key: 'endodoncia_realizada',
    Icon: CheckCircle2,
    color: '#3B82F6',
    priority: 3,
    form033: '_ Azul',
    tooltip: 'Endodoncia realizada',
    categoria: 'tratamiento_realizado'
  },
  obturacion: {
    key: 'obturacion',
    Icon: Disc,
    color: '#3B82F6',
    priority: 2,
    form033: 'o Azul',
    tooltip: 'Obturado',
    categoria: 'tratamiento_realizado'
  },
  protesis_fija_realizada: {
    key: 'protesis_fija_realizada',
    Icon: Link2,
    color: '#3B82F6',
    priority: 2,
    form033: '-- Azul',
    tooltip: 'Prótesis fija realizada',
    categoria: 'tratamiento_realizado'
  },
  protesis_removible_realizada: {
    key: 'protesis_removible_realizada',
    Icon: SmilePlus,
    color: '#3B82F6',
    priority: 2,
    form033: '----- Azul',
    tooltip: 'Prótesis removible realizada',
    categoria: 'tratamiento_realizado'
  },
  corona_realizada: {
    key: 'corona_realizada',
    Icon: Crown,
    color: '#3B82F6',
    priority: 2,
    form033: 'ª Azul',
    tooltip: 'Corona realizada',
    categoria: 'tratamiento_realizado'
  },
  protesis_total_realizada: {
    key: 'protesis_total_realizada',
    Icon: Layers,
    color: '#3B82F6',
    priority: 2,
    form033: '═ Azul',
    tooltip: 'Prótesis total realizada',
    categoria: 'tratamiento_realizado'
  },

  // ⚪ PRIORIDAD 1 (ESTRUCTURAL) - Gris #6B7280
  ausente: {
    key: 'ausente',
    Icon: Ban,
    color: '#6B7280',
    priority: 1,
    form033: 'A',
    tooltip: 'Ausente',
    categoria: 'ausencia'
  },

  // 🟢 PRIORIDAD 1 (PREVENTIVO) - Verde #10B981
  diente_sano: {
    key: 'diente_sano',
    Icon: CheckCircle,
    color: '#10B981',
    priority: 1,
    form033: '✓ Verde',
    tooltip: 'Diente sano',
    categoria: 'preventivo'
  }
};

// Función helper para obtener icono por key
export const getDiagnosticIcon = (key: string): DiagnosticIcon | null => {
  return DIAGNOSTIC_ICONS[key] || null;
};

// Función para obtener icono dominante por prioridad
export const getDominantDiagnosticIcon = (diagnostics: string[]): DiagnosticIcon | null => {
  const validDiagnostics = diagnostics
    .map(key => DIAGNOSTIC_ICONS[key])
    .filter(Boolean) as DiagnosticIcon[];
  
  if (!validDiagnostics.length) return null;
  
  // Retorna el de mayor prioridad (número más alto)
  return validDiagnostics.reduce((highest, current) => 
    current.priority > highest.priority ? current : highest
  );
};
