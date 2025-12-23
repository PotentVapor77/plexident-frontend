// src/components/odontogram/patient/PacienteInfoPanel.tsx
import React from "react";
import { X, User, Calendar, Phone, MapPin, CreditCard } from "lucide-react";
import type { IPaciente } from "../../../types/patient/IPatient";

interface Props {
  paciente: IPaciente;
  onRemovePaciente?: () => void;
  // control externo del tamaño
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const PacienteInfoPanel: React.FC<Props> = ({
  paciente,
  onRemovePaciente,
  collapsed,
  onToggleCollapsed,
}) => {
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Usar `collapsed` controlado si viene de fuera, si no,
  // comportarse como antes (control interno)
  const isMinimized = collapsed ?? false;

  if (isMinimized) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-shadow">
        <button
          onClick={onToggleCollapsed ?? (() => {})}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          <User className="w-4 h-4" />
          {paciente.nombres} {paciente.apellidos}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {paciente.nombres} {paciente.apellidos}
              </h3>
              <p className="text-sm text-blue-100">Paciente Activo</p>
            </div>
          </div>
          <button
            onClick={onToggleCollapsed ?? (() => {})}
            className="text-white/80 hover:text-white transition-colors"
            title="Minimizar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Cédula */}
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Cédula</p>
            <p className="text-sm text-gray-900">{paciente.cedula_pasaporte}</p>
          </div>
        </div>

        {/* Edad y Fecha de Nacimiento */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Edad</p>
            <p className="text-sm text-gray-900">
              {calcularEdad(paciente.fecha_nacimiento)} años
            </p>
            <p className="text-xs text-gray-400">
              {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Teléfono */}
        {paciente.telefono && (
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Teléfono</p>
              <p className="text-sm text-gray-900">{paciente.telefono}</p>
            </div>
          </div>
        )}

        {/* Dirección */}
        {paciente.direccion && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Dirección</p>
              <p className="text-sm text-gray-900">{paciente.direccion}</p>
            </div>
          </div>
        )}

        {/* Sexo */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Sexo</p>
            <p className="text-sm text-gray-900">
              {paciente.sexo === "M" ? "Masculino" : "Femenino"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer con botón de remover (si se proporciona la callback) */}
      {onRemovePaciente && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <button
            onClick={onRemovePaciente}
            className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cambiar Paciente
          </button>
        </div>
      )}
    </div>
  );
};
