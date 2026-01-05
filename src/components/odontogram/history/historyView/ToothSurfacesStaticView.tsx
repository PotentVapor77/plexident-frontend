// src/components/odontogram/history/historyView/ToothSurfacesStaticView.tsx

import React, { useMemo } from 'react';

import odontSvg from '../../../../assets/images/dental/odonto.svg';
import raizCanino from '../../../../assets/images/roots/raiz_canino.svg';
import raizDental from '../../../../assets/images/roots/raiz_dental.svg';
import raizIncisivo from '../../../../assets/images/roots/raiz_incisivo.svg';
import raizMolarInferior from '../../../../assets/images/roots/raiz_molar_inferior.svg';
import raizMolarSuperior from '../../../../assets/images/roots/raiz_molar_superior.svg';
import raizPremolar from '../../../../assets/images/roots/raiz_premolar.svg';

import { getRootTypeByFDI } from '../../../../hooks/odontogram/diagnosticoHooks/useToothSelection';
import type { DiagnosticoEntry } from '../../../../core/types/odontograma.types';

// Mismo map que en SurfaceSelector
const ROOT_SVG_MAP: Record<string, string> = {
  raiz_molar_superior: raizMolarSuperior,
  raiz_molar_inferior: raizMolarInferior,
  raiz_premolar: raizPremolar,
  raiz_canino: raizCanino,
  raiz_incisivo: raizIncisivo,
  raiz_dental: raizDental,
};

// Mapa de superficie -> área principal (corona / raíz / general)
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
  // 1) Si todos los diagnósticos son generales → no mostrar SVG
  const onlyGeneral = useMemo(
    () =>
      diagnosticos.length > 0 &&
      diagnosticos.every((d) =>
        (d.areasafectadas || []).every((a) => a === 'general'),
      ),
    [diagnosticos],
  );

  if (onlyGeneral) {
    // O devuelve null si prefieres que DetailedToothView no muestre nada visual
    return (
      <div className="flex items-center justify-center py-4 text-xs text-gray-500 dark:text-gray-400">
        Estado general (no aplica vista de superficies)
      </div>
    );
  }

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


  // 4) Separar superficies de corona y raíz para la leyenda
  const crownEntries = Array.from(surfacesColorMap.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'corona' || id.startsWith('cara_'),
  );
  const rootEntries = Array.from(surfacesColorMap.entries()).filter(
    ([id]) => SURFACE_AREA_MAP[id] === 'raiz' || id.startsWith('raiz'),
  );

  // 5) Seleccionar SVG de raíz
  const rootType = getRootTypeByFDI(toothId);
  const rootSvgPath = ROOT_SVG_MAP[rootType] || raizDental;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
      {/* Raíz */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
          <img
            src={rootSvgPath}
            alt="Raíz dental"
            className="max-w-full max-h-full object-contain opacity-90"
          />
        </div>

        {!!rootEntries.length && (
          <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
            {rootEntries.map(([surfaceId, color]) => (
              <span
                key={surfaceId}
                className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">
                  {surfaceId.replace('raiz_', '').replace('_', ' ')}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Corona */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
          <img
            src={odontSvg}
            alt="Corona dental"
            className="max-w-full max-h-full object-contain opacity-90"
          />
        </div>

        {!!crownEntries.length && (
          <div className="flex flex-wrap justify-center gap-1 max-w-[180px]">
            {crownEntries.map(([surfaceId, color]) => (
              <span
                key={surfaceId}
                className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">
                  {surfaceId.replace('cara_', '').replace('_', ' ')}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
