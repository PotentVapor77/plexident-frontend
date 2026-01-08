// src/components/odontogram/history/historyView/ToothSurfacesStaticView.tsx

import React, { useMemo, useEffect, useRef, useState } from 'react';
import odontSvg from '../../../../assets/images/dental/odonto.svg';
import raizCanino from '../../../../assets/images/roots/raiz_canino.svg';
import raizDental from '../../../../assets/images/roots/raiz_dental.svg';
import raizIncisivo from '../../../../assets/images/roots/raiz_incisivo.svg';
import raizMolarInferior from '../../../../assets/images/roots/raiz_molar_inferior.svg';
import raizMolarSuperior from '../../../../assets/images/roots/raiz_molar_superior.svg';
import raizPremolar from '../../../../assets/images/roots/raiz_premolar.svg';
import { getRootTypeByFDI } from '../../../../hooks/odontogram/diagnosticoHooks/useToothSelection';
import type { DiagnosticoEntry } from '../../../../core/types/odontograma.types';

const ROOT_SVG_MAP: Record<string, string> = {
  raiz_molar_superior: raizMolarSuperior,
  raiz_molar_inferior: raizMolarInferior,
  raiz_premolar: raizPremolar,
  raiz_canino: raizCanino,
  raiz_incisivo: raizIncisivo,
  raiz_dental: raizDental,
};

const SURFACE_AREA_MAP: Record<string, string> = {
  cara_oclusal: 'corona',
  cara_distal: 'corona',
  cara_mesial: 'corona',
  cara_vestibular: 'corona',
  cara_lingual: 'corona',
  raiz_mesial: 'raiz',
  raiz_distal: 'raiz',
  raiz_palatal: 'raiz',
  raiz_vestibular: 'raiz',
  raiz_principal: 'raiz',
  general: 'general',
};

interface ToothSurfacesStaticViewProps {
  toothId: string;
  diagnosticos: DiagnosticoEntry[];
  getPermanentColorForSurface: (toothId: string | null, surfaceId: string) => string | null;
}

export const ToothSurfacesStaticView: React.FC<ToothSurfacesStaticViewProps> = ({
  toothId,
  diagnosticos,
  getPermanentColorForSurface,
}) => {
  const crownContainerRef = useRef<HTMLDivElement>(null);
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const [crownLoaded, setCrownLoaded] = useState(false);
  const [rootLoaded, setRootLoaded] = useState(false);

  // 1) Si todos los diagnósticos son generales → mostrar SVGs sin colores
  const onlyGeneral = useMemo(
    () =>
      diagnosticos.length > 0 &&
      diagnosticos.every((d) =>
        (d.areasafectadas || []).every((a) => a === 'general'),
      ),
    [diagnosticos],
  );

  // 2) Derivar superficies técnicas presentes en el snapshot
  const selectedSurfaces = useMemo(() => {
    const set = new Set<string>();
    diagnosticos.forEach((d) => {
      if (d.superficieId) {
        set.add(d.superficieId);
      } else {
        (d.areasafectadas || []).forEach((s) => set.add(s as string));
      }
    });
    return Array.from(set);
  }, [diagnosticos]);

  const surfacesColorMap = useMemo(() => {
    const map = new Map<string, string>();
    selectedSurfaces.forEach((surfaceId) => {
      const color = getPermanentColorForSurface(toothId, surfaceId);
      if (color) map.set(surfaceId, color);
    });
    return map;
  }, [selectedSurfaces, toothId, getPermanentColorForSurface]);

  // 4) Separar superficies de corona y raíz
  const crownEntries = Array.from(surfacesColorMap.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'corona' || id.startsWith('cara_'),
  );

  const rootEntries = Array.from(surfacesColorMap.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'raiz' || id.startsWith('raiz'),
  );

  // 5) Seleccionar SVG de raíz
  const rootType = getRootTypeByFDI(toothId);
  const rootSvgPath = ROOT_SVG_MAP[rootType] || raizDental;

  // ============================================================================
  // 🔄 CARGAR SVG DE CORONA (SIEMPRE)
  // ============================================================================
  useEffect(() => {
    if (!crownContainerRef.current) return;

    fetch(odontSvg)
      .then(res => res.text())
      .then(svgText => {
        if (crownContainerRef.current) {
          crownContainerRef.current.innerHTML = svgText;
          
          // Aplicar tamaño fijo al SVG
          const svgElement = crownContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '80px';
            svgElement.style.height = '80px';
            svgElement.style.maxWidth = '80px';
            svgElement.style.maxHeight = '80px';
          }
          
          setCrownLoaded(true);
        }
      })
      .catch(err => console.error('Error loading crown SVG:', err));
  }, [toothId]);

  // ============================================================================
  // 🔄 CARGAR SVG DE RAÍZ (SIEMPRE)
  // ============================================================================
  useEffect(() => {
    if (!rootContainerRef.current) return;

    fetch(rootSvgPath)
      .then(res => res.text())
      .then(svgText => {
        if (rootContainerRef.current) {
          rootContainerRef.current.innerHTML = svgText;
          
          // Aplicar tamaño fijo al SVG
          const svgElement = rootContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '60px';
            svgElement.style.height = '60px';
            svgElement.style.maxWidth = '60px';
            svgElement.style.maxHeight = '60px';
          }
          
          setRootLoaded(true);
        }
      })
      .catch(err => console.error('Error loading root SVG:', err));
  }, [rootSvgPath, toothId]);

  // ============================================================================
  // 🎨 APLICAR COLORES AL SVG DE CORONA
  // ============================================================================
  useEffect(() => {
    if (!crownLoaded || !crownContainerRef.current) return;

    const container = crownContainerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // Resetear todos los colores primero
    const allPaths = svgElement.querySelectorAll('path[id]');
    allPaths.forEach((path) => {
      (path as SVGPathElement).style.fill = '#ffffff';
    });

    // Aplicar colores de diagnósticos (solo si hay)
    if (!onlyGeneral) {
      crownEntries.forEach(([surfaceId, color]) => {
        const pathElement = svgElement.querySelector(`path[id="${surfaceId}"]`);
        if (pathElement) {
          (pathElement as SVGPathElement).style.fill = color;
        }
      });
    }
  }, [crownLoaded, crownEntries, onlyGeneral]);

  // ============================================================================
  // 🎨 APLICAR COLORES AL SVG DE RAÍZ
  // ============================================================================
  useEffect(() => {
    if (!rootLoaded || !rootContainerRef.current) return;

    const container = rootContainerRef.current;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // Resetear todos los colores primero
    const allElements = svgElement.querySelectorAll('path[id], rect[id]');
    allElements.forEach((element) => {
      (element as SVGElement).style.fill = '#ffffff';
    });

    // Aplicar colores de diagnósticos (solo si hay)
    if (!onlyGeneral) {
      rootEntries.forEach(([surfaceId, color]) => {
        const possibleIds = [
          surfaceId,
          surfaceId.replace('raiz_', 'raiz:'),
          surfaceId.replace('raiz_', ''),
        ];

        for (const id of possibleIds) {
          const element = svgElement.querySelector(`path[id="${id}"], rect[id="${id}"]`);
          if (element) {
            (element as SVGElement).style.fill = color;
            break;
          }
        }
      });
    }
  }, [rootLoaded, rootEntries, onlyGeneral]);

  // Resetear al cambiar de diente
  useEffect(() => {
    setCrownLoaded(false);
    setRootLoaded(false);
  }, [toothId]);

  return (
    <div className="w-full space-y-3">
      {/* SVGs en la misma fila */}
      <div className="flex items-center justify-center gap-6 py-2">
        {/* SVG DE LA RAÍZ */}
        <div className="flex flex-col items-center gap-1.5">
          <div 
            ref={rootContainerRef}
            className="flex items-center justify-center"
            style={{ 
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          />
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            Raíz
          </span>
        </div>

        {/* SVG DE LA CORONA */}
        <div className="flex flex-col items-center gap-1.5">
          <div 
            ref={crownContainerRef}
            className="flex items-center justify-center"
            style={{ 
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          />
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            Corona
          </span>
        </div>
      </div>

      {/* Leyenda de superficies afectadas (solo si hay diagnósticos) */}
      {!onlyGeneral && (rootEntries.length > 0 || crownEntries.length > 0) && (
        <div className="w-full space-y-2 pt-1 border-t border-gray-200 dark:border-gray-700">
          {/* Superficies de raíz */}
          {rootEntries.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Raíz afectada
              </p>
              <div className="flex flex-wrap gap-1">
                {rootEntries.map(([surfaceId, color]) => (
                  <span
                    key={surfaceId}
                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] flex items-center gap-1"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {surfaceId.replace('raiz_', '').replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Superficies de corona */}
          {crownEntries.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Corona afectada
              </p>
              <div className="flex flex-wrap gap-1">
                {crownEntries.map(([surfaceId, color]) => (
                  <span
                    key={surfaceId}
                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] flex items-center gap-1"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {surfaceId.replace('cara_', '').replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensaje para diagnósticos generales */}
      {onlyGeneral && (
        <div className="text-center py-2 px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Diagnóstico general (no aplica a superficies específicas)
          </p>
        </div>
      )}
    </div>
  );
};
