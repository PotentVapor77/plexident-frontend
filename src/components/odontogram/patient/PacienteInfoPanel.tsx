// src/components/odontogram/patient/PacienteInfoPanel.tsx
import React from "react";
import { X, User, Calendar, Phone, MapPin, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import type { IPaciente } from "../../../types/patient/IPatient";
import Button from "../../ui/button/Button";

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
      <div className="mt-0.5 p-1.5 rounded-md bg-gray-50 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-400">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white/90">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3 hover:shadow-md transition-all duration-300 inline-block">
        <button
          onClick={onToggleCollapsed}
          className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
            <User className="h-4 w-4" />
          </div>
          <span className="whitespace-nowrap">{paciente.nombres} {paciente.apellidos}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-brand-500 p-5 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 -left-4 w-12 h-12 bg-brand-400/20 rounded-full blur-xl" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
              <User className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-white text-lg">
                {paciente.nombres}
                <span className="block font-medium text-white/80">{paciente.apellidos}</span>
              </h3>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-semibold text-green-100">
                Paciente Activo
              </div>
            </div>
          </div>
          
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Minimizar"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Información del paciente */}
      <div className="p-6 space-y-5 bg-white dark:bg-gray-900">
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
          <InfoItem icon={Phone} label="Contacto" value={paciente.telefono} />
        )}

        {paciente.direccion && (
          <InfoItem icon={MapPin} label="Residencia" value={paciente.direccion} />
        )}
      </div>

      {/* Footer con botón de acción */}
      {onRemovePaciente && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onRemovePaciente}
            className="w-full inline-flex items-center justify-center gap-2"
            size="sm"
          >
            <X className="h-4 w-4" />
            Cambiar Paciente
          </Button>
        </div>
      )}
    </div>
  );
};