// src/components/patients/consultations/forms/ConsultationForm.tsx

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import ConsultationFormFields from './ConsultationFormFields';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import type { IConsultationCreate, IConsultationError, IConsultationUpdate } from '../../../../types/consultations/IConsultation';
import { useCreateConsultation, useUpdateConsultation } from '../../../../hooks/consultations/useConsultation';

export interface ConsultationFormData {
  paciente: string;
  fecha_consulta: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  diagnostico: string;
  plan_tratamiento: string;
  observaciones: string;
  activo: boolean;
}

interface ConsultationFormProps {
  onConsultationCreated?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<ConsultationFormData>;
  consultationId?: string;
  notify: ReturnType<typeof useNotification>['notify'];
  pacienteId: string;
  pacienteNombre?: string;
}

type InputElement = HTMLInputElement | HTMLTextAreaElement;

export default function ConsultationForm({
  onConsultationCreated,
  mode = 'create',
  initialData,
  consultationId,
  notify,
  pacienteId,
  pacienteNombre,
}: ConsultationFormProps) {
  const [formData, setFormData] = useState<ConsultationFormData>({
    paciente: initialData?.paciente ?? pacienteId,
    fecha_consulta: initialData?.fecha_consulta ?? new Date().toISOString().split('T')[0],
    motivo_consulta: initialData?.motivo_consulta ?? '',
    enfermedad_actual: initialData?.enfermedad_actual ?? '',
    diagnostico: initialData?.diagnostico ?? '',
    plan_tratamiento: initialData?.plan_tratamiento ?? '',
    observaciones: initialData?.observaciones ?? '',
    activo: initialData?.activo ?? true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();

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
    if (!formData.fecha_consulta) errors.push('La fecha de consulta es requerida');
    if (!formData.motivo_consulta.trim()) errors.push('El motivo de consulta es requerido');
    if (!formData.enfermedad_actual.trim()) errors.push('La enfermedad actual es requerida');

    return errors;
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId,
      fecha_consulta: new Date().toISOString().split('T')[0],
      motivo_consulta: '',
      enfermedad_actual: '',
      diagnostico: '',
      plan_tratamiento: '',
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
      const baseData = {
        paciente: formData.paciente,
        fecha_consulta: formData.fecha_consulta,
        motivo_consulta: formData.motivo_consulta.trim(),
        enfermedad_actual: formData.enfermedad_actual.trim(),
        diagnostico: formData.diagnostico.trim() || undefined,
        plan_tratamiento: formData.plan_tratamiento.trim() || undefined,
        observaciones: formData.observaciones.trim() || undefined,
        activo: formData.activo,
      };

      if (mode === 'create') {
        const consultationData: IConsultationCreate = baseData as IConsultationCreate;
        await createConsultation.mutateAsync(consultationData);
        notify({
          type: 'success',
          title: 'Consulta creada',
          message: 'Se creó la consulta correctamente.',
        });
      } else {
        if (!consultationId) throw new Error('Falta el id de consulta para editar');
        const consultationData: IConsultationUpdate = baseData;
        await updateConsultation.mutateAsync({ id: consultationId, data: consultationData });
        notify({
          type: 'warning',
          title: 'Consulta actualizada',
          message: 'Se actualizó la consulta correctamente.',
        });
      }

      resetForm();
      onConsultationCreated?.();
    } catch (err: unknown) {
      let errorMessage = '❌ Error al guardar la consulta';

      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as IConsultationError;
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
        <ConsultationFormFields
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