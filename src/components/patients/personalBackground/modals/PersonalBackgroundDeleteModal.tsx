// src/components/personalBackground/modals/PersonalBackgroundDeleteModal.tsx

import { useState } from "react";
import type { IPersonalBackground } from "../../../../types/personalBackground/IPersonalBackground";
import { Modal } from "../../../ui/modal";

interface PersonalBackgroundDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  background: IPersonalBackground | null;
  onDeleted?: () => void; // ✅ Ya no elimina, solo notifica
  notify?: (message: string, type: "success" | "error") => void;
}

export function PersonalBackgroundDeleteModal({
  isOpen,
  onClose,
  background,
  onDeleted,
  notify,
}: PersonalBackgroundDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !background) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // ✅ onDeleted EJECUTA removeBackground desde PersonalBackgroundMain
      await onDeleted?.();
    } catch (error) {
      notify?.(
        error instanceof Error ? error.message : "Error al eliminar",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener nombre del paciente
  const getPatientInfo = (): string => {
    if (!background) return '';
    if (typeof background.paciente === 'object' && background.paciente !== null) {
      return `${background.paciente.apellidos}, ${background.paciente.nombres}`;
    }
    return 'Paciente';
  };

  const getCedula = (): string => {
    if (typeof background?.paciente === 'object' && background.paciente !== null) {
      return background.paciente.cedula_pasaporte || 'N/A';
    }
    return 'N/A';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 text-lg dark:text-white/90">
              Confirmar Desactivación
            </h5>
          </div>
        </div>

        {/* Body */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ¿Está seguro de que desea <strong>desactivar</strong> los antecedentes personales de{' '}
          <span className="font-semibold text-gray-800 dark:text-white/90">{getPatientInfo()}</span>?
          <br />
          <span className="text-xs">CI: {getCedula()}</span>
          <br />
          <span className="text-xs text-red-600 dark:text-red-400">Esta acción no se puede deshacer.</span>
        </p>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Desactivando...' : 'Desactivar Antecedentes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
