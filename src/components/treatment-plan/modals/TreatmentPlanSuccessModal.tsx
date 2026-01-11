// src/components/odontogram/treatmentPlan/TreatmentPlanSuccessModal.tsx

import { CheckCircle2, X } from "lucide-react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanSuccessModal({
  isOpen,
  onClose,
  message = "El plan de tratamiento se registró correctamente",
  title = "¡Éxito!",
}: TreatmentPlanSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
                      isOpen={isOpen}
                      onClose={onClose}
                      className="max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden"
                    >
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ====================================================================
            CONTENIDO
        ==================================================================== */}
        <div className="p-6 text-center space-y-4">
          {/* Icono de éxito */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Mensaje */}
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            {message}
          </p>
        </div>

        {/* ====================================================================
            FOOTER
        ==================================================================== */}
        <div className="flex justify-center px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <Button variant="primary" onClick={onClose}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
                    </Modal>
    
  );
}
