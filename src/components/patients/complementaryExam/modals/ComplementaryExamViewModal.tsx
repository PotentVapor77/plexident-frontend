// src/components/complementaryExam/modals/ComplementaryExamViewModal.tsx

import { Modal } from '../../../ui/modal';
import type { IComplementaryExam } from '../../../../types/complementaryExam/IComplementaryExam';
import type { IPaciente } from '../../../../types/patient/IPatient';

interface ComplementaryExamViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: IComplementaryExam | null;
}

export function ComplementaryExamViewModal({
  isOpen,
  onClose,
  exam,
}: ComplementaryExamViewModalProps) {
  if (!isOpen || !exam) return null;

  const paciente =
    typeof exam.paciente === 'object' ? (exam.paciente as IPaciente) : null;

  const formatDate = (dateString: string): string => {
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

  const formatDateTime = (dateString: string): string => {
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

  const getFullName = (): string => {
    if (!paciente) return "Información no disponible";
    return `${paciente.apellidos}, ${paciente.nombres}`;
  };

  const getCedula = (): string => {
    if (!paciente) return "N/A";
    return paciente.cedula_pasaporte || "N/A";
  };

  const getEstadoBadge = () => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium";
    
    if (exam.estado_examenes === 'completado') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}>
          ✓ Completado
        </span>
      );
    } else if (exam.estado_examenes === 'pendiente') {
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`}>
          ⏳ Pendiente
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`}>
          ○ No solicitado
        </span>
      );
    }
  };

  const getPedidoBadge = () => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium";
    
    if (exam.pedido_examenes === 'SI') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}>
          ✓ Solicitud activa
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`}>
          ✗ No solicitado
        </span>
      );
    }
  };

  const getInformeBadge = () => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium";
    
    if (exam.informe_examenes === 'NINGUNO') {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400`}>
          Sin informe
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`}>
          {exam.informe_examenes}
        </span>
      );
    }
  };

  const initials = paciente ? 
    `${paciente.nombres?.[0] ?? ""}${paciente.apellidos?.[0] ?? ""}`.toUpperCase() 
    : "PE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
                Examen Complementario
              </h5>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Información detallada del registro
              </p>
            </div>
            {getEstadoBadge()}
          </div>
        </div>

        <div className="space-y-6">
          {/* Tarjeta de Información del Paciente */}
          {/* <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xl font-semibold shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getFullName()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      CI/Pasaporte: <span className="font-medium text-gray-900 dark:text-white">{getCedula()}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de creación</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(exam.fecha_creacion)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Última actualización</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(exam.fecha_modificacion)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {exam.resumen_examenes_complementarios && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Resumen del caso
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {exam.resumen_examenes_complementarios}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Sección: Solicitud de Exámenes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Solicitud de Exámenes
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Estado de solicitud
                  </p>
                  {getPedidoBadge()}
                </div>
              </div>

              {exam.pedido_examenes === 'SI' && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Detalles de la solicitud
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {exam.pedido_examenes_detalle || (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          No se especificaron detalles de los exámenes solicitados
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección: Informe de Resultados */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resultados del Examen
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tipo de examen realizado
                  </p>
                  {getInformeBadge()}
                </div>
              </div>

              {exam.informe_examenes !== 'NINGUNO' && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Resultados detallados
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {exam.informe_examenes_detalle || (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          No se detallaron los resultados del examen
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <p className="font-medium">Fecha de creación completa</p>
                <p className="mt-1">{formatDateTime(exam.fecha_creacion)}</p>
              </div>
              <div>
                <p className="font-medium">Última modificación</p>
                <p className="mt-1">{formatDateTime(exam.fecha_modificacion)}</p>
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
        </div>
      </>
    </Modal>
  );
}