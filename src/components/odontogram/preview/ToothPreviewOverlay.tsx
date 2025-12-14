// src/components/preview/ToothPreviewOverlay.tsx
import React from "react";

type ToothPreviewOverlayProps = {
  svgsCorona?: React.ReactNode[]; // SVGs de la Corona (máx. 3)
  svgsRaiz?: React.ReactNode[];   // SVGs de la Raíz (máx. 3)
  tooltipCorona?: string;
  tooltipRaiz?: string;
  color?: string;
  coberturaTotal?: boolean;
  isToothUpper?: boolean;
};

/* ----------------------------------------------------
 * Tooltip + contenedor
 * -------------------------------------------------- */
const ContenedorEstado: React.FC<{
  children: React.ReactNode;
  tooltip?: string;
  fullHeight?: boolean;
}> = ({ children, tooltip, fullHeight = false }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${
        fullHeight ? "h-full" : ""
      }`}
    >
      {children}

      {tooltip && (
        <div
          className="
            absolute bottom-full mb-1
            px-2 py-1
            text-[10px] font-medium
            bg-gray-900 text-white
            rounded-md shadow-lg
            opacity-0 scale-95
            transition-all duration-200
            pointer-events-none
            group-hover:opacity-100 group-hover:scale-100
            whitespace-nowrap
            z-30
          "
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------------------
 * Grupo de íconos (Corona / Raíz)
 * -------------------------------------------------- */
const IconGroup: React.FC<{
  svgs?: React.ReactNode[];
  color: string;
}> = ({ svgs, color }) => {
  if (!svgs || svgs.length === 0) return null;

  return (
    <div
      className="
        flex items-center justify-center gap-1
        px-1.5 py-1
        rounded-md
        bg-white/75
        backdrop-blur-sm
        shadow-theme-xs
        pointer-events-auto
      "
      style={{ color }}
    >
      {svgs.slice(0, 3).map((svg, idx) => (
        <div key={idx} className="w-4 h-4 flex-shrink-0">
          {svg}
        </div>
      ))}
    </div>
  );
};

/* ----------------------------------------------------
 * Overlay principal
 * -------------------------------------------------- */
export const ToothPreviewOverlay: React.FC<ToothPreviewOverlayProps> = ({
  svgsCorona,
  svgsRaiz,
  tooltipCorona,
  tooltipRaiz,
  color = "#374151", // gray-700
  coberturaTotal = false,
  isToothUpper = false,
}) => {
  const direction = isToothUpper ? "flex-col" : "flex-col-reverse";

  return (
    <div
      className={`
        absolute inset-0 z-20
        flex ${direction}
        justify-between items-center
        p-2
        select-none
        pointer-events-none
        ${coberturaTotal ? "animate-pulse-soft" : ""}
      `}
      style={{ color }}
    >
      {/* -------- Raíz -------- */}
      <div className="group">
        <ContenedorEstado tooltip={tooltipRaiz} fullHeight={coberturaTotal}>
          <IconGroup svgs={svgsRaiz} color={color} />
        </ContenedorEstado>
      </div>

      {/* -------- Indicador central -------- */}
      {coberturaTotal && (
        <div
          className="
            text-[10px] font-semibold
            px-2 py-0.5
            rounded-full
            bg-warning-100 text-warning-800
            shadow-theme-xs
          "
        >
          Afecta todo el diente
        </div>
      )}

      {/* -------- Corona -------- */}
      <div className="group">
        <ContenedorEstado tooltip={tooltipCorona} fullHeight={coberturaTotal}>
          <IconGroup svgs={svgsCorona} color={color} />
        </ContenedorEstado>
      </div>
    </div>
  );
};