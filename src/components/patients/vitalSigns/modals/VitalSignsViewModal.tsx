// src/components/vitalSigns/modals/VitalSignsViewModal.tsx

import { Modal } from "../../../ui/modal";
import type { IVitalSigns, IPacienteBasico } from "../../../../types/vitalSigns/IVitalSigns";
import { usePaciente } from "../../../../hooks/patient/usePatients";

interface VitalSignsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vital: IVitalSigns | null;
  onEdit?: () => void;
}

export function VitalSignsViewModal({
  isOpen,
  onClose,
  vital,
  onEdit,
}: VitalSignsViewModalProps) {
  const getPatientId = (): string => {
    if (!vital?.paciente) return "";
    if (typeof vital.paciente === "string") return vital.paciente;
    return (vital.paciente as IPacienteBasico).id || "";
  };

  const patientId = getPatientId();
  const { data: pacienteData, isLoading: isLoadingPaciente } = usePaciente(patientId);

  if (!isOpen || !vital) return null;

  const getStatusText = (status: boolean): string =>
    status ? "Activo" : "Inactivo";

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getPacienteInfo = () => {
    if (pacienteData) {
      const nombres = pacienteData.nombres || "";
      const apellidos = pacienteData.apellidos || "";
      const cedula = pacienteData.cedula_pasaporte || "";
      const nombreCompleto =
        [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";
      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";
      
      const getCondicionEdadLabel = (): string => {
        switch (pacienteData.condicion_edad) {
          case "H":
            return "horas";
          case "D":
            return "días";
          case "M":
            return "meses";
          case "A":
            return "años";
          default:
            return "";
        }
      };
      
      const getSexoLabel = (): string =>
        pacienteData.sexo === "M" ? "Masculino" : "Femenino";
      
      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales,
        sexo: getSexoLabel(),
        edad: `${pacienteData.edad || "N/A"} ${getCondicionEdadLabel()}`,
        fechaNacimiento: pacienteData.fecha_nacimiento,
        direccion: pacienteData.direccion || "No registrada",
        telefono: pacienteData.telefono || "No registrado",
        correo: pacienteData.correo || "No registrado",
      };
    }


    if (isLoadingPaciente) {
      return {
        nombre: "Cargando...",
        cedula: patientId || "No especificado",
        iniciales: "C",
        sexo: "Cargando...",
        edad: "Cargando...",
        fechaNacimiento: undefined,
        direccion: "Cargando...",
        telefono: "Cargando...",
        correo: "Cargando...",
      };
    }

    return {
      nombre: "Paciente no especificado",
      cedula: patientId || "No especificado",
      iniciales: "P",
      sexo: "No especificado",
      edad: "No especificada",
      fechaNacimiento: undefined,
      direccion: "No registrada",
      telefono: "No registrado",
      correo: "No registrado",
    };
  };

  const pacienteInfo = getPacienteInfo();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
            Detalle de Signos Vitales
          </h5>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Registro clínico de constantes vitales
            </p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              vital.activo 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {getStatusText(vital.activo)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del Paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-2xl font-semibold shadow-lg flex-shrink-0">
                {pacienteInfo.iniciales || "P"}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteInfo.nombre}
                    {isLoadingPaciente && (
                      <span className="ml-2 text-sm font-normal text-gray-500">(cargando...)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    CI/Pasaporte: <span className="font-medium text-gray-900 dark:text-white">{pacienteInfo.cedula}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de consulta</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(vital.fecha_consulta)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de registro</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(vital.fecha_creacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Badge de paciente fijado */}
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 shadow-sm">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Paciente fijado activamente
              </span>
            </div>
          </div>
          {/* Signos Vitales */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🩺 Signos Vitales
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Temperatura
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      T
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vital.temperatura !== null && vital.temperatura !== undefined
                          ? `${vital.temperatura}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">°C</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    Pulso
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      P
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vital.pulso !== null && vital.pulso !== undefined
                          ? `${vital.pulso}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">lpm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    Frecuencia respiratoria
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      F
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vital.frecuencia_respiratoria !== null && vital.frecuencia_respiratoria !== undefined
                          ? `${vital.frecuencia_respiratoria}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">rpm</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                    Presión arterial
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600 dark:bg-red-700 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      PA
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {vital.presion_arterial || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">mmHg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Consulta */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📋 Información de la Consulta
              </h3>
            </div>
            <div className="space-y-4">
              {vital.motivo_consulta && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Motivo de Consulta
                  </p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {vital.motivo_consulta}
                  </p>
                </div>
              )}

              {vital.enfermedad_actual && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Enfermedad Actual
                  </p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {vital.enfermedad_actual}
                  </p>
                </div>
              )}

              {vital.observaciones && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Observaciones
                  </p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {vital.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>{formatDateTime(vital.fecha_creacion)}</p>
              </div>
              <div>
                <p className="font-medium">Última modificación:</p>
                <p>{formatDateTime(vital.fecha_modificacion || vital.fecha_creacion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar Signos Vitales
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}
