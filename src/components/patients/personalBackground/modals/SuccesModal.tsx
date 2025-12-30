// src/components/personalBackground/modals/SuccessModal.tsx

import { Modal } from "../../../ui/modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-gray-700">{message}</p>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
