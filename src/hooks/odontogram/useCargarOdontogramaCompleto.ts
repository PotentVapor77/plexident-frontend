// src/components/hooks/useCargarOdontogramaCompleto.ts
import { useCallback, useState } from 'react';
import type { OdontogramaData } from '../../core/types/typeOdontograma';
import { obtenerOdontogramaCompletoFrontend } from '../../services/odontogram/odontogramaService';

export function useCargarOdontogramaCompleto() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarOdontograma = useCallback(
        async (pacienteId: string): Promise<OdontogramaData | null> => {
            if (!pacienteId) return null;

            console.log('[HOOK] cargarOdontograma → start', pacienteId);
            setLoading(true);
            setError(null);

            try {
                const data = await obtenerOdontogramaCompletoFrontend(pacienteId);
                console.log('[HOOK] cargarOdontograma → data recibida', data);
                return data;
            } catch (e: any) {
                console.error('[HOOK] cargarOdontograma → error', e);
                setError(e?.message ?? 'Error desconocido');
                return null;
            } finally {
                setLoading(false);
                console.log('[HOOK] cargarOdontograma → end');
            }
        },
        [],
    );

    return { cargarOdontograma, loading, error };
}