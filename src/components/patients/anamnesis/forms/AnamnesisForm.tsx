// src/components/patients/anamnesis/forms/AnamnesisForm.tsx

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import AnamnesisFormFields from './AnamnesisFormFields';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import { useCreateAnamnesis, useUpdateAnamnesis } from '../../../../hooks/anamnesis/useAnamnesis';
import type { IAnamnesisCreate, IAnamnesisError, IAnamnesisUpdate } from '../../../../types/anamnesis/IAnamnesis';

export interface AnamnesisFormData {
  // Paciente
  paciente: string;
  
  // ========== ANTECEDENTES PERSONALES ==========
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  
  // Hemorragias / Problemas de coagulación
  hemorragias: string;
  hemorragias_detalle: string;
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension_arterial: string;
  hipertension_arterial_otro: string;
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro: string;
  otro_antecedente_personal: string;
  
  // ========== ANTECEDENTES FAMILIARES ==========
  
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  enfermedad_cerebrovascular_familiar: string;
  enfermedad_cerebrovascular_familiar_otro: string;
  endocrino_metabolico_familiar: string;
  endocrino_metabolico_familiar_otro: string;
  cancer_familiar: string;
  cancer_familiar_otro: string;
  tuberculosis_familiar: string;
  tuberculosis_familiar_otro: string;
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  enfermedad_infecciosa_familiar: string;
  enfermedad_infecciosa_familiar_otro: string;
  malformacion_familiar: string;
  malformacion_familiar_otro: string;
  otro_antecedente_familiar: string;
  
  // ========== EXÁMENES COMPLEMENTARIOS ==========
  pedido_examenes_complementarios: string;
  pedido_examenes_complementarios_detalle: string;
  informe_examenes: string;
  informe_examenes_detalle: string;
  
  // ========== HÁBITOS Y OBSERVACIONES ==========
  habitos: string;
  observaciones: string;
  
  // ========== ESTADO ==========
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
    
    // ========== ANTECEDENTES PERSONALES ==========
    
    // Alergias específicas
    alergia_antibiotico: initialData?.alergia_antibiotico ?? 'NO',
    alergia_antibiotico_otro: initialData?.alergia_antibiotico_otro ?? '',
    alergia_anestesia: initialData?.alergia_anestesia ?? 'NO',
    alergia_anestesia_otro: initialData?.alergia_anestesia_otro ?? '',
    
    // Hemorragias / Problemas de coagulación
    hemorragias: initialData?.hemorragias ?? 'NO',
    hemorragias_detalle: initialData?.hemorragias_detalle ?? '',
    
    // Enfermedades y condiciones
    vih_sida: initialData?.vih_sida ?? 'NEGATIVO',
    vih_sida_otro: initialData?.vih_sida_otro ?? '',
    tuberculosis: initialData?.tuberculosis ?? 'NO',
    tuberculosis_otro: initialData?.tuberculosis_otro ?? '',
    asma: initialData?.asma ?? 'NO',
    asma_otro: initialData?.asma_otro ?? '',
    diabetes: initialData?.diabetes ?? 'NO',
    diabetes_otro: initialData?.diabetes_otro ?? '',
    hipertension_arterial: initialData?.hipertension_arterial ?? 'NO',
    hipertension_arterial_otro: initialData?.hipertension_arterial_otro ?? '',
    enfermedad_cardiaca: initialData?.enfermedad_cardiaca ?? 'NO',
    enfermedad_cardiaca_otro: initialData?.enfermedad_cardiaca_otro ?? '',
    otro_antecedente_personal: initialData?.otro_antecedente_personal ?? '',
    
    // ========== ANTECEDENTES FAMILIARES ==========
    
    cardiopatia_familiar: initialData?.cardiopatia_familiar ?? 'NO',
    cardiopatia_familiar_otro: initialData?.cardiopatia_familiar_otro ?? '',
    hipertension_familiar: initialData?.hipertension_familiar ?? 'NO',
    hipertension_familiar_otro: initialData?.hipertension_familiar_otro ?? '',
    enfermedad_cerebrovascular_familiar: initialData?.enfermedad_cerebrovascular_familiar ?? 'NO',
    enfermedad_cerebrovascular_familiar_otro: initialData?.enfermedad_cerebrovascular_familiar_otro ?? '',
    endocrino_metabolico_familiar: initialData?.endocrino_metabolico_familiar ?? 'NO',
    endocrino_metabolico_familiar_otro: initialData?.endocrino_metabolico_familiar_otro ?? '',
    cancer_familiar: initialData?.cancer_familiar ?? 'NO',
    cancer_familiar_otro: initialData?.cancer_familiar_otro ?? '',
    tuberculosis_familiar: initialData?.tuberculosis_familiar ?? 'NO',
    tuberculosis_familiar_otro: initialData?.tuberculosis_familiar_otro ?? '',
    enfermedad_mental_familiar: initialData?.enfermedad_mental_familiar ?? 'NO',
    enfermedad_mental_familiar_otro: initialData?.enfermedad_mental_familiar_otro ?? '',
    enfermedad_infecciosa_familiar: initialData?.enfermedad_infecciosa_familiar ?? 'NO',
    enfermedad_infecciosa_familiar_otro: initialData?.enfermedad_infecciosa_familiar_otro ?? '',
    malformacion_familiar: initialData?.malformacion_familiar ?? 'NO',
    malformacion_familiar_otro: initialData?.malformacion_familiar_otro ?? '',
    otro_antecedente_familiar: initialData?.otro_antecedente_familiar ?? '',
    
    // ========== EXÁMENES COMPLEMENTARIOS ==========
    pedido_examenes_complementarios: initialData?.pedido_examenes_complementarios ?? 'NO',
    pedido_examenes_complementarios_detalle: initialData?.pedido_examenes_complementarios_detalle ?? '',
    informe_examenes: initialData?.informe_examenes ?? 'NINGUNO',
    informe_examenes_detalle: initialData?.informe_examenes_detalle ?? '',
    
    // ========== HÁBITOS Y OBSERVACIONES ==========
    habitos: initialData?.habitos ?? '',
    observaciones: initialData?.observaciones ?? '',
    
    // ========== ESTADO ==========
    activo: initialData?.activo ?? true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const createAnamnesis = useCreateAnamnesis();
  const updateAnamnesis = useUpdateAnamnesis();

  useEffect(() => {
    if (pacienteId) {
      setFormData((prev) => ({
        ...prev,
        paciente: pacienteId,
      }));
    }
  }, [pacienteId]);

  // ✅ CORREGIDO: handleInputChange con limpieza automática de campos relacionados
  const handleInputChange = (e: React.ChangeEvent<InputElement>): void => {
    const { name, type, value } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        // ✅ LIMPIAR campos de exámenes complementarios cuando cambia a "NO"
        if (name === 'pedido_examenes_complementarios' && value === 'NO') {
          newData.pedido_examenes_complementarios_detalle = '';
        }

        // ✅ LIMPIAR campos de informe cuando cambia a "NINGUNO"
        if (name === 'informe_examenes' && value === 'NINGUNO') {
          newData.informe_examenes_detalle = '';
        }

        // ✅ LIMPIAR campos de hemorragias cuando cambia a "NO"
        if (name === 'hemorragias' && value === 'NO') {
          newData.hemorragias_detalle = '';
        }

        // ✅ LIMPIAR todos los campos "_otro" cuando NO es "OTRO"
        const camposOtroRelacionados: Record<string, keyof AnamnesisFormData> = {
          'alergia_antibiotico': 'alergia_antibiotico_otro',
          'alergia_anestesia': 'alergia_anestesia_otro',
          'vih_sida': 'vih_sida_otro',
          'tuberculosis': 'tuberculosis_otro',
          'asma': 'asma_otro',
          'diabetes': 'diabetes_otro',
          'hipertension_arterial': 'hipertension_arterial_otro',
          'enfermedad_cardiaca': 'enfermedad_cardiaca_otro',
          'cardiopatia_familiar': 'cardiopatia_familiar_otro',
          'hipertension_familiar': 'hipertension_familiar_otro',
          'enfermedad_cerebrovascular_familiar': 'enfermedad_cerebrovascular_familiar_otro',
          'endocrino_metabolico_familiar': 'endocrino_metabolico_familiar_otro',
          'cancer_familiar': 'cancer_familiar_otro',
          'tuberculosis_familiar': 'tuberculosis_familiar_otro',
          'enfermedad_mental_familiar': 'enfermedad_mental_familiar_otro',
          'enfermedad_infecciosa_familiar': 'enfermedad_infecciosa_familiar_otro',
          'malformacion_familiar': 'malformacion_familiar_otro',
        };

        // Si el campo cambiado tiene un campo "_otro" relacionado
        if (camposOtroRelacionados[name]) {
          // Si el nuevo valor NO es "OTRO", limpiar el campo relacionado
          if (value !== 'OTRO') {
            newData[camposOtroRelacionados[name]] = '';
          }
        }

        return newData;
      });
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.paciente) {
      errors.push('Debe seleccionar un paciente');
    }

    // Validar campos "Otro" que requieren especificación
    const camposOtroValidacion = [
      { campo: 'alergia_antibiotico', valor: 'OTRO', campoOtro: 'alergia_antibiotico_otro', mensaje: 'el antibiótico' },
      { campo: 'alergia_anestesia', valor: 'OTRO', campoOtro: 'alergia_anestesia_otro', mensaje: 'la anestesia' },
      { campo: 'vih_sida', valor: 'OTRO', campoOtro: 'vih_sida_otro', mensaje: 'el estado VIH/SIDA' },
      { campo: 'tuberculosis', valor: 'OTRO', campoOtro: 'tuberculosis_otro', mensaje: 'el estado de tuberculosis' },
      { campo: 'asma', valor: 'OTRO', campoOtro: 'asma_otro', mensaje: 'el tipo de asma' },
      { campo: 'diabetes', valor: 'OTRO', campoOtro: 'diabetes_otro', mensaje: 'el tipo de diabetes' },
      { campo: 'hipertension_arterial', valor: 'OTRO', campoOtro: 'hipertension_arterial_otro', mensaje: 'el tipo de hipertensión' },
      { campo: 'enfermedad_cardiaca', valor: 'OTRO', campoOtro: 'enfermedad_cardiaca_otro', mensaje: 'la enfermedad cardíaca' },
      { campo: 'cardiopatia_familiar', valor: 'OTRO', campoOtro: 'cardiopatia_familiar_otro', mensaje: 'el familiar con cardiopatía' },
      { campo: 'hipertension_familiar', valor: 'OTRO', campoOtro: 'hipertension_familiar_otro', mensaje: 'el familiar con hipertensión' },
      { campo: 'enfermedad_cerebrovascular_familiar', valor: 'OTRO', campoOtro: 'enfermedad_cerebrovascular_familiar_otro', mensaje: 'el familiar con enfermedad cerebrovascular' },
      { campo: 'endocrino_metabolico_familiar', valor: 'OTRO', campoOtro: 'endocrino_metabolico_familiar_otro', mensaje: 'el familiar con enfermedad endocrino-metabólica' },
      { campo: 'cancer_familiar', valor: 'OTRO', campoOtro: 'cancer_familiar_otro', mensaje: 'el tipo de cáncer familiar' },
      { campo: 'tuberculosis_familiar', valor: 'OTRO', campoOtro: 'tuberculosis_familiar_otro', mensaje: 'el familiar con tuberculosis' },
      { campo: 'enfermedad_mental_familiar', valor: 'OTRO', campoOtro: 'enfermedad_mental_familiar_otro', mensaje: 'el tipo de enfermedad mental' },
      { campo: 'enfermedad_infecciosa_familiar', valor: 'OTRO', campoOtro: 'enfermedad_infecciosa_familiar_otro', mensaje: 'el tipo de enfermedad infecciosa' },
      { campo: 'malformacion_familiar', valor: 'OTRO', campoOtro: 'malformacion_familiar_otro', mensaje: 'el tipo de malformación' },
    ];

    for (const { campo, valor, campoOtro, mensaje } of camposOtroValidacion) {
      const campoValue = formData[campo as keyof AnamnesisFormData];
      const campoOtroValue = formData[campoOtro as keyof AnamnesisFormData];
      
      if (typeof campoValue === 'string' && campoValue === valor) {
        if (typeof campoOtroValue === 'string' && !campoOtroValue.trim()) {
          errors.push(`Debe especificar ${mensaje} cuando selecciona "Otro"`);
        }
      }
    }

    // Validar hemorragias
    if (formData.hemorragias === 'SI' && !formData.hemorragias_detalle.trim()) {
      errors.push('Debe especificar el detalle de hemorragias cuando selecciona "Sí"');
    }

    // Validar exámenes complementarios
    if (formData.pedido_examenes_complementarios === 'SI' && !formData.pedido_examenes_complementarios_detalle.trim()) {
      errors.push('Debe especificar los exámenes solicitados cuando selecciona "Sí"');
    }

    // Validar informe de exámenes
    if (formData.informe_examenes !== 'NINGUNO' && !formData.informe_examenes_detalle.trim()) {
      errors.push('Debe detallar los resultados cuando selecciona un tipo de examen');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId,
      
      // ========== ANTECEDENTES PERSONALES ==========
      alergia_antibiotico: 'NO',
      alergia_antibiotico_otro: '',
      alergia_anestesia: 'NO',
      alergia_anestesia_otro: '',
      hemorragias: 'NO',
      hemorragias_detalle: '',
      vih_sida: 'NEGATIVO',
      vih_sida_otro: '',
      tuberculosis: 'NO',
      tuberculosis_otro: '',
      asma: 'NO',
      asma_otro: '',
      diabetes: 'NO',
      diabetes_otro: '',
      hipertension_arterial: 'NO',
      hipertension_arterial_otro: '',
      enfermedad_cardiaca: 'NO',
      enfermedad_cardiaca_otro: '',
      otro_antecedente_personal: '',
      
      // ========== ANTECEDENTES FAMILIARES ==========
      cardiopatia_familiar: 'NO',
      cardiopatia_familiar_otro: '',
      hipertension_familiar: 'NO',
      hipertension_familiar_otro: '',
      enfermedad_cerebrovascular_familiar: 'NO',
      enfermedad_cerebrovascular_familiar_otro: '',
      endocrino_metabolico_familiar: 'NO',
      endocrino_metabolico_familiar_otro: '',
      cancer_familiar: 'NO',
      cancer_familiar_otro: '',
      tuberculosis_familiar: 'NO',
      tuberculosis_familiar_otro: '',
      enfermedad_mental_familiar: 'NO',
      enfermedad_mental_familiar_otro: '',
      enfermedad_infecciosa_familiar: 'NO',
      enfermedad_infecciosa_familiar_otro: '',
      malformacion_familiar: 'NO',
      malformacion_familiar_otro: '',
      otro_antecedente_familiar: '',
      
      // ========== EXÁMENES COMPLEMENTARIOS ==========
      pedido_examenes_complementarios: 'NO',
      pedido_examenes_complementarios_detalle: '',
      informe_examenes: 'NINGUNO',
      informe_examenes_detalle: '',
      
      // ========== HÁBITOS Y OBSERVACIONES ==========
      habitos: '',
      observaciones: '',
      
      // ========== ESTADO ==========
      activo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      notify({
        type: 'error',
        title: 'Errores de validación',
        message: validationErrors.join('\n'),
      });
      return;
    }

    setSubmitLoading(true);

    try {
      const anamnesisData: IAnamnesisCreate = {
        paciente: formData.paciente,
        
        // ========== ANTECEDENTES PERSONALES ==========
        alergia_antibiotico: formData.alergia_antibiotico,
        // ✅ CORREGIDO: Enviar string vacío en lugar de undefined
        alergia_antibiotico_otro: formData.alergia_antibiotico === 'OTRO' ? formData.alergia_antibiotico_otro.trim() : '',
        alergia_anestesia: formData.alergia_anestesia,
        alergia_anestesia_otro: formData.alergia_anestesia === 'OTRO' ? formData.alergia_anestesia_otro.trim() : '',
        hemorragias: formData.hemorragias,
        hemorragias_detalle: formData.hemorragias === 'SI' ? formData.hemorragias_detalle.trim() : '',
        vih_sida: formData.vih_sida,
        vih_sida_otro: formData.vih_sida === 'OTRO' ? formData.vih_sida_otro.trim() : '',
        tuberculosis: formData.tuberculosis,
        tuberculosis_otro: formData.tuberculosis === 'OTRO' ? formData.tuberculosis_otro.trim() : '',
        asma: formData.asma,
        asma_otro: formData.asma === 'OTRO' ? formData.asma_otro.trim() : '',
        diabetes: formData.diabetes,
        diabetes_otro: formData.diabetes === 'OTRO' ? formData.diabetes_otro.trim() : '',
        hipertension_arterial: formData.hipertension_arterial,
        hipertension_arterial_otro: formData.hipertension_arterial === 'OTRO' ? formData.hipertension_arterial_otro.trim() : '',
        enfermedad_cardiaca: formData.enfermedad_cardiaca,
        enfermedad_cardiaca_otro: formData.enfermedad_cardiaca === 'OTRO' ? formData.enfermedad_cardiaca_otro.trim() : '',
        otro_antecedente_personal: formData.otro_antecedente_personal.trim() || undefined,
        
        // ========== ANTECEDENTES FAMILIARES ==========
        cardiopatia_familiar: formData.cardiopatia_familiar,
        cardiopatia_familiar_otro: formData.cardiopatia_familiar === 'OTRO' ? formData.cardiopatia_familiar_otro.trim() : '',
        hipertension_familiar: formData.hipertension_familiar,
        hipertension_familiar_otro: formData.hipertension_familiar === 'OTRO' ? formData.hipertension_familiar_otro.trim() : '',
        enfermedad_cerebrovascular_familiar: formData.enfermedad_cerebrovascular_familiar,
        enfermedad_cerebrovascular_familiar_otro: formData.enfermedad_cerebrovascular_familiar === 'OTRO' ? formData.enfermedad_cerebrovascular_familiar_otro.trim() : '',
        endocrino_metabolico_familiar: formData.endocrino_metabolico_familiar,
        endocrino_metabolico_familiar_otro: formData.endocrino_metabolico_familiar === 'OTRO' ? formData.endocrino_metabolico_familiar_otro.trim() : '',
        cancer_familiar: formData.cancer_familiar,
        cancer_familiar_otro: formData.cancer_familiar === 'OTRO' ? formData.cancer_familiar_otro.trim() : '',
        tuberculosis_familiar: formData.tuberculosis_familiar,
        tuberculosis_familiar_otro: formData.tuberculosis_familiar === 'OTRO' ? formData.tuberculosis_familiar_otro.trim() : '',
        enfermedad_mental_familiar: formData.enfermedad_mental_familiar,
        enfermedad_mental_familiar_otro: formData.enfermedad_mental_familiar === 'OTRO' ? formData.enfermedad_mental_familiar_otro.trim() : '',
        enfermedad_infecciosa_familiar: formData.enfermedad_infecciosa_familiar,
        enfermedad_infecciosa_familiar_otro: formData.enfermedad_infecciosa_familiar === 'OTRO' ? formData.enfermedad_infecciosa_familiar_otro.trim() : '',
        malformacion_familiar: formData.malformacion_familiar,
        malformacion_familiar_otro: formData.malformacion_familiar === 'OTRO' ? formData.malformacion_familiar_otro.trim() : '',
        otro_antecedente_familiar: formData.otro_antecedente_familiar.trim() || undefined,
        
        // ========== EXÁMENES COMPLEMENTARIOS ==========
        // ✅ CORREGIDO: Enviar string vacío cuando no aplica
        pedido_examenes_complementarios: formData.pedido_examenes_complementarios,
        pedido_examenes_complementarios_detalle: formData.pedido_examenes_complementarios === 'SI' ? formData.pedido_examenes_complementarios_detalle.trim() : '',
        informe_examenes: formData.informe_examenes,
        informe_examenes_detalle: formData.informe_examenes !== 'NINGUNO' ? formData.informe_examenes_detalle.trim() : '',
        
        // ========== HÁBITOS Y OBSERVACIONES ==========
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

      notify({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
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
  );
}
