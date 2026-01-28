// src/hooks/clinicalRecord/useSectionData.ts
import { useState, useCallback } from "react";
import api from "../../services/api/axiosInstance";

interface SectionDataResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    refresh: () => Promise<void>;
}

export const useSectionData = <T>(
    section: string,
    pacienteId: string
): SectionDataResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const endpointMap: Record<string, string> = {
        antecedentes_personales: `/clinical-records/antecedentes-personales/${pacienteId}/latest/`,
        antecedentes_familiares: `/clinical-records/antecedentes-familiares/${pacienteId}/latest/`,
        constantes_vitales: `/clinical-records/constantes-vitales/${pacienteId}/latest/`,
        examen_estomatognatico: `/clinical-records/examen-estomatognatico/${pacienteId}/latest/`,
        odontograma_2d: `/clinical-records/odontograma-2d/${pacienteId}/latest/`,
    };

    const refresh = useCallback(async () => {
        if (!pacienteId) return;

        const endpoint = endpointMap[section];
        if (!endpoint) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(endpoint);

            if (response.data.success && response.data.data) {
                setData(response.data.data);
                setLastUpdated(response.data.data.fecha_creacion || new Date().toISOString());
            } else {
                throw new Error(response.data.message || "Error en la respuesta");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                `Error al cargar ${section}`
            );
        } finally {
            setLoading(false);
        }
    }, [section, pacienteId]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        refresh,
    };
};