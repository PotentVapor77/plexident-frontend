// src/components/patients/backgrounds/forms/BackgroundsForm.tsx

import { useState } from 'react';
import { AxiosError } from 'axios';
import { useModal } from '../../../../hooks/useModal';
import BackgroundsFormFields from './BackgroundsFormFields';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import { SuccessModal } from '../modals/SuccessModal';
import {
  useCreateAntecedentePersonal,
  useUpdateAntecedentePersonal,
  useCreateAntecedenteFamiliar,
  useUpdateAntecedenteFamiliar,
} from '../../../../hooks/backgrounds/useBackgrounds';
import type {
  IAntecedentePersonalCreate,
  IAntecedentePersonalUpdate,
  IAntecedenteFamiliarCreate,
  IAntecedenteFamiliarUpdate,
  IAntecedenteError,
} from '../../../../types/backgrounds/IBackground';

export interface BackgroundFormData {
  // ESTADO
  activo: boolean;

  // ANTECEDENTES PERSONALES
  alergia_antibiotico: string;
  alergia_antibiotico_otro?: string;
  alergia_anestesia: string;
  alergia_anestesia_otro?: string;
  hemorragias: string;
  hemorragias_detalle?: string;
  vih_sida: string;
  vih_sida_otro?: string;
  tuberculosis: string;
  tuberculosis_otro?: string;
  asma: string;
  asma_otro?: string;
  diabetes: string;
  diabetes_otro?: string;
  hipertension_arterial: string;
  hipertension_arterial_otro?: string;
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro?: string;
  otros_antecedentes_personales?: string;
  habitos?: string;
  observaciones?: string;

  // ANTECEDENTES FAMILIARES
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro?: string;
  hipertension_arterial_familiar: string;
  hipertension_arterial_familiar_otro?: string;
  enfermedad_vascular_familiar: string;
  enfermedad_vascular_familiar_otro?: string;
  endocrino_metabolico_familiar: string;
  endocrino_metabolico_familiar_otro?: string;
  cancer_familiar: string;
  cancer_familiar_otro?: string;
  tipo_cancer?: string;
  tipo_cancer_otro?: string;
  tuberculosis_familiar: string;
  tuberculosis_familiar_otro?: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro?: string;
  enfermedad_infecciosa_familiar: string;
  enfermedad_infecciosa_familiar_otro?: string;
  malformacion_familiar: string;
  malformacion_familiar_otro?: string;
  otros_antecedentes_familiares?: string;
}

interface BackgroundsFormProps {
  onBackgroundCreated?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<BackgroundFormData>;
  backgroundPersonalId?: string;
  backgroundFamiliarId?: string;
  pacienteId: string;
  notify: ReturnType<typeof useNotification>['notify'];
}

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export default function BackgroundsForm({
  onBackgroundCreated,
  mode = 'create',
  initialData,
  backgroundPersonalId,
  backgroundFamiliarId,
  pacienteId,
  notify,
}: BackgroundsFormProps) {
  const [formData, setFormData] = useState<BackgroundFormData>({
    // ESTADO
    activo: initialData?.activo ?? true,

    // ANTECEDENTES PERSONALES
    alergia_antibiotico: initialData?.alergia_antibiotico ?? 'NO',
    alergia_antibiotico_otro: initialData?.alergia_antibiotico_otro ?? '',
    alergia_anestesia: initialData?.alergia_anestesia ?? 'NO',
    alergia_anestesia_otro: initialData?.alergia_anestesia_otro ?? '',
    hemorragias: initialData?.hemorragias ?? 'NO',
    hemorragias_detalle: initialData?.hemorragias_detalle ?? '',
    vih_sida: initialData?.vih_sida ?? 'NEGATIVO',
    vih_sida_otro: initialData?.vih_sida_otro ?? '',
    tuberculosis: initialData?.tuberculosis ?? 'NUNCA',
    tuberculosis_otro: initialData?.tuberculosis_otro ?? '',
    asma: initialData?.asma ?? 'NO',
    asma_otro: initialData?.asma_otro ?? '',
    diabetes: initialData?.diabetes ?? 'NO',
    diabetes_otro: initialData?.diabetes_otro ?? '',
    hipertension_arterial: initialData?.hipertension_arterial ?? 'NO',
    hipertension_arterial_otro: initialData?.hipertension_arterial_otro ?? '',
    enfermedad_cardiaca: initialData?.enfermedad_cardiaca ?? 'NO',
    enfermedad_cardiaca_otro: initialData?.enfermedad_cardiaca_otro ?? '',
    otros_antecedentes_personales: initialData?.otros_antecedentes_personales ?? '',
    habitos: initialData?.habitos ?? '',
    observaciones: initialData?.observaciones ?? '',

    // ANTECEDENTES FAMILIARES
    cardiopatia_familiar: initialData?.cardiopatia_familiar ?? 'NO',
    cardiopatia_familiar_otro: initialData?.cardiopatia_familiar_otro ?? '',
    hipertension_arterial_familiar: initialData?.hipertension_arterial_familiar ?? 'NO',
    hipertension_arterial_familiar_otro: initialData?.hipertension_arterial_familiar_otro ?? '',
    enfermedad_vascular_familiar: initialData?.enfermedad_vascular_familiar ?? 'NO',
    enfermedad_vascular_familiar_otro: initialData?.enfermedad_vascular_familiar_otro ?? '',
    endocrino_metabolico_familiar: initialData?.endocrino_metabolico_familiar ?? 'NO',
    endocrino_metabolico_familiar_otro: initialData?.endocrino_metabolico_familiar_otro ?? '',
    cancer_familiar: initialData?.cancer_familiar ?? 'NO',
    cancer_familiar_otro: initialData?.cancer_familiar_otro ?? '',
    tipo_cancer: initialData?.tipo_cancer ?? '',
    tipo_cancer_otro: initialData?.tipo_cancer_otro ?? '',
    tuberculosis_familiar: initialData?.tuberculosis_familiar ?? 'NO',
    tuberculosis_familiar_otro: initialData?.tuberculosis_familiar_otro ?? '',
    enfermedad_mental_familiar: initialData?.enfermedad_mental_familiar ?? 'NO',
    enfermedad_mental_familiar_otro: initialData?.enfermedad_mental_familiar_otro ?? '',
    enfermedad_infecciosa_familiar: initialData?.enfermedad_infecciosa_familiar ?? 'NO',
    enfermedad_infecciosa_familiar_otro: initialData?.enfermedad_infecciosa_familiar_otro ?? '',
    malformacion_familiar: initialData?.malformacion_familiar ?? 'NO',
    malformacion_familiar_otro: initialData?.malformacion_familiar_otro ?? '',
    otros_antecedentes_familiares: initialData?.otros_antecedentes_familiares ?? '',
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  const createAntecedentePersonal = useCreateAntecedentePersonal();
  const updateAntecedentePersonal = useUpdateAntecedentePersonal();
  const createAntecedenteFamiliar = useCreateAntecedenteFamiliar();
  const updateAntecedenteFamiliar = useUpdateAntecedenteFamiliar();

  const handleInputChange = (e: React.ChangeEvent<InputElement>): void => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];
    if (!formData.alergia_antibiotico) errors.push('Debe seleccionar Alergia a Antibiótico');
    if (!formData.alergia_anestesia) errors.push('Debe seleccionar Alergia a Anestesia');
    if (!formData.hemorragias) errors.push('Debe seleccionar Hemorragias');
    return errors;
  };

  const resetForm = () => {
    setFormData({
      activo: true,
      alergia_antibiotico: 'NO',
      alergia_antibiotico_otro: '',
      alergia_anestesia: 'NO',
      alergia_anestesia_otro: '',
      hemorragias: 'NO',
      hemorragias_detalle: '',
      vih_sida: 'NEGATIVO',
      vih_sida_otro: '',
      tuberculosis: 'NUNCA',
      tuberculosis_otro: '',
      asma: 'NO',
      asma_otro: '',
      diabetes: 'NO',
      diabetes_otro: '',
      hipertension_arterial: 'NO',
      hipertension_arterial_otro: '',
      enfermedad_cardiaca: 'NO',
      enfermedad_cardiaca_otro: '',
      otros_antecedentes_personales: '',
      habitos: '',
      observaciones: '',
      cardiopatia_familiar: 'NO',
      cardiopatia_familiar_otro: '',
      hipertension_arterial_familiar: 'NO',
      hipertension_arterial_familiar_otro: '',
      enfermedad_vascular_familiar: 'NO',
      enfermedad_vascular_familiar_otro: '',
      endocrino_metabolico_familiar: 'NO',
      endocrino_metabolico_familiar_otro: '',
      cancer_familiar: 'NO',
      cancer_familiar_otro: '',
      tipo_cancer: '',
      tipo_cancer_otro: '',
      tuberculosis_familiar: 'NO',
      tuberculosis_familiar_otro: '',
      enfermedad_mental_familiar: 'NO',
      enfermedad_mental_familiar_otro: '',
      enfermedad_infecciosa_familiar: 'NO',
      enfermedad_infecciosa_familiar_otro: '',
      malformacion_familiar: 'NO',
      malformacion_familiar_otro: '',
      otros_antecedentes_familiares: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitLoading(true);

    try {
      const personalData: IAntecedentePersonalCreate = {
        paciente: pacienteId,
        activo: formData.activo, // ✅ Usamos el valor del formulario
        alergia_antibiotico: formData.alergia_antibiotico,
        alergia_antibiotico_otro: formData.alergia_antibiotico_otro,
        alergia_anestesia: formData.alergia_anestesia,
        alergia_anestesia_otro: formData.alergia_anestesia_otro,
        hemorragias: formData.hemorragias,
        hemorragias_detalle: formData.hemorragias_detalle,
        vih_sida: formData.vih_sida,
        vih_sida_otro: formData.vih_sida_otro,
        tuberculosis: formData.tuberculosis,
        tuberculosis_otro: formData.tuberculosis_otro,
        asma: formData.asma,
        asma_otro: formData.asma_otro,
        diabetes: formData.diabetes,
        diabetes_otro: formData.diabetes_otro,
        hipertension_arterial: formData.hipertension_arterial,
        hipertension_arterial_otro: formData.hipertension_arterial_otro,
        enfermedad_cardiaca: formData.enfermedad_cardiaca,
        enfermedad_cardiaca_otro: formData.enfermedad_cardiaca_otro,
        otros_antecedentes_personales: formData.otros_antecedentes_personales,
        habitos: formData.habitos,
        observaciones: formData.observaciones,
      };

      const familiarData: IAntecedenteFamiliarCreate = {
        paciente: pacienteId,
        activo: formData.activo, // ✅ Usamos el valor del formulario
        cardiopatia_familiar: formData.cardiopatia_familiar,
        cardiopatia_familiar_otro: formData.cardiopatia_familiar_otro,
        hipertension_arterial_familiar: formData.hipertension_arterial_familiar,
        hipertension_arterial_familiar_otro: formData.hipertension_arterial_familiar_otro,
        enfermedad_vascular_familiar: formData.enfermedad_vascular_familiar,
        enfermedad_vascular_familiar_otro: formData.enfermedad_vascular_familiar_otro,
        endocrino_metabolico_familiar: formData.endocrino_metabolico_familiar,
        endocrino_metabolico_familiar_otro: formData.endocrino_metabolico_familiar_otro,
        cancer_familiar: formData.cancer_familiar,
        cancer_familiar_otro: formData.cancer_familiar_otro,
        tipo_cancer: formData.tipo_cancer,
        tipo_cancer_otro: formData.tipo_cancer_otro,
        tuberculosis_familiar: formData.tuberculosis_familiar,
        tuberculosis_familiar_otro: formData.tuberculosis_familiar_otro,
        enfermedad_mental_familiar: formData.enfermedad_mental_familiar,
        enfermedad_mental_familiar_otro: formData.enfermedad_mental_familiar_otro,
        enfermedad_infecciosa_familiar: formData.enfermedad_infecciosa_familiar,
        enfermedad_infecciosa_familiar_otro: formData.enfermedad_infecciosa_familiar_otro,
        malformacion_familiar: formData.malformacion_familiar,
        malformacion_familiar_otro: formData.malformacion_familiar_otro,
        otros_antecedentes_familiares: formData.otros_antecedentes_familiares,
      };

      if (mode === 'create') {
        await Promise.all([
          createAntecedentePersonal.mutateAsync(personalData),
          createAntecedenteFamiliar.mutateAsync(familiarData),
        ]);

        notify({
          type: 'success',
          title: 'Antecedentes creados',
          message: 'Se crearon los antecedentes correctamente.',
        });
      } else {
        if (!backgroundPersonalId || !backgroundFamiliarId) {
          throw new Error('Faltan los IDs de antecedentes para editar');
        }

        await Promise.all([
          updateAntecedentePersonal.mutateAsync({
            id: backgroundPersonalId,
            data: personalData as IAntecedentePersonalUpdate,
          }),
          updateAntecedenteFamiliar.mutateAsync({
            id: backgroundFamiliarId,
            data: familiarData as IAntecedenteFamiliarUpdate,
          }),
        ]);

        notify({
          type: 'warning',
          title: 'Antecedentes actualizados',
          message: 'Se actualizaron los antecedentes correctamente.',
        });
      }

      resetForm();
      openSuccessModal();
      onBackgroundCreated?.();
    } catch (err: unknown) {
      let errorMessage = '❌ Error al guardar los antecedentes';

      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as IAntecedenteError;
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    closeSuccessModal();
    resetForm();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <BackgroundsFormFields 
          formData={formData} 
          onInputChange={handleInputChange}
          mode={mode}
          activo={formData.activo}
        />

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={resetForm}
            disabled={submitLoading}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className={`px-6 py-3 text-sm font-medium text-white rounded-lg focus:ring-4 disabled:opacity-50 transition-colors ${
              mode === 'edit'
                ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            {submitLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {mode === 'create' ? 'Registrando...' : 'Guardando...'}
              </span>
            ) : mode === 'create' ? (
              'Registrar Antecedentes'
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">📋 Información importante:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Los campos marcados con * son obligatorios</li>
                <li>Complete toda la información médica relevante del paciente</li>
                <li>Los antecedentes familiares ayudan a identificar riesgos hereditarios</li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        message={
          mode === 'create'
            ? '¡Antecedentes registrados exitosamente!'
            : '¡Antecedentes actualizados exitosamente!'
        }
      />
    </>
  );
}