// src/components/parameters/horarios/modals/HorarioBulkUpdateModal.tsx

import { X } from 'lucide-react';
import HorarioForm from '../forms/HorarioForm';
import type { IHorario, IHorarioBulkUpdate } from '../../../../types/parameters/IParameters';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import { useBulkUpdateHorarios } from '../../../../hooks/parameters/useParameters';

interface HorarioBulkUpdateModalProps {
  currentHorarios: IHorario[];
  onClose: () => void;
  onSuccess: () => void;
}

const HorarioBulkUpdateModal = ({
  currentHorarios,
  onClose,
  onSuccess,
}: HorarioBulkUpdateModalProps) => {
  const { mutateAsync, isPending } = useBulkUpdateHorarios();
  const { notify } = useNotification();

  const handleSubmit = async (data: IHorarioBulkUpdate) => {
    try {
      await mutateAsync(data);
      notify({
        type: 'success',
        title: 'Éxito',
        message: 'Horarios actualizados correctamente',
      });
      onSuccess();
    } catch (error: any) {
      notify({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Error al actualizar horarios',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Actualizar Horarios de Atención
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <HorarioForm
            currentHorarios={currentHorarios}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default HorarioBulkUpdateModal;
