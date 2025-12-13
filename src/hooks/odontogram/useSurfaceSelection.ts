// src/hooks/useSurfaceSelection.ts
import { useState } from "react";

export const useSurfaceSelection = () => {
  // Ahora cada diente puede tener varias superficies seleccionadas
  const [surfaceSelections, setSurfaceSelections] = useState<
    Record<string, string[]>
  >({});

  // Obtener superficies seleccionadas para un diente
  const getSurfacesForTooth = (toothId: string | null): string[] => {
    if (!toothId) return [];
    return surfaceSelections[toothId] || [];
  };

  // Establecer superficies seleccionadas para un diente
  const setSurfacesForTooth = (toothId: string | null, surfaces: string[]) => {
    if (!toothId) return;
    setSurfaceSelections((prev) => ({
      ...prev,
      [toothId]: surfaces,
    }));
  };

  // Limpiar superficies seleccionadas de un diente
  const clearSurfacesForTooth = (toothId: string | null) => {
    if (!toothId) return;
    setSurfaceSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[toothId];
      return newSelections;
    });
  };

  return {
    surfaceSelections,
    getSurfacesForTooth,
    setSurfacesForTooth,
    clearSurfacesForTooth,
  };
};