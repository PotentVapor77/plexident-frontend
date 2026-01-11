// src/components/odontogram/treatmentPlan/SessionCreateEditModal.tsx

import { X, Calendar } from "lucide-react";
import SessionForm from "../form/SessionForm";
// ============================================================================
// PROPS
// ============================================================================

interface SessionCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  planId: string;
  sesionId?: string;
  onSuccess: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionCreateEditModal({
  isOpen,
  onClose,
  mode,
  planId,
  sesionId,
  onSuccess,
}: SessionCreateEditModalProps) {
  if (!isOpen) return null;

  const title = mode === "create" ? "Crear Sesión de Tratamiento" : "Editar Sesión de Tratamiento";
  const subtitle =
    mode === "create"
      ? "Registre una nueva sesión con procedimientos y prescripciones"
      : "Actualice la información de la sesión de tratamiento";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-brand-100 mt-0.5">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ====================================================================
            CONTENIDO SCROLLABLE
        ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-6">
          <SessionForm
            mode={mode}
            planId={planId}
            sesionId={sesionId}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
