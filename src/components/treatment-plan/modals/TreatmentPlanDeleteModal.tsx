// src/components/odontogram/treatmentPlan/TreatmentPlanDeleteModal.tsx

import { AlertTriangle, X } from "lucide-react";
import { formatDateToReadable } from "../../../mappers/treatmentPlanMapper";
import type { PlanTratamientoListResponse } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanTratamientoListResponse;
  onConfirm: () => void;
  isDeleting: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanDeleteModal({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isDeleting,
}: TreatmentPlanDeleteModalProps) {
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
            Confirmar eliminación
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ====================================================================
            CONTENIDO
        ==================================================================== */}
        <div className="p-6 space-y-4">
          {/* Icono de advertencia */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Mensaje de advertencia */}
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Esta acción eliminará de forma permanente el plan de tratamiento seleccionado.{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                Esta acción no se puede deshacer.
              </span>
            </p>
          </div>

          {/* Información del plan */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
              Plan a eliminar:
            </p>
            <div className="space-y-1 text-sm text-red-800 dark:text-red-200">
              <p>
                <span className="font-semibold">Título:</span> {plan.titulo}
              </p>
              <p>
                <span className="font-semibold">Paciente:</span> {plan.paciente_nombre}
              </p>
              <p>
                <span className="font-semibold">Fecha de creación:</span>{" "}
                {formatDateToReadable(plan.fecha_creacion)}
              </p>
              <p>
                <span className="font-semibold">Sesiones registradas:</span>{" "}
                {plan.total_sesiones}
              </p>
            </div>
          </div>

          {/* Advertencia adicional */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Nota:</strong> Se eliminarán también todas las sesiones de tratamiento 
              asociadas a este plan. Esta acción es irreversible.
            </p>
          </div>
        </div>

        {/* ====================================================================
            FOOTER
        ==================================================================== */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? "Eliminando..." : "Eliminar plan"}
          </Button>
        </div>
      </div>
    </div>

                    </Modal>
    
  );
}
