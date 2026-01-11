// src/components/odontogram/treatmentPlan/TreatmentPlanCreateEditModal.tsx
import React from "react";
import { FileText } from "lucide-react";
import { Modal } from "../../ui/modal";
import TreatmentPlanForm from "../form/TreatmentPlanForm";

interface TreatmentPlanCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  planId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
}

const TreatmentPlanCreateEditModal: React.FC<TreatmentPlanCreateEditModalProps> = ({
  isOpen,
  onClose,
  mode,
  planId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const title = isEdit ? "Editar plan de tratamiento" : "Crear plan de tratamiento";

  const subtitle = isEdit
    ? "Actualice la información del plan de tratamiento"
    : pacienteNombreCompleto
    ? `Registre el plan de tratamiento para ${pacienteNombreCompleto}`
    : "Seleccione un paciente y registre el plan de tratamiento";

  return (
    <Modal
          isOpen={isOpen}
          onClose={onClose}
          className="max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden"
        >

      <div className="flex items-start gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-h-[75vh] overflow-y-auto px-6 py-4 custom-scrollbar">
        <TreatmentPlanForm
          mode={mode}
          planId={planId}
          pacienteId={pacienteId}
          pacienteNombreCompleto={pacienteNombreCompleto}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};

export default TreatmentPlanCreateEditModal;
