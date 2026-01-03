// FamilyBackgroundDeleteModal.tsx - VERSIÓN CON CACHE

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IFamilyBackground } from "../../../../types/familyBackground/IFamilyBackground";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { Modal } from "../../../ui/modal";

interface FamilyBackgroundDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  background: IFamilyBackground | null;
  onDeleted?: () => void;
  notify?: (message: string, type: "success" | "error") => void;
}

export function FamilyBackgroundDeleteModal({
  isOpen,
  onClose,
  background,
  onDeleted,
  notify,
}: FamilyBackgroundDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  // ✅ Obtener ID del paciente
  const getPacienteId = (): string | null => {
    if (!background) return null;
    if (typeof background.paciente === 'string') return background.paciente;
    if (typeof background.paciente === 'object' && background.paciente !== null) {
      return background.paciente.id;
    }
    return null;
  };

  const pacienteId = getPacienteId();

  // ✅ Cargar datos del paciente si solo tenemos el ID
  const { data: pacienteData } = useQuery({
    queryKey: ['paciente', pacienteId],
    queryFn: () => pacienteId ? getPacienteById(pacienteId) : null,
    enabled: !!pacienteId && typeof background?.paciente === 'string',
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Obtener objeto paciente (ya sea del background o de la query)
  const getPaciente = (): IPaciente | null => {
    if (!background) return null;
    if (typeof background.paciente === 'object' && background.paciente !== null) {
      return background.paciente as IPaciente;
    }
    return pacienteData || null;
  };

  const paciente = getPaciente();

  if (!isOpen || !background) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
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

  // ✅ Obtener nombre completo
  const getFullName = (): string => {
    if (!paciente) return "Cargando...";
    return `${paciente.apellidos}, ${paciente.nombres}`;
  };

  // ✅ Obtener cédula
  const getCedula = (): string => {
    if (!paciente) return "...";
    return paciente.cedula_pasaporte || "N/A";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="flex flex-col">
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
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
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

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ¿Está seguro de que desea eliminar los antecedentes familiares de{" "}
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {getFullName()}
          </span>
          {" "}(CI: {getCedula()})? Esta acción no se puede deshacer.
        </p>

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
            {loading ? "Eliminando..." : "Eliminar Antecedentes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
