// src/components/odontogram/treatmentPlan/SessionViewModal.tsx


import { formatDateToReadable, formatDateTimeToReadable, getEstadoSesionColor } from "../../../mappers/treatmentPlanMapper";
import { X, Calendar, User, FileText, Stethoscope, Pill, CheckCircle2, FileSignature } from "lucide-react";
import Button from "../../ui/button/Button";
import { useSesionTratamiento } from "../../../hooks/treatmentPlan/useTreatmentSession";

// ============================================================================
// PROPS
// ============================================================================

interface SessionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesionId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionViewModal({
  isOpen,
  onClose,
  sesionId,
}: SessionViewModalProps) {
  const { data: sesion, isLoading, isError } = useSesionTratamiento(sesionId);

  if (!isOpen) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Detalle de la Sesión de Tratamiento</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ====================================================================
            CONTENIDO
        ==================================================================== */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
              <span className="ml-4 text-gray-600 dark:text-gray-400">
                Cargando sesión...
              </span>
            </div>
          ) : isError || !sesion ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Error al cargar la sesión
              </p>
              <p className="text-red-600 dark:text-red-400 mt-2">
                No se pudo obtener la información de la sesión de tratamiento.
              </p>
            </div>
          ) : (
            <>
              {/* ==============================================================
                  INFORMACIÓN GENERAL
              ============================================================== */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Información General
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Número de sesión</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        Sesión #{sesion.numero_sesion}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getEstadoSesionColor(sesion.estado)}`}>
                        {sesion.estado_display}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plan de tratamiento</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sesion.plan_titulo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha programada</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDateToReadable(sesion.fecha_programada)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de realización</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sesion.fecha_realizacion
                          ? formatDateTimeToReadable(sesion.fecha_realizacion)
                          : "No realizada"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Odontólogo responsable</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sesion.odontologo_info
                          ? `${sesion.odontologo_info.nombres} ${sesion.odontologo_info.apellidos}`
                          : "No asignado"}
                      </p>
                    </div>
                  </div>

                  {sesion.fecha_firma && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FileSignature className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            Sesión firmada digitalmente
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            Firmada el {formatDateTimeToReadable(sesion.fecha_firma)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ==============================================================
                  PROCEDIMIENTOS
              ============================================================== */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Procedimientos ({sesion.procedimientos?.length || 0})
                </h3>

                {!sesion.procedimientos || sesion.procedimientos.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <Stethoscope className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No hay procedimientos registrados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sesion.procedimientos.map((proc, index) => (
                      <div
                        key={proc.id || index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                Procedimiento #{index + 1}
                              </span>
                              {proc.completado && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              {proc.descripcion}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              {proc.diente && <p>Diente: {proc.diente}</p>}
                              {proc.superficie && <p>Superficie: {proc.superficie}</p>}
                              {proc.codigo && <p>Código: {proc.codigo}</p>}
                              {proc.duracion_estimada && <p>Duración: {proc.duracion_estimada} min</p>}
                            </div>
                            {proc.notas && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
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

              {/* ==============================================================
                  PRESCRIPCIONES
              ============================================================== */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Prescripciones ({sesion.prescripciones?.length || 0})
                </h3>

                {!sesion.prescripciones || sesion.prescripciones.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <Pill className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No hay prescripciones registradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sesion.prescripciones.map((presc, index) => (
                      <div
                        key={presc.id || index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">
                              {presc.medicamento}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <p><span className="font-medium">Dosis:</span> {presc.dosis}</p>
                              <p><span className="font-medium">Frecuencia:</span> {presc.frecuencia}</p>
                              <p><span className="font-medium">Duración:</span> {presc.duracion}</p>
                              {presc.via_administracion && (
                                <p><span className="font-medium">Vía:</span> {presc.via_administracion}</p>
                              )}
                            </div>
                            {presc.indicaciones && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                Indicaciones: {presc.indicaciones}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ==============================================================
                  NOTAS DE LA SESIÓN
              ============================================================== */}
              {sesion.notas && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    Notas de la sesión
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {sesion.notas}
                    </p>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* ====================================================================
            FOOTER
        ==================================================================== */}
        <div className="sticky bottom-0 flex justify-end px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
