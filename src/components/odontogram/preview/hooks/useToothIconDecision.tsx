// src/components/odontogram/preview/hooks/useToothIconDecision.tsx
import  { useMemo } from 'react';
import { getDominantDiagnosticIcon } from '../../../../core/constants/diagnosticIcons';
import type { Diagnostico } from '../ToothStatusDisplay';

export interface ToothIconDecision {
    mainIconKey: string | null;
    iconCount: number;
    tooltip: string;
    colorGlobal: string;
}

const ordenarDiagnosticos = (diags: Diagnostico[]) =>
  [...diags].sort((a, b) => {
    const PRIORIDADES: Record<string, number> = { 
      ALTA: 5, 
      ESTRUCTURAL: 4, 
      MEDIA: 3, 
      BAJA: 2, 
      INFORMATIVA: 1 
    };
    // De mayor a menor prioridad
    return PRIORIDADES[b.prioridadKey] - PRIORIDADES[a.prioridadKey];
  });

const deduplicarDiagnosticos = (diags: Diagnostico[]) => {
    const map = new Map<string, Diagnostico>();
    for (const d of diags) if (!map.has(d.id)) map.set(d.id, d);
    return Array.from(map.values());
};

export const useToothIconDecision = (
    diagsFiltrados: Diagnostico[],
    esFiltroPorSuperficie: boolean
): ToothIconDecision => {
    return useMemo(() => {
        if (diagsFiltrados.length === 0) {
            return { mainIconKey: 'diente_sano', iconCount: 0, tooltip: 'Diente sano', colorGlobal: '#10B981' };
        }

        const diagsUnicos = deduplicarDiagnosticos(diagsFiltrados);
        const masPrioritario = ordenarDiagnosticos(diagsUnicos)[0];
        const procId =
            masPrioritario.key ||
            masPrioritario.procedimientoId ||
            'diente_sano';

        const iconData = getDominantDiagnosticIcon(masPrioritario.procedimientoId ? [masPrioritario.procedimientoId] : []);
        console.log('ICON DEBUG', diagsUnicos.map(d => ({
            id: d.id,
            key: d.key,
            procedimientoId: d.procedimientoId,
            siglas: d.siglas,
            nombre: d.nombre,
        })), 'procId:', procId);
        return {
            mainIconKey: iconData?.key || 'diente_sano',
            iconCount: diagsUnicos.length,
            tooltip: diagsUnicos.map(d => `${d.siglas}: ${d.nombre}`).join(', '),
            colorGlobal: iconData?.color || '#10B981',
        };
    }, [diagsFiltrados]);

};
