// src/services/odontogramaService.ts

import type { AreaAfectada } from "../../core/types/typeOdontograma";
import type { ApiResponse } from "../../types/api";
import api from "../api/axiosInstance";


// ============================================================================
// INTERFACES DEL BACKEND (según tu Django API)
// ============================================================================

export interface BackendSuperficie {
    id: string;
    tipo_superficie: string;
    codigo: string;
    diagnosticos: BackendDiagnostico[];
}

export interface BackendDiagnostico {
    id: string;
    diagnostico_catalogo: {
        id: string;
        codigo: string;
        nombre: string;
        categoria: string;
    };
    estado_tratamiento: 'pendiente' | 'en_proceso' | 'completado' | 'planificado';
    fecha_diagnostico: string;
    fecha_tratamiento?: string;
    descripcion?: string;
    notas?: string;
    odontologo: {
        id: string;
        nombres: string;
        apellidos: string;
    };
}

export interface BackendDiente {
    id: string;
    codigo_fdi: string;
    tipo_diente: 'permanente' | 'deciduo';
    estado: 'presente' | 'ausente' | 'erupcionando';
    superficies: BackendSuperficie[];
}

export interface BackendOdontogramaResponse {
    paciente_id: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    dientes: BackendDiente[];
    total_diagnosticos: number;
}

export interface BackendDiagnosticoCreatePayload {
    superficie_id: string;
    diagnostico_catalogo_id: string;
    odontologo_id: string;
    descripcion?: string;
    estado_tratamiento?: 'pendiente' | 'en_proceso' | 'completado' | 'planificado';
    notas?: string;
}

export interface BackendDiagnosticoResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        diagnostico: BackendDiagnostico;
    };
}

// ============================================================================
// MAPEO DE SUPERFICIES
// ============================================================================

/**
 * Mapea tipos de superficie del backend a IDs del frontend
 */
export const SURFACE_BACKEND_TO_FRONTEND: Record<string, string> = {
    'vestibular': 'vestibular',
    'lingual': 'lingual',
    'palatina': 'lingual', // En superiores puede ser palatina
    'mesial': 'mesial',
    'distal': 'distal',
    'oclusal': 'oclusal',
    'incisal': 'incisal',
    'general': 'diente_completo',
    'diente_completo': 'diente_completo',
};

/**
 * Mapea IDs del frontend a tipos de superficie del backend
 */
export const SURFACE_FRONTEND_TO_BACKEND: Record<string, string> = {
    'vestibular': 'vestibular',
    'lingual': 'lingual',
    'mesial': 'mesial',
    'distal': 'distal',
    'oclusal': 'oclusal',
    'incisal': 'incisal',
    'diente_completo': 'general',
};

// ============================================================================
// SERVICIO DE ODONTOGRAMA
// ============================================================================

export const odontogramaService = {
    /**
     * Obtiene el odontograma completo de un paciente
     * GET /api/odontogram/pacientes/{pacienteId}/odontograma/
     */
    async getOdontograma(pacienteId: string): Promise<BackendOdontogramaResponse> {
        const response = await api.get<ApiResponse<BackendOdontogramaResponse>>(
            `/api/odontogram/pacientes/${pacienteId}/odontograma/`
        );
        return response.data.data;
    },

    /**
     * Obtiene todos los diagnósticos de un paciente (opcional: filtrar por estado)
     * GET /api/odontogram/pacientes/{pacienteId}/diagnosticos/?estado={estado}
     */
    async getDiagnosticos(
        pacienteId: string,
        estado?: 'pendiente' | 'en_proceso' | 'completado' | 'planificado'
    ): Promise<BackendDiagnostico[]> {
        const params = estado ? { estado } : {};
        const response = await api.get<ApiResponse<BackendDiagnostico[]>>(
            `/api/odontogram/pacientes/${pacienteId}/diagnosticos/`,
            { params }
        );
        return response.data.data;
    },

    /**
     * Crea un nuevo diagnóstico
     * POST /api/odontogram/diagnosticos-aplicados/
     */
    async createDiagnostico(
        payload: BackendDiagnosticoCreatePayload
    ): Promise<BackendDiagnosticoResponse> {
        const response = await api.post<BackendDiagnosticoResponse>(
            '/api/odontogram/diagnosticos-aplicados/',
            payload
        );
        return response.data;
    },

    /**
     * Actualiza un diagnóstico existente
     * PATCH /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/
     */
    async updateDiagnostico(
        diagnosticoId: string,
        payload: Partial<BackendDiagnosticoCreatePayload>
    ): Promise<BackendDiagnosticoResponse> {
        const response = await api.patch<BackendDiagnosticoResponse>(
            `/api/odontogram/diagnosticos-aplicados/${diagnosticoId}/`,
            payload
        );
        return response.data;
    },

    /**
     * Elimina un diagnóstico
     * DELETE /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/eliminar/
     */
    async deleteDiagnostico(diagnosticoId: string): Promise<void> {
        await api.delete(
            `/api/odontogram/diagnosticos-aplicados/${diagnosticoId}/eliminar/`
        );
    },

    /**
     * Marca un diagnóstico como tratado
     * POST /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/marcar_tratado/
     */
    async marcarDiagnosticoTratado(diagnosticoId: string): Promise<BackendDiagnostico> {
        const response = await api.post<ApiResponse<{ diagnostico: BackendDiagnostico }>>(
            `/api/odontogram/diagnosticos-aplicados/${diagnosticoId}/marcar_tratado/`
        );
        return response.data.data.diagnostico;
    },

    /**
     * Marca un diente como ausente
     * POST /api/odontogram/dientes/{dienteId}/marcar_ausente/
     */
    async marcarDienteAusente(
        dienteId: string,
        odontologoId: string
    ): Promise<BackendDiente> {
        const response = await api.post<ApiResponse<{ diente: BackendDiente }>>(
            `/api/odontogram/dientes/${dienteId}/marcar_ausente/`,
            { odontologo_id: odontologoId }
        );
        return response.data.data.diente;
    },

    /**
     * Obtiene los dientes de un paciente
     * GET /api/odontogram/dientes/?paciente_id={pacienteId}
     */
    async getDientes(pacienteId: string): Promise<BackendDiente[]> {
        const response = await api.get<ApiResponse<BackendDiente[]>>(
            '/api/odontogram/dientes/',
            { params: { paciente_id: pacienteId } }
        );
        return response.data.data;
    },

    /**
     * Obtiene las superficies de un diente
     * GET /api/odontogram/superficies/?diente_id={dienteId}
     */
    async getSuperficies(dienteId: string): Promise<BackendSuperficie[]> {
        const response = await api.get<ApiResponse<BackendSuperficie[]>>(
            '/api/odontogram/superficies/',
            { params: { diente_id: dienteId } }
        );
        return response.data.data;
    },

    /**
     * Obtiene el historial de cambios del odontograma
     * GET /api/odontogram/historial/?paciente_id={pacienteId}
     */
    async getHistorial(pacienteId: string): Promise<any[]> {
        const response = await api.get<ApiResponse<any[]>>(
            '/api/odontogram/historial/',
            { params: { paciente_id: pacienteId } }
        );
        return response.data.data;
    },

    /**
     * Exporta un diagnóstico individual como FHIR Observation
     * GET /api/odontogram/diagnosticos/{diagnosticoId}/export-fhir/
     */
    async exportDiagnosticoFHIR(diagnosticoId: string): Promise<any> {
        const response = await api.get<ApiResponse<any>>(
            `/api/odontogram/diagnosticos/${diagnosticoId}/export-fhir/`
        );
        return response.data.data;
    },

    /**
     * Obtiene el odontograma completo como Bundle FHIR
     * GET /api/odontogram/pacientes/{pacienteId}/odontograma-fhir/
     */
    async getOdontogramaFHIR(pacienteId: string): Promise<any> {
        const response = await api.get<ApiResponse<any>>(
            `/api/odontogram/pacientes/${pacienteId}/odontograma-fhir/`
        );
        return response.data.data;
    },
};

// ============================================================================
// HELPER: Determinar áreas afectadas desde tipo de superficie
// ============================================================================

export function determineAreasFromSurface(tipoSuperficie: string): AreaAfectada[] {
    const surfaceLower = tipoSuperficie.toLowerCase();

    if (surfaceLower === 'general' || surfaceLower === 'diente_completo') {
        return ['general'];
    }

    if (['vestibular', 'lingual', 'palatina', 'mesial', 'distal', 'oclusal', 'incisal'].includes(surfaceLower)) {
        return ['corona']; // Superficies visibles son parte de la corona
    }

    if (surfaceLower.includes('raiz') || surfaceLower.includes('root')) {
        return ['raiz'];
    }

    // Default
    return ['corona'];
}

export default odontogramaService;
