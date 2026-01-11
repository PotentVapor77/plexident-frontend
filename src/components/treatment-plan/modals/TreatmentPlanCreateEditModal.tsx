// src/components/odontogram/treatmentPlan/TreatmentPlanCreateEditModal.tsx

import { X, FileText } from "lucide-react";
import TreatmentPlanForm from "../form/TreatmentPlanForm";

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  planId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanCreateEditModal({
  isOpen,
  onClose,
  mode,
  planId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
}: TreatmentPlanCreateEditModalProps) {
  if (!isOpen) return null;

  const title = mode === "create" ? "Crear Plan de Tratamiento" : "Editar Plan de Tratamiento";
  const subtitle =
    mode === "create"
      ? pacienteNombreCompleto
        ? `Registre el plan de tratamiento para ${pacienteNombreCompleto}`
        : "Seleccione un paciente y registre el plan de tratamiento"
      : "Actualice la información del plan de tratamiento";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* ====================================================================
            HEADER
        ==================================================================== */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
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
          <TreatmentPlanForm
            mode={mode}
            planId={planId}
            pacienteId={pacienteId}
            pacienteNombreCompleto={pacienteNombreCompleto}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
