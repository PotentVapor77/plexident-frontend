// src/components/patients/consultations/modals/ConsultationCreateEditModal.tsx

import { Modal } from '../../../ui/modal';
import ConsultationForm from '../forms/ConsultationForm';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import type { IConsultation } from '../../../../types/consultations/IConsultation';

// ✅ AGREGAR onSuccess y consultationData
interface ConsultationCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // ✅ AGREGAR ESTA LÍNEA
  mode?: 'create' | 'edit'; // Hacer opcional para compatibilidad
  consultation?: IConsultation | null;
  consultationData?: IConsultation | null; // ✅ AGREGAR ESTA LÍNEA (alias)
  pacienteId: string;
  pacienteNombre?: string;
}

export function ConsultationCreateEditModal({
  isOpen,
  onClose,
  onSuccess, // ✅ AGREGAR ESTA LÍNEA
  mode: modeProp,
  consultation,
  consultationData, // ✅ AGREGAR ESTA LÍNEA
  pacienteId,
  pacienteNombre,
}: ConsultationCreateEditModalProps) {
  const { notify } = useNotification();

  // ✅ Determinar mode usando consultation o consultationData
  const mode = modeProp || (consultation || consultationData ? 'edit' : 'create');
  const currentConsultation = consultation || consultationData;

  const handleSuccess = () => {
    // ✅ LLAMAR onSuccess si existe
    onSuccess?.();
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
            mode === 'edit' && currentConsultation
              ? {
                  paciente: currentConsultation.paciente,
                  fecha_consulta: currentConsultation.fecha_consulta,
                  motivo_consulta: currentConsultation.motivo_consulta || '',
                  enfermedad_actual: currentConsultation.enfermedad_actual || '',
                  observaciones: currentConsultation.observaciones || '',
                  activo: currentConsultation.activo,
                }
              : undefined
          }
          consultationId={mode === 'edit' && currentConsultation ? currentConsultation.id : undefined}
          notify={notify}
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
        />
      </>
    </Modal>
  );
}
