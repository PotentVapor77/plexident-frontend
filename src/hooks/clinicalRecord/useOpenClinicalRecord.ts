// src/hooks/clinicalRecord/useOpenClinicalRecord.ts
// Hook para cambiar estado de BORRADOR → ABIERTO

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/api/axiosInstance";
import { clinicalRecordKeys } from "./useClinicalRecords";

const BASE_URL = "clinical-records";

/**
 * Llama a POST /api/clinical-records/{id}/abrir/
 * Transiciona el historial de BORRADOR a ABIERTO.
 */
const abrirHistorial = async (id: string) => {
  const response = await axiosInstance.post(`${BASE_URL}/${id}/abrir/`);
  return response.data;
};

export function useOpenClinicalRecord(id: string, pacienteId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => abrirHistorial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.lists() });
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: clinicalRecordKeys.byPaciente(pacienteId),
        });
      }
    },
  });
}