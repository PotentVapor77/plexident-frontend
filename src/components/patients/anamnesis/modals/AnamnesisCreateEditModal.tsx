// src/components/patients/anamnesis/modals/AnamnesisCreateEditModal.tsx

import { Modal } from '../../../ui/modal';
import AnamnesisForm from '../forms/AnamnesisForm';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import type { IAnamnesis } from '../../../../types/anamnesis/IAnamnesis';

interface AnamnesisCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  anamnesis?: IAnamnesis | null;
  pacienteId: string;
  pacienteNombre?: string;
}

export function AnamnesisCreateEditModal({
  isOpen,
  onClose,
  mode,
  anamnesis,
  pacienteId,
  pacienteNombre,
}: AnamnesisCreateEditModalProps) {
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
              {mode === 'create' ? 'Crear Anamnesis General' : 'Editar Anamnesis General'}
            </h5>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {mode === 'create'
                ? 'Complete los datos de la anamnesis general del paciente'
                : 'Actualice la información de la anamnesis general'}
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
        <AnamnesisForm
          mode={mode}
          onAnamnesisCreated={handleSuccess}
          initialData={
            mode === 'edit' && anamnesis
              ? {
                  paciente: anamnesis.paciente,
                  tiene_alergias: anamnesis.tiene_alergias,
                  alergias_detalle: anamnesis.alergias_detalle || '',
                  antecedentes_personales: anamnesis.antecedentes_personales || '',
                  antecedentes_familiares: anamnesis.antecedentes_familiares || '',
                  problemas_coagulacion: anamnesis.problemas_coagulacion,
                  problemas_coagulacion_detalle: anamnesis.problemas_coagulacion_detalle || '',
                  problemas_anestesicos: anamnesis.problemas_anestesicos,
                  problemas_anestesicos_detalle: anamnesis.problemas_anestesicos_detalle || '',
                  toma_medicamentos: anamnesis.toma_medicamentos,
                  medicamentos_actuales: anamnesis.medicamentos_actuales || '',
                  habitos: anamnesis.habitos || '',
                  otros: anamnesis.otros || '',
                  activo: anamnesis.activo, // ✅ YA ESTABA
                }
              : undefined
          }
          anamnesisId={mode === 'edit' && anamnesis ? anamnesis.id : undefined}
          notify={notify}
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
        />
      </>
    </Modal>
  );
}
