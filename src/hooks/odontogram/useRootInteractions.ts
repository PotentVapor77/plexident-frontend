// src/components/odontograma/hooks/useRootInteractions.ts
import { useEffect, useRef } from "react";

const HOVER_COLOR_ROOT = "#facc15";

interface UseRootInteractionsProps {
  rootSvgLoaded: boolean;
  selectedTooth: string | null;
  rootInfo: { type: string; roots: string[] };
  selectedSurfaces: string[];
  onSurfaceSelect: (surfaces: string[]) => void;
  previewColorHex: string | null;
  getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
  UI_SELECTION_COLOR: string;
  DEFAULT_COLOR: string;
}

export const useRootInteractions = ({
  rootSvgLoaded,
  selectedTooth,
  rootInfo,
  selectedSurfaces,
  onSurfaceSelect,
  previewColorHex,
  getPermanentColorForSurface,
  UI_SELECTION_COLOR,
  DEFAULT_COLOR
}: UseRootInteractionsProps) => {
  const selectedSurfacesRef = useRef<string[]>(selectedSurfaces);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    selectedSurfacesRef.current = selectedSurfaces;
  }, [selectedSurfaces]);

  // ------------------ Interacciones ------------------
  useEffect(() => {
    cleanupFnsRef.current.forEach(fn => fn());
    cleanupFnsRef.current = [];

    if (!rootSvgLoaded || !selectedTooth) return;

    const setup = () => {
      const rootSvg = document.getElementById("raiz-svg") as HTMLObjectElement;
      if (!rootSvg?.contentDocument) {
        requestAnimationFrame(setup);
        return;
      }

      const rootDoc = rootSvg.contentDocument;

      rootInfo.roots.forEach(rootId => {
        const surfaceId = `raiz:${rootId}`;
        const groupElement = rootDoc.getElementById(rootId);
        if (!groupElement) return;

        const elements = groupElement.querySelectorAll("path, rect, circle, polygon");
        elements.forEach(el => {
          const element = el as HTMLElement;
          element.style.pointerEvents = "all";
          element.style.cursor = "pointer";
          element.style.transition = "fill 0.3s ease";

          if (!element.dataset.originalFill) {
            element.dataset.originalFill = window.getComputedStyle(element).fill || DEFAULT_COLOR;
          }

          const handleMouseEnter = () => {
            const permanentColor = getPermanentColorForSurface(selectedTooth, surfaceId);
            if (!selectedSurfacesRef.current.includes(surfaceId) && !permanentColor) {
              element.style.fill = HOVER_COLOR_ROOT;
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

          cleanupFnsRef.current.push(() => {
            element.removeEventListener("mouseenter", handleMouseEnter);
            element.removeEventListener("mouseleave", handleMouseLeave);
            element.removeEventListener("click", handleClick);
          });
        });
      });
    };

    setup();

    return () => {
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, [rootSvgLoaded, selectedTooth, rootInfo.roots.join(), onSurfaceSelect, getPermanentColorForSurface, DEFAULT_COLOR]);

  // ------------------ Sincronización SVG ------------------
  useEffect(() => {
    if (!rootSvgLoaded || !selectedTooth) return;

    const rootSvg = document.getElementById("raiz-svg") as HTMLObjectElement;
    if (!rootSvg?.contentDocument) return;

    const rootDoc = rootSvg.contentDocument;

    rootInfo.roots.forEach(rootId => {
      const surfaceId = `raiz:${rootId}`;
      const groupElement = rootDoc.getElementById(rootId);
      if (!groupElement) return;

      const elements = groupElement.querySelectorAll("path, rect, circle, polygon");
      const permanentColor = getPermanentColorForSurface(selectedTooth, surfaceId);
      const isSelected = selectedSurfaces.includes(surfaceId);

      elements.forEach(el => {
        const element = el as HTMLElement;
        let finalColor = DEFAULT_COLOR;

        if (permanentColor) {
          finalColor = permanentColor;
        } else if (isSelected && previewColorHex) {
          finalColor = previewColorHex;
        } else if (isSelected) {
          finalColor = UI_SELECTION_COLOR;
        } else {
          finalColor = element.dataset.originalFill || DEFAULT_COLOR;
        }

        element.style.fill = finalColor;
      });
    });
  }, [selectedSurfaces, rootSvgLoaded, selectedTooth, rootInfo.roots.join(), previewColorHex, getPermanentColorForSurface, UI_SELECTION_COLOR, DEFAULT_COLOR]);
};