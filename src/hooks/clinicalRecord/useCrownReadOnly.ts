// src/hooks/clinicalRecord/useCrownReadOnly.ts

import { useEffect, useMemo } from 'react';

/**
 * IDs de superficies de corona según odonto.svg
 */
export const CROWN_SURFACE_IDS = {
    OCLUSAL: 'cara_oclusal',
    DISTAL: 'cara_distal',
    MESIAL: 'cara_mesial',
    VESTIBULAR: 'cara_vestibular',
    LINGUAL: 'cara_lingual',
} as const;

export type CrownSurfaceId = typeof CROWN_SURFACE_IDS[keyof typeof CROWN_SURFACE_IDS];

export interface SurfaceColorData {
    id: CrownSurfaceId;
    color: string;
    opacity?: number;
}

interface UseCrownReadOnlyParams {
    svgLoaded: boolean;
    toothFDI: string;
    surfaces: SurfaceColorData[];
    showBorders?: boolean;
    defaultColor?: string;
    defaultStroke?: string;
}
export const useCrownReadOnly = ({
    svgLoaded,
    toothFDI,
    surfaces,
    showBorders = true,
    defaultColor = '#ffffff',
    defaultStroke = '#cccccc',
}: UseCrownReadOnlyParams) => {

    // Mapeo optimizado de superficies a colores
    const surfaceColorMap = useMemo(() => {
        const map = new Map<CrownSurfaceId, { color: string; opacity: number }>();
        surfaces.forEach((s) => {
            map.set(s.id, {
                color: s.color,
                opacity: s.opacity ?? 0.8
            });
        });

        return map;
    }, [surfaces, toothFDI]);

    // Aplicar colores al SVG
    useEffect(() => {
        if (!svgLoaded || !toothFDI) return;

        const svgObject = document.getElementById(`crown-${toothFDI}`) as HTMLObjectElement;
        if (!svgObject?.contentDocument) return;

        const svgDoc = svgObject.contentDocument;

        // Deshabilitar estilos embebidos
        const styleTags = svgDoc.querySelectorAll('style');
        styleTags.forEach(tag => tag.remove());

        // Aplicar estilos a cada superficie
        Object.values(CROWN_SURFACE_IDS).forEach((surfaceId) => {
            const group = svgDoc.getElementById(surfaceId);
            if (!group) return;

            const surfaceData = surfaceColorMap.get(surfaceId);

            if (surfaceData) {
                const { color, opacity } = surfaceData;

                // Aplicar a todos los elementos dentro del grupo
                const allElements = [group, ...Array.from(group.querySelectorAll('*'))];

                allElements.forEach((el) => {
                    const element = el as SVGElement;
                    element.setAttribute('fill', color);
                    element.setAttribute('fill-opacity', opacity.toString());
                    element.style.cssText += `fill: ${color} !important; fill-opacity: ${opacity} !important;`;
                });

                if (showBorders) {
                    group.setAttribute('stroke', color);
                    group.setAttribute('stroke-width', '1.5');
                }
            } else {
                // Sin diagnóstico
                const allElements = [group, ...Array.from(group.querySelectorAll('*'))];
                allElements.forEach((el) => {
                    (el as SVGElement).setAttribute('fill', defaultColor);
                    (el as SVGElement).setAttribute('fill-opacity', '0.1');
                });
            }

            group.style.pointerEvents = 'none';
        });

        svgDoc.documentElement.style.pointerEvents = 'none';
    }, [svgLoaded, toothFDI, surfaceColorMap, showBorders, defaultColor, defaultStroke]);

    return {
        surfaceColorMap,
        hasSurfaces: surfaces.length > 0,
    };
};
