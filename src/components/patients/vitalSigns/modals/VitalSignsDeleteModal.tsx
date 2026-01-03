// src/components/vitalSigns/modals/VitalSignsDeleteModal.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IPacienteBasico, IVitalSigns } from "../../../../types/vitalSigns/IVitalSigns";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { Modal } from "../../../ui/modal";

interface VitalSignsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vital: IVitalSigns | null;
  onDeleted?: () => Promise<void> | void;
  notify?: (message: string, type: "success" | "error") => void;
}

export function VitalSignsDeleteModal({
  isOpen,
  onClose,
  vital,
  onDeleted,
  notify,
}: VitalSignsDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const getPacienteId = (): string | null => {
    if (!vital?.paciente) return null;
    
    if (typeof vital.paciente === "string") {
      return vital.paciente;
    }
    
    if (typeof vital.paciente === "object" && vital.paciente !== null) {
      const pacienteBasico = vital.paciente as unknown as IPacienteBasico;
      return pacienteBasico.id || null;
    }
    
    return null;
  };

  const pacienteId = getPacienteId();

  const { data: pacienteData } = useQuery({
    queryKey: ["paciente", pacienteId],
    queryFn: () => (pacienteId ? getPacienteById(pacienteId) : null),
    enabled: !!pacienteId && typeof vital?.paciente === "string",
    staleTime: 5 * 60 * 1000,
  });

  const getPaciente = (): IPaciente | null => {
    if (!vital?.paciente) return null;
    
    // Si ya es un objeto completo IPaciente
    if (typeof vital.paciente === "object") {
      // Verificamos si tiene las propiedades de IPaciente
      const pacienteObj = vital.paciente as unknown as Record<string, unknown>;
      if (pacienteObj.nombres !== undefined && pacienteObj.apellidos !== undefined) {
        return vital.paciente as unknown as IPaciente;
      }
      // Si es IPacienteBasico, necesitamos los datos completos de pacienteData
      if (pacienteData) {
        return pacienteData;
      }
    }
    
    // Si es un string ID, usar los datos de pacienteData
    return pacienteData || null;
  };

  const paciente = getPaciente();

  if (!isOpen || !vital) return null;

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

  const getFullName = (): string => {
    if (!paciente) return "Cargando...";
    
    // Verificar si el paciente tiene las propiedades necesarias
    const hasNames = paciente.nombres && paciente.apellidos;
    
    if (hasNames) {
      return `${paciente.apellidos}, ${paciente.nombres}`;
    }
    
    // Si no tiene nombres/apellidos directamente, intentar obtener del objeto
    const pacienteObj = paciente as unknown as Record<string, unknown>;
    const nombres = pacienteObj.nombres || pacienteObj.nombre || "";
    const apellidos = pacienteObj.apellidos || "";
    
    return `${apellidos}${apellidos && nombres ? ", " : ""}${nombres}`.trim() || "Paciente";
  };

  const getCedula = (): string => {
    if (!paciente) return "...";
    
    // Verificar si el paciente tiene cedula_pasaporte
    const pacienteObj = paciente as unknown as Record<string, unknown>;
    const cedula = pacienteObj.cedula_pasaporte as string | undefined;
    
    return cedula || "N/A";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Confirmar eliminación
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          ¿Está seguro de que desea eliminar los signos vitales registrados de{" "}
          <span className="font-semibold">{getFullName()}</span> (CI:{" "}
          {getCedula()})? Esta acción no se puede deshacer.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Eliminar signos vitales"}
          </button>
        </div>
      </div>
    </Modal>
  );
}