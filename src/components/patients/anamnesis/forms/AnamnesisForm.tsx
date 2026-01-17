// src/components/patients/anamnesis/forms/AnamnesisForm.tsx

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import AnamnesisFormFields from './AnamnesisFormFields';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import { useCreateAnamnesis, useUpdateAnamnesis } from '../../../../hooks/anamnesis/useAnamnesis';
import type { IAnamnesisCreate, IAnamnesisError, IAnamnesisUpdate } from '../../../../types/anamnesis/IAnamnesis';


export interface AnamnesisFormData {
  paciente: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  tiene_alergias: boolean;
  alergias_detalle: string;
  antecedentes_personales: string;
  antecedentes_familiares: string;
  problemas_coagulacion: boolean;
  problemas_coagulacion_detalle: string;
  problemas_anestesicos: boolean;
  problemas_anestesicos_detalle: string;
  toma_medicamentos: boolean;
  medicamentos_actuales: string;
  habitos: string;
  otros: string;
  activo: boolean; // ✅ AGREGADO
}

interface AnamnesisFormProps {
  onAnamnesisCreated?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<AnamnesisFormData>;
  anamnesisId?: string;
  notify: ReturnType<typeof useNotification>['notify'];
  pacienteId: string;
  pacienteNombre?: string;
}

type InputElement = HTMLInputElement | HTMLTextAreaElement;

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
    paciente: initialData?.paciente ?? pacienteId,
    motivo_consulta: initialData?.motivo_consulta ?? '',
    enfermedad_actual: initialData?.enfermedad_actual ?? '',
    tiene_alergias: initialData?.tiene_alergias ?? false,
    alergias_detalle: initialData?.alergias_detalle ?? '',
    antecedentes_personales: initialData?.antecedentes_personales ?? '',
    antecedentes_familiares: initialData?.antecedentes_familiares ?? '',
    problemas_coagulacion: initialData?.problemas_coagulacion ?? false,
    problemas_coagulacion_detalle: initialData?.problemas_coagulacion_detalle ?? '',
    problemas_anestesicos: initialData?.problemas_anestesicos ?? false,
    problemas_anestesicos_detalle: initialData?.problemas_anestesicos_detalle ?? '',
    toma_medicamentos: initialData?.toma_medicamentos ?? false,
    medicamentos_actuales: initialData?.medicamentos_actuales ?? '',
    habitos: initialData?.habitos ?? '',
    otros: initialData?.otros ?? '',
    activo: initialData?.activo ?? true, // ✅ AGREGADO (true por defecto)
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
    const target = e.target;
    const { name, type } = target;

    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Limpiar campos condicionales cuando se desmarca
        ...(name === 'tiene_alergias' && !checked && { alergias_detalle: '' }),
        ...(name === 'problemas_coagulacion' && !checked && { problemas_coagulacion_detalle: '' }),
        ...(name === 'problemas_anestesicos' && !checked && { problemas_anestesicos_detalle: '' }),
        ...(name === 'toma_medicamentos' && !checked && { medicamentos_actuales: '' }),
      }));
    } else {
      const { value } = target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.paciente) errors.push('Debe seleccionar un paciente');

    // Validar campos condicionales
    if (formData.tiene_alergias && !formData.alergias_detalle.trim()) {
      errors.push('Debe detallar las alergias');
    }

    if (formData.problemas_coagulacion && !formData.problemas_coagulacion_detalle.trim()) {
      errors.push('Debe detallar los problemas de coagulación');
    }

    if (formData.problemas_anestesicos && !formData.problemas_anestesicos_detalle.trim()) {
      errors.push('Debe detallar los problemas con anestésicos');
    }

    if (formData.toma_medicamentos && !formData.medicamentos_actuales.trim()) {
      errors.push('Debe detallar los medicamentos actuales');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId,
      motivo_consulta: '',
      enfermedad_actual: '',
      tiene_alergias: false,
      alergias_detalle: '',
      antecedentes_personales: '',
      antecedentes_familiares: '',
      problemas_coagulacion: false,
      problemas_coagulacion_detalle: '',
      problemas_anestesicos: false,
      problemas_anestesicos_detalle: '',
      toma_medicamentos: false,
      medicamentos_actuales: '',
      habitos: '',
      otros: '',
      activo: true, // ✅ AGREGADO
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
      const baseData = {
        paciente: formData.paciente,
        tiene_alergias: formData.tiene_alergias,
        alergias_detalle: formData.tiene_alergias ? formData.alergias_detalle.trim() : undefined,
        antecedentes_personales: formData.antecedentes_personales.trim() || undefined,
        antecedentes_familiares: formData.antecedentes_familiares.trim() || undefined,
        problemas_coagulacion: formData.problemas_coagulacion,
        problemas_coagulacion_detalle: formData.problemas_coagulacion
          ? formData.problemas_coagulacion_detalle.trim()
          : undefined,
        problemas_anestesicos: formData.problemas_anestesicos,
        problemas_anestesicos_detalle: formData.problemas_anestesicos
          ? formData.problemas_anestesicos_detalle.trim()
          : undefined,
        toma_medicamentos: formData.toma_medicamentos,
        medicamentos_actuales: formData.toma_medicamentos ? formData.medicamentos_actuales.trim() : undefined,
        habitos: formData.habitos.trim() || undefined,
        otros: formData.otros.trim() || undefined,
        activo: formData.activo, // ✅ AGREGADO
      };

      if (mode === 'create') {
        const anamnesisData: IAnamnesisCreate = baseData as IAnamnesisCreate;
        await createAnamnesis.mutateAsync(anamnesisData);
        notify({
          type: 'success',
          title: 'Anamnesis creada',
          message: 'Se creó la anamnesis correctamente.',
        });
      } else {
        if (!anamnesisId) throw new Error('Falta el id de anamnesis para editar');
        const anamnesisData: IAnamnesisUpdate = baseData;
        await updateAnamnesis.mutateAsync({ id: anamnesisId, data: anamnesisData });
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
