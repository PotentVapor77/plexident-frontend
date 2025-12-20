
import type { IPaciente } from "../../../types/patient/IPatient";
import type { BadgeColor } from "../../ui/badge/Badge";
import Badge from "../../ui/badge/Badge";
import { Modal } from "../../ui/modal";

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

  const getStatusText = (status: boolean): string =>
    status ? "Activo" : "Inactivo";

  const getStatusColor = (status: boolean): BadgeColor =>
    status ? "success" : "error";

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
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
      className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-theme-xl bg-white dark:bg-gray-900"
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-light-100 bg-blue-light-25 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-sm">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.314 0-6 2.239-6 5v1h12v-1c0-2.761-2.686-5-6-5z"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
                Perfil del Paciente
              </h2>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                Historia Clínica · Información General
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge size="sm" color={getStatusColor(paciente.activo)}>
              {getStatusText(paciente.activo)}
            </Badge>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-400 hover:bg-blue-light-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cabecera principal */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-light-50 text-brand-700 dark:bg-blue-light-900/40 dark:text-blue-light-100 flex items-center justify-center text-lg font-semibold shadow-theme-sm">
              {initials || "P"}
            </div>
            <div>
              <p className="text-theme-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Paciente
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {getFullName()}
              </p>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-1">
                CI/Pasaporte: {paciente.cedula_pasaporte}
              </p>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="flex flex-col gap-2 text-theme-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Teléfono</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {paciente.telefono || "No registrado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Correo</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px] text-right">
                {paciente.correo || "No registrado"}
              </span>
            </div>
          </div>

          {/* Fechas */}
          <div className="flex flex-col gap-2 text-theme-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Fecha de nacimiento
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(paciente.fecha_nacimiento)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Registrado</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(paciente.fecha_creacion)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-6 py-5 bg-gray-50 dark:bg-gray-dark">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Información del Paciente */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              Información General
            </h3>
            <dl className="space-y-2 text-theme-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Sexo</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {getSexoLabel()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Edad</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {paciente.edad} {getCondicionEdadLabel()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Embarazo</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {getEmbarazoText()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Dirección</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {paciente.direccion || "No registrada"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Contacto de emergencia */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              Contacto de Emergencia
            </h3>
            <dl className="space-y-2 text-theme-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Nombre</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {paciente.contacto_emergencia_nombre || "No registrado"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Teléfono</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {paciente.contacto_emergencia_telefono || "No registrado"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Datos clínicos */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4 lg:col-span-2">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              Información Clínica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-theme-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Motivo de consulta
                </dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {paciente.motivo_consulta || "No registrado"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">
                  Enfermedad actual
                </dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {paciente.enfermedad_actual || "No registrada"}
                </dd>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cerrar
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Editar Paciente
          </button>
        )}
      </div>
    </Modal>
  );
}
