// src/hooks/odontogram/useCatalogoDiagnosticos.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { DiagnosticoCategory } from '../../components/odontogram';
import { obtenerCatalogoDiagnosticos, obtenerAtributosClinicos } from '../../services/odontogram/odontogramaService';
import type { CategoriaDiagnosticoBackend, DiagnosticoBackend } from '../../types/odontogram/typeBackendOdontograma';

// ============================================================================
// MAPEO SIMPLIFICADO (sin mapper complejo)
// ============================================================================

function mapearCategoriasDirecto(categorias: CategoriaDiagnosticoBackend[]): DiagnosticoCategory[] {
  if (!Array.isArray(categorias)) return [];

  return categorias.map(cat => ({
    id: cat.key as any, // Usar key como ID
    nombre: cat.nombre,
    colorKey: cat.color_key as any,
    prioridadKey: cat.prioridad_key as any,
    diagnosticos: Array.isArray(cat.diagnosticos)
      ? cat.diagnosticos.map((diag: DiagnosticoBackend) => ({
          id: diag.key,
          nombre: diag.nombre,
          siglas: diag.siglas,
          simboloColor: diag.simbolo_color as any,
          categoria: cat.nombre as any,
          areas_afectadas: mapearSuperficies(diag.superficie_aplicables || []),
          atributos_clinicos: {},
        }))
      : [],
  }));
}

function mapearSuperficies(superficies: string[]): ('corona' | 'raiz' | 'general')[] {
  if (superficies.includes('general') || superficies.length === 0) return ['general'];
  
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
  // Query 1: Categorías CON diagnósticos anidados
  const {
    data: categoriasRaw,
    isLoading: isLoadingCategorias,
    error: errorCategorias
  } = useQuery({
    queryKey: ['catalogo-diagnosticos'],
    queryFn: obtenerCatalogoDiagnosticos,
    staleTime: 1000 * 60 * 60, // Cache por 1 hora
  });

  // Query 2: Atributos clínicos (opcional, solo si los usas en la UI)
  const {
    data: atributosClinicos,
    isLoading: isLoadingAtributos,
    error: errorAtributos
  } = useQuery({
    queryKey: ['atributos-clinicos'],
    queryFn: obtenerAtributosClinicos,
    staleTime: 1000 * 60 * 60,
  });

  // Mapeo a formato frontend
  const categoriasMapeadas: DiagnosticoCategory[] = useMemo(() => {
    if (!categoriasRaw || !Array.isArray(categoriasRaw)) {
      console.warn('categoriasRaw no es un array:', categoriasRaw);
      return [];
    }

    try {
      return mapearCategoriasDirecto(categoriasRaw);
    } catch (error) {
      console.error('Error mapeando categorías:', error);
      return [];
    }
  }, [categoriasRaw]);

  return {
    categorias: categoriasMapeadas,
    atributosClinicos: Array.isArray(atributosClinicos) ? atributosClinicos : [],
    isLoading: isLoadingCategorias || isLoadingAtributos,
    error: errorCategorias || errorAtributos,
  };
};
