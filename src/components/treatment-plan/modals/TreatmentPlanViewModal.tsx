// src/components/odontogram/treatmentPlan/TreatmentPlanViewModal.tsx


import { formatDateToReadable, getEstadoSesionLabel, getEstadoSesionColor } from "../../../mappers/treatmentPlanMapper";
import { X, FileText, Calendar, User, ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react";
import Button from "../../ui/button/Button";
import { usePlanTratamiento } from "../../../hooks/treatmentPlan/useTreatmentPlan";

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
  const { data: plan, isLoading, isError } = usePlanTratamiento(planId);

  if (!isOpen) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Detalle del Plan de Tratamiento</h2>
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
                Cargando plan...
              </span>
            </div>
          ) : isError || !plan ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Error al cargar el plan
              </p>
              <p className="text-red-600 dark:text-red-400 mt-2">
                No se pudo obtener la información del plan de tratamiento.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Título</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {plan.titulo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paciente</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {plan.paciente_info.nombres} {plan.paciente_info.apellidos}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        CI: {plan.paciente_info.cedula_pasaporte}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fecha de creación
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDateToReadable(plan.fecha_creacion)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Creado por</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {plan.creado_por_info
                          ? `${plan.creado_por_info.nombres} ${plan.creado_por_info.apellidos}`
                          : "No especificado"}
                      </p>
                    </div>
                  </div>

                  {plan.notas_generales && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Notas generales
                      </p>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {plan.notas_generales}
                      </p>
                    </div>
                  )}

                  {plan.version_odontograma && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Este plan está vinculado a una versión específica del odontograma
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ==============================================================
                  ESTADÍSTICAS DEL PLAN
              ============================================================== */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Estadísticas del Plan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Total */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.estadisticas.total}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  </div>

                  {/* Planificadas */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {plan.estadisticas.planificadas}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Planificadas</p>
                  </div>

                  {/* En progreso */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {plan.estadisticas.en_progreso}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      En progreso
                    </p>
                  </div>

                  {/* Completadas */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {plan.estadisticas.completadas}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">Completadas</p>
                  </div>

                  {/* Canceladas */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {plan.estadisticas.canceladas}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">Canceladas</p>
                  </div>
                </div>
              </section>

              {/* ==============================================================
                  SESIONES DEL PLAN
              ============================================================== */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Sesiones de Tratamiento ({plan.sesiones.length})
                </h3>

                {plan.sesiones.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay sesiones registradas para este plan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Las sesiones se agregarán conforme se planifique el tratamiento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plan.sesiones.map((sesion) => (
                      <div
                        key={sesion.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold">
                                Sesión #{sesion.numero_sesion}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoSesionColor(
                                  sesion.estado
                                )}`}
                              >
                                {sesion.estado_display}
                              </span>
                              {sesion.esta_firmada && (
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Firmada
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Fecha programada
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {sesion.fecha_programada
                                    ? formatDateToReadable(sesion.fecha_programada)
                                    : "No especificada"}
                                </p>
                              </div>

                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Fecha de realización
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {sesion.fecha_realizacion
                                    ? formatDateToReadable(sesion.fecha_realizacion)
                                    : "No realizada"}
                                </p>
                              </div>

                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Odontólogo</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {sesion.odontologo_nombre || "No asignado"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                {sesion.total_diagnosticos} diagnóstico(s)
                              </span>
                              <span>•</span>
                              <span>
                                {sesion.total_procedimientos} procedimiento(s)
                              </span>
                              <span>•</span>
                              <span>
                                {sesion.total_prescripciones} prescripción(es)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
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
