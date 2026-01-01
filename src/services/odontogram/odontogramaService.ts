// src/services/odontogramaService.ts

import type {
  CategoriaDiagnosticoBackend,
  DiagnosticoBackend,
  TipoAtributoClinicoBackend,
  OdontogramaCompletoBackend,
  DiagnosticoDentalBackend,
  CrearDiagnosticoPayload,
  DienteBackend,
  HistorialOdontogramaBackend,
} from '../../types/odontogram/typeBackendOdontograma';
import { createApiError } from '../../types/api';
import api from '../api/axiosInstance';
import type { OdontogramaData } from '../../core/types/odontograma.types';
import { mapearOdontogramaBackendToFrontend, mapearOdontogramaFrontendToBackend } from '../../mappers/odontogramaMapper';

// ============================================================================
// CONSTANTES DE ENDPOINTS
// ============================================================================

const ODONTOGRAM_ENDPOINTS = {
  // Catálogo
  categorias: '/odontogram/catalogo/categorias/con-diagnosticos/',
  diagnosticos: '/odontogram/catalogo/diagnosticos/',
  atributosClinicos: '/odontogram/catalogo/atributos-clinicos/',
  
  odontogramaCompleto: (pacienteId: string) =>
    `/odontogram/odontogramas/${pacienteId}/completo/`,

  // Paciente
  odontogramaPaciente: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/odontograma/`,
  diagnosticosPaciente: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/diagnosticos/`,
  odontogramaFHIR: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/odontograma-fhir/`,
  guardarOdontogramaCompleto: (pacienteId: string) => `/odontogram/pacientes/${pacienteId}/guardar-odontograma/`,

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
  historialPorOdontologo: (odontologoId: number | string) =>`/odontogram/historial/?odontologo_id=${odontologoId}`,

} as const;

// ============================================================================
// ODONTOGRAMA COMPLETO (USO GENERAL)
// ============================================================================
export async function obtenerOdontogramaCompletoFrontend(
  pacienteId: string,
): Promise<OdontogramaData> {
  console.log('[SERVICE] Cargando odontograma completo para', pacienteId);

  const { data } = await api.get<{
    success: boolean;
    status_code: number;
    message: string;
    data: OdontogramaCompletoBackend;
  }>(ODONTOGRAM_ENDPOINTS.odontogramaCompleto(pacienteId));

  console.log('[SERVICE] Respuesta backend /completo:', data);

  if (!data.success) {
    console.error('[SERVICE] Backend no success:', data.message);
    throw new Error(data.message || 'Error al cargar odontograma completo');
  }

  const frontendData = mapearOdontogramaBackendToFrontend(data.data);
  console.log('[SERVICE] Datos mapeados a OdontogramaData:', frontendData);

  return frontendData;
}


// ============================================================================
// TIPOS PARA GUARDADO COMPLETO
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
 * GET /api/odontogram/categorias/con-diagnosticos/
 * Obtiene todas las categorías de diagnóstico con sus diagnósticos anidados
 */
export async function obtenerCatalogoDiagnosticos(): Promise<CategoriaDiagnosticoBackend[]> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.categorias
    );
    
    return data.data || [];
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
    
    return data.data || [];
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
    
    return data.data || [];
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
    
    return data.data || [];
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// ODONTOGRAMA DEL PACIENTE
// ============================================================================

/**
 * GET /api/odontogram/pacientes/{pacienteId}/odontograma/
 * Obtiene el odontograma completo de un paciente
 */
export async function obtenerOdontogramaPaciente(
  pacienteId: string
): Promise<OdontogramaCompletoBackend> {
  try {
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.odontogramaPaciente(pacienteId)
    );
    
    return data.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * GET /api/odontogram/pacientes/{pacienteId}/diagnosticos/
 * Obtiene todos los diagnósticos dentales de un paciente
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
    
    return data.data || [];
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
    
    return data.data;
  } catch (error) {
    throw createApiError(error);
  }
}
export async function guardarOdontogramaCompleto(
  pacienteId: string,
  odontogramaData: OdontogramaData,
  odontologoId?: number,
): Promise<ResultadoGuardado> {
  // 1) Mapear el OdontogramaData completo al formato que espera el backend
  const odontogramaBackend = mapearOdontogramaFrontendToBackend(odontogramaData);

  const payload: GuardarOdontogramaPayload = {
    paciente_id: pacienteId,
    odontologo_id: odontologoId,
    odontograma_data: odontogramaBackend,
  };

  // 2) Hacer POST al endpoint de batch
  const { data } = await api.post<{
    success: boolean;
    status_code: number;
    message: string;
    data: ResultadoGuardado;
  }>(ODONTOGRAM_ENDPOINTS.guardarOdontogramaCompleto(pacienteId), payload);

  if (!data.success) {
    throw new Error(data.message || 'Error al guardar odontograma completo');
  }

  return data.data;
}

// ============================================================================
// CREAR/MODIFICAR/ELIMINAR DIAGNÓSTICOS INDIVIDUALES
// ============================================================================

export async function crearDiagnostico(
  payload: CrearDiagnosticoPayload
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.post(
      ODONTOGRAM_ENDPOINTS.diagnosticosAplicados,
      payload
    );
    
    return data.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export async function actualizarDiagnostico(
  diagnosticoId: string,
  payload: Partial<CrearDiagnosticoPayload>
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.patch(
      ODONTOGRAM_ENDPOINTS.diagnosticoAplicadoById(diagnosticoId),
      payload
    );
    
    return data.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export async function eliminarDiagnostico(diagnosticoId: string): Promise<void> {
  try {
    await api.delete(ODONTOGRAM_ENDPOINTS.eliminarDiagnostico(diagnosticoId));
  } catch (error) {
    throw createApiError(error);
  }
}

export async function marcarDiagnosticoTratado(
  diagnosticoId: string
): Promise<DiagnosticoDentalBackend> {
  try {
    const { data } = await api.post(
      ODONTOGRAM_ENDPOINTS.marcarTratado(diagnosticoId)
    );
    
    return data.data;
  } catch (error) {
    throw createApiError(error);
  }
}

// ============================================================================
// DIENTES
// ============================================================================

export async function obtenerDientes(pacienteId?: string): Promise<DienteBackend[]> {
  try {
    const params = pacienteId ? { paciente_id: pacienteId } : {};
    const { data } = await api.get(
      ODONTOGRAM_ENDPOINTS.dientes,
      { params }
    );
    
    return data.data || [];
  } catch (error) {
    throw createApiError(error);
  }
}

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


export async function obtenerHistorialPaciente(
  pacienteId: string
): Promise<HistorialOdontogramaBackend[]> {
  console.log('[SERVICE] [HISTORIAL] obtenerHistorialPaciente -> pacienteId:', pacienteId);
  try {
    const { data } = await api.get<{
      success: boolean;
      status_code: number;
      message: string;
      data: HistorialOdontogramaBackend[];
    }>(ODONTOGRAM_ENDPOINTS.historialPorPaciente(pacienteId));
    console.log(
      '[SERVICE][HISTORIAL] respuesta paciente',
      { success: data.success, status: data.status_code, registros: data.data?.length ?? 0 },
    );

    return data.data || [];
  } catch (error) {
    console.error('[SERVICE][HISTORIAL] error paciente', error);
    throw createApiError(error);
  }
}
export async function obtenerHistorialDiente(
  dienteId: string
): Promise<HistorialOdontogramaBackend[]> {
  console.log('[SERVICE][HISTORIAL] obtenerHistorialDiente → dienteId:', dienteId);
  try {
    const { data } = await api.get<{
      success: boolean;
      status_code: number;
      message: string;
      data: HistorialOdontogramaBackend[];
    }>(ODONTOGRAM_ENDPOINTS.historialPorDiente(dienteId));
console.log(
      '[SERVICE][HISTORIAL] respuesta diente',
      { success: data.success, status: data.status_code, registros: data.data?.length ?? 0 },
    );
    return data.data || [];
  } catch (error) {
    console.error('[SERVICE][HISTORIAL] error diente', error);
    throw createApiError(error);
  }
}

export async function obtenerHistorialOdontologo(
  odontologoId: number | string,
): Promise<HistorialOdontogramaBackend[]> {
  console.log('[SERVICE][HISTORIAL] obtenerHistorialOdontologo →', odontologoId);

  try {
    const { data } = await api.get<{
      success: boolean;
      status_code: number;
      message: string;
      data: HistorialOdontogramaBackend[];
    }>(ODONTOGRAM_ENDPOINTS.historialPorOdontologo(odontologoId));

    console.log('[SERVICE][HISTORIAL] respuesta odontologo', {
      success: data.success,
      status: data.status_code,
      registros: data.data?.length ?? 0,
    });

    return data.data || [];
  } catch (error) {
    console.error('[SERVICE][HISTORIAL] error odontologo', error);
    throw createApiError(error);
  }
}


export interface SurfaceDefinition {
  id_frontend: string;
  id_backend: string;
  nombre: string;
  area: 'corona' | 'raiz' | 'general';
  codigo_fhir: string | null;
}

interface SurfaceDefinitionsResponse {
  definiciones: SurfaceDefinition[];
  total: number;
}

export const fetchSurfaceDefinitions = async (): Promise<SurfaceDefinition[]> => {
  const response = await api.get<SurfaceDefinitionsResponse>(
    '/api/odontograma/definiciones-superficies/'
  );
  return response.data.definiciones;
};



