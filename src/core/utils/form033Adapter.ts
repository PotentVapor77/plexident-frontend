// src/utils/odontogram/form033Adapter.ts

import type { SurfaceColorData } from '../../hooks/clinicalRecord/useCrownReadOnly';

/**
 * Datos de un diente según Form033Service del backend
 */
export interface Form033ToothData {
  key: string;
  simbolo: string;
  color: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  prioridad: number;
  codigo_fdi: string;
  superficies_afectadas: string[];
  diagnostico_id?: string;
  fecha_diagnostico?: string;
}

/**
 * Tipos de diagnóstico que pueden renderizar superficies en SVG
 * Solo CARIES y OBTURADO según requisitos
 */
const ALLOWED_SURFACE_TYPES = [
  'caries',           // "O" rojo
  'obturacion',       // "o" azul
  'restaurado',       // Alias para obturación
] as const;


export const adaptForm033ToSurfaceColors = (
  toothData: Form033ToothData | null
): SurfaceColorData[] => {
  if (!toothData) {
    return [];
  }

  // Priorizar key y color sobre tipo
  const keyLower = toothData.key.toLowerCase();
  const descLower = toothData.descripcion.toLowerCase();
  const tipoLower = toothData.tipo.toLowerCase();

  // Detectar CARIES
  const isCaries = 
    keyLower === 'caries' ||
    keyLower.includes('caries') ||
    descLower.includes('caries') ||
    (toothData.color === '#FF0000' && tipoLower === 'patologia'); // Rojo = caries

  // Detectar OBTURACIÓN
  const isObturacion = 
    keyLower === 'obturacion' ||
    keyLower === 'restaurado' ||
    keyLower.includes('obturacion') ||
    keyLower.includes('obturado') ||
    descLower.includes('obturado') ||
    descLower.includes('restaurado') ||
    (toothData.color === '#0000FF' && tipoLower === 'tratamiento'); // Azul = obturado

  if (!isCaries && !isObturacion) {
    return [];
  }

  // Sin superficies afectadas
  if (!toothData.superficies_afectadas || toothData.superficies_afectadas.length === 0) {
    return [];
  }

  // Rechazar "general"
  if (toothData.superficies_afectadas.includes('general')) {
    return [];
  }

  // Mapeo de nombres del backend → IDs del SVG
  const surfaceMapping: Record<string, string> = {
    'lingual': 'cara_lingual',
    'mesial': 'cara_mesial', 
    'oclusal': 'cara_oclusal',
    'distal': 'cara_distal',
    'vestibular': 'cara_vestibular',
  };

  const VALID_SVG_SURFACES = [
    'cara_oclusal', 
    'cara_distal',
    'cara_mesial', 
    'cara_vestibular',
    'cara_lingual',
  ];

  const validSurfaces = toothData.superficies_afectadas
    .map(original => {
      const lower = original.toLowerCase().trim();
      return surfaceMapping[lower];
    })
    .filter((id): id is string => {
      return !!id && VALID_SVG_SURFACES.includes(id);
    });

  if (validSurfaces.length === 0) {
    return [];
  }

  // Usar el color del backend directamente
  const opacity = isCaries ? 0.9 : 0.7;

  const result = validSurfaces.map((surfaceId) => ({
    id: surfaceId as SurfaceColorData['id'],
    color: toothData.color,
    opacity: opacity,
  }));

  return result;
};
export const shouldShowOverlayIcon = (
  toothData: Form033ToothData | null
): boolean => {
  if (!toothData) {
    return false;
  }
  
  // Si tiene superficies válidas coloreables, NO mostrar icono
  const hasSurfaces = adaptForm033ToSurfaceColors(toothData).length > 0;
  
  if (hasSurfaces) {
    return false;
  }

  // Mostrar icono para:
  // 1. Diagnósticos que no son caries/obturado
  const isNonSurfaceType = !ALLOWED_SURFACE_TYPES.some(
    type => toothData.tipo.toLowerCase().includes(type)
  );

  // 2. Caries/Obturado con superficies "general" o vacías
  const hasGeneralSurface = toothData.superficies_afectadas?.includes('general');
  const isAllowedTypeWithNoValidSurfaces = ALLOWED_SURFACE_TYPES.some(
    type => toothData.tipo.toLowerCase().includes(type)
  ) && !hasSurfaces;

  return isNonSurfaceType || hasGeneralSurface || isAllowedTypeWithNoValidSurfaces;
};

/**
 * Adapta múltiples dientes de una fila/cuadrante
 * 
 * @param teethRow - Array de dientes de una fila del odontograma
 * @returns Array de surfaces por posición (puede tener elementos vacíos)
 */
export const adaptForm033RowToSurfaces = (
  teethRow: (Form033ToothData | null)[]
): SurfaceColorData[][] => {
  return teethRow.map(toothData => adaptForm033ToSurfaceColors(toothData));
};

/**
 * Verifica si un diente tiene superficies renderizables
 * 
 * @param toothData - Datos del diente
 * @returns true si tiene al menos una superficie de caries/obturación
 */
export const hasRenderableSurfaces = (
  toothData: Form033ToothData | null
): boolean => {
  if (!toothData) return false;
  
  const surfaces = adaptForm033ToSurfaceColors(toothData);
  
  return surfaces.length > 0;
};

/**
 * Obtiene estadísticas de superficies afectadas
 * 
 * @param teethData - Array de dientes
 * @returns Conteo de caries y obturaciones
 */
export const getSurfaceStatistics = (
  teethData: (Form033ToothData | null)[]
): {
  totalCaries: number;
  totalObturaciones: number;
  totalSuperficiesAfectadas: number;
} => {
  let totalCaries = 0;
  let totalObturaciones = 0;
  let totalSuperficiesAfectadas = 0;

  teethData.forEach((tooth) => {
    if (!tooth) return;

    const surfaces = adaptForm033ToSurfaceColors(tooth);
    if (surfaces.length === 0) return;

    totalSuperficiesAfectadas += surfaces.length;

    if (tooth.tipo === 'caries') {
      totalCaries += surfaces.length;
    } else if (tooth.tipo === 'obturacion' || tooth.tipo === 'restaurado') {
      totalObturaciones += surfaces.length;
    }
  });

  return {
    totalCaries,
    totalObturaciones,
    totalSuperficiesAfectadas,
  };
};
