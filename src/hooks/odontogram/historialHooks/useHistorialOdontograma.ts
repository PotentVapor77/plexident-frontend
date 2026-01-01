// src/hooks/odontogram/historialHooks/useHistorialOdontograma.ts
import { useQuery } from '@tanstack/react-query';
import type { OdontogramaSnapshot, TimelineEvent } from '../../../core/types/odontogramaHistory.types';
import { mapHistorialToSnapshots, mapHistorialToTimeline } from '../../../mappers/historialMapper';
import { obtenerHistorialDiente, obtenerHistorialOdontologo, obtenerHistorialPaciente } from '../../../services/odontogram/odontogramaService';

interface UseHistorialOptions {
    pacienteId?: string;
    dienteId?: string;
    odontologoId?: number | string;
    enabled?: boolean;
}

/**
 * Hook genérico para cargar el historial (por paciente o por diente)
 */
export function useHistorialOdontograma({
    pacienteId,
    dienteId,
    odontologoId,
    enabled = true,
}: UseHistorialOptions) {
    const isByPaciente = !!pacienteId && !dienteId;
    const isByDiente = !!dienteId;
    const isByOdontologo = !isByPaciente && !isByDiente && !!odontologoId;

    console.log('[HOOK][Historial] init', {
        pacienteId,
        dienteId,
        odontologoId,
        enabled,
        isByPaciente,
        isByDiente,
        isByOdontologo,
    });

    const queryKey = isByPaciente
        ? ['odontograma', 'historial', 'paciente', pacienteId]
        : isByDiente
            ? ['odontograma', 'historial', 'diente', dienteId]
            : ['odontograma', 'historial', 'odontologo', odontologoId];

    const queryFn = async () => {
        console.log('[HOOK][Historial] queryFn', { isByPaciente, isByDiente, isByOdontologo });

        if (isByPaciente && pacienteId) {
            return obtenerHistorialPaciente(pacienteId);
        }

        if (isByDiente && dienteId) {
            return obtenerHistorialDiente(dienteId);
        }

        if (isByOdontologo && odontologoId) {
            return obtenerHistorialOdontologo(odontologoId);
        }

        console.warn('[HOOK][Historial] queryFn sin parámetros válidos');
        return [];
    };

    const queryResult = useQuery({
        queryKey,
        queryFn,
        enabled: enabled && (isByPaciente || isByDiente || isByOdontologo),
    });

    const raw = queryResult.data;

    console.log('[HOOK][Historial] raw data', raw);

    const historialArray =
        Array.isArray(raw)
            ? raw
            : Array.isArray((raw as any)?.results)
                ? (raw as any).results
                : [];

    const snapshots: OdontogramaSnapshot[] = mapHistorialToSnapshots(historialArray);
    const timeline: TimelineEvent[] = mapHistorialToTimeline(historialArray);

    console.log('[HOOK][Historial] mapped', {
        rawCount: historialArray.length,
        snapshotsCount: snapshots.length,
        timelineCount: timeline.length,
    });

    return {
        ...queryResult,
        snapshots,
        timeline,
    };
}