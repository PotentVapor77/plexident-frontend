

import React from "react";
import type { Diagnostico } from "../ToothStatusDisplay";

// --- Tipos y Constantes Auxiliares (Duplicados o importados si fuera un archivo separado) ---
export const COLORES_PRIORIDAD: Record<Diagnostico['prioridadKey'], string> = {
    ALTA: '#D9534F',
    ESTRUCTURAL: '#428BCA',
    MEDIA: '#F0AD4E',
    BAJA: '#5CB85C',
    INFORMATIVA: '#5BC0DE',
};

// Se asume que SvgProblema, SvgCoberturaTotal y ordenarDiagnosticos están definidos
// en el mismo ámbito o se importarán a este archivo si fuera un módulo separado.
const MAX_ICONS = 3;

const ordenarDiagnosticos = (diags: Diagnostico[]) => {
    const ordenPrioridad: Record<Diagnostico['prioridadKey'], number> = {
        ALTA: 1, ESTRUCTURAL: 2, MEDIA: 3, BAJA: 4, INFORMATIVA: 5,
    };
    // Se utiliza sort in-place, pero se clona la lista para no mutar el estado
    return [...diags].sort((a, b) => ordenPrioridad[a.prioridadKey] - ordenPrioridad[b.prioridadKey]);
};

// Definiciones de SVG para el hook (deberían importarse)
const SvgProblema = ({ color, className }: { color: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className} style={{ color }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" />
    </svg>
);
const SvgCoberturaTotal = ({ color, className }: { color: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke={color} className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
);
const obtenerIcono = (diag: Diagnostico) => {
    const color = COLORES_PRIORIDAD[diag.prioridadKey];
    return <SvgProblema color={color} className="w-4 h-4" />;
};
// --- Fin de Auxiliares ---

interface DecisionResult {
    svgsCorona: React.ReactElement[];
    svgsRaiz: React.ReactElement[];
    tooltipCorona: string;
    tooltipRaiz: string;
    colorGlobal: string;
    coberturaTotal: boolean;
    coberturaTotalSvg?: React.ReactElement; // SVG de cobertura si aplica
    coberturaTotalTooltip?: string;
}

/**
 * Hook para determinar el color predominante, los íconos de problema
 * y si se aplica una Cobertura Total.
 */
export const useToothColorDecision = (
    diagsFiltrados: Diagnostico[],
    esFiltroPorSuperficie: boolean,
): DecisionResult => {

    if (diagsFiltrados.length === 0) {
        return {
            svgsCorona: [], svgsRaiz: [], tooltipCorona: '', tooltipRaiz: '', 
            colorGlobal: '#333', coberturaTotal: false 
        };
    }
    
    // 1. Decisión de Cobertura Total
    //const diagsGeneral = diagsFiltrados.filter(d => d.areas_afectadas.includes('general'));
    const diagsOrdenados = ordenarDiagnosticos(diagsFiltrados);
    const masPrioritario = diagsOrdenados[0];
    
    // Regla de Cobertura Total: existe un diagnóstico 'general' y NO hay un filtro de superficie activo
    const activarCobertura = masPrioritario.areas_afectadas.includes('general') && !esFiltroPorSuperficie;

    if (activarCobertura) {
        const color = COLORES_PRIORIDAD[masPrioritario.prioridadKey];
        const svg = <SvgCoberturaTotal color={color} className="w-full h-full" />;
        return {
            svgsCorona: [], svgsRaiz: [], 
            tooltipCorona: masPrioritario.nombre, tooltipRaiz: masPrioritario.nombre, 
            colorGlobal: color, 
            coberturaTotal: true,
            coberturaTotalSvg: svg,
            coberturaTotalTooltip: masPrioritario.nombre,
        };
    }

    // 2. Separación por área (para íconos)
    const diagsCorona = diagsFiltrados.filter(d => d.areas_afectadas.includes('corona') || d.areas_afectadas.includes('general'));
    const diagsRaiz = diagsFiltrados.filter(d => d.areas_afectadas.includes('raiz') || d.areas_afectadas.includes('general'));

    const diagsCoronaOrdenados = ordenarDiagnosticos(diagsCorona);
    const diagsRaizOrdenados = ordenarDiagnosticos(diagsRaiz);

    // 3. Generación de SVGs e Tooltips
    const svgsCorona = diagsCoronaOrdenados.slice(0, MAX_ICONS).map(obtenerIcono);
    const svgsRaiz = diagsRaizOrdenados.slice(0, MAX_ICONS).map(obtenerIcono);

    const tooltipCorona = diagsCoronaOrdenados.map(d => d.nombre).join(', ');
    const tooltipRaiz = diagsRaizOrdenados.map(d => d.nombre).join(', ');

    // 4. Color Global (el más prioritario de todo lo que se muestra)
    const colorGlobal = diagsOrdenados[0] ? COLORES_PRIORIDAD[diagsOrdenados[0].prioridadKey] : '#333';

    return {
        svgsCorona,
        svgsRaiz,
        tooltipCorona,
        tooltipRaiz,
        colorGlobal,
        coberturaTotal: false,
    };
};