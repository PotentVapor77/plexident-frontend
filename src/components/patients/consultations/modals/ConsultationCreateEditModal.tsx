// src/components/patients/consultations/modals/ConsultationCreateEditModal.tsx

import { Modal } from '../../../ui/modal';
import ConsultationForm from '../forms/ConsultationForm';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import type { IConsultation } from '../../../../types/consultations/IConsultation';

interface ConsultationCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  consultation?: IConsultation | null;
  pacienteId: string;
  pacienteNombre?: string;
}

export function ConsultationCreateEditModal({
  isOpen,
  onClose,
  mode,
  consultation,
  pacienteId,
  pacienteNombre,
}: ConsultationCreateEditModalProps) {
  const { notify } = useNotification();

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl">
              {mode === 'create' ? 'Crear Consulta' : 'Editar Consulta'}
            </h5>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {mode === 'create'
                ? 'Complete los datos de la consulta del paciente'
                : 'Actualice la información de la consulta'}
            </p>
            {pacienteNombre && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  📋 Paciente:
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {pacienteNombre}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <ConsultationForm
          mode={mode}
          onConsultationCreated={handleSuccess}
          initialData={
            mode === 'edit' && consultation
              ? {
                  paciente: consultation.paciente,
                  fecha_consulta: consultation.fecha_consulta,
                  motivo_consulta: consultation.motivo_consulta || '',
                  enfermedad_actual: consultation.enfermedad_actual || '',
                  diagnostico: consultation.diagnostico || '',
                  plan_tratamiento: consultation.plan_tratamiento || '',
                  observaciones: consultation.observaciones || '',
                  activo: consultation.activo,
                }
              : undefined
          }
          consultationId={mode === 'edit' && consultation ? consultation.id : undefined}
          notify={notify}
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
        />
      </>
    </Modal>
  );
}