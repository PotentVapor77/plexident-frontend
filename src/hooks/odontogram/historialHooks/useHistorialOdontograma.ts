import { useQuery } from '@tanstack/react-query';
import type { OdontogramaSnapshot, TimelineEvent } from '../../../core/types/odontogramaHistory.types';
import { mapHistorialToSnapshots, mapHistorialToTimeline } from '../../../mappers/historialMapper';
import { obtenerHistorialPaciente } from '../../../services/odontogram/odontogramaService';


// src/hooks/odontogram/historialHooks/useHistorialOdontograma.ts
interface UseHistorialOptions {
  pacienteId?: string;
  dienteId?: string;
  enabled?: boolean;
}

/**
 * Hook genérico para cargar el historial (por paciente o por diente)
 */
export function useHistorialOdontograma({
  pacienteId,
  dienteId,
  enabled = true,
}: UseHistorialOptions) {
  const isByPaciente = !!pacienteId && !dienteId;
  const isByDiente = !!dienteId;

  const queryKey = isByPaciente
    ? ['odontograma', 'historial', 'paciente', pacienteId]
    : ['odontograma', 'historial', 'diente', dienteId];

  const queryFn = async () => {
    if (isByPaciente && pacienteId) {
      return obtenerHistorialPaciente(pacienteId);
    }
    if (isByDiente && dienteId) {
      return obtenerHistorialPaciente(dienteId);
    }
    return [];
  };

  const queryResult = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && (isByPaciente || isByDiente),
  });

  const snapshots: OdontogramaSnapshot[] = queryResult.data
    ? mapHistorialToSnapshots(queryResult.data)
    : [];

  const timeline: TimelineEvent[] = queryResult.data
    ? mapHistorialToTimeline(queryResult.data)
    : [];

  return {
    ...queryResult,
    snapshots,
    timeline,
  };
}