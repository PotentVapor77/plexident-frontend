// src/hooks/odontogram/usePiezasIndice.ts

import { useQuery } from "@tanstack/react-query";
import { PiezasIndiceService, type InformacionPiezasResponse } from "../../services/odontogram/odontogramaService";

export const usePiezasIndice = (pacienteId: string | null) => {
  const query = useQuery<InformacionPiezasResponse>({
    queryKey: ["piezas-indice", pacienteId],
    queryFn: async () => {
      if (!pacienteId) {
        throw new Error("Se requiere ID de paciente");
      }
      
      const response = await PiezasIndiceService.obtenerInformacionPiezas(pacienteId);
      
      if (response && !response.piezas_mapeo && response.piezas) {
        console.warn('[usePiezasIndice] Respuesta usa "piezas" en lugar de "piezas_mapeo", normalizando...');
        return {
          ...response,
          piezas_mapeo: response.piezas
        };
      }
      
      return response;
    },
    enabled: !!pacienteId,
    staleTime: 60000, // 1 minuto
    retry: 2,
    retryDelay: 1000,
  });

  return {
    informacionPiezas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || null,
    refetch: query.refetch, 
  };
};

export const useVerificarDisponibilidadPiezas = (pacienteId: string | null) => {
  return useQuery({
    queryKey: ["verificar-piezas", pacienteId],
    queryFn: async () => {
      if (!pacienteId) {
        throw new Error("Se requiere ID de paciente");
      }
      return await PiezasIndiceService.verificarDisponibilidad(pacienteId);
    },
    enabled: !!pacienteId,
    staleTime: 30000,
    retry: 2,
  });
};
