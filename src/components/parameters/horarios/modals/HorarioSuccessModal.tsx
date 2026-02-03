// src/components/parameters/horarios/modals/HorarioSuccessModal.tsx

import { CheckCircle } from 'lucide-react';

interface HorarioSuccessModalProps {
  onClose: () => void;
  message: string;
}

const HorarioSuccessModal = ({ onClose, message }: HorarioSuccessModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            ¡Operación exitosa!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HorarioSuccessModal;
