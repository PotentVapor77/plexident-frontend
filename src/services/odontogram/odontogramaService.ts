// src/services/odontogramaService.ts

import type {
  CategoriaDiagnosticoBackend,
  DiagnosticoBackend,
  TipoAtributoClinicoBackend,
  OdontogramaCompletoBackend,
  DiagnosticoDentalBackend,
  CrearDiagnosticoPayload,
  DienteBackend,
} from '../../types/odontogram/typeBackendOdontograma';
import { createApiError } from '../../types/api';
import api from '../api/axiosInstance';
import type { OdontogramaData } from '../../core/types/typeOdontograma'; 

// ============================================================================
// CONSTANTES DE ENDPOINTS
// ============================================================================

const ODONTOGRAM_ENDPOINTS = {
  // Catálogo
  categorias: '/odontogram/categorias/',
  diagnosticos: '/odontogram/diagnosticos/',
  atributosClinicos: '/odontogram/atributos-clinicos/',

  // Paciente
  odontogramaPaciente: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/odontograma/`,
  diagnosticosPaciente: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/diagnosticos/`,
  odontogramaFHIR: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/odontograma-fhir/`,
  guardarOdontogramaCompleto: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/guardar-odontograma/`, // 🆕 NUEVO

  // Diagnósticos aplicados
  diagnosticosAplicados: '/odontogram/diagnosticos-aplicados/',
  diagnosticoAplicadoById: (id: string) => `/odontogram/diagnosticos-aplicados/${id}/`,
  marcarTratado: (id: string) => `/odontogram/diagnosticos-aplicados/${id}/marcar_tratado/`,
  eliminarDiagnostico: (id: string) => `/odontogram/diagnosticos-aplicados/${id}/eliminar/`,

  // Dientes
  dientes: '/odontogram/dientes/',
  dienteById: (id: string) => `/odontogram/dientes/${id}/`,
  marcarAusente: (id: string) => `/odontogram/dientes/${id}/marcar_ausente/`,

  // Historial
  historial: '/odontogram/historial/',
  historialPorDiente: (dienteId: string) => `/odontogram/historial/?diente_id=${dienteId}`,
  historialPorPaciente: (pacienteId: string) => `/odontogram/historial/?paciente_id=${pacienteId}`,
} as const;

// ============================================================================
// 🆕 TIPOS PARA GUARDADO COMPLETO
// ============================================================================

export interface GuardarOdontogramaPayload {
  paciente_id: string;
  odontologo_id?: number;
  odontograma_data: Record<string, Record<string, any[]>>;
}

export interface ResultadoGuardado {
  paciente_id: string;
  dientes_procesados: string[];
  diagnosticos_guardados: number;
  errores: string[];
}

// ============================================================================
// CATÁLOGO (Solo lectura)
// ============================================================================

/**
 * GET /api/odontogram/categorias/
 * Obtiene todas las categorías de diagnóstico con sus diagnósticos anidados
 */
export async function obtenerCatalogoDiagnosticos(): Promise<CategoriaDiagnosticoBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.categorias
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/diagnosticos/
 * Obtiene todos los diagnósticos del catálogo (flat, sin agrupar)
 */
export async function obtenerDiagnosticos(): Promise<DiagnosticoBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.diagnosticos
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/diagnosticos/?categoria_id={id}
 * Obtiene diagnósticos filtrados por categoría
 */
export async function obtenerDiagnosticosPorCategoria(
  categoriaId: number
): Promise<DiagnosticoBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.diagnosticos,
      { params: { categoria_id: categoriaId } }
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/atributos-clinicos/
 * Obtiene tipos de atributos clínicos con sus opciones
 */
export async function obtenerAtributosClinicos(): Promise<TipoAtributoClinicoBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.atributosClinicos
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// ODONTOGRAMA DEL PACIENTE
// ============================================================================

/**
 * GET /api/odontogram/pacientes/{pacienteId}/odontograma/
 * Obtiene el odontograma completo de un paciente con dientes, superficies y diagnósticos
 */
export async function obtenerOdontogramaPaciente(
  pacienteId: string
): Promise<OdontogramaCompletoBackend> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.odontogramaPaciente(pacienteId)
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/pacientes/{pacienteId}/diagnosticos/
 * Obtiene todos los diagnósticos dentales de un paciente
 * @param pacienteId - UUID del paciente
 * @param estado - Filtro opcional por estado_tratamiento: 'diagnosticado' | 'en_tratamiento' | 'tratado' | 'cancelado'
 */
export async function obtenerDiagnosticosPaciente(
  pacienteId: string,
  estado?: 'diagnosticado' | 'en_tratamiento' | 'tratado' | 'cancelado'
): Promise<DiagnosticoDentalBackend[]> {
  try {
    const params = estado ? { estado } : {};
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.diagnosticosPaciente(pacienteId),
      { params }
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/pacientes/{pacienteId}/odontograma-fhir/
 * Obtiene el odontograma como Bundle FHIR
 */
export async function obtenerOdontogramaFHIR(
  pacienteId: string
): Promise<any> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.odontogramaFHIR(pacienteId)
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// 🆕 GUARDAR ODONTOGRAMA COMPLETO
// ============================================================================

/**
 * POST /api/odontogram/pacientes/{pacienteId}/guardar-odontograma/
 * Guarda el odontograma completo de un paciente en una sola transacción atómica
 * 
 * @param pacienteId - UUID del paciente
 * @param odontogramaData - Datos del odontograma en formato frontend (OdontogramaData)
 * @param odontologoId - ID del odontólogo (opcional, usa el usuario actual por defecto)
 * @returns Resultado del guardado con conteo de éxitos y errores
 * 
 * @example
 * const resultado = await guardarOdontogramaCompleto(
 *   "550e8400-e29b-41d4-a716-446655440000",
 *   {
 *     "11": {
 *       "cara_vestibular": [
 *         {
 *           procedimientoId: "caries_icdas_3",
 *           colorHex: "#ef4444",
 *           descripcion: "Caries profunda",
 *           secondaryOptions: { material: "resina" }
 *         }
 *       ]
 *     }
 *   }
 * );
 * 
 * console.log(`Guardados ${resultado.diagnosticos_guardados} diagnósticos`);
 */
export async function guardarOdontogramaCompleto(
  pacienteId: string,
  odontogramaData: OdontogramaData,
  odontologoId?: number
): Promise<ResultadoGuardado> {
  try {
    // Importar el mapper dinámicamente para evitar dependencias circulares
    const { mapearOdontogramaFrontendToBackend } = await import('../../mappers/odontogramaMapper');
    
    // Transformar datos del frontend al formato del backend
    const backendData = mapearOdontogramaFrontendToBackend(odontogramaData);
    
    // Construir payload
    const payload: GuardarOdontogramaPayload = {
      paciente_id: pacienteId,
      odontograma_data: backendData,
    };
    
    if (odontologoId) {
      payload.odontologo_id = odontologoId;
    }
    
    // Enviar request al backend
    const { data } = await api.post<ResultadoGuardado>(
      ODONTOGRAM_ENDPOINTS.guardarOdontogramaCompleto(pacienteId),
      payload
    );
    
    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
    console.log('Odontograma guardado:', {
        paciente: data.paciente_id,
        dientes: data.dientes_procesados.length,
        diagnosticos: data.diagnosticos_guardados,
        errores: data.errores.length,
    });
    
    if (data.errores.length > 0) {
        console.warn('Errores al guardar:', data.errores);
    }
    }
    
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// CREAR/MODIFICAR/ELIMINAR DIAGNÓSTICOS INDIVIDUALES
// ============================================================================

/**
 * POST /api/odontogram/diagnosticos-aplicados/
 * Crea un nuevo diagnóstico dental (individual)
 */
export async function crearDiagnostico(
  payload: CrearDiagnosticoPayload
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.post(
      ODONTOGRAM_ENDPOINTS.diagnosticosAplicados,
      payload
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * PATCH /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/
 * Actualiza un diagnóstico existente
 */
export async function actualizarDiagnostico(
  diagnosticoId: string,
  payload: Partial<CrearDiagnosticoPayload>
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.patch(
      ODONTOGRAM_ENDPOINTS.diagnosticoAplicadoById(diagnosticoId),
      payload
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * DELETE /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/eliminar/
 * Elimina (soft delete) un diagnóstico
 */
export async function eliminarDiagnostico(diagnosticoId: string): Promise<void> {
  try {
    await api.delete(ODONTOGRAM_ENDPOINTS.eliminarDiagnostico(diagnosticoId));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * POST /api/odontogram/diagnosticos-aplicados/{diagnosticoId}/marcar_tratado/
 * Marca un diagnóstico como tratado
 */
export async function marcarDiagnosticoTratado(
  diagnosticoId: string
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.post(
      ODONTOGRAM_ENDPOINTS.marcarTratado(diagnosticoId)
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// DIENTES
// ============================================================================

/**
 * GET /api/odontogram/dientes/
 * Obtiene todos los dientes (con filtro opcional por paciente_id)
 */
export async function obtenerDientes(pacienteId?: string): Promise<DienteBackend[]> {
  try {
    const params = pacienteId ? { paciente_id: pacienteId } : {};
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.dientes,
      { params }
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * POST /api/odontogram/dientes/{dienteId}/marcar_ausente/
 * Marca un diente como ausente
 */
export async function marcarDienteAusente(
  dienteId: string,
  razonAusencia: 'caries' | 'otra_causa' | 'sin_erupcionar' | 'exodoncia_planificada'
): Promise<void> {
  try {
    await api.post(ODONTOGRAM_ENDPOINTS.marcarAusente(dienteId), {
      razon_ausencia: razonAusencia,
    });
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// HISTORIAL
// ============================================================================

export interface HistorialOdontogramaBackend {
  id: string;
  diente: string;
  tipo_cambio: string;
  descripcion: string;
  odontologo: string;
  odontologo_nombre?: string;
  fecha: string;
  datos_anteriores: Record<string, any>;
  datos_nuevos: Record<string, any>;
}

/**
 * GET /api/odontogram/historial/?diente_id={id}
 * Obtiene historial de cambios de un diente
 */
export async function obtenerHistorialDiente(
  dienteId: string
): Promise<HistorialOdontogramaBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.historialPorDiente(dienteId)
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/historial/?paciente_id={id}
 * Obtiene historial completo de un paciente
 */
export async function obtenerHistorialPaciente(
  pacienteId: string
): Promise<HistorialOdontogramaBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.historialPorPaciente(pacienteId)
    );
    return data;
  } catch (error) {
    throw createApiError(error);
  }
}
