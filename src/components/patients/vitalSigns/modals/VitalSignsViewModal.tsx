// src/components/vitalSigns/modals/VitalSignsViewModal.tsx

import { Modal } from "../../../ui/modal";
import Badge from "../../../ui/badge/Badge";
import type { BadgeColor } from "../../../ui/badge/Badge";
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
  const getStatusColor = (status: boolean): BadgeColor =>
    status ? "success" : "error";

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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
      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales,
      };
    }

    if (typeof vital.paciente === "object" && vital.paciente !== null) {
      const pacienteObj = vital.paciente as IPacienteBasico;
      const nombres = pacienteObj.nombres || "";
      const apellidos = pacienteObj.apellidos || "";
      const cedula = pacienteObj.cedula_pasaporte || "";
      const nombreCompleto =
        [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";
      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";
      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales,
      };
    }

    if (isLoadingPaciente) {
      return {
        nombre: "Cargando...",
        cedula: patientId || "No especificado",
        iniciales: "C",
      };
    }

    return {
      nombre: "Paciente no especificado",
      cedula: patientId || "No especificado",
      iniciales: "P",
    };
  };

  const pacienteInfo = getPacienteInfo();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl overflow-hidden rounded-2xl bg-white p-0 shadow-xl dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-6 py-5 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12h3l3 8 4-16 3 8h5"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Detalle de signos vitales
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Registro clínico de constantes vitales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge size="sm" color={getStatusColor(vital.activo)}>
            {getStatusText(vital.activo)}
          </Badge>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:rotate-90 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Paciente info */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6 py-6 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/50">
            {pacienteInfo.iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Paciente
            </p>
            <h3 className="truncate text-xl font-bold text-gray-900 dark:text-white">
              {pacienteInfo.nombre}
              {isLoadingPaciente && (
                <span className="ml-2 text-sm text-gray-500">(cargando...)</span>
              )}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              CI/Pasaporte:{" "}
              <span className="font-semibold">{pacienteInfo.cedula}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Fecha de registro
              </span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(vital.fecha_creacion)}
              </p>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Última modificación
              </span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(vital.fecha_modificacion || vital.fecha_creacion)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body - 2 columnas: 2 izquierda, 2 derecha */}
      <div className="max-h-[60vh] space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6 dark:from-gray-900 dark:to-gray-900">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Izquierda: Temperatura + Pulso */}
          <InfoSection title="Valores principales" icon="🩺">
            <InfoField
              label="Temperatura"
              value={
                vital.temperatura !== null && vital.temperatura !== undefined
                  ? `${vital.temperatura} °C`
                  : "No registrada"
              }
            />
            <InfoField
              label="Pulso"
              value={
                vital.pulso !== null && vital.pulso !== undefined
                  ? `${vital.pulso} lpm`
                  : "No registrado"
              }
            />
          </InfoSection>

          {/* Derecha: FR + PA */}
          <InfoSection title="Valores respiratorios" icon="🫁">
            <InfoField
              label="Frecuencia respiratoria"
              value={
                vital.frecuencia_respiratoria !== null &&
                vital.frecuencia_respiratoria !== undefined
                  ? `${vital.frecuencia_respiratoria} rpm`
                  : "No registrada"
              }
            />
            <InfoField
              label="Presión arterial"
              value={vital.presion_arterial || "No registrada"}
            />
          </InfoSection>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 px-6 py-4 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
        >
          Cerrar
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            Editar signos vitales
          </button>
        )}
      </div>
    </Modal>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, children, icon }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
    <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
      {icon && <span className="text-lg">{icon}</span>}
      <span>{title}</span>
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="group">
    <dt className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </dt>
    <dd className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:border-blue-200 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:group-hover:border-gray-600">
      {value}
    </dd>
  </div>
);
