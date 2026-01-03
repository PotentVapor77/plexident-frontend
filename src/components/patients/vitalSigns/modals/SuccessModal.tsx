// src/components/vitalSigns/modals/SuccessModal.tsx

import { Modal } from "../../../ui/modal";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "¡Operación Exitosa!",
  message = "La operación se completó correctamente.",
  actionLabel = "Aceptar",
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Botón de acción */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}