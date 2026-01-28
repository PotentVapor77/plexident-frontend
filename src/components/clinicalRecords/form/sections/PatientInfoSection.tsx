// src/components/clinicalRecord/form/sections/PatientInfoSection.tsx
import React from "react";
import { User, Calendar, Phone, Mail, MapPin, Stethoscope, FileText, AlertCircle } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../../types/patient/IPatient";
import type { IUser } from "../../../../types/user/IUser";
import { getSexoLabel } from "../../../../types/patient/IPatient";

interface PatientInfoSectionProps {
  formData: ClinicalRecordFormData;
  updateField: <K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => void;
  selectedPaciente: IPaciente | null;
  selectedOdontologo: IUser | null;
  mode: "create" | "edit";
  validationErrors: Record<string, string>;
}

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({
  formData,
  updateField,
  selectedPaciente,
  selectedOdontologo,
  mode,
  validationErrors,
}) => {
  // Helper para formatear fecha
  const formatFecha = (fechaString?: string) => {
    if (!fechaString) return "No registrada";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fechaString;
    }
  };

  // Helper para edad completa
  const getEdadCompleta = (paciente: IPaciente) => {
    const { edad, condicion_edad } = paciente;
    if (!condicion_edad || condicion_edad === 'A') return `${edad} años`;
    
    const labels: Record<string, string> = {
      H: 'horas',
      D: 'días',
      M: 'meses',
      A: 'años'
    };
    return `${edad} ${labels[condicion_edad] || condicion_edad}`;
  };

  // Determinar color del estado del historial
  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      BORRADOR: "bg-amber-100 text-amber-800 border-amber-200",
      ABIERTO: "bg-emerald-100 text-emerald-800 border-emerald-200",
      CERRADO: "bg-slate-100 text-slate-800 border-slate-200"
    };
    return colors[estado] || colors.BORRADOR;
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header de la sección */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              B. Información del Paciente y Responsable
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Datos del paciente y odontólogo responsable para el historial clínico
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sección del Paciente */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Datos del Paciente
            </h4>
          </div>

          {selectedPaciente ? (
            <div className="bg-blue-50/30 border border-blue-100 rounded-lg p-4">
              {/* Header del paciente */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                <div>
                  <h5 className="text-lg font-bold text-slate-800">
                    {selectedPaciente.nombres} {selectedPaciente.apellidos}
                  </h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <User className="h-3 w-3" />
                      {getSexoLabel(selectedPaciente.sexo)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="h-3 w-3" />
                      {getEdadCompleta(selectedPaciente)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedPaciente.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                
                {/* ID del paciente */}
                <div className="mt-2 md:mt-0">
                  <div className="text-sm font-mono font-medium text-slate-700 bg-white px-3 py-1 rounded border border-slate-200">
                    ID: {selectedPaciente.id.substring(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Grid de información del paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Identificación</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedPaciente.cedula_pasaporte || "No registrada"}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Fecha de Nacimiento</p>
                    <p className="text-sm font-medium text-slate-800">
                      {formatFecha(selectedPaciente.fecha_nacimiento)}
                    </p>
                  </div>
                </div>

                {/* Columna derecha - Contacto */}
                <div className="space-y-3">
                  {selectedPaciente.telefono && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded border border-slate-100">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Teléfono</p>
                        <p className="text-sm font-medium text-slate-800">{selectedPaciente.telefono}</p>
                      </div>
                    </div>
                  )}

                  {selectedPaciente.correo && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded border border-slate-100">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Correo Electrónico</p>
                        <p className="text-sm font-medium text-slate-800">{selectedPaciente.correo}</p>
                      </div>
                    </div>
                  )}

                  {selectedPaciente.direccion && mode === "edit" && (
                    <div className="flex items-start gap-2 p-3 bg-white rounded border border-slate-100">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Dirección</p>
                        <p className="text-sm font-medium text-slate-800">{selectedPaciente.direccion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de emergencia (solo en modo edición) */}
              {mode === "edit" && (selectedPaciente.contacto_emergencia_nombre || selectedPaciente.contacto_emergencia_telefono) && (
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-medium text-slate-700">Contacto de Emergencia</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPaciente.contacto_emergencia_nombre && (
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <p className="text-xs text-slate-500">Nombre</p>
                        <p className="text-sm font-medium text-slate-800">
                          {selectedPaciente.contacto_emergencia_nombre}
                        </p>
                      </div>
                    )}
                    {selectedPaciente.contacto_emergencia_telefono && (
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="text-sm font-medium text-slate-800">
                          {selectedPaciente.contacto_emergencia_telefono}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                No se ha seleccionado ningún paciente
              </p>
            </div>
          )}
        </div>

        {/* Sección del Odontólogo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Odontólogo Responsable
            </h4>
          </div>

          {selectedOdontologo ? (
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <Stethoscope className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-slate-800">
                      {selectedOdontologo.nombres} {selectedOdontologo.apellidos}
                    </h5>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium">Usuario:</span> {selectedOdontologo.username}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm font-mono font-medium text-slate-700 bg-white px-3 py-1 rounded border border-slate-200">
                  ID: {selectedOdontologo.id.substring(0, 8)}...
                </div>
              </div>

              {/* Información de contacto del odontólogo */}
              {selectedOdontologo.correo && (
                <div className="mt-4 pt-4 border-t border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Correo Profesional</p>
                      <p className="text-sm font-medium text-slate-800">{selectedOdontologo.correo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-sm text-slate-500 italic">
                No se ha asignado un odontólogo responsable
              </p>
            </div>
          )}
        </div>

        {/* Estado del Historial y Embarazo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado del Historial */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500"></div>
              <label className="text-sm font-medium text-slate-700">
                Estado del Historial
              </label>
            </div>
            
            <div className={`px-4 py-3 border rounded-lg ${getEstadoColor(formData.estado)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium capitalize">
                    {formData.estado === "BORRADOR" && "Borrador"}
                    {formData.estado === "ABIERTO" && "Abierto"}
                    {formData.estado === "CERRADO" && "Cerrado"}
                  </span>
                </div>
                <select
                  value={formData.estado || "BORRADOR"}
                  onChange={(e) =>
                    updateField("estado", e.target.value as "BORRADOR" | "ABIERTO" | "CERRADO")
                  }
                  className={`text-sm px-2 py-1 rounded border bg-white/50 ${validationErrors.estado ? "border-red-300" : "border-slate-200"}`}
                >
                  <option value="BORRADOR">Borrador</option>
                  <option value="ABIERTO">Abierto</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {formData.estado === "BORRADOR" && "📝 El historial está en edición y puede ser modificado"}
                {formData.estado === "ABIERTO" && "✅ El historial está activo y disponible para consulta"}
                {formData.estado === "CERRADO" && "🔒 El historial ha sido finalizado y archivado"}
              </p>
            </div>
          </div>

          {/* Estado de embarazo (solo mujeres) */}
          {selectedPaciente?.sexo === "F" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <label className="text-sm font-medium text-slate-700">
                  Estado de Embarazo
                </label>
              </div>
              
              <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="embarazada"
                      value="SI"
                      checked={formData.embarazada === "SI"}
                      onChange={(e) => updateField("embarazada", e.target.value as "SI" | "NO")}
                      className="h-4 w-4 text-rose-600 border-rose-300"
                    />
                    <span className="text-sm font-medium text-slate-800">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="embarazada"
                      value="NO"
                      checked={formData.embarazada === "NO"}
                      onChange={(e) => updateField("embarazada", e.target.value as "SI" | "NO")}
                      className="h-4 w-4 text-rose-600 border-rose-300"
                    />
                    <span className="text-sm font-medium text-slate-800">No</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Esta información es crucial para procedimientos médicos seguros
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatientInfoSection;