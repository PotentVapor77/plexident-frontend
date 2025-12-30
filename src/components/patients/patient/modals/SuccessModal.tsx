// src/components/patients/modals/SuccessModal.tsx

import { Modal } from "../../../ui/modal";



interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export  function SuccessModal({
  isOpen,
  onClose,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          ¡Éxito!
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
