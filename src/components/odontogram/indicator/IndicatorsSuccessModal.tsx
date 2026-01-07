// src/components/odontogram/indicator/IndicatorsSuccessModal.tsx

import React from "react";
import { Modal } from "../../ui/modal";

interface IndicatorsSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const IndicatorsSuccessModal: React.FC<IndicatorsSuccessModalProps> = ({
  isOpen,
  onClose,
  message = "Indicadores guardados correctamente",
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-sm p-6"
    >
      <div className="flex flex-col items-center text-center">
        {/* Icono de éxito */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 text-emerald-600 dark:text-emerald-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 
                 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          ¡Éxito!
        </h3>

        {/* Mensaje */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          {message}
        </p>

        {/* Botón */}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
};
