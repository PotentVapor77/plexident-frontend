// src/components/patients/anamnesis/forms/AnamnesisForm.tsx

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import AnamnesisFormFields from './AnamnesisFormFields';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import type { IAnamnesisCreate, IAnamnesisError, IAnamnesisUpdate } from '../../../../types/anamnesis/IAnamnesis';
import { useCreateAnamnesis, useUpdateAnamnesis } from '../../../../hooks/anamnesis/useAnamnesis';


export interface AnamnesisFormData {
  // Paciente
  paciente: string;
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  tiene_alergias: boolean;
  
  // Problemas de coagulación
  problemas_coagulacion: string;
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension: string;
  hipertension_otro: string;
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otra: string;
  problemas_anestesicos: boolean;
  
  // Antecedentes familiares
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  diabetes_familiar: string;
  diabetes_familiar_otro: string;
  cancer_familiar: string;
  cancer_familiar_otro: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  
  // Hábitos y observaciones
  habitos: string;
  observaciones: string;
  
  // Estado
  activo: boolean;
}

interface AnamnesisFormProps {
  onAnamnesisCreated?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<IAnamnesisCreate> & { activo?: boolean };
  anamnesisId?: string;
  notify: ReturnType<typeof useNotification>['notify'];
  pacienteId: string;
  pacienteNombre?: string;
}

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export default function AnamnesisForm({
  onAnamnesisCreated,
  mode = 'create',
  initialData,
  anamnesisId,
  notify,
  pacienteId,
  pacienteNombre,
}: AnamnesisFormProps) {
  const [formData, setFormData] = useState<AnamnesisFormData>({
    // Paciente
    paciente: initialData?.paciente ?? pacienteId,
    
    // Alergias específicas
    alergia_antibiotico: initialData?.alergia_antibiotico ?? 'NO',
    alergia_antibiotico_otro: initialData?.alergia_antibiotico_otro ?? '',
    alergia_anestesia: initialData?.alergia_anestesia ?? 'NO',
    alergia_anestesia_otro: initialData?.alergia_anestesia_otro ?? '',
    tiene_alergias: initialData?.tiene_alergias ?? false,
    
    // Problemas de coagulación
    problemas_coagulacion: initialData?.problemas_coagulacion ?? 'NO',
    
    // Enfermedades y condiciones
    vih_sida: initialData?.vih_sida ?? 'NEGATIVO',
    vih_sida_otro: initialData?.vih_sida_otro ?? '',
    tuberculosis: initialData?.tuberculosis ?? 'NO',
    tuberculosis_otro: initialData?.tuberculosis_otro ?? '',
    asma: initialData?.asma ?? 'NO',
    asma_otro: initialData?.asma_otro ?? '',
    diabetes: initialData?.diabetes ?? 'NO',
    diabetes_otro: initialData?.diabetes_otro ?? '',
    hipertension: initialData?.hipertension ?? 'NO',
    hipertension_otro: initialData?.hipertension_otro ?? '',
    enfermedad_cardiaca: initialData?.enfermedad_cardiaca ?? 'NO',
    enfermedad_cardiaca_otra: initialData?.enfermedad_cardiaca_otra ?? '',
    problemas_anestesicos: initialData?.problemas_anestesicos ?? false,
    
    // Antecedentes familiares
    cardiopatia_familiar: initialData?.cardiopatia_familiar ?? 'NO',
    cardiopatia_familiar_otro: initialData?.cardiopatia_familiar_otro ?? '',
    hipertension_familiar: initialData?.hipertension_familiar ?? 'NO',
    hipertension_familiar_otro: initialData?.hipertension_familiar_otro ?? '',
    diabetes_familiar: initialData?.diabetes_familiar ?? 'NO',
    diabetes_familiar_otro: initialData?.diabetes_familiar_otro ?? '',
    cancer_familiar: initialData?.cancer_familiar ?? 'NO',
    cancer_familiar_otro: initialData?.cancer_familiar_otro ?? '',
    enfermedad_mental_familiar: initialData?.enfermedad_mental_familiar ?? 'NO',
    enfermedad_mental_familiar_otro: initialData?.enfermedad_mental_familiar_otro ?? '',
    
    // Hábitos y observaciones
    habitos: initialData?.habitos ?? '',
    observaciones: initialData?.observaciones ?? '',
    
    // Estado
    activo: initialData?.activo ?? true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const createAnamnesis = useCreateAnamnesis();
  const updateAnamnesis = useUpdateAnamnesis();

  // ✅ Actualizar paciente cuando cambia el prop
  useEffect(() => {
    if (pacienteId) {
      setFormData((prev) => ({
        ...prev,
        paciente: pacienteId,
      }));
    }
  }, [pacienteId]);

  const handleInputChange = (e: React.ChangeEvent<InputElement>): void => {
    const { name, type, value } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'select-one') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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

    if (!formData.paciente) {
      errors.push('Debe seleccionar un paciente');
    }

    // Validar campos "Otro" que requieren especificación
    if (formData.alergia_antibiotico === 'OTRO' && !formData.alergia_antibiotico_otro.trim()) {
      errors.push('Debe especificar el antibiótico cuando selecciona "Otro"');
    }

    if (formData.alergia_anestesia === 'OTRO' && !formData.alergia_anestesia_otro.trim()) {
      errors.push('Debe especificar la anestesia cuando selecciona "Otro"');
    }

    if (formData.vih_sida === 'OTRO' && !formData.vih_sida_otro.trim()) {
      errors.push('Debe especificar el estado VIH/SIDA cuando selecciona "Otro"');
    }

    if (formData.tuberculosis === 'OTRO' && !formData.tuberculosis_otro.trim()) {
      errors.push('Debe especificar el estado de tuberculosis cuando selecciona "Otro"');
    }

    if (formData.asma === 'OTRO' && !formData.asma_otro.trim()) {
      errors.push('Debe especificar el tipo de asma cuando selecciona "Otro"');
    }

    if (formData.diabetes === 'OTRO' && !formData.diabetes_otro.trim()) {
      errors.push('Debe especificar el tipo de diabetes cuando selecciona "Otro"');
    }

    if (formData.hipertension === 'OTRO' && !formData.hipertension_otro.trim()) {
      errors.push('Debe especificar el tipo de hipertensión cuando selecciona "Otro"');
    }

    if (formData.enfermedad_cardiaca === 'OTRA' && !formData.enfermedad_cardiaca_otra.trim()) {
      errors.push('Debe especificar la enfermedad cardíaca cuando selecciona "Otra"');
    }

    if (formData.cardiopatia_familiar === 'OTRO' && !formData.cardiopatia_familiar_otro.trim()) {
      errors.push('Debe especificar el familiar con cardiopatía cuando selecciona "Otro familiar"');
    }

    if (formData.hipertension_familiar === 'OTRO' && !formData.hipertension_familiar_otro.trim()) {
      errors.push('Debe especificar el familiar con hipertensión cuando selecciona "Otro familiar"');
    }

    if (formData.diabetes_familiar === 'OTRO' && !formData.diabetes_familiar_otro.trim()) {
      errors.push('Debe especificar el familiar con diabetes cuando selecciona "Otro familiar"');
    }

    if (formData.cancer_familiar === 'OTRO' && !formData.cancer_familiar_otro.trim()) {
      errors.push('Debe especificar el familiar con cáncer cuando selecciona "Otro familiar"');
    }

    if (formData.enfermedad_mental_familiar === 'OTRO' && !formData.enfermedad_mental_familiar_otro.trim()) {
      errors.push('Debe especificar el familiar con enfermedad mental cuando selecciona "Otro familiar"');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId,
      alergia_antibiotico: 'NO',
      alergia_antibiotico_otro: '',
      alergia_anestesia: 'NO',
      alergia_anestesia_otro: '',
      tiene_alergias: false,
      problemas_coagulacion: 'NO',
      vih_sida: 'NEGATIVO',
      vih_sida_otro: '',
      tuberculosis: 'NO',
      tuberculosis_otro: '',
      asma: 'NO',
      asma_otro: '',
      diabetes: 'NO',
      diabetes_otro: '',
      hipertension: 'NO',
      hipertension_otro: '',
      enfermedad_cardiaca: 'NO',
      enfermedad_cardiaca_otra: '',
      problemas_anestesicos: false,
      cardiopatia_familiar: 'NO',
      cardiopatia_familiar_otro: '',
      hipertension_familiar: 'NO',
      hipertension_familiar_otro: '',
      diabetes_familiar: 'NO',
      diabetes_familiar_otro: '',
      cancer_familiar: 'NO',
      cancer_familiar_otro: '',
      enfermedad_mental_familiar: 'NO',
      enfermedad_mental_familiar_otro: '',
      habitos: '',
      observaciones: '',
      activo: true,
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
      const anamnesisData: IAnamnesisCreate = {
        paciente: formData.paciente,
        
        // Alergias específicas
        alergia_antibiotico: formData.alergia_antibiotico,
        alergia_antibiotico_otro: formData.alergia_antibiotico === 'OTRO' ? formData.alergia_antibiotico_otro.trim() : undefined,
        alergia_anestesia: formData.alergia_anestesia,
        alergia_anestesia_otro: formData.alergia_anestesia === 'OTRO' ? formData.alergia_anestesia_otro.trim() : undefined,
        tiene_alergias: formData.tiene_alergias,
        
        // Problemas de coagulación
        problemas_coagulacion: formData.problemas_coagulacion,
        
        // Enfermedades y condiciones
        vih_sida: formData.vih_sida,
        vih_sida_otro: formData.vih_sida === 'OTRO' ? formData.vih_sida_otro.trim() : undefined,
        tuberculosis: formData.tuberculosis,
        tuberculosis_otro: formData.tuberculosis === 'OTRO' ? formData.tuberculosis_otro.trim() : undefined,
        asma: formData.asma,
        asma_otro: formData.asma === 'OTRO' ? formData.asma_otro.trim() : undefined,
        diabetes: formData.diabetes,
        diabetes_otro: formData.diabetes === 'OTRO' ? formData.diabetes_otro.trim() : undefined,
        hipertension: formData.hipertension,
        hipertension_otro: formData.hipertension === 'OTRO' ? formData.hipertension_otro.trim() : undefined,
        enfermedad_cardiaca: formData.enfermedad_cardiaca,
        enfermedad_cardiaca_otra: formData.enfermedad_cardiaca === 'OTRA' ? formData.enfermedad_cardiaca_otra.trim() : undefined,
        problemas_anestesicos: formData.problemas_anestesicos,
        
        // Antecedentes familiares
        cardiopatia_familiar: formData.cardiopatia_familiar,
        cardiopatia_familiar_otro: formData.cardiopatia_familiar === 'OTRO' ? formData.cardiopatia_familiar_otro.trim() : undefined,
        hipertension_familiar: formData.hipertension_familiar,
        hipertension_familiar_otro: formData.hipertension_familiar === 'OTRO' ? formData.hipertension_familiar_otro.trim() : undefined,
        diabetes_familiar: formData.diabetes_familiar,
        diabetes_familiar_otro: formData.diabetes_familiar === 'OTRO' ? formData.diabetes_familiar_otro.trim() : undefined,
        cancer_familiar: formData.cancer_familiar,
        cancer_familiar_otro: formData.cancer_familiar === 'OTRO' ? formData.cancer_familiar_otro.trim() : undefined,
        enfermedad_mental_familiar: formData.enfermedad_mental_familiar,
        enfermedad_mental_familiar_otro: formData.enfermedad_mental_familiar === 'OTRO' ? formData.enfermedad_mental_familiar_otro.trim() : undefined,
        
        // Hábitos y observaciones
        habitos: formData.habitos.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined,
      };

      if (mode === 'create') {
        await createAnamnesis.mutateAsync(anamnesisData);
        notify({
          type: 'success',
          title: 'Anamnesis creada',
          message: 'Se creó la anamnesis correctamente.',
        });
      } else {
        if (!anamnesisId) throw new Error('Falta el id de anamnesis para editar');
        const updateData: IAnamnesisUpdate = {
          ...anamnesisData,
          activo: formData.activo,
        };
        await updateAnamnesis.mutateAsync({ id: anamnesisId, data: updateData });
        notify({
          type: 'warning',
          title: 'Anamnesis actualizada',
          message: 'Se actualizó la anamnesis correctamente.',
        });
      }

      resetForm();
      onAnamnesisCreated?.();
    } catch (err: unknown) {
      let errorMessage = '❌ Error al guardar la anamnesis';

      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as IAnamnesisError;
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnamnesisFormFields
          formData={formData}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
          mode={mode}
          pacienteNombre={pacienteNombre}
        />
      </form>
    </>
  );
}