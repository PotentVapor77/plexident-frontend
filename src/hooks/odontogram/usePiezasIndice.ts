// src/hooks/odontogram/usePiezasIndice.ts

import { useQuery } from "@tanstack/react-query";
import { PiezasIndiceService, type InformacionPiezasResponse } from "../../services/odontogram/odontogramaService";

export const usePiezasIndice = (pacienteId: string | null) => {
  const query = useQuery<InformacionPiezasResponse>({
    queryKey: ["piezas-indice", pacienteId],
    queryFn: () => {
      if (!pacienteId) {
        throw new Error("Se requiere ID de paciente");
      }
      return PiezasIndiceService.obtenerInformacionPiezas(pacienteId);
    },
    enabled: !!pacienteId,
    staleTime: 60000, // 1 minuto
  });

  return {
    informacionPiezas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || null,
  };
};

export const useVerificarDisponibilidadPiezas = (pacienteId: string | null) => {
  return useQuery({
    queryKey: ["verificar-piezas", pacienteId],
    queryFn: () => {
      if (!pacienteId) {
        throw new Error("Se requiere ID de paciente");
      }
      return PiezasIndiceService.verificarDisponibilidad(pacienteId);
    },
    enabled: !!pacienteId,
    staleTime: 30000,
  });
};
