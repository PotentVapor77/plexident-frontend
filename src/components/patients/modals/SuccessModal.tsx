import React from 'react';
import { Modal } from '../../ui/modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother?: () => void;
  message: string;
  title?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onRegisterAnother,
  message,
  title = "¡Registro Exitoso!"
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">{title}</h3>
        
        <p className="text-sm text-gray-600 text-center leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Cerrar
          </button>
          {onRegisterAnother && (
            <button
              onClick={onRegisterAnother}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Registrar Otro
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
