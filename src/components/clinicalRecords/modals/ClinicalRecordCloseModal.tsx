// src/components/clinicalRecord/modals/ClinicalRecordCloseModal.tsx

import { useState } from "react";
import { Modal } from "../../ui/modal";
import { Lock, AlertCircle } from "lucide-react";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useCloseClinicalRecord } from "../../../hooks/clinicalRecord/useClinicalRecords";
import { AxiosError } from "axios";

/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
const STYLES = {
  textarea:
    "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 resize-none",
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
};

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  onSuccess: () => void;
}

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
export default function ClinicalRecordCloseModal({
  isOpen,
  onClose,
  recordId,
  onSuccess,
}: ClinicalRecordCloseModalProps) {
  const { notify } = useNotification();
  const [observacionesCierre, setObservacionesCierre] = useState("");
  
  const closeMutation = useCloseClinicalRecord(recordId, null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await closeMutation.mutateAsync({
        observaciones_cierre: observacionesCierre || undefined,
      });

      notify({
        type: "success",
        title: "Historial cerrado",
        message: "El historial clínico se cerró correctamente. Ya no se podrá editar.",
      });

      setObservacionesCierre("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      let errorMessage = "Error al cerrar el historial clínico";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notify({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-7">
      {/* ====================================================================
          HEADER
      ==================================================================== */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cerrar historial clínico
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El historial no podrá ser editado después de cerrarse
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CONTENIDO
      ==================================================================== */}
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-6">
          {/* Alerta informativa */}
          <div className="mb-6 rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-warning-600 dark:text-warning-400" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-warning-900 dark:text-warning-100">
                  Al cerrar este historial clínico:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-warning-800 dark:text-warning-200">
                  <li>No se podrá editar ningún campo del formulario</li>
                  <li>Se registrará la fecha y hora de cierre</li>
                  <li>Solo podrá reabrirse mediante autorización especial</li>
                  <li>Se recomienda verificar que toda la información esté completa</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Campo de observaciones */}
          <div className="space-y-2">
            <label htmlFor="observaciones_cierre" className={STYLES.label}>
              Observaciones de cierre (opcional)
            </label>
            <textarea
              id="observaciones_cierre"
              rows={4}
              value={observacionesCierre}
              onChange={(e) => setObservacionesCierre(e.target.value)}
              className={STYLES.textarea}
              placeholder="Agregue notas finales o comentarios sobre el cierre del historial..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {observacionesCierre.length}/500 caracteres
            </p>
          </div>

          {/* Info adicional */}
          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Nota:</span> Las observaciones de cierre se
              agregarán al campo de observaciones generales del historial clínico.
            </p>
          </div>
        </div>

        {/* ==================================================================
            FOOTER
        ================================================================== */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={closeMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={closeMutation.isPending}
            className="bg-success-600 hover:bg-success-700 focus:ring-success-500 dark:bg-success-500 dark:hover:bg-success-600"
          >
            {closeMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cerrando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Cerrar historial
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
