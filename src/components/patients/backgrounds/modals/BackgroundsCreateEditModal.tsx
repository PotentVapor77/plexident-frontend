// src/components/patients/backgrounds/modals/BackgroundsCreateEditModal.tsx

import { Modal } from '../../../ui/modal';
import BackgroundsForm from '../forms/BackgroundsForm';
import type {
  IAntecedentePersonal,
  IAntecedenteFamiliar,
} from '../../../../types/backgrounds/IBackground';
import { useNotification } from '../../../../context/notifications/NotificationContext';

interface BackgroundsCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  backgroundPersonal?: IAntecedentePersonal | null;
  backgroundFamiliar?: IAntecedenteFamiliar | null;
  pacienteId: string;
  pacienteNombre?: string;
}

export function BackgroundsCreateEditModal({
  isOpen,
  onClose,
  mode,
  backgroundPersonal,
  backgroundFamiliar,
  pacienteId,
  pacienteNombre,
}: BackgroundsCreateEditModalProps) {
  const { notify } = useNotification();

  const handleBackgroundCreated = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col">
        {/* Barra superior */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl">
              {mode === 'create' ? 'Crear Antecedentes Médicos' : 'Editar Antecedentes Médicos'}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pacienteNombre
                ? `Paciente: ${pacienteNombre}`
                : 'Complete los antecedentes del paciente'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido con el formulario */}
        <div className="space-y-6">
          {/* Cabecera pequeña */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-semibold text-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h6 className="font-semibold text-gray-800 dark:text-white/90 text-lg">
                Antecedentes Médicos
              </h6>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Información clínica completa del paciente
              </p>
            </div>
          </div>

          {/* BackgroundsForm */}
          <BackgroundsForm
            mode={mode}
            backgroundPersonalId={backgroundPersonal?.id}
            backgroundFamiliarId={backgroundFamiliar?.id}
            pacienteId={pacienteId}
            initialData={
              mode === 'edit' && backgroundPersonal && backgroundFamiliar
                ? {
                    // Personales
                    alergia_antibiotico: backgroundPersonal.alergia_antibiotico,
                    alergia_antibiotico_otro: backgroundPersonal.alergia_antibiotico_otro,
                    alergia_anestesia: backgroundPersonal.alergia_anestesia,
                    alergia_anestesia_otro: backgroundPersonal.alergia_anestesia_otro,
                    hemorragias: backgroundPersonal.hemorragias,
                    hemorragias_detalle: backgroundPersonal.hemorragias_detalle,
                    vih_sida: backgroundPersonal.vih_sida,
                    vih_sida_otro: backgroundPersonal.vih_sida_otro,
                    tuberculosis: backgroundPersonal.tuberculosis,
                    tuberculosis_otro: backgroundPersonal.tuberculosis_otro,
                    asma: backgroundPersonal.asma,
                    asma_otro: backgroundPersonal.asma_otro,
                    diabetes: backgroundPersonal.diabetes,
                    diabetes_otro: backgroundPersonal.diabetes_otro,
                    hipertension_arterial: backgroundPersonal.hipertension_arterial,
                    hipertension_arterial_otro: backgroundPersonal.hipertension_arterial_otro,
                    enfermedad_cardiaca: backgroundPersonal.enfermedad_cardiaca,
                    enfermedad_cardiaca_otro: backgroundPersonal.enfermedad_cardiaca_otro,
                    otros_antecedentes_personales: backgroundPersonal.otros_antecedentes_personales,
                    habitos: backgroundPersonal.habitos,
                    observaciones: backgroundPersonal.observaciones,
                    // Familiares
                    cardiopatia_familiar: backgroundFamiliar.cardiopatia_familiar,
                    cardiopatia_familiar_otro: backgroundFamiliar.cardiopatia_familiar_otro,
                    hipertension_arterial_familiar:
                      backgroundFamiliar.hipertension_arterial_familiar,
                    hipertension_arterial_familiar_otro:
                      backgroundFamiliar.hipertension_arterial_familiar_otro,
                    enfermedad_vascular_familiar: backgroundFamiliar.enfermedad_vascular_familiar,
                    enfermedad_vascular_familiar_otro:
                      backgroundFamiliar.enfermedad_vascular_familiar_otro,
                    endocrino_metabolico_familiar: backgroundFamiliar.endocrino_metabolico_familiar,
                    endocrino_metabolico_familiar_otro:
                      backgroundFamiliar.endocrino_metabolico_familiar_otro,
                    cancer_familiar: backgroundFamiliar.cancer_familiar,
                    cancer_familiar_otro: backgroundFamiliar.cancer_familiar_otro,
                    tipo_cancer: backgroundFamiliar.tipo_cancer,
                    tipo_cancer_otro: backgroundFamiliar.tipo_cancer_otro,
                    tuberculosis_familiar: backgroundFamiliar.tuberculosis_familiar,
                    tuberculosis_familiar_otro: backgroundFamiliar.tuberculosis_familiar_otro,
                    enfermedad_mental_familiar: backgroundFamiliar.enfermedad_mental_familiar,
                    enfermedad_mental_familiar_otro:
                      backgroundFamiliar.enfermedad_mental_familiar_otro,
                    enfermedad_infecciosa_familiar:
                      backgroundFamiliar.enfermedad_infecciosa_familiar,
                    enfermedad_infecciosa_familiar_otro:
                      backgroundFamiliar.enfermedad_infecciosa_familiar_otro,
                    malformacion_familiar: backgroundFamiliar.malformacion_familiar,
                    malformacion_familiar_otro: backgroundFamiliar.malformacion_familiar_otro,
                    otros_antecedentes_familiares: backgroundFamiliar.otros_antecedentes_familiares,
                  }
                : undefined
            }
            onBackgroundCreated={handleBackgroundCreated}
            notify={notify}
          />
        </div>
      </div>
    </Modal>
  );
}
