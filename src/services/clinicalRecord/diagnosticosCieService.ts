import type {
    ApiListWrapper,
    DiagnosticoCIEIndividualResponse,
    DiagnosticoCIEUpdatePayload,
    DiagnosticosCIEResponse,
    SincronizarDiagnosticosPayload,
    SincronizarDiagnosticosResponse,
} from "../../types/clinicalRecords/typeBackendClinicalRecord";
import axiosInstance from "../api/axiosInstance";

export const diagnosticosCieService = {
    /**
     * Obtener diagnósticos CIE disponibles para un paciente
     */
    getAvailable: async (pacienteId: string, tipocarga?: "nuevos" | "todos" | null): Promise<DiagnosticosCIEResponse> => {
        console.log('[diagnosticosCieService] Params enviados:', { paciente_id: pacienteId, tipo_carga: tipocarga });

        const params: Record<string, any> = {
            pacienteid: pacienteId,
            tipocarga: tipocarga || "nuevos"
        };

        try {
            // Cambiar el tipo de respuesta para esperar el wrapper
            const response = await axiosInstance.get<ApiListWrapper<DiagnosticosCIEResponse>>('/clinical-records/diagnosticos-cie/', {
                params
            });

            console.log('[diagnosticosCieService] Respuesta recibida:', {
                success: response.data.success,
                status_code: response.data.status_code,
                message: response.data.message,
                data: response.data.data
            });

            // Acceder a la data dentro del wrapper
            const diagnosticosData = response.data.data;

            if (!diagnosticosData || !Array.isArray(diagnosticosData.diagnosticos)) {
                console.error('[diagnosticosCieService] Estructura inválida en data:', diagnosticosData);
                throw new Error('Estructura de respuesta inválida del servidor');
            }

            return diagnosticosData;
        } catch (error) {
            console.error('[diagnosticosCieService] Error en getAvailable:', error);
            throw error;
        }
    },

    /**
     * Obtener diagnósticos CIE por historial clínico
     */
    getByRecord: async (historialId: string): Promise<DiagnosticosCIEResponse> => {
  console.log('[diagnosticosCieService] Obteniendo diagnósticos para historial:', historialId);

  try {
    const response = await axiosInstance.get<ApiListWrapper<DiagnosticosCIEResponse>>(
      `/clinical-records/${historialId}/obtener-diagnosticos-cie/`
    );

    console.log('[diagnosticosCieService] Respuesta del historial:', {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    });

    // Retornar la data directamente
    return response.data.data;
  } catch (error: any) {
    console.log('[diagnosticosCieService] Error obteniendo diagnósticos del historial:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Si es 404, lanzar error para que el hook lo maneje
    if (error.response?.status === 404) {
      throw error; // Dejar que el hook maneje el 404
    }
    
    // Para otros errores, también relanzar
    throw error;
  }
},

    /**
     * Cargar diagnósticos CIE a un historial (reemplaza todos)
     */
    loadToRecord: async (
        historialId: string,
        payload: {
            tipocarga: "nuevos" | "todos";
            diagnosticos: Array<{ diagnostico_dental_id: string; tipo_cie?: "PRE" | "DEF" }>;
        }
    ): Promise<any> => {
        console.log('[diagnosticosCieService] Cargando diagnósticos al historial:', {
            historialId,
            tipocarga: payload.tipocarga,
            cantidadDiagnosticos: payload.diagnosticos.length
        });

        const response = await axiosInstance.post<ApiListWrapper<any>>(
            `/clinical-records/${historialId}/cargar-diagnosticos-cie/`,
            payload
        );

        console.log('[diagnosticosCieService] Carga completada:', {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        });

        return response.data.data;
    },

    /**
     * Eliminar todos los diagnósticos CIE de un historial
     */
    deleteAllFromRecord: async (
        historialId: string
    ): Promise<{ success: boolean; message: string; eliminados: number }> => {
        console.log('[diagnosticosCieService] Eliminando todos los diagnósticos del historial:', historialId);

        const response = await axiosInstance.delete<ApiListWrapper<{ success: boolean; message: string; eliminados: number }>>(
            `/clinical-records/${historialId}/eliminar-diagnosticos-cie/`
        );

        console.log('[diagnosticosCieService] Eliminación completada:', response.data.data);

        return response.data.data;
    },

    /**
     * Eliminar diagnóstico CIE individual
     */
    deleteIndividual: async (
        historialId: string,
        diagnosticoId: string
    ): Promise<DiagnosticoCIEIndividualResponse> => {
        console.log('[diagnosticosCieService] Eliminando diagnóstico individual:', {
            historialId,
            diagnosticoId
        });

        const response = await axiosInstance.delete(
            `/clinical-records/${historialId}/diagnosticos-cie/${diagnosticoId}/`
        );

        console.log('[diagnosticosCieService] Eliminación individual completada:', response.data);

        return response.data;
    },

    /**
     * Actualizar tipo CIE (PRE/DEF) de diagnóstico individual
     */
    updateType: async (
        historialId: string,
        diagnosticoId: string,
        payload: DiagnosticoCIEUpdatePayload
    ): Promise<DiagnosticoCIEIndividualResponse> => {
        console.log('[diagnosticosCieService] Actualizando tipo CIE:', {
            historialId,
            diagnosticoId,
            nuevoTipo: payload.tipo_cie
        });

        const response = await axiosInstance.patch(
            `/clinical-records/${historialId}/diagnosticos-cie/${diagnosticoId}/actualizar-tipo/`,
            payload
        );

        console.log('[diagnosticosCieService] Actualización completada:', response.data);

        return response.data;
    },

    /**
     * Sincronizar diagnósticos CIE (mantener solo los especificados)
     */
    syncInRecord: async (
        historialId: string,
        payload: SincronizarDiagnosticosPayload
    ): Promise<SincronizarDiagnosticosResponse> => {
        console.log('[diagnosticosCieService] Sincronizando diagnósticos:', {
            historialId,
            tipoCarga: payload.tipo_carga,
            cantidadDiagnosticos: payload.diagnosticos_finales.length
        });

        const response = await axiosInstance.post(
        `/clinical-records/${historialId}/sincronizar-diagnosticos-cie/`, 
        payload
    );

        console.log('[diagnosticosCieService] Sincronización completada:', {
            success: response.data.success,
            total: response.data.total_diagnosticos
        });

        return response.data;
    },
    saveToHistorial: async (
        historialId: string,
        payload: {
            diagnosticos: Array<{
                diagnostico_dental_id: string;
                tipo_cie: "PRE" | "DEF";
            }>;
            tipo_carga: "nuevos" | "todos";
        }
    ): Promise<SincronizarDiagnosticosResponse> => {
        console.log('[diagnosticosCieService] Guardando diagnósticos en historial:', {
            historialId,
            cantidadDiagnosticos: payload.diagnosticos.length,
            tipoCarga: payload.tipo_carga
        });

        try {
            const response = await axiosInstance.post<ApiListWrapper<SincronizarDiagnosticosResponse>>(
                `/clinical-records/${historialId}/sincronizar-diagnosticos-cie/`,
                payload
            );

            console.log('[diagnosticosCieService] Diagnósticos guardados exitosamente:', {
                success: response.data.success,
                total: response.data.data.total_diagnosticos,
                estadisticas: response.data.data.estadisticas
            });

            return response.data.data;
        } catch (error: any) {
            console.error('[diagnosticosCieService] Error al guardar diagnósticos:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    },

};

// Versión simplificada para evitar ciclos infinitos
export const diagnosticosCieServiceOptimized = {
    /**
     * Obtener diagnósticos CIE sin guardar en el estado del formulario
     */
    getAvailableOptimized: async (
        pacienteId: string,
        tipocarga?: "nuevos" | "todos" | null,
        callback?: (data: DiagnosticosCIEResponse) => void
    ): Promise<DiagnosticosCIEResponse> => {
        console.log('[diagnosticosCieServiceOptimized] Obteniendo diagnósticos para paciente:', pacienteId);

        const params: Record<string, any> = {
            paciente_id: pacienteId,
            tipo_carga: tipocarga || "nuevos"
        };

        try {
            const response = await axiosInstance.get<any>('/clinical-records/diagnosticos-cie/', {
                params
            });

            if (response.data.success && callback) {
                // Llamar al callback de manera asíncrona para evitar ciclos
                setTimeout(() => {
                    callback(response.data);
                }, 0);
            }

            return response.data as DiagnosticosCIEResponse;
        } catch (error) {
            console.error('[diagnosticosCieServiceOptimized] Error:', error);
            throw error;
        }
    },

    /**
     * Verificar si hay diagnósticos disponibles sin procesarlos completamente
     */
    checkAvailable: async (
        pacienteId: string,
        tipocarga?: "nuevos" | "todos" | null
    ): Promise<{ disponible: boolean; cantidad: number }> => {
        try {
            const data = await diagnosticosCieService.getAvailable(pacienteId, tipocarga);
            return {
                disponible: data.disponible || false,
                cantidad: data.total_diagnosticos || 0
            };
        } catch (error) {
            console.error('[diagnosticosCieServiceOptimized] Error en checkAvailable:', error);
            return { disponible: false, cantidad: 0 };
        }
    }
};

export default diagnosticosCieService;