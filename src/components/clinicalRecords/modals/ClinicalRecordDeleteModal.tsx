// src/components/clinicalRecord/modals/ClinicalRecordDeleteModal.tsx

import { Modal } from "../../ui/modal";
import { AlertCircle, Trash2 } from "lucide-react";
import Button from "../../ui/button/Button";
import { formatDateToReadable } from "../../../mappers/clinicalRecordMapper";
import type { ClinicalRecordListResponse } from "../../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClinicalRecordListResponse;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
export default function ClinicalRecordDeleteModal({
  isOpen,
  onClose,
  record,
  onConfirm,
  isDeleting,
}: ClinicalRecordDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* ====================================================================
          HEADER
      ==================================================================== */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Eliminar historial clínico
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CONTENIDO
      ==================================================================== */}
      <div className="px-6 py-6">
        {/* Alerta de advertencia */}
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" />
            <div>
              <p className="text-sm font-medium text-error-900 dark:text-error-100">
                Esta acción eliminará de forma permanente el historial clínico seleccionado.{" "}
                <span className="font-bold">Esta acción no se puede deshacer.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Información del registro */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Historial a eliminar:
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Paciente:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {record.paciente_nombre}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">CI:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {record.paciente_cedula}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fecha de atención:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDateToReadable(record.fecha_atencion)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Odontólogo:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {record.odontologo_nombre}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {record.estado_display}
              </span>
            </div>
          </div>
        </div>

        {/* Nota adicional */}
        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Nota:</span> Esta es una eliminación lógica. El
          historial se marcará como inactivo en el sistema pero se mantendrá en la base de datos
          por auditoría.
        </p>
      </div>

      {/* ====================================================================
          FOOTER
      ==================================================================== */}
      <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-error-600 hover:bg-error-700 focus:ring-error-500 dark:bg-error-500 dark:hover:bg-error-600"
        >
          {isDeleting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Eliminando...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Confirmar eliminación
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
