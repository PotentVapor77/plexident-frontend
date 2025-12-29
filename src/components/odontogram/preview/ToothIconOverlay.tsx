// src/components/odontogram/preview/ToothIconOverlay.tsx
import React from "react";
import { DiagnosticIconComponent } from "./DiagnosticIcon";

interface ToothIconOverlayProps {
  mainIconKey: string | null;
  iconCount: number;
  tooltip: string;
  colorGlobal: string;  // ✅ Renombrado para matching
  // ❌ ELIMINADOS props no usados: diagnosticoIdEnPreview, isToothUpper
}

const ContenedorEstado: React.FC<{
  children: React.ReactNode;
  tooltip?: string;
}> = ({ children, tooltip }) => (
  <div className="group relative flex items-center justify-center">
    {children}
    {tooltip && (
      <div className="absolute bottom-full mb-1 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-md shadow-lg opacity-0 scale-95 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap z-30">
        {tooltip}
      </div>
    )}
  </div>
);

export const ToothIconOverlay: React.FC<ToothIconOverlayProps> = ({
  mainIconKey,
  iconCount,
  tooltip,
  colorGlobal
}) => {
  if (!mainIconKey) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-2 select-none pointer-events-none"
      style={{ color: colorGlobal }}
    >
      <ContenedorEstado tooltip={tooltip}>
        <div className="relative">
          <DiagnosticIconComponent 
            diagnosticKey={mainIconKey} 
            size={36}
          />
          {iconCount > 1 && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-white shadow-lg">
              {iconCount}
            </div>
          )}
        </div>
      </ContenedorEstado>
    </div>
  );
};
