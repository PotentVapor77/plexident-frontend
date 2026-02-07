// src/components/complementaryExam/modals/ComplementaryExamCreateEditModal.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../ui/modal';
import { ComplementaryExamForm } from '../form/ComplementaryExamForm';
import type {
  IComplementaryExam,
  IComplementaryExamCreate,
} from '../../../../types/complementaryExam/IComplementaryExam';
import {
  useCreateComplementaryExam,
  useUpdateComplementaryExam,
} from '../../../../hooks/complementaryExam/useComplementaryExam';

interface ComplementaryExamCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam?: IComplementaryExam | null;
  pacienteId: string;
}

export function ComplementaryExamCreateEditModal({
  isOpen,
  onClose,
  onSuccess,
  exam,
  pacienteId,
}: ComplementaryExamCreateEditModalProps) {
  const isEditing = !!exam;
  const [activo, setActivo] = useState(true);

  const form = useForm<IComplementaryExamCreate>({
    defaultValues: {
      paciente: pacienteId,
      pedido_examenes: 'NO',
      pedido_examenes_detalle: '',
      informe_examenes: 'NINGUNO',
      informe_examenes_detalle: '',
      activo: true,
    },
  });

  const createMutation = useCreateComplementaryExam();
  const updateMutation = useUpdateComplementaryExam();

  useEffect(() => {
    if (exam) {
      form.reset({
        paciente: typeof exam.paciente === 'string' ? exam.paciente : exam.paciente.id,
        pedido_examenes: exam.pedido_examenes,
        pedido_examenes_detalle: exam.pedido_examenes_detalle || '',
        informe_examenes: exam.informe_examenes,
        informe_examenes_detalle: exam.informe_examenes_detalle || '',
        activo: exam.activo,
      });
      setActivo(exam.activo ?? true);
    } else {
      form.reset({
        paciente: pacienteId,
        pedido_examenes: 'NO',
        pedido_examenes_detalle: '',
        informe_examenes: 'NINGUNO',
        informe_examenes_detalle: '',
        activo: true,
      });
      setActivo(true);
    }
  }, [exam, pacienteId, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Validaciones personalizadas
      const errors: Record<string, string> = {};

      if (data.pedido_examenes === 'SI' && !data.pedido_examenes_detalle?.trim()) {
        errors.pedido_examenes_detalle = 'Debe especificar los exámenes solicitados';
      }

      if (data.informe_examenes === 'OTROS' && !data.informe_examenes_detalle?.trim()) {
        errors.informe_examenes_detalle =
          'Debe especificar el tipo de examen cuando selecciona "Otros"';
      }

      if (
        data.informe_examenes !== 'NINGUNO' &&
        !data.informe_examenes_detalle?.trim()
      ) {
        errors.informe_examenes_detalle = 'Debe detallar los resultados del examen';
      }

      // Si hay errores, mostrarlos en el formulario
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof IComplementaryExamCreate, {
            type: 'manual',
            message,
          });
        });
        return;
      }

      if (isEditing && exam) {
        await updateMutation.mutateAsync({
          id: exam.id,
          data: {
            ...data,
            activo,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          activo,
        });
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error al guardar examen complementario:', error);
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  const title = isEditing
    ? 'Editar Examen Complementario'
    : 'Crear Examen Complementario';
  const subtitle = isEditing
    ? 'Actualiza la información del examen complementario.'
    : 'Registra un nuevo examen complementario del paciente.';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <ComplementaryExamForm 
          form={form} 
          mode={isEditing ? 'edit' : 'create'}
          activo={activo}
          onActivoChange={setActivo}
        />

        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : isEditing ? (
              'Actualizar Examen'
            ) : (
              'Crear Examen'
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
