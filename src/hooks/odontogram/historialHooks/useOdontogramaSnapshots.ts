// src/hooks/odontogram/historialHooks/useOdontogramaSnapshots.ts

import { useState, useMemo, useEffect } from 'react';
import { useHistorialOdontograma } from './useHistorialOdontograma';
import type { OdontogramaSnapshot, TimelineEvent } from '../../../core/types/odontogramaHistory.types';

interface UseOdontogramaSnapshotsOptions {
    pacienteId?: string;
    dienteId?: string;
    odontologoId?: number | string;
    enabled?: boolean;
}

/**
 * Orquesta:
 * - carga de historial (por paciente)
 * - selección de snapshot activo
 * - selección de snapshot de comparación
 * - timeline derivado
 */
export function useOdontogramaSnapshots(options: UseOdontogramaSnapshotsOptions) {
    const { pacienteId, dienteId, odontologoId, enabled = true } = options;

    console.log('[HOOK][Snapshots] init', { pacienteId, dienteId, odontologoId, enabled });

    const {
        snapshots,
        timeline,
        isLoading,
        error,
    } = useHistorialOdontograma({
        pacienteId,
        dienteId,
        odontologoId,
        enabled,
    });

    const orderedSnapshots: OdontogramaSnapshot[] = useMemo(() => {
        const ordered = snapshots ? [...snapshots].sort(
            (a, b) => a.fecha.getTime() - b.fecha.getTime(),
        ) : [];
        console.log('[HOOK][Snapshots] orderedSnapshots', { count: ordered.length });
        return ordered;
    }, [snapshots]);

    const orderedTimeline: TimelineEvent[] = useMemo(() => {
        const ordered = timeline ? [...timeline].sort(
            (a, b) => a.fecha.getTime() - b.fecha.getTime(),
        ) : [];
        console.log('[HOOK][Snapshots] orderedTimeline', { count: ordered.length });
        return ordered;
    }, [timeline]);

    // Estado para snapshot seleccionado y de comparación
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null,);
    const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null,);

    // Cuando cambie la lista de snapshots (nuevo paciente, refetch, etc.),
    // inicializar selección
    useEffect(() => {
        if (!orderedSnapshots.length) {
            console.log('[HOOK][Snapshots] no snapshots → reset selection');
            setSelectedSnapshotId(null);
            setCompareSnapshotId(null);
            return;
        }

        // Por defecto: último snapshot como seleccionado y penúltimo como comparación
        const last = orderedSnapshots[orderedSnapshots.length - 1];
        const prev =
            orderedSnapshots.length > 1
                ? orderedSnapshots[orderedSnapshots.length - 2]
                : last;

        setSelectedSnapshotId((current) => current ?? last.id);
        setCompareSnapshotId((current) => current ?? prev.id);
        console.log('[HOOK][Snapshots] init selection', {
            lastId: last.id,
            prevId: prev.id,
        });
    }, [orderedSnapshots]);

    const selectedSnapshot = useMemo(
        () => orderedSnapshots.find((s) => s.id === selectedSnapshotId) ?? null,
        [orderedSnapshots, selectedSnapshotId],
    );

    const compareSnapshot = useMemo(
        () =>
            orderedSnapshots.find((s) => s.id === compareSnapshotId) ??
            selectedSnapshot,
        [orderedSnapshots, compareSnapshotId, selectedSnapshot],
    );

    // Helpers para cambiar selección desde la UI
    const selectSnapshot = (id: string) => {
        console.log('[HOOK][Snapshots] selectSnapshot', { id });
        setSelectedSnapshotId(id);
        // Si la comparación no existe aún, la alineamos con el seleccionado
        setCompareSnapshotId((current) => current ?? id);
    };

    const selectCompareSnapshot = (id: string) => {
        console.log('[HOOK][Snapshots] selectCompareSnapshot', { id });
        setCompareSnapshotId(id);
    };

    return {
        // datos crudos
        snapshots: orderedSnapshots,
        timeline: orderedTimeline,

        // selección
        selectedSnapshot,
        compareSnapshot,
        selectedSnapshotId,
        compareSnapshotId,

        // helpers
        selectSnapshot,
        selectCompareSnapshot,

        // estados de carga
        isLoading,
        error,
    };
}
