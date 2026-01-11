// src/components/odontogram/treatmentPlan/SessionCreateEditModal.tsx

import { Calendar } from "lucide-react";
import SessionForm from "../form/SessionForm";
import { Modal } from "../../ui/modal";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
    >
      {/* ====================================================================
          HEADER
      ==================================================================== */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <Calendar className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CONTENIDO SCROLLABLE
      ==================================================================== */}
      <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-6">
        <SessionForm
          mode={mode}
          planId={planId}
          sesionId={sesionId}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}
