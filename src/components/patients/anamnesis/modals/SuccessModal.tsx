// src/components/patients/anamnesis/modals/SuccessModal.tsx

import { Modal } from '../../../ui/modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¡Éxito!" size="small">
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          La anamnesis se guardó correctamente.
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
