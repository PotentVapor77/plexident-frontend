// src/hooks/odontogram/useCPOIndices.ts (actualizado)
import { useState, useCallback, useEffect } from 'react';
import { CPOService, type CPOIndices } from '../../../services/odontogram/cpoService';



export const useCPOIndices = (pacienteId: string | null, odontogramaData?: any, categorias?: any[]) => {
    const [savedIndices, setSavedIndices] = useState<CPOIndices | null>(null);
    const [calculatedIndices, setCalculatedIndices] = useState<CPOIndices>({
        C: 0,
        P: 0,
        O: 0,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calcular índices locales cuando cambian los datos
    const calculateLocalIndices = useCallback(() => {
        if (odontogramaData && categorias && Object.keys(odontogramaData).length > 0) {
            const indices = CPOService.calculateLocalIndices(odontogramaData, categorias);
            setCalculatedIndices(indices);
            return indices;
        }
        return null;
    }, [odontogramaData, categorias]);

    // Cargar índices guardados del backend
    const fetchSavedIndices = useCallback(async () => {
        if (!pacienteId) {
            setSavedIndices(null);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const indices = await CPOService.getIndices(pacienteId);
            setSavedIndices(indices);
            return indices;
        } catch (err: any) {
            console.error('Error cargando índices CPO:', err);
            setError(err.message || 'Error al cargar índices CPO');
            setSavedIndices(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [pacienteId]);

    // Calcular automáticamente cuando cambia odontogramaData
    useEffect(() => {
        if (odontogramaData && categorias) {
            calculateLocalIndices();
        }
    }, [odontogramaData, categorias, calculateLocalIndices]);

    // Cargar automáticamente cuando cambia el paciente
    useEffect(() => {
        fetchSavedIndices();
    }, [fetchSavedIndices]);

    return {
        savedIndices,
        calculatedIndices,
        loading,
        error,
        fetchSavedIndices,
        calculateLocalIndices,
        setSavedIndices,
    };
};