// src/components/patients/consultations/modals/ConsultationViewModal.tsx

import type { IConsultation } from '../../../../types/consultations/IConsultation';
import { Modal } from '../../../ui/modal';

interface ConsultationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: IConsultation | null;
  onEdit?: () => void;
}

export function ConsultationViewModal({
  isOpen,
  onClose,
  consultation,
  onEdit,
}: ConsultationViewModalProps) {
  if (!consultation) return null;

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
            Ver Consulta
          </h5>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Información detallada de la consulta del paciente
            </p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              consultation.activo 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {consultation.activo ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paciente</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {consultation.paciente_nombre}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de consulta</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(consultation.fecha_consulta).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Motivo de Consulta
              </h3>
            </div>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {consultation.motivo_consulta}
            </p>
          </div>

          {/* Enfermedad Actual */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enfermedad Actual
              </h3>
            </div>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {consultation.enfermedad_actual}
            </p>
          </div>

          {/* Diagnóstico */}
          {consultation.diagnostico && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  🩺 Diagnóstico
                </h3>
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {consultation.diagnostico}
              </p>
            </div>
          )}

          {/* Plan de Tratamiento */}
          {consultation.plan_tratamiento && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  💊 Plan de Tratamiento
                </h3>
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {consultation.plan_tratamiento}
              </p>
            </div>
          )}

          {/* Observaciones */}
          {consultation.observaciones && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Observaciones
                </h3>
              </div>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {consultation.observaciones}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>
                  {new Date(consultation.fecha_creacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium">Última modificación:</p>
                <p>
                  {new Date(consultation.fecha_modificacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {consultation.creado_por && (
                <div>
                  <p className="font-medium">Creado por:</p>
                  <p>{consultation.creado_por}</p>
                </div>
              )}
              {consultation.actualizado_por && (
                <div>
                  <p className="font-medium">Actualizado por:</p>
                  <p>{consultation.actualizado_por}</p>
                </div>
              )}
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
              Editar
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}