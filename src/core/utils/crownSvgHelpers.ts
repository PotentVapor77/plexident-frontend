// src/utils/odontogram/crownSvgHelpers.ts

export const SYMBOL_SIZE_CLASSES = {
  xs: 'w-12',  // 40% para odontograma completo
  sm: 'w-24',  // 60% para cuadrante
  md: 'w-36',  // 80% para selector original
  lg: 'w-48',
} as const;

export const getSymbolSizeClasses = (crownSize: CrownSize): string => {
  return SYMBOL_SIZE_CLASSES[crownSize];
};
export const OVERLAY_SCALE_CLASSES = {
  xs: 'scale-[0.4]',  // 40% para odontograma completo
  sm: 'scale-[0.6]',  // 60% para cuadrante
  md: 'scale-[0.8]',  // 80% para selector original
  lg: 'scale-100',    // 100% para vista individual
} as const;

/**
 * Clases CSS de tamaño para el componente ToothCrownReadOnly
 */
export const CROWN_SIZE_CLASSES = {
  xs: 'w-16 h-16',    // Odontograma completo (32 dientes)
  sm: 'w-11 h-24',    // Vista de cuadrante
  md: 'w-36 h-36',    // Original del selector
  lg: 'w-48 h-48',    // Vista detallada individual
} as const;
export const OVERLAY_ICON_SIZES = {
  xs: 16,  // 16px para xs
  sm: 24,  // 24px para sm
  md: 32,  // 32px para md
  lg: 48,  // 48px para lg
} as const;
export type CrownSize = keyof typeof CROWN_SIZE_CLASSES;

/**
 * Genera ID único para el SVG de corona
 * 
 * @param toothFDI - Código FDI del diente
 * @param prefix - Prefijo opcional (default: 'crown')
 * @returns ID único del elemento SVG
 */
export const getCrownSvgId = (toothFDI: string, prefix = 'crown'): string => {
  return `${prefix}-${toothFDI}`;
};

/**
 * Valida si un código FDI es válido
 * 
 * @param fdi - Código FDI a validar
 * @returns true si es válido
 */
export const isValidFDI = (fdi: string): boolean => {
  // Permanentes: 11-48
  const permanentPattern = /^[1-4][1-8]$/;
  // Temporales: 51-85
  const temporalPattern = /^[5-8][1-5]$/;
  
  return permanentPattern.test(fdi) || temporalPattern.test(fdi);
};

/**
 * Determina si un diente es permanente o temporal
 * 
 * @param fdi - Código FDI
 * @returns 'permanente' | 'temporal' | null
 */
export const getToothType = (fdi: string): 'permanente' | 'temporal' | null => {
  if (!isValidFDI(fdi)) return null;
  
  const firstDigit = parseInt(fdi[0]);
  return firstDigit <= 4 ? 'permanente' : 'temporal';
};

export const getQuadrant = (fdi: string): number | null => {
  if (!isValidFDI(fdi)) return null;
  return parseInt(fdi[0]);
};
export const getOverlayScaleClass = (size: CrownSize): string => {
  return OVERLAY_SCALE_CLASSES[size];
};
export const getOverlayIconSize = (size: CrownSize): number => {
  return OVERLAY_ICON_SIZES[size];
};

export const generateAriaLabel = (fdi: string, surfaceCount: number): string => {
  const toothType = getToothType(fdi);
  const typeLabel = toothType === 'permanente' ? 'permanente' : 'temporal';
  
  if (surfaceCount === 0) {
    return `Diente ${fdi} ${typeLabel} - Sin diagnósticos`;
  }
  
  const surfaceLabel = surfaceCount === 1 ? 'superficie afectada' : 'superficies afectadas';
  return `Diente ${fdi} ${typeLabel} - ${surfaceCount} ${surfaceLabel}`;
};
export const getOverlayContainerClasses = (size: CrownSize, customClasses = ''): string => {
  const baseClasses = 'absolute inset-0 flex items-center justify-center pointer-events-none';
  const scaleClass = getOverlayScaleClass(size);
  
  return `${baseClasses} ${scaleClass} ${customClasses}`.trim();
};
/**
 * Calcula el tamaño óptimo según el número de dientes a mostrar
 * 
 * @param teethCount - Número total de dientes
 * @returns Tamaño recomendado
 */
export const getOptimalSize = (teethCount: number): CrownSize => {
  if (teethCount >= 32) return 'xs';  
  if (teethCount >= 16) return 'sm';  
  if (teethCount >= 8) return 'md';   
  return 'lg';                        
};

export const getBadgeClasses = (size: CrownSize): string => {
  const baseClasses = 'absolute bg-slate-700 text-white font-mono rounded';
  
  const sizeSpecific = {
    xs: 'text-[8px] px-1 py-0.5 -bottom-0.5 -right-0.5',
    sm: 'text-[10px] px-1.5 py-0.5 -bottom-1 -right-1',
    md: 'text-xs px-2 py-1 -bottom-1 -right-1',
    lg: 'text-sm px-2 py-1 -bottom-2 -right-2',
  };
  
  return `${baseClasses} ${sizeSpecific[size]}`;
};

export const waitForSvgLoad = (svgId: string, timeout = 3000): Promise<Document> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      const svgObject = document.getElementById(svgId) as HTMLObjectElement;
      
      if (svgObject?.contentDocument) {
        clearInterval(checkInterval);
        resolve(svgObject.contentDocument);
      }
      
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error(`SVG ${svgId} no se cargó en ${timeout}ms`));
      }
    }, 50);
  });
};
