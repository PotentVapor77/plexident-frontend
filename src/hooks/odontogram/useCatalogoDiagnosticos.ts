// src/hooks/odontogram/useCatalogoDiagnosticos.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { obtenerCatalogoDiagnosticos } from '../../services/odontogram/odontogramaService';
import type {
  CategoriaDiagnosticoBackend,
  DiagnosticoBackend,
  AtributoClinicoBackend
} from '../../types/odontogram/typeBackendOdontograma';
import type { DiagnosticoCategory, PrioridadKey } from '../../core/types/odontograma.types';

// ============================================================================
// MAPEO DE PRIORIDADES
// ============================================================================

const PRIORIDAD_BACKEND_TO_FRONTEND: Record<number, PrioridadKey> = {
  5: 'ALTA',
  4: 'ESTRUCTURAL',
  3: 'MEDIA',
  2: 'BAJA',
  1: 'INFORMATIVA',
};

// ============================================================================
// MAPEO CON ATRIBUTOS CLÍNICOS
// ============================================================================

function mapearCategoriasConAtributos(categorias: CategoriaDiagnosticoBackend[]): DiagnosticoCategory[] {
  if (!Array.isArray(categorias)) {
    console.warn('❌ categorias no es un array:', categorias);
    return [];
  }

  return categorias.map(cat => {
    
    return {
      id: cat.key as any,
      nombre: cat.nombre,
      colorKey: cat.color_key as any,
      prioridadKey: cat.prioridad_key as any,
      diagnosticos: Array.isArray(cat.diagnosticos)
        ? cat.diagnosticos.map((diag: DiagnosticoBackend) => {
            const atributosMapeados = mapearAtributosClinicos(diag.atributos_relacionados || []);
            
            return {
              id: diag.key,
              nombre: diag.nombre,
              siglas: diag.siglas,
              simboloColor: diag.simbolo_color as any,
              categoria: cat.nombre as any,
              prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[diag.prioridad] || 'MEDIA', 
              areasafectadas: mapearSuperficies(diag.superficie_aplicables || []),
              atributos_clinicos: atributosMapeados,
            };
          })
        : [],
    };
  });
}

/**
 * Mapea los atributos clínicos del backend a un formato más usable en el frontend
 */
function mapearAtributosClinicos(atributos: AtributoClinicoBackend[]): Record<string, any> {
  if (!Array.isArray(atributos) || atributos.length === 0) {
    return {};
  }


  const resultado: Record<string, any> = {};

  atributos.forEach(attr => {
    
    resultado[attr.key] = {
      nombre: attr.nombre,
      descripcion: attr.descripcion,
      tipo_input: attr.tipo_input,
      requerido: attr.requerido,
      opciones: attr.opciones.map(opc => ({
        key: opc.key,
        label: opc.nombre,
        prioridad: opc.prioridad,
        orden: opc.orden,
      })),
    };
  });

  return resultado;
}

/**
 * Mapea las superficies aplicables del backend a áreas afectadas del frontend
 */
function mapearSuperficies(superficies: string[]): ('corona' | 'raiz' | 'general')[] {
  if (superficies.includes('general') || superficies.length === 0) {
    return ['general'];
  }

  const tieneCorona = superficies.some(s =>
    ['vestibular', 'lingual', 'oclusal', 'mesial', 'distal'].includes(s)
  );
  const tieneRaiz = superficies.some(s => s.startsWith('raiz_'));

  const result: ('corona' | 'raiz' | 'general')[] = [];
  if (tieneCorona) result.push('corona');
  if (tieneRaiz) result.push('raiz');

  return result.length > 0 ? result : ['general'];
}

// ============================================================================
// HOOK
// ============================================================================

export const useCatalogoDiagnosticos = () => {
  // Query: Categorías CON diagnósticos anidados
  const {
    data: categoriasRaw,
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalogo-diagnosticos'],
    queryFn: obtenerCatalogoDiagnosticos,
    staleTime: 1000 * 60 * 60,
  });

  // Mapeo a formato frontend
  const categoriasMapeadas: DiagnosticoCategory[] = useMemo(() => {
    if (!categoriasRaw || !Array.isArray(categoriasRaw)) {
      console.warn('categoriasRaw no es un array:', categoriasRaw);
      return [];
    }

    // console.log(`Mapeando ${categoriasRaw.length} categorías...`);

    try {
      const resultado = mapearCategoriasConAtributos(categoriasRaw);
      // console.log(`Mapeo completado. ${resultado.length} categorías procesadas.`);
      return resultado;
    } catch (error) {
      // console.error('Error mapeando categorías:', error);
      return [];
    }
  }, [categoriasRaw]);

  return {
    categorias: categoriasMapeadas,
    isLoading,
    error,
  };
};
