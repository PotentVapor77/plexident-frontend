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

// ============================================================================
// CONFIGURACIÓN Y MAPEOS
// ============================================================================

const ROOT_SVG_MAP: Record<string, string> = {
  raiz_molar_superior: raizMolarSuperior,
  raiz_molar_inferior: raizMolarInferior,
  raiz_premolar: raizPremolar,
  raiz_canino: raizCanino,
  raiz_incisivo: raizIncisivo,
  raiz_dental: raizDental,
};

const SURFACE_AREA_MAP: Record<string, 'corona' | 'raiz' | 'general'> = {
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
  'raiz:mesial': 'raiz',
  'raiz:distal': 'raiz',
  'raiz:palatal': 'raiz',
  'raiz:vestibular': 'raiz',
  'raiz:principal': 'raiz',
  general: 'general',
};

interface ToothSurfacesStaticViewProps {
  toothId: string;
  diagnosticos: DiagnosticoEntry[];
}

// FUNCION HELPER PARA PINTAR RECURSIVAMENTE (Importante para grupos <g>)
const paintElement = (element: Element, color: string) => {
  // 1. Pintar el elemento en sí
  (element as SVGElement).style.fill = color;
  element.setAttribute('fill', color); // Doble binding para asegurar

  // 2. Si es un grupo, buscar todos los hijos dibujables y forzar el color
  const children = element.querySelectorAll('path, polygon, circle, rect, ellipse');
  children.forEach((child) => {
    (child as SVGElement).style.fill = color;
    child.setAttribute('fill', color);
    // Eliminar estilos inline que puedan bloquear la herencia
    (child as SVGElement).style.removeProperty('stroke'); 
  });
};

export const ToothSurfacesStaticView: React.FC<ToothSurfacesStaticViewProps> = ({
  toothId,
  diagnosticos,
}) => {
  const crownContainerRef = useRef<HTMLDivElement>(null);
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const [crownLoaded, setCrownLoaded] = useState(false);
  const [rootLoaded, setRootLoaded] = useState(false);

  // ============================================================================
  // 1. LÓGICA DE CALCULO DE COLORES
  // ============================================================================

  const { surfaceColors, onlyGeneral, generalColor } = useMemo(() => {
    const map = new Map<string, string>();
    let isGeneral = false;
    let genColor: string | null = null; // Tipado explícito arreglado

    if (!diagnosticos || diagnosticos.length === 0) {
      return { surfaceColors: map, onlyGeneral: false, generalColor: null };
    }

    const diagBySurface: Record<string, DiagnosticoEntry[]> = {};

    diagnosticos.forEach((diag) => {
      if (diag.areasafectadas?.includes('general')) {
        isGeneral = true;
        if (!genColor || diag.priority > (diagBySurface['general']?.[0]?.priority || 0)) {
           genColor = diag.colorHex;
           diagBySurface['general'] = [diag];
        }
        return;
      }

      const surfaces = diag.superficieId 
        ? [diag.superficieId] 
        : (diag.areasafectadas || []);

      surfaces.forEach((surface) => {
        if (surface === 'general') return;
        if (!diagBySurface[surface]) diagBySurface[surface] = [];
        diagBySurface[surface].push(diag);
      });
    });

    Object.keys(diagBySurface).forEach((surface) => {
      const diags = diagBySurface[surface];
      diags.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      if (diags.length > 0) {
        map.set(surface, diags[0].colorHex);
      }
    });

    return { 
      surfaceColors: map, 
      onlyGeneral: isGeneral && map.size === 0, 
      generalColor: genColor 
    };
  }, [diagnosticos]);

  const crownEntries = Array.from(surfaceColors.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'corona' || id.startsWith('cara_')
  );

  const rootEntries = Array.from(surfaceColors.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'raiz' || id.startsWith('raiz')
  );

  const rootType = getRootTypeByFDI(toothId);
  const rootSvgPath = ROOT_SVG_MAP[rootType] || raizDental;

  // ============================================================================
  // CARGA DE SVGs
  // ============================================================================

  useEffect(() => {
    if (!crownContainerRef.current) return;
    setCrownLoaded(false);

    fetch(odontSvg)
      .then((res) => res.text())
      .then((svgText) => {
        if (crownContainerRef.current) {
          crownContainerRef.current.innerHTML = svgText;
          const svgElement = crownContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            if (!svgElement.getAttribute('viewBox')) {
                svgElement.setAttribute('viewBox', '0 0 100 100'); 
            }
          }
          setCrownLoaded(true);
        }
      })
      .catch((err) => console.error('Error loading crown SVG:', err));
  }, [toothId]);

  useEffect(() => {
    if (!rootContainerRef.current) return;
    setRootLoaded(false);

    fetch(rootSvgPath)
      .then((res) => res.text())
      .then((svgText) => {
        if (rootContainerRef.current) {
          rootContainerRef.current.innerHTML = svgText;
          const svgElement = rootContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
          }
          setRootLoaded(true);
        }
      })
      .catch((err) => console.error('Error loading root SVG:', err));
  }, [rootSvgPath, toothId]);

  // ============================================================================
  // PINTADO DE CORONA (MEJORADO)
  // ============================================================================
  useEffect(() => {
    if (!crownLoaded || !crownContainerRef.current) return;
    const svgElement = crownContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    // 1. Resetear todo a blanco
    const allElements = svgElement.querySelectorAll('path, circle, rect, polygon, g');
    allElements.forEach((el) => {
      (el as SVGElement).style.fill = onlyGeneral && generalColor ? generalColor : '#ffffff';
    });

    if (onlyGeneral) return;

    // 2. Aplicar colores
    crownEntries.forEach(([surfaceId, color]) => {
      // Intentar variantes de ID
      const cleanId = surfaceId.replace('cara_', '');
      const selectors = [
        `[id="${surfaceId}"]`,       // ej: cara_distal
        `[id="${cleanId}"]`,         // ej: distal
        `[id="cara:${cleanId}"]`     // ej: cara:distal
      ];
      
      const element = svgElement.querySelector(selectors.join(', '));
      
      if (element) {
        paintElement(element, color);
      } else {
        console.warn(`[Crown] No se encontró superficie: ${surfaceId} en el diente ${toothId}`);
      }
    });
  }, [crownLoaded, crownEntries, onlyGeneral, generalColor, toothId]);

  // ============================================================================
  // PINTADO DE RAÍZ (MEJORADO)
  // ============================================================================
  useEffect(() => {
    if (!rootLoaded || !rootContainerRef.current) return;
    const svgElement = rootContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    // 1. Resetear todo
    const allElements = svgElement.querySelectorAll('path, circle, rect, polygon, g');
    allElements.forEach((el) => {
      (el as SVGElement).style.fill = onlyGeneral && generalColor ? generalColor : '#ffffff';
    });

    if (onlyGeneral) return;

    // 2. Aplicar colores
    rootEntries.forEach(([surfaceId, color]) => {
        const cleanId = surfaceId.replace('raiz_', '').replace('raiz:', '');
        
        // IDs probables para raíces
        const selectors = [
            `[id="${surfaceId}"]`,       // raiz_mesial
            `[id="${cleanId}"]`,         // mesial
            `[id="raiz:${cleanId}"]`,    // raiz:mesial
            `[id*="${cleanId}"]`         // contiene "mesial" (útil para grupos complejos)
        ];

        // Buscar primero coincidencia exacta, luego aproximada
        let element = svgElement.querySelector(selectors.slice(0, 3).join(', '));
        
        // Si no encuentra exacto, buscar coincidencia parcial con cuidado
        if (!element) {
           element = svgElement.querySelector(selectors[3]); 
        }
        
        if (element) {
             paintElement(element, color);
        } else {
            console.warn(`[Root] No se encontró superficie: ${surfaceId} en el diente ${toothId}`);
        }
    });
  }, [rootLoaded, rootEntries, onlyGeneral, generalColor, toothId]);


  return (
    <div className="w-full space-y-3">
      {/* SVGs */}
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex flex-col items-center gap-1.5">
          <div 
            ref={rootContainerRef} 
            className="flex items-center justify-center overflow-hidden w-[60px] h-[60px]"
          />
          <span className="text-[10px] font-medium text-gray-500">Raíz</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div 
            ref={crownContainerRef} 
            className="flex items-center justify-center overflow-hidden w-[80px] h-[80px]"
          />
          <span className="text-[10px] font-medium text-gray-500">Corona</span>
        </div>
      </div>

      {/* Leyenda */}
      {!onlyGeneral && (rootEntries.length > 0 || crownEntries.length > 0) && (
        <div className="w-full space-y-2 pt-1 border-t border-gray-200">
          
          {rootEntries.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase">Raíz afectada</p>
              <div className="flex flex-wrap gap-1">
                {rootEntries.map(([sid, color]) => (
                  <span key={sid} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {sid.replace('raiz_', '').replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* {crownEntries.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 uppercase">Corona afectada</p>
              <div className="flex flex-wrap gap-1">
                {crownEntries.map(([sid, color]) => (
                  <span key={sid} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {sid.replace('cara_', '').replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )} */}
        </div>
      )}

      {onlyGeneral && (
        <div className="text-center py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
             Diagnóstico General (Afecta todo el diente)
          </p>
        </div>
      )}
    </div>
  );
};