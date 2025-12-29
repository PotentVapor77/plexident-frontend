// src/components/odontograma/hooks/useCrownInteractions.ts
import { useEffect, useRef } from "react";

const HOVER_COLOR = "#F7D34D"; // Amarillo de hover

interface UseCrownInteractionsProps {
  svgLoaded: boolean;
  selectedSurfaces: string[];
  onSurfaceSelect: (surfaces: string[]) => void;
  selectedTooth: string | null;
  previewColorHex: string | null;
  getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
  UI_SELECTION_COLOR: string;
  DEFAULT_COLOR: string;
}

export const useCrownInteractions = ({
  svgLoaded,
  selectedSurfaces,
  onSurfaceSelect,
  selectedTooth,
  previewColorHex,
  getPermanentColorForSurface,
  UI_SELECTION_COLOR,
  DEFAULT_COLOR
}: UseCrownInteractionsProps) => {
  const selectedSurfacesRef = useRef<string[]>(selectedSurfaces);

  useEffect(() => {
    selectedSurfacesRef.current = selectedSurfaces;
  }, [selectedSurfaces]);

  // ------------------ Interacciones (hover/click) ------------------
  useEffect(() => {
    if (!svgLoaded || !selectedTooth) return;

    const svgObject = document.getElementById("odonto-svg") as HTMLObjectElement;
    if (!svgObject?.contentDocument) return;

    const svgDoc = svgObject.contentDocument;
    const surfaces = ["cara_vestibular", "cara_distal", "cara_mesial", "cara_lingual", "cara_oclusal"];
    const cleanupFns: (() => void)[] = [];

    surfaces.forEach(surfaceId => {
      const groupElement = svgDoc.getElementById(surfaceId);
      if (!groupElement) return;

      const elements = groupElement.querySelectorAll("path, rect, circle, polygon");
      elements.forEach(el => {
        const element = el as HTMLElement;
        element.style.pointerEvents = "all";
        element.style.cursor = "pointer";
        element.style.transition = "fill 0.2s ease";

        if (!element.dataset.originalFill) {
          element.dataset.originalFill = element.style.fill || window.getComputedStyle(element).fill || DEFAULT_COLOR;
        }

        const handleMouseEnter = () => {
          const permanentColor = getPermanentColorForSurface(selectedTooth, surfaceId);
          if (!selectedSurfacesRef.current.includes(surfaceId) && !permanentColor) {
            element.style.fill = HOVER_COLOR;
          }
        };

        const handleMouseLeave = () => {
          const permanentColor = getPermanentColorForSurface(selectedTooth, surfaceId);
          const isSelected = selectedSurfacesRef.current.includes(surfaceId);
          if (!isSelected && !permanentColor) {
            element.style.fill = element.dataset.originalFill || DEFAULT_COLOR;
          }
        };

        const handleClick = () => {
          let newSelection: string[];
          if (selectedSurfacesRef.current.includes(surfaceId)) {
            newSelection = selectedSurfacesRef.current.filter(s => s !== surfaceId);
          } else {
            newSelection = [...selectedSurfacesRef.current, surfaceId];
          }
          onSurfaceSelect(newSelection);
        };

        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);
        element.addEventListener("click", handleClick);

        cleanupFns.push(() => {
          element.removeEventListener("mouseenter", handleMouseEnter);
          element.removeEventListener("mouseleave", handleMouseLeave);
          element.removeEventListener("click", handleClick);
        });
      });
    });

    return () => cleanupFns.forEach(fn => fn());
  }, [svgLoaded, selectedTooth, onSurfaceSelect, getPermanentColorForSurface, DEFAULT_COLOR]);

  // ------------------ Sincronización del SVG con React ------------------
  useEffect(() => {
    if (!svgLoaded || !selectedTooth) return;

    const svgObject = document.getElementById("odonto-svg") as HTMLObjectElement;
    if (!svgObject?.contentDocument) return;

    const svgDoc = svgObject.contentDocument;
    const surfaces = ["cara_vestibular", "cara_distal", "cara_mesial", "cara_lingual", "cara_oclusal"];

    surfaces.forEach(surfaceId => {
      const groupElement = svgDoc.getElementById(surfaceId);
      if (!groupElement) return;

      const elements = groupElement.querySelectorAll("path, rect, circle, polygon");
      const permanentColor = getPermanentColorForSurface(selectedTooth, surfaceId);
      const isSelected = selectedSurfaces.includes(surfaceId);

      elements.forEach(el => {
        const element = el as HTMLElement;
        let finalColor = element.dataset.originalFill || DEFAULT_COLOR;

if (isSelected) {
  finalColor = UI_SELECTION_COLOR;
} 
else if (previewColorHex && !permanentColor) {
  finalColor = previewColorHex;
}
else if (permanentColor) {
  finalColor = permanentColor;
}

        element.style.fill = finalColor;
      });
    });
  }, [selectedSurfaces, svgLoaded, selectedTooth, previewColorHex, getPermanentColorForSurface, UI_SELECTION_COLOR, DEFAULT_COLOR]);
};