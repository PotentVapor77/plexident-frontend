// src/components/odontogram/patient/NoPacienteOverlay.tsx
import React from 'react';
import { Users } from 'lucide-react';

export const NoPacienteOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Icono */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur shadow-xl">
          <Users className="w-10 h-10 text-blue-500" />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Selecciona un Paciente
          </h2>
          <p className="text-gray-200 text-sm">
            Para comenzar a trabajar en el odontograma, primero debes seleccionar un paciente
          </p>
        </div>

        {/* Indicador visual */}
        <div className="flex items-center justify-center gap-2 text-white/80 text-xs">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>Usa el botón flotante para seleccionar</span>
        </div>
      </div>
    </div>
  );
};
