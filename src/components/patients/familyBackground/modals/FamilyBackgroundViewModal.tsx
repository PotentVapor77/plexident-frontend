// src/components/familyBackground/modals/FamilyBackgroundViewModal.tsx

import Badge from "../../../ui/badge/Badge";
import type { BadgeColor } from "../../../ui/badge/Badge";
import { Modal } from "../../../ui/modal";
import {
  getFamiliarMemberLabel,
  contarAntecedentesActivos,
  tieneAntecedentesCriticos,
  type IFamilyBackground,
} from "../../../../types/familyBackground/IFamilyBackground";
import { usePaciente } from "../../../../hooks/patient/usePatients";
import type { IPacienteBasico } from "../../../../types/personalBackground/IPersonalBackground";

interface FamilyBackgroundViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  background: IFamilyBackground | null;
  onEdit?: () => void;
}

export function FamilyBackgroundViewModal({
  isOpen,
  onClose,
  background,
  onEdit,
}: FamilyBackgroundViewModalProps) {
  // ✅ HOOK MOVIDO ANTES DEL EARLY RETURN
  const getPatientId = (): string => {
    if (!background?.paciente) return "";
    if (typeof background.paciente === "string") return background.paciente;
    return background.paciente.id || "";
  };

  const patientId = getPatientId();
  const { data: pacienteData, isLoading: isLoadingPaciente } = usePaciente(patientId);

  // ✅ EARLY RETURN DESPUÉS DE TODOS LOS HOOKS
  if (!isOpen || !background) return null;

  const getStatusText = (status: boolean): string => (status ? "Activo" : "Inactivo");
  const getStatusColor = (status: boolean): BadgeColor => (status ? "success" : "error");

  const formatDate = (dateString?: string): string => {
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

  // 🔍 FUNCIÓN MEJORADA - Solo muestra antecedentes SI hay datos relevantes
  const getPacienteInfo = () => {
    // Si tenemos datos del paciente desde el hook
    if (pacienteData) {
      const nombres = pacienteData.nombres || "";
      const apellidos = pacienteData.apellidos || "";
      const cedula = pacienteData.cedula_pasaporte || "";

      const nombreCompleto = [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";

      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";

      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales: iniciales,
      };
    }

    // Si el paciente viene como objeto en el background
    if (typeof background.paciente === "object" && background.paciente !== null) {
      const pacienteObj = background.paciente as IPacienteBasico;
      const nombres = pacienteObj.nombres || "";
      const apellidos = pacienteObj.apellidos || "";
      const cedula = pacienteObj.cedula_pasaporte || "";

      const nombreCompleto = [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";

      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";

      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales: iniciales,
      };
    }

    // Si el paciente es un string (ID) y está cargando
    if (isLoadingPaciente) {
      return {
        nombre: "Cargando...",
        cedula: patientId || "No especificado",
        iniciales: "C",
      };
    }

    // Caso por defecto
    return {
      nombre: "Paciente no especificado",
      cedula: patientId || "No especificado",
      iniciales: "P",
    };
  };

  const pacienteInfo = getPacienteInfo();
  const totalAntecedentes = contarAntecedentesActivos(background);
  const tieneCriticos = tieneAntecedentesCriticos(background);

  // ✅ SOLUCIÓN: Solo lista antecedentes que NO son "NO" o "No hay"
  const getAntecedentesActivos = (): string[] => {
    const lista: string[] = [];

    // Solo agrega si NO es "NO"
    if (background.cardiopatia_familiar !== "NO") {
      lista.push(`Cardiopatía: ${getFamiliarMemberLabel(background.cardiopatia_familiar)}`);
    }

    if (background.hipertension_arterial_familiar !== "NO") {
      lista.push(`Hipertensión Arterial: ${getFamiliarMemberLabel(background.hipertension_arterial_familiar)}`);
    }

    if (background.enfermedad_vascular_familiar !== "NO") {
      lista.push(`Enfermedad Vascular: ${getFamiliarMemberLabel(background.enfermedad_vascular_familiar)}`);
    }

    if (background.cancer_familiar !== "NO") {
      lista.push(`Cáncer: ${getFamiliarMemberLabel(background.cancer_familiar)}`);
    }

    if (background.enfermedad_mental_familiar !== "NO") {
      lista.push(`Enfermedad Mental: ${getFamiliarMemberLabel(background.enfermedad_mental_familiar)}`);
    }

    // Otros antecedentes solo si existen
     if (
    background.otros_antecedentes_familiares && 
    background.otros_antecedentes_familiares !== "NO" && 
    background.otros_antecedentes_familiares !== "No" && 
    background.otros_antecedentes_familiares !== "no" && 
    background.otros_antecedentes_familiares.trim()
  ) {
    lista.push(`Otros: ${background.otros_antecedentes_familiares}`);
  }

    return lista;
  };

  const listaAntecedentes = getAntecedentesActivos();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Perfil de Antecedentes Familiares
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Historia Clínica · Información Familiar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge size="sm" color={getStatusColor(background.activo)}>
            {getStatusText(background.activo)}
          </Badge>
          {tieneCriticos && (
            <Badge size="sm" color="error">
              Crítico
            </Badge>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200 hover:rotate-90 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Paciente Info Card */}
      <div className="px-6 py-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/50">
            {pacienteInfo.iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-1.5">
              PACIENTE
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {pacienteInfo.nombre}
              {isLoadingPaciente && (
                <span className="ml-2 text-sm text-gray-500">(cargando...)</span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              CI/Pasaporte: <span className="font-semibold">{pacienteInfo.cedula}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total antecedentes</span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAntecedentes}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fecha de registro</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(background.fecha_creacion)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estado crítico</span>
              <p className={`text-lg font-bold ${tieneCriticos ? "text-red-600 dark:text-red-500" : "text-green-600 dark:text-green-500"}`}>
                {tieneCriticos ? "Sí" : "No"}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Modificado</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(background.fecha_modificacion || background.fecha_creacion)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        {/* Resumen de Antecedentes - SOLO si hay antecedentes */}
        {listaAntecedentes.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
              Resumen de Antecedentes Activos
            </h3>
            <div className="space-y-2.5">
              {listaAntecedentes.map((ant, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                  <span className="flex-1">{ant}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Grid de secciones detalladas - SIEMPRE muestra, pero con "No hay" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoSection title="Enfermedades Cardiovasculares" icon="❤️">
            <InfoField
              label="Cardiopatía"
              value={background.cardiopatia_familiar === "NO" ? "No hay antecedentes" : getFamiliarMemberLabel(background.cardiopatia_familiar)}
            />
            <InfoField
              label="Hipertensión Arterial"
              value={background.hipertension_arterial_familiar === "NO" ? "No hay antecedentes" : getFamiliarMemberLabel(background.hipertension_arterial_familiar)}
            />
            <InfoField
              label="Enfermedad Vascular"
              value={background.enfermedad_vascular_familiar === "NO" ? "No hay antecedentes" : getFamiliarMemberLabel(background.enfermedad_vascular_familiar)}
            />
          </InfoSection>

          <InfoSection title="Condiciones Oncológicas y Mentales" icon="🧠">
            <InfoField
              label="Cáncer"
              value={background.cancer_familiar === "NO" ? "No hay antecedentes" : getFamiliarMemberLabel(background.cancer_familiar)}
            />
            <InfoField
              label="Enfermedad Mental"
              value={background.enfermedad_mental_familiar === "NO" ? "No hay antecedentes" : getFamiliarMemberLabel(background.enfermedad_mental_familiar)}
            />
          </InfoSection>
        </div>

        {/* Otros antecedentes si existen */}
        {background.otros_antecedentes_familiares?.trim() && (
          <InfoSection title="Otros Antecedentes" icon="📋">
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              {background.otros_antecedentes_familiares}
            </div>
          </InfoSection>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow"
        >
          Cerrar
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Editar Antecedentes
          </button>
        )}
      </div>
    </Modal>
  );
}

// ✅ Componentes auxiliares
const InfoSection: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: string;
}> = ({ title, children, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-gray-600">
    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      <span>{title}</span>
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoField: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="group">
    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-gray-600 transition-colors duration-200">
      {value}
    </dd>
  </div>
);
