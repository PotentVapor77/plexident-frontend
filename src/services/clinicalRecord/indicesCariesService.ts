import axiosInstance from "../api/axiosInstance";
import type {
    IndicesCariesData,
    LatestIndicesCariesResponse
} from "../../types/clinicalRecords/typeBackendClinicalRecord";

export const indicesCariesService = {
    getLatestByPaciente: async (pacienteId: string): Promise<LatestIndicesCariesResponse> => {
    const response = await axiosInstance.get(
        `/clinical-records/indices-caries/${pacienteId}/latest/`
    );
    
    const backendData = response.data?.data || null;

    return {
        ...backendData,
        disponible: !!backendData?.id
    };
},
    /**
     * Obtener índices asociados a un historial específico
     */
    getByHistorial: async (historialId: string): Promise<IndicesCariesData | null> => {
        try {
            const response = await axiosInstance.get(
                `/clinical-records/${historialId}/`
            );
            if (response.data.indices_caries_data) {
                return response.data.indices_caries_data;
            }

            return null;
        } catch (error) {
            console.error("Error obteniendo índices del historial:", error);
            return null;
        }
    },

    /**
     * Guardar nuevos índices y asociarlos a un historial
     */
    saveToHistorial: async (
        historialId: string,
        indicesData: Partial<IndicesCariesData>
    ): Promise<IndicesCariesData> => {
        const response = await axiosInstance.post(
            `/clinical-records/${historialId}/guardar-indices-caries/`,
            indicesData
        );
        return response.data.data;
    },

    updateInHistorial: async (
        historialId: string,
        indicesData: Partial<IndicesCariesData>
    ): Promise<IndicesCariesData> => {
        const response = await axiosInstance.patch(
            `/clinical-records/${historialId}/actualizar-indices-caries/`,
            indicesData
        );
        return response.data.data;
    },

    calculateFromOdontograma: async (pacienteId: string): Promise<LatestIndicesCariesResponse> => {
  const response = await axiosInstance.get(
    `/clinical-records/indices-caries/${pacienteId}/latest/`
  );
  return response.data;
},

};