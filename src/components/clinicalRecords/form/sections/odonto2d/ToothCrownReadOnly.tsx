// src/components/clinicalRecords/form/sections/odonto2d/ToothCrownReadOnly.tsx

import React, { useRef, useState } from 'react';
import odontSvg from '../../../../../assets/images/dental/odonto.svg';
import { useCrownReadOnly, type SurfaceColorData } from '../../../../../hooks/clinicalRecord/useCrownReadOnly';
import { 
  CROWN_SIZE_CLASSES, 
  generateAriaLabel, 
  getBadgeClasses, 
  getCrownSvgId, 
  getOverlayContainerClasses, 
  getOverlayIconSize, 
  type CrownSize 
} from '../../../../../core/utils/crownSvgHelpers';

interface ToothCrownReadOnlyProps {
  toothFDI: string;
  surfaces: SurfaceColorData[];
  size?: CrownSize;
  className?: string;
  showBadge?: boolean;
  showBorders?: boolean;
  overlayIcon?: React.ReactNode; 
  symbolScale?: number;
}

export const ToothCrownReadOnly: React.FC<ToothCrownReadOnlyProps> = ({
  toothFDI,
  surfaces,
  size = 'sm',
  className = '',
  showBadge = true,
  showBorders = true,
  overlayIcon,
  symbolScale,
}) => {
  const [svgLoaded, setSvgLoaded] = useState(false);
  const prevSurfacesRef = useRef<SurfaceColorData[]>([]);

  const surfacesChanged = JSON.stringify(surfaces) !== JSON.stringify(prevSurfacesRef.current);
  if (surfacesChanged) {
    prevSurfacesRef.current = surfaces;
  }

  // Hook para aplicar colores
  const { hasSurfaces } = useCrownReadOnly({
    svgLoaded,
    toothFDI,
    surfaces,
    showBorders,
  });

  const svgId = getCrownSvgId(toothFDI);
  const ariaLabel = generateAriaLabel(toothFDI, surfaces.length);
  const overlayContainerClasses = getOverlayContainerClasses(size);
  const iconSize = getOverlayIconSize(size);

  // Si hay escala manual (symbolScale), usarla; si no, usar la automática del helper
  const customScaleStyle = symbolScale 
    ? { transform: `scale(${symbolScale})` }
    : undefined;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* SVG de Corona - SIEMPRE VISIBLE */}
      <object
        id={svgId}
        data={odontSvg}
        type="image/svg+xml"
        className={`block max-w-full ${CROWN_SIZE_CLASSES[size]}`}
        onLoad={() => {
          setSvgLoaded(true);
        }}
        onError={(e) => {
          console.error(`Error cargando SVG para diente ${toothFDI}:`, e);
        }}
        role="img"
        aria-label={ariaLabel}
        style={{ pointerEvents: 'none' }}
      />

      {/* Overlay Icon con escala */}
      {overlayIcon && (
        <div 
          className={overlayContainerClasses}
          style={customScaleStyle}
        >
          {React.isValidElement(overlayIcon) 
            ? React.cloneElement(overlayIcon as React.ReactElement<any>, {
                // Inyectar tamaño sugerido si el icono acepta width/height
                width: iconSize,
                height: iconSize,
                // Preservar props existentes
                ...(overlayIcon.props || {}),
              })
            : overlayIcon
          }
        </div>
      )}

      {/* Badge con código FDI */}
      {showBadge && (
        <div 
          className={getBadgeClasses(size)}
          aria-hidden="true"
        >
          {toothFDI}
        </div>
      )}

      {/* Indicador de carga */}
      {!svgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
