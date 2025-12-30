// src/components/preview/ToothPreviewOverlay.tsx
import React from 'react';
import { DiagnosticIconComponent } from '../../odontogram/preview/DiagnosticIcon';

interface ToothPreviewOverlayProps {
  mainIconKey: string | null;
  iconCount: number;
  tooltip: string;
  color: string;
  isToothUpper?: boolean;
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

export const ToothPreviewOverlay: React.FC<ToothPreviewOverlayProps> = ({
  mainIconKey,
  iconCount,
  tooltip,
  color = '#374151',
  isToothUpper = false
}) => {
  if (!mainIconKey) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center p-2 select-none pointer-events-none"
      style={{ color }}
    >
      <ContenedorEstado tooltip={tooltip}>
        <div className="relative">
          <DiagnosticIconComponent 
            diagnosticKey={mainIconKey} 
            size={36}
          />
          
        </div>
      </ContenedorEstado>
    </div>
  );
};
