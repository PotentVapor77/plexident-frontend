// src/components/odontogram/patient/PacienteInfoPanel.tsx
import React from "react";
import { X, User, Calendar, Phone, MapPin, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import type { IPaciente } from "../../../types/patient/IPatient";

interface Props {
  paciente: IPaciente;
  onRemovePaciente?: () => void;
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

  const isMinimized = collapsed ?? false;

  // Estilo común para los contenedores de datos
  const InfoItem = ({ icon: Icon, label, value, subValue }: any) => (
    <div className="flex items-start gap-3 group">
      <div className="mt-0.5 p-1.5 rounded-md bg-gray-50 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors duration-200 dark:bg-gray-800">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {label}
        </span>
        <span className="text-theme-sm font-medium text-gray-900 dark:text-white/90">
          {value}
        </span>
        {subValue && (
          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-theme-sm border border-gray-200 dark:border-gray-800 p-2 hover:shadow-theme-md transition-all duration-300 w-auto inline-block">
        <button
          onClick={onToggleCollapsed}
          className="flex items-center gap-3 px-2 py-1 text-theme-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
            <User className="w-4 h-4" />
          </div>
          <span className="whitespace-nowrap">{paciente.nombres} {paciente.apellidos}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-dark rounded-2xl shadow-theme-lg border border-gray-200 dark:border-gray-800 w-80 overflow-hidden animate-slide-down">
      {/* Header con gradiente de marca */}
      <div className="relative bg-brand-500 p-5 overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 -left-4 w-16 h-16 bg-brand-400/20 rounded-full blur-xl" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 text-white">
              <User className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-white text-lg leading-tight tracking-tight">
                {paciente.nombres}
                <span className="block font-medium text-white/80">{paciente.apellidos}</span>
              </h3>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-success-500/20 border border-success-500/30 text-[10px] font-bold text-success-100 uppercase tracking-wide">
                Paciente Activo
              </div>
            </div>
          </div>
          
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Minimizar"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="p-6 space-y-5 bg-white dark:bg-gray-dark">
        <InfoItem 
          icon={CreditCard} 
          label="Identificación" 
          value={paciente.cedula_pasaporte} 
        />
        
        <InfoItem 
          icon={Calendar} 
          label="Edad y Nacimiento" 
          value={`${calcularEdad(paciente.fecha_nacimiento)} años`}
          subValue={new Date(paciente.fecha_nacimiento).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
          })}
        />

        {(paciente.telefono || paciente.direccion) && <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />}

        {paciente.telefono && (
          <InfoItem icon={Phone} label="Contacto Directo" value={paciente.telefono} />
        )}

        {paciente.direccion && (
          <InfoItem icon={MapPin} label="Residencia" value={paciente.direccion} />
        )}
      </div>

      {/* Action Footer */}
      {onRemovePaciente && (
        <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onRemovePaciente}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-error-25 dark:hover:bg-error-500/10 text-gray-600 dark:text-gray-400 hover:text-error-600 dark:hover:text-error-400 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-error-200 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Cambiar Paciente
          </button>
        </div>
      )}
    </div>
  );
};