// src/components/odontogram/preview/hooks/useToothColorDecision.tsx
import React, { useMemo } from "react";
import type { Diagnostico } from "../..";
// Asumiendo que 'Diagnostico' se define en este archivo o en el import de abajo


/* ----------------------------------------------------
 * Mapeo de Colores Semánticos a Clases CSS (Tailwind)
 *
 * Utilizamos las variables de color definidas en index.css
 * para asegurar la consistencia del diseño.
 * -------------------------------------------------- */

// Mapeo de prioridadKey a CLASES de color de texto de Tailwind para estilizar los SVGs.
export const COLOR_CLASSES_POR_PRIORIDAD: Record<Diagnostico["prioridadKey"], string> = {
    ALTA: "text-error-500", // Rojo: F04438
    ESTRUCTURAL: "text-brand-500", // Azul principal: 465fff
    MEDIA: "text-warning-500", // Naranja: F79009
    BAJA: "text-success-500", // Verde: 12B76A
    INFORMATIVA: "text-blue-light-500", // Azul claro: 0ba5ec
};

// Colores directos (HEX) para el colorGlobal, usado para rellenar/bordear el diente.
export const COLORES_PRIORIDAD: Record<Diagnostico["prioridadKey"], string> = {
    ALTA: "#F04438",
    ESTRUCTURAL: "#465fff",
    MEDIA: "#F79009",
    BAJA: "#12B76A",
    INFORMATIVA: "#0ba5ec",
};

const MAX_ICONS = 3;

/* ----------------------------------------------------
 * Utilidades puras
 * -------------------------------------------------- */
const ORDEN_PRIORIDAD: Record<Diagnostico["prioridadKey"], number> = {
    ALTA: 1,
    ESTRUCTURAL: 2,
    MEDIA: 3,
    BAJA: 4,
    INFORMATIVA: 5,
};

/** Ordena los diagnósticos de mayor a menor prioridad (1 es la más alta). */
const ordenarDiagnosticos = (diags: Diagnostico[]) =>
    [...diags].sort(
        (a, b) => ORDEN_PRIORIDAD[a.prioridadKey] - ORDEN_PRIORIDAD[b.prioridadKey]
    );

/* ----------------------------------------------------
 * Componentes SVG (mejorado con clases de Tailwind)
 * -------------------------------------------------- */

// Icono de problema/información genérico (círculo con signo de exclamación/i)
const SvgProblema = React.memo(({ colorClass }: { colorClass: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        // Fill con currentColor permite que la clase CSS defina el color
        fill="currentColor"
        className={`size-4 ${colorClass}`}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" />
    </svg>
));

// Icono para indicar cobertura total (ej: una corona o recuadro)
const SvgCoberturaTotal = React.memo(({ colorClass }: { colorClass: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        // Stroke con currentColor permite que la clase CSS defina el color
        stroke="currentColor"
        strokeWidth={2.5}
        className={`size-4 ${colorClass}`}
    >
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    </svg>
));

/* ----------------------------------------------------
 * Tipos de salida
 * -------------------------------------------------- */
interface DecisionResult {
    svgsCorona: React.ReactElement[];
    svgsRaiz: React.ReactElement[];
    tooltipCorona: string;
    tooltipRaiz: string;
    colorGlobal: string; // Color hex principal para rellenar la superficie del diente (o el borde)
    coberturaTotal: boolean;
    coberturaTotalSvg?: React.ReactElement;
    coberturaTotalTooltip?: string;
}

/* ----------------------------------------------------
 * Hook principal
 * -------------------------------------------------- */
/** Elimina diagnósticos duplicados por id (mantiene el primero) */
const deduplicarDiagnosticos = (diags: Diagnostico[]) => {
    const map = new Map<string, Diagnostico>();

    for (const d of diags) {
        if (!map.has(d.id)) {
            map.set(d.id, d);
        }
    }

    return Array.from(map.values());
};
export const useToothColorDecision = (
    diagsFiltrados: Diagnostico[],
    esFiltroPorSuperficie: boolean
): DecisionResult => {
    return useMemo(() => {
        // Caso: Sin diagnósticos
        if (diagsFiltrados.length === 0) {
            return {
                svgsCorona: [],
                svgsRaiz: [],
                tooltipCorona: "",
                tooltipRaiz: "",
                // Usando Gray-400 para un estado neutro/saludable sutil.
                colorGlobal: "#98A2B3",
                coberturaTotal: false,
            };
        }

        /* ---------- 1. Ordenar por prioridad y obtener colores principales ---------- */
        const diagsUnicos = deduplicarDiagnosticos(diagsFiltrados);
        const diagsOrdenados = ordenarDiagnosticos(diagsFiltrados);
        const masPrioritario = diagsOrdenados[0];
        const colorPrincipalHex = COLORES_PRIORIDAD[masPrioritario.prioridadKey];
        const colorPrincipalClass = COLOR_CLASSES_POR_PRIORIDAD[masPrioritario.prioridadKey];


        /* ---------- 2. Determinar Cobertura total (diente completo) ---------- */
        const activarCobertura =
            masPrioritario.areasafectadas.includes("general") &&
            !esFiltroPorSuperficie;

        if (activarCobertura) {
            return {
                svgsCorona: [],
                svgsRaiz: [],
                tooltipCorona: masPrioritario.nombre,
                tooltipRaiz: masPrioritario.nombre,
                colorGlobal: colorPrincipalHex,
                coberturaTotal: true,
                coberturaTotalSvg: <SvgCoberturaTotal colorClass={colorPrincipalClass} />,
                coberturaTotalTooltip: masPrioritario.nombre,
            };
        }

        /* ---------- 3. Separación por área (Corona vs. Raíz) ---------- */
        const diagsCorona = diagsOrdenados.filter(
            d =>
                d.areasafectadas.includes("corona") ||
                d.areasafectadas.includes("general")
        );

        const diagsRaiz = diagsOrdenados.filter(
            d =>
                d.areasafectadas.includes("raiz") ||
                d.areasafectadas.includes("general")
        );

        /* ---------- 4. Generación de SVGs (máx. 3 por área) ---------- */
        const svgsCorona = diagsCorona
            .slice(0, MAX_ICONS)
            .map(d => (
                <SvgProblema
                    key={d.id}
                    colorClass={COLOR_CLASSES_POR_PRIORIDAD[d.prioridadKey]}
                />
            ));

        const svgsRaiz = diagsRaiz
            .slice(0, MAX_ICONS)
            .map(d => (
                <SvgProblema
                    key={d.id}
                    colorClass={COLOR_CLASSES_POR_PRIORIDAD[d.prioridadKey]}
                />
            ));

        /* ---------- 5. Tooltips (Nombres de todos los diagnósticos) ---------- */
        const tooltipCorona = Array.from(
            new Set(diagsCorona.map(d => d.nombre))
        ).join(", ");

        const tooltipRaiz = Array.from(
            new Set(diagsRaiz.map(d => d.nombre))
        ).join(", ");

        return {
            svgsCorona,
            svgsRaiz,
            tooltipCorona,
            tooltipRaiz,
            colorGlobal: colorPrincipalHex,
            coberturaTotal: false,
        };
    }, [diagsFiltrados, esFiltroPorSuperficie]);
};