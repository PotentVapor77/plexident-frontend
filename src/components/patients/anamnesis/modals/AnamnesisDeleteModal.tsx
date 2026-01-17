// src/components/patients/anamnesis/modals/AnamnesisDeleteModal.tsx

import { useState } from 'react';
import { Modal } from '../../../ui/modal';

import { useNotification } from '../../../../context/notifications/NotificationContext';
import { useDeleteAnamnesis } from '../../../../hooks/anamnesis/useAnamnesis';
import type { IAnamnesis } from '../../../../types/anamnesis/IAnamnesis';

interface AnamnesisDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  anamnesis: IAnamnesis | null;
}

export function AnamnesisDeleteModal({
  isOpen,
  onClose,
  anamnesis,
}: AnamnesisDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAnamnesis = useDeleteAnamnesis();
  const { notify } = useNotification();

  const handleDelete = async () => {
    if (!anamnesis) return;

    setIsDeleting(true);
    try {
      await deleteAnamnesis.mutateAsync(anamnesis.id);
      notify({
        type: 'success',
        title: 'Anamnesis eliminada',
        message: 'La anamnesis se eliminó correctamente.',
      });
      onClose();
    } catch (error) {
      notify({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar la anamnesis.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!anamnesis) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Anamnesis" size="small">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            ¿Está seguro que desea eliminar la anamnesis del paciente{' '}
            <span className="font-semibold">{anamnesis.paciente_nombre}</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
