// src/components/odontogram/treatmentPlan/SessionViewModal.tsx

import { Modal } from "../../ui/modal";
import { useSesionTratamiento } from "../../../hooks/treatmentPlan/useTreatmentSession";
import {
  Eye,
  Calendar,
  Clock,
  User,
  FileText,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
  Hash,
  ClipboardList,
  ShieldCheck,
  FileSignature,
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

const formatDateTimeToReadable = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================================
// PROPS
// ============================================================================

interface SessionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesionId: string;
  planId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionViewModal({
  isOpen,
  onClose,
  sesionId,
  planId,
}: SessionViewModalProps) {
  const { data: sesion, isLoading, error } = useSesionTratamiento(sesionId);

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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
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
              Detalles de la Sesión de Tratamiento
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Información completa sobre los procedimientos y prescripciones realizados
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
              Error al cargar la sesión
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              No se pudo obtener la información de la sesión de tratamiento.
            </p>
          </div>
        ) : sesion ? (
          <div className="space-y-6">
            {/* ================================================================
                INFORMACIÓN GENERAL
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Hash className="h-5 w-5 text-brand-500" />
                Información General
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Número de sesión
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    Sesión #{sesion.numero_sesion}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Estado
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getEstadoBadge(
                        sesion.estado
                      )}`}
                    >
                      {sesion.estado_display}
                    </span>
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Plan de tratamiento
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {sesion.plan_titulo}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Fecha programada
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDateToReadable(sesion.fecha_programada)}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    Fecha de realización
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {sesion.fecha_realizacion
                      ? formatDateTimeToReadable(sesion.fecha_realizacion)
                      : "No realizada"}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    Odontólogo responsable
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {sesion.odontologo_info
                      ? `${sesion.odontologo_info.nombres} ${sesion.odontologo_info.apellidos}`
                      : "No asignado"}
                  </dd>
                </div>
              </div>

              {sesion.fecha_firma && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm dark:border-success-500/20 dark:bg-success-500/5">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 text-success-600 dark:text-success-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong className="font-semibold">Sesión firmada digitalmente</strong> ·
                    Firmada el {formatDateTimeToReadable(sesion.fecha_firma)}
                  </span>
                </div>
              )}
            </section>

            {/* ================================================================
                PROCEDIMIENTOS
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Stethoscope className="h-5 w-5 text-brand-500" />
                Procedimientos Realizados
              </div>

              {!sesion.procedimientos || sesion.procedimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-center dark:border-gray-700">
                  <ClipboardList className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No hay procedimientos registrados
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sesion.procedimientos.map((proc, index) => (
                    <div
                      key={proc.id || index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {proc.descripcion}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {proc.diente && (
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                Diente: {proc.diente}
                              </span>
                            )}
                            {proc.superficie && (
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                Superficie: {proc.superficie}
                              </span>
                            )}
                            {proc.completado && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-success-100 px-2 py-1 text-success-700 dark:bg-success-500/20 dark:text-success-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Completado
                              </span>
                            )}
                          </div>
                          {proc.notas && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              {proc.notas}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================================================================
                PRESCRIPCIONES
            ================================================================ */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Pill className="h-5 w-5 text-brand-500" />
                Prescripciones Médicas
              </div>

              {!sesion.prescripciones || sesion.prescripciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-center dark:border-gray-700">
                  <FileSignature className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No hay prescripciones registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sesion.prescripciones.map((presc, index) => (
                    <div
                      key={presc.id || index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {presc.medicamento}
                          </p>
                          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Dosis:{" "}
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {presc.dosis}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Frecuencia:{" "}
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {presc.frecuencia}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Duración:{" "}
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {presc.duracion}
                              </span>
                            </div>
                            {presc.via_administracion && (
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                  Vía:{" "}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {presc.via_administracion}
                                </span>
                              </div>
                            )}
                          </div>
                          {presc.indicaciones && (
                            <div className="mt-2 rounded-md bg-blue-light-50 p-2 text-xs text-gray-700 dark:bg-blue-light-500/10 dark:text-gray-300">
                              <span className="font-medium">Indicaciones: </span>
                              {presc.indicaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================================================================
                NOTAS
            ================================================================ */}
            {sesion.notas && (
              <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Notas de la Sesión
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {sesion.notas}
                </p>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
