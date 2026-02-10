// src/components/odontogram/patient/NoPacienteOverlay.tsx
import React from 'react';
import { Users } from 'lucide-react';
import Button from '../../ui/button/Button';

interface Props {
  onOpenSelector?: () => void;
}

export const NoPacienteOverlay: React.FC<Props> = ({ onOpenSelector }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Icono */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/90 backdrop-blur shadow-lg">
          <Users className="h-10 w-10 text-brand-600" />
        </div>

        {/* Título */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">
            Selecciona un Paciente
          </h2>
          <p className="text-gray-200 text-sm">
            Para comenzar a trabajar en el odontograma, primero debes seleccionar un paciente
          </p>
        </div>

        {/* Botón de acción (si hay función para abrir selector) */}
        {onOpenSelector && (
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={onOpenSelector}
              className="inline-flex items-center gap-2"
              size="md"
            >
              <Users className="h-4 w-4" />
              Abrir selector de pacientes
            </Button>
          </div>
        )}

        {/* Indicador visual */}
        <div className="flex items-center justify-center gap-2 text-white/80 text-xs">
          <div className="h-2 w-2 bg-brand-400 rounded-full animate-pulse" />
          <span>Usa el botón flotante para seleccionar</span>
        </div>
      </div>
    </div>
  );
};