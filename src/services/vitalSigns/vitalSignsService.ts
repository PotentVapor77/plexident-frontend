/**
 * ============================================================================
 * VITAL SIGNS SERVICE
 * ============================================================================
 */

import api from "../api/axiosInstance";
import { ENDPOINTS } from "../../config/api";
import { createApiError } from "../../types/api";
import { logger } from "../../utils/logger";
import type {
  IVitalSigns,
  IVitalSignsCreate,
  IVitalSignsListResponse,
  IVitalSignsSingleResponse,
  IVitalSignsUpdate,

} from "../../types/vitalSigns/IVitalSigns";

/**
 * Obtener lista paginada de constantes vitales
 */
export const getVitalSigns = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
}): Promise<IVitalSignsListResponse> => {
  try {
    logger.info("Obteniendo lista de constantes vitales", params);
    const { data } = await api.get<IVitalSignsListResponse>(
      ENDPOINTS.vitalSigns.base,
      { params }
    );
    logger.info("✅ Constantes vitales obtenidas exitosamente", {
      count: data.data.count || 0,
    });
    return data;
  } catch (error) {
    logger.error("Error al obtener constantes vitales", error);
    throw createApiError(error);
  }
};

/**
 * Obtener constantes vitales por ID
 */
export const getVitalSignsById = async (id: string): Promise<IVitalSigns> => {
  try {
    logger.info("Obteniendo constantes vitales por ID", { id });
    const { data } = await api.get<IVitalSignsSingleResponse>(
      ENDPOINTS.vitalSigns.byId(id)
    );
    if (!data.success || !data.data) {
      throw new Error("Constantes vitales no encontradas");
    }
    logger.info("✅ Constantes vitales obtenidas exitosamente", {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al obtener constantes vitales por ID", error);
    throw createApiError(error);
  }
};

/**
 * Obtener constantes vitales por ID de paciente
 * (NOTE: tu ENDPOINTS.vitalSigns.byPaciente usa ?paciente=...)
 */
export const getVitalSignsByPaciente = async (
  pacienteId: string
): Promise<IVitalSigns> => {
  try {
    logger.info("Obteniendo constantes vitales por paciente", { pacienteId });
    const { data } = await api.get<IVitalSignsSingleResponse>(
      ENDPOINTS.vitalSigns.byPaciente(pacienteId)
    );
    if (!data.success || !data.data) {
      throw new Error("No se encontraron constantes vitales para este paciente");
    }
    logger.info("✅ Constantes vitales del paciente obtenidas exitosamente", {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al obtener constantes vitales por paciente", error);
    throw createApiError(error);
  }
};

/**
 * Crear nuevas constantes vitales
 */
export const createVitalSigns = async (
  vitalData: IVitalSignsCreate
): Promise<IVitalSigns> => {
  try {
    logger.info("Creando constantes vitales", {
      paciente: vitalData.paciente,
    });
    const { data } = await api.post<IVitalSignsSingleResponse>(
      ENDPOINTS.vitalSigns.base,
      vitalData
    );
    if (!data.success || !data.data) {
      throw new Error("Error al crear constantes vitales");
    }
    logger.info("✅ Constantes vitales creadas exitosamente", {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al crear constantes vitales", error);
    throw createApiError(error);
  }
};

/**
 * Actualizar constantes vitales
 */
export const updateVitalSigns = async (
  id: string,
  vitalData: IVitalSignsUpdate
): Promise<IVitalSigns> => {
  try {
    logger.info("Actualizando constantes vitales", { id });
    const { data } = await api.patch<IVitalSignsSingleResponse>(
      ENDPOINTS.vitalSigns.byId(id),
      vitalData
    );
    if (!data.success || !data.data) {
      throw new Error("Error al actualizar constantes vitales");
    }
    logger.info("✅ Constantes vitales actualizadas exitosamente", {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al actualizar constantes vitales", error);
    throw createApiError(error);
  }
};

/**
 * Eliminar constantes vitales (eliminación lógica)
 */
export const deleteVitalSigns = async (
  id: string
): Promise<{ id: string }> => {
  try {
    logger.info("Eliminando constantes vitales", { id });
    const { data } = await api.delete<{ id: string }>(
      ENDPOINTS.vitalSigns.byId(id)
    );
    logger.info("✅ Constantes vitales eliminadas exitosamente", { id });
    return data;
  } catch (error) {
    logger.error("Error al eliminar constantes vitales", error);
    throw createApiError(error);
  }
};
