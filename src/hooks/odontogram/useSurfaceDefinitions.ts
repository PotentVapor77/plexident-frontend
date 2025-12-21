// src/hooks/odontogram/useSurfaceDefinitions.ts

import { useQuery } from "@tanstack/react-query";
import { type SurfaceDefinition, fetchSurfaceDefinitions } from "../../services/odontogram/odontogramaService";


export const useSurfaceDefinitions = () => {
  const { data, isLoading, error } = useQuery<SurfaceDefinition[], Error>({
    queryKey: ['surface-definitions'],
    queryFn: fetchSurfaceDefinitions,
    staleTime: Infinity, // Las definiciones no cambian frecuentemente
    gcTime: 1000 * 60 * 60 * 24, // ✅ gcTime (antes cacheTime) - Cache por 24 horas
  });

  const getSurfaceName = (surfaceId: string): string => {
    const definition = data?.find((def: SurfaceDefinition) => def.id_frontend === surfaceId);
    return definition?.nombre || surfaceId;
  };

  const getSurfaceArea = (surfaceId: string): 'corona' | 'raiz' | 'general' | null => {
    const definition = data?.find((def: SurfaceDefinition) => def.id_frontend === surfaceId);
    return definition?.area || null;
  };

  return {
    definitions: data || [],
    getSurfaceName,
    getSurfaceArea,
    isLoading,
    error,
  };
};
