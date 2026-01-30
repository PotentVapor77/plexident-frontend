import React from "react";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import { Modal } from "../../ui/modal";

interface IndicatorsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: BackendIndicadoresSaludBucal | null;
}

export const IndicatorsViewModal: React.FC<IndicatorsViewModalProps> = ({
  isOpen,
  onClose,
  registro,
}) => {
  if (!isOpen || !registro) return null;

  const formatDate = (dateString?: string | null): string => {
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

  const getPatientFullName = () => {
  const nombre = registro.paciente_nombre?.trim();
  const apellido = registro.paciente_apellido?.trim();

  if (nombre && apellido) {
    return `${nombre} ${apellido}`;
  }

  return nombre || apellido || "Paciente no especificado";
};

  const formatValue = (value?: number | null): string =>
    value == null ? "No registrado" : value.toFixed(2);

  const getPeriodontalText = () =>
    registro.enfermedad_periodontal || "No registrada";

  const getOclusionText = () =>
    registro.tipo_oclusion || "No registrada";

  const getFluorosisText = () =>
    registro.nivel_fluorosis || "No registrada";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/40 dark:to-indigo-900/40 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historia clínica · Resumen de indicadores
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Detalle de los indicadores de salud bucal registrados para el paciente.
          </p>
        </div>

        {/* Contenido scrollable */}
        <div className="px-6 py-4 space-y-5 overflow-y-auto bg-gray-50/40 dark:bg-slate-900/40">
          {/* Paciente */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Paciente
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Datos básicos del titular de los indicadores.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 px-3 py-1 text-xs font-medium">
                Registro #{registro.id ?? "N/D"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Nombre
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                  {getPatientFullName()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  CI
                </p>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {registro.paciente_cedula ?? "No registrada"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Fecha del registro
                </p>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {formatDate(registro.fecha)}
                </p>
              </div>
            </div>
          </section>

          {/* OHI */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-200/70 dark:border-emerald-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Índice de higiene oral (OHI)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Valores promedio de placa y cálculo.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 px-3 py-1 text-xs font-medium">
                Higiene oral
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                  OHI Placa promedio
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  {formatValue(registro.ohi_promedio_placa)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                  OHI Cálculo promedio
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  {formatValue(registro.ohi_promedio_calculo)}
                </p>
              </div>
              
              <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                  GI Gingivitis promedio
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  {formatValue(registro.gi_promedio_gingivitis)}
                </p>
              </div>
            </div>
          </section>


          {/* Evaluación clínica */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-indigo-200/70 dark:border-indigo-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Evaluación clínica
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Características periodontales, oclusales y de fluorosis.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
                Estado clínico
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                  Enfermedad periodontal
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getPeriodontalText()}
                </p>
              </div>
              <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                  Tipo de oclusión
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getOclusionText()}
                </p>
              </div>
              <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-900/30 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                  Nivel de fluorosis
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getFluorosisText()}
                </p>
              </div>
            </div>
          </section>

          {/* Observaciones */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-200/70 dark:border-amber-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Observaciones adicionales
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comentarios relevantes registrados por el profesional.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-3 py-1 text-xs font-medium">
                Notas
              </span>
            </div>

            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line bg-amber-50/60 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              {registro.observaciones || "No se registraron observaciones."}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 dark:bg-slate-900/60 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
