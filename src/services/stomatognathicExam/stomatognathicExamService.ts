// src/services/stomatognathicExam/stomatognathicExamService.ts

import api from "../api/axiosInstance";
import { ENDPOINTS } from "../../config/api";
import { createApiError } from "../../types/api";
import { logger } from "../../utils/logger";
import type {
  IStomatognathicExam,
  IStomatognathicExamCreate,
  IStomatognathicExamListResponse,
  IStomatognathicExamSingleResponse,
  IStomatognathicExamUpdate,
} from "../../types/stomatognathicExam/IStomatognathicExam";

export const getStomatognathicExams = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  paciente?: string;
}): Promise<IStomatognathicExamListResponse> => {
  try {
    logger.info("Obteniendo lista de exámenes estomatognáticos", params);
    const { data } = await api.get<IStomatognathicExamListResponse>(
      ENDPOINTS.stomatognathicExam.base,
      { params }
    );
    logger.info("✅ Exámenes estomatognáticos obtenidos exitosamente", {
      count: data.data.count || 0,
    });
    return data;
  } catch (error) {
    logger.error("Error al obtener exámenes estomatognáticos", error);
    throw createApiError(error);
  }
};

export const getStomatognathicExamById = async (id: string): Promise<IStomatognathicExam> => {
  try {
    logger.info("Obteniendo examen estomatognático por ID", { id });
    const { data } = await api.get<IStomatognathicExamSingleResponse>(
      ENDPOINTS.stomatognathicExam.byId(id)
    );
    if (!data.success || !data.data) {
      throw new Error("Examen estomatognático no encontrado");
    }
    logger.info("✅ Examen estomatognático obtenido exitosamente", {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al obtener examen estomatognático por ID", error);
    throw createApiError(error);
  }
};

export const getStomatognathicExamByPaciente = async (
  pacienteId: string
): Promise<IStomatognathicExam> => {
  try {
    logger.info("Obteniendo examen estomatognático por paciente", { pacienteId });
    const { data } = await api.get<IStomatognathicExamSingleResponse>(
      ENDPOINTS.stomatognathicExam.byPaciente(pacienteId)
    );
    if (!data.success || !data.data) {
      throw new Error("No se encontró examen estomatognático para este paciente");
    }
    logger.info("✅ Examen estomatognático del paciente obtenido exitosamente", {
      paciente: data.data.paciente,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al obtener examen estomatognático por paciente", error);
    throw createApiError(error);
  }
};

export const createStomatognathicExam = async (
  examData: IStomatognathicExamCreate
): Promise<IStomatognathicExam> => {
  try {
    logger.info("Creando examen estomatognático", {
      paciente: examData.paciente,
    });
    const { data } = await api.post<IStomatognathicExamSingleResponse>(
      ENDPOINTS.stomatognathicExam.base,
      examData
    );
    if (!data.success || !data.data) {
      throw new Error("Error al crear examen estomatognático");
    }
    logger.info("✅ Examen estomatognático creado exitosamente", {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al crear examen estomatognático", error);
    throw createApiError(error);
  }
};

export const updateStomatognathicExam = async (
  id: string,
  examData: IStomatognathicExamUpdate
): Promise<IStomatognathicExam> => {
  try {
    logger.info("Actualizando examen estomatognático", { id });
    const { data } = await api.patch<IStomatognathicExamSingleResponse>(
      ENDPOINTS.stomatognathicExam.byId(id),
      examData
    );
    if (!data.success || !data.data) {
      throw new Error("Error al actualizar examen estomatognático");
    }
    logger.info("✅ Examen estomatognático actualizado exitosamente", {
      id: data.data.id,
    });
    return data.data;
  } catch (error) {
    logger.error("Error al actualizar examen estomatognático", error);
    throw createApiError(error);
  }
};

export const deleteStomatognathicExam = async (
  id: string
): Promise<{ id: string }> => {
  try {
    logger.info("Eliminando examen estomatognático", { id });
    const { data } = await api.delete<{ id: string }>(
      ENDPOINTS.stomatognathicExam.byId(id)
    );
    logger.info("✅ Examen estomatognático eliminado exitosamente", { id });
    return data;
  } catch (error) {
    logger.error("Error al eliminar examen estomatognático", error);
    throw createApiError(error);
  }
};
