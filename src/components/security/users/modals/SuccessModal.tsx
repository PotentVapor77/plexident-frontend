import { Modal } from "../../../../components/ui/modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  message: string | null;
}

export default function SuccessModal({
  isOpen,
  onClose,
  onRegisterAnother,
  message,
}: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 dark:bg-green-900/20">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          ¡Registro Exitoso!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message || "Usuario registrado exitosamente"}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onRegisterAnother}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
          >
            Registrar Otro
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
