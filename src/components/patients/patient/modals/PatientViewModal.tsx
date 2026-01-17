// src/components/patients/patient/modals/PacienteViewModal.tsx

import type { IPaciente } from "../../../../types/patient/IPatient";
import { Modal } from "../../../ui/modal";

interface PacienteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: IPaciente | null;
  onEdit?: () => void;
}

export function PacienteViewModal({
  isOpen,
  onClose,
  paciente,
  onEdit,
}: PacienteViewModalProps) {
  if (!isOpen || !paciente) return null;

  const getFullName = (): string =>
    `${paciente.apellidos}, ${paciente.nombres}`;

  const formatDate = (dateString?: string): string => {
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

  const formatDateTime = (dateString?: string): string => {
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

  const initials = `${paciente.nombres?.[0] ?? ""}${
    paciente.apellidos?.[0] ?? ""
  }`.toUpperCase();

  const getCondicionEdadLabel = (): string => {
    switch (paciente.condicion_edad) {
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
    paciente.sexo === "M" ? "Masculino" : "Femenino";

  const getEmbarazoText = (): string => {
    if (paciente.sexo === "M") return "No aplica";
    if (paciente.embarazada === "SI") return "Embarazada";
    if (paciente.embarazada === "NO") return "No embarazada";
    return "No especificado";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
            Perfil del Paciente
          </h5>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Información detallada del paciente
            </p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              paciente.activo 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {paciente.activo ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información Principal del Paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-2xl font-semibold shadow-lg flex-shrink-0">
                {initials || "P"}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre completo</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getFullName()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    CI/Pasaporte: <span className="font-medium text-gray-900 dark:text-white">{paciente.cedula_pasaporte}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de nacimiento</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(paciente.fecha_nacimiento)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de registro</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(paciente.fecha_creacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información Personal
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Sexo
                </p>
                <p className="text-gray-900 dark:text-white">{getSexoLabel()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Edad
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paciente.edad} {getCondicionEdadLabel()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Estado de embarazo
                </p>
                <p className="text-gray-900 dark:text-white">{getEmbarazoText()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Dirección
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paciente.direccion || "No registrada"}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información de Contacto
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Teléfono
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paciente.telefono || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Correo electrónico
                </p>
                <p className="text-gray-900 dark:text-white break-all">
                  {paciente.correo || "No registrado"}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🚨 Contacto de Emergencia
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Nombre del contacto
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paciente.contacto_emergencia_nombre || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Teléfono de emergencia
                </p>
                <p className="text-gray-900 dark:text-white">
                  {paciente.contacto_emergencia_telefono || "No registrado"}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>{formatDateTime(paciente.fecha_creacion)}</p>
              </div>
              <div>
                <p className="font-medium">Última modificación:</p>
                <p>{formatDateTime(paciente.fecha_modificacion)}</p>
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
              Editar Paciente
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}
