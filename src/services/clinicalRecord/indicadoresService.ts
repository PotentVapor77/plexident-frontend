// src/services/clinicalRecord/indicadoresService.ts
import axiosInstance from "../api/axiosInstance";
import type { IndicadoresSaludBucalData } from "../../types/clinicalRecords/typeBackendClinicalRecord";

export const indicadoresSaludBucalService = {
    /**
     * Obtiene los últimos indicadores de salud bucal de un paciente
     */
    async getLatestByPaciente(pacienteId: string): Promise<IndicadoresSaludBucalData | null> {
        try {
            const response = await axiosInstance.get<IndicadoresSaludBucalData>(
                `/clinical-records/indicadores-salud-bucal/${pacienteId}/latest/`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Recarga indicadores para prellenar formulario
     */
    async recargarIndicadores(pacienteId: string): Promise<IndicadoresSaludBucalData | null> {
        try {
            const response = await axiosInstance.get<IndicadoresSaludBucalData>(
                `/clinical-records/indicadores-salud-bucal/${pacienteId}/recargar/`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Obtiene indicadores por historial clínico
     */
    async getByHistorial(historialId: string): Promise<IndicadoresSaludBucalData | null> {
        try {
            const response = await axiosInstance.get<IndicadoresSaludBucalData>(
                `/clinical-records/${historialId}/indicadores-salud-bucal/`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async getByHistorialId(historialId: string): Promise<IndicadoresSaludBucalData | null> {
        try {
            const response = await axiosInstance.get<IndicadoresSaludBucalData>(
                `/clinical-records/indicadores-salud-bucal/historial/${historialId}/`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
};