// src/components/odontogram/indicator/IndicatorsDeleteModal.tsx

import React, { useState } from "react";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import { Modal } from "../../ui/modal";

interface IndicatorsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: BackendIndicadoresSaludBucal | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const IndicatorsDeleteModal: React.FC<IndicatorsDeleteModalProps> = ({
  isOpen,
  onClose,
  registro,
  onConfirm,
  loading = false,
}) => {
  // 🔒 LÓGICA ORIGINAL MANTENIDA
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !registro) return null;

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Sin fecha";
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error al eliminar indicador:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="flex flex-col">
        {/* Icono de advertencia */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 
                     0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 
                     0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-800 text-theme-lg dark:text-white/90">
              Confirmar Eliminación
            </h5>
          </div>
        </div>

        {/* Texto de confirmación */}
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta acción eliminará de forma permanente el registro de indicadores
            de salud bucal seleccionado.{" "}
            ¿Está seguro de que desea eliminar el registro de indicadores del{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {formatDate(registro.fecha)} de {registro.paciente_nombre} {
                registro.paciente_apellido
              }
            </span>
            ? Esta acción no se puede deshacer. Se perderán todos los datos
            registrados en este indicador de salud bucal.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            disabled={isDeleting || loading}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            type="button"
            disabled={isDeleting || loading}
            className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting || loading ? "Eliminando..." : "Eliminar Registro"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
