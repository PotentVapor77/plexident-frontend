// src/components/odontogram/treatmentPlan/TreatmentPlanViewModal.tsx

import { Modal } from "../../ui/modal";
import { usePlanTratamiento } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import {
  Eye,
  FileText,
  Calendar,
  User,
  Activity,
  Link2,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

// ============================================================================
// HELPERS
// ============================================================================

const formatDateToReadable = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanViewModal({
  isOpen,
  onClose,
  planId,
}: TreatmentPlanViewModalProps) {
  const { data: plan, isLoading, error } = usePlanTratamiento(planId);

  if (!isOpen) return null;

  // Estado de badge según el estado de la sesión
  const getEstadoBadge = (estado: string) => {
    const badges = {
      planificada: "bg-blue-light-50 text-blue-light-700 ring-blue-light-600/20 dark:bg-blue-light-400/10 dark:text-blue-light-400 dark:ring-blue-light-400/20",
      en_progreso: "bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-400/10 dark:text-warning-400 dark:ring-warning-400/20",
      completada: "bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-400/10 dark:text-success-400 dark:ring-success-400/20",
      cancelada: "bg-error-50 text-error-700 ring-error-600/20 dark:bg-error-400/10 dark:text-error-400 dark:ring-error-400/20",
    };
    return badges[estado as keyof typeof badges] || badges.planificada;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
      {/* ====================================================================
          HEADER
      ==================================================================== */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <Eye className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalles del Plan de Tratamiento
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Información completa del plan y seguimiento de sesiones
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CONTENIDO
      ==================================================================== */}
      <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-error-200 bg-error-50 p-6 text-center dark:border-error-500/20 dark:bg-error-500/5">
            <AlertCircle className="mx-auto h-12 w-12 text-error-500" />
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
              Error al cargar el plan
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              No se pudo obtener la información del plan de tratamiento.
            </p>
          </div>
        ) : plan ? (
          <div className="space-y-6">
            {/* ================================================================
                INFORMACIÓN GENERAL
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-brand-500" />
                Información General
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Título
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {plan.titulo}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    Paciente
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {plan.paciente_info.nombres} {plan.paciente_info.apellidos}
                  </dd>
                  <dd className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    CI: {plan.paciente_info.cedula_pasaporte}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Fecha de creación
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDateToReadable(plan.fecha_creacion)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    Creado por
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {plan.creado_por_info
                      ? `${plan.creado_por_info.nombres} ${plan.creado_por_info.apellidos}`
                      : "No especificado"}
                  </dd>
                </div>

                {plan.notas_generales && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Notas generales
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {plan.notas_generales}
                    </dd>
                  </div>
                )}
              </div>

              {plan.version_odontograma  && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-light-200 bg-blue-light-50 px-3 py-2 text-sm dark:border-blue-light-500/20 dark:bg-blue-light-500/5">
                  <Link2 className="h-4 w-4 flex-shrink-0 text-blue-light-600 dark:text-blue-light-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Este plan está vinculado a una versión específica del odontograma
                  </span>
                </div>
              )}
            </section>

            {/* ================================================================
                ESTADÍSTICAS DE SESIONES
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-brand-500" />
                Resumen de Sesiones
              </div>

              <div className="grid gap-4 sm:grid-cols-5">
                {/* Total */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.estadisticas.total}
                  </dd>
                </div>

                {/* Planificadas */}
                <div className="rounded-lg border border-blue-light-200 bg-blue-light-50 p-4 text-center dark:border-blue-light-500/20 dark:bg-blue-light-500/5">
                  <dt className="flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-blue-light-700 dark:text-blue-light-400">
                    <Clock className="h-3.5 w-3.5" />
                    Planificadas
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-blue-light-700 dark:text-blue-light-400">
                    {plan.estadisticas.planificadas}
                  </dd>
                </div>

                {/* En progreso */}
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 text-center dark:border-warning-500/20 dark:bg-warning-500/5">
                  <dt className="flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-warning-700 dark:text-warning-400">
                    <Loader2 className="h-3.5 w-3.5" />
                    En progreso
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-warning-700 dark:text-warning-400">
                    {plan.estadisticas.en_progreso}
                  </dd>
                </div>

                {/* Completadas */}
                <div className="rounded-lg border border-success-200 bg-success-50 p-4 text-center dark:border-success-500/20 dark:bg-success-500/5">
                  <dt className="flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-success-700 dark:text-success-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completadas
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-success-700 dark:text-success-400">
                    {plan.estadisticas.completadas}
                  </dd>
                </div>

                {/* Canceladas */}
                <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-center dark:border-error-500/20 dark:bg-error-500/5">
                  <dt className="flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-error-700 dark:text-error-400">
                    <XCircle className="h-3.5 w-3.5" />
                    Canceladas
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-error-700 dark:text-error-400">
                    {plan.estadisticas.canceladas}
                  </dd>
                </div>
              </div>
            </section>

            {/* ================================================================
                LISTA DE SESIONES
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Activity className="h-5 w-5 text-brand-500" />
                Sesiones Registradas
              </div>

              {!plan.sesiones || plan.sesiones.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-center dark:border-gray-700">
                  <ClipboardList className="h-10 w-10 text-gray-400" />
                  <h4 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                    No hay sesiones registradas para este plan
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Las sesiones se agregarán conforme se planifique el tratamiento
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.sesiones.map((sesion, index) => (
                    <div
                      key={sesion.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                            #{sesion.numero_sesion}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Sesión {sesion.numero_sesion}
                              </h4>
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getEstadoBadge(
                                  sesion.estado
                                )}`}
                              >
                                {sesion.estado_display}
                              </span>
                            </div>

                            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Fecha programada:{" "}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {sesion.fecha_programada
                                    ? formatDateToReadable(sesion.fecha_programada)
                                    : "No especificada"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Fecha de realización:{" "}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {sesion.fecha_realizacion
                                    ? formatDateToReadable(sesion.fecha_realizacion)
                                    : "No realizada"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Odontólogo:{" "}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {sesion.odontologo_nombre || "No asignado"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
