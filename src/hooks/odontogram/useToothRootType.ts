// src/hooks/useToothRootType.ts
import { useMemo } from 'react';

export interface ToothRootInfo {
    type: 'raiz_molar_superior' | 'raiz_molar_inferior' | 'raiz_premolar' | 'raiz_canino' | 'raiz_incisivo' | 'raiz_dental';
    roots: ('raiz-mesial' | 'raiz-distal' | 'raiz-palatal' | 'raiz-vestibular' | 'raiz-principal')[];
}

// Mapeo centralizado para mejor mantenibilidad y rendimiento
const TOOTH_ROOT_MAPPINGS: Array<{
    patterns: string[];
    config: ToothRootInfo;
}> = [
    {
        patterns: ['premolar'],
        config: { 
            type: 'raiz_premolar', 
            roots: ['raiz-vestibular', 'raiz-palatal'] 
        }
    },
    {
        patterns: ['molar_upper', 'wisdom_upper'],
        config: { 
            type: 'raiz_molar_superior', 
            roots: ['raiz-mesial', 'raiz-distal', 'raiz-palatal'] 
        }
    },
    {
        patterns: ['molar_lower', 'wisdom_lower'],
        config: { 
            type: 'raiz_molar_inferior', 
            roots: ['raiz-mesial', 'raiz-distal'] 
        }
    },
    
    {
        patterns: ['canine'],
        config: { 
            type: 'raiz_canino', 
            roots: ['raiz-principal'] 
        }
    },
    {
        patterns: ['incisor'],
        config: { 
            type: 'raiz_incisivo', 
            roots: ['raiz-principal'] 
        }
    }
];

// Cache simple para evitar recálculos frecuentes
const rootCache = new Map<string, ToothRootInfo>();

// Función utilitaria para uso fuera de React
export const getToothRootType = (toothId: string | null): ToothRootInfo => {
    if (!toothId) return { type: 'raiz_dental', roots: [] };
    
    // Verificar cache primero
    const cached = rootCache.get(toothId);
    if (cached) {
        return cached;
    }

    const normalizedId = toothId.toLowerCase();
    let result: ToothRootInfo = { type: 'raiz_dental', roots: [] };

    // Buscar en los patrones definidos
    for (const mapping of TOOTH_ROOT_MAPPINGS) {
        const hasMatch = mapping.patterns.some(pattern => 
            normalizedId.includes(pattern)
        );
        
        if (hasMatch) {
            result = mapping.config;
            break;
        }
    }

    // Almacenar en cache (con límite para evitar memory leaks)
    if (rootCache.size > 100) {
        const firstKey = rootCache.keys().next().value;
        if (firstKey) {
            rootCache.delete(firstKey);
        }
    }
    rootCache.set(toothId, result);

    return result;
};

export const useToothRootType = (toothId: string | null): ToothRootInfo => {
    return useMemo(() => {
        return getToothRootType(toothId);
    }, [toothId]);
};