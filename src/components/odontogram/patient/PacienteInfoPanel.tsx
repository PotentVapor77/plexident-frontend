// src/components/odontogram/patient/PacienteInfoPanel.tsx
import React from "react";
import { X, User, Calendar, Phone, MapPin, CreditCard, ChevronDown, ChevronUp, Users, AlertCircle } from "lucide-react";
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

  const InfoItem = ({ icon: Icon, label, value, subValue, urgent = false }: any) => (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 p-1.5 rounded-md ${
        urgent ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium uppercase tracking-wide ${
          urgent ? 'text-amber-700' : 'text-gray-500'
        }`}>
          {label}
        </span>
        <span className={`text-sm font-semibold ${
          urgent ? 'text-amber-900' : 'text-gray-900'
        }`}>
          {value}
        </span>
        {subValue && (
          <span className={`text-xs ${
            urgent ? 'text-amber-600/80' : 'text-gray-500'
          }`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-theme-sm p-2">
        <button
          onClick={onToggleCollapsed}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors w-full"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 border border-brand-100">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="flex-1 text-left truncate">{paciente.nombres} {paciente.apellidos}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    );
  }

  // Verificar si hay información de emergencia
  const hasEmergencyInfo = paciente.contacto_emergencia_nombre || paciente.contacto_emergencia_telefono;

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-theme-sm overflow-hidden">
      {/* Header minimalista */}
      <div className="border-b border-gray-200 px-5 py-4 bg-gray-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {paciente.nombres} {paciente.apellidos}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600">Paciente Activo</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">ID: {paciente.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onToggleCollapsed}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Minimizar panel"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Información del paciente en grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información básica - tonos neutros */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Identificación
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white rounded border border-gray-100">
              <p className="text-sm text-gray-900 font-medium">
                {paciente.cedula_pasaporte}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Edad
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white rounded border border-gray-100">
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-gray-900">
                  {calcularEdad(paciente.fecha_nacimiento)}
                </p>
                <span className="text-xs text-gray-500">años</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Fecha Nacimiento
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white rounded border border-gray-100">
              <p className="text-sm text-gray-900">
                {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-ES", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>
          </div>

          {paciente.telefono && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Teléfono
                </span>
              </div>
              <div className="px-2 py-1.5 bg-white rounded border border-gray-100">
                <p className="text-sm text-gray-900 font-medium">
                  {paciente.telefono}
                </p>
              </div>
            </div>
          )}

          {paciente.direccion && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Dirección
                </span>
              </div>
              <div className="px-2 py-1.5 bg-white rounded border border-gray-100">
                <p className="text-sm text-gray-900">
                  {paciente.direccion}
                </p>
              </div>
            </div>
          )}

          {/* Información de emergencia - destacada con color ámbar */}
          {hasEmergencyInfo && (
            <>
              <div className="col-span-2 mt-2 mb-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Contacto de Emergencia
                  </span>
                  <div className="flex-1 h-px bg-amber-200"></div>
                </div>
              </div>

              {paciente.contacto_emergencia_nombre && (
                <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Nombre Contacto
                    </span>
                  </div>
                  <div className="px-2 py-1.5 bg-white rounded border border-amber-100">
                    <p className="text-sm text-amber-900 font-medium">
                      {paciente.contacto_emergencia_nombre}
                    </p>
                  </div>
                </div>
              )}

              {paciente.contacto_emergencia_telefono && (
                <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Teléfono Emergencia
                    </span>
                  </div>
                  <div className="px-2 py-1.5 bg-white rounded border border-amber-100">
                    <p className="text-sm text-amber-900 font-medium">
                      {paciente.contacto_emergencia_telefono}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer con botón de acción */}
      {onRemovePaciente && (
        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/50">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onRemovePaciente}
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cambiar Paciente
            </Button>
          </div>
        </div>
      )}

      {/* Pie de sección */}
      <div className="border-t border-gray-200 px-5 py-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
            <p className="text-xs text-gray-500">
              Información personal del paciente
            </p>
          </div>
          {hasEmergencyInfo && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              <span className="text-xs text-amber-600">Contacto emergencia disponible</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};