// src/components/complementaryExam/modals/ComplementaryExamDeleteModal.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../../ui/modal';
import { getPacienteById } from '../../../../services/patient/patientService';
import { useDeleteComplementaryExam } from '../../../../hooks/complementaryExam/useComplementaryExam';
import type { IComplementaryExam } from '../../../../types/complementaryExam/IComplementaryExam';
import type { IPaciente } from '../../../../types/patient/IPatient';

interface ComplementaryExamDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam: IComplementaryExam | null;
}

interface PacienteBasico {
  id: string;
  nombres?: string;
  apellidos?: string;
  cedula_pasaporte?: string;
  [key: string]: unknown;
}

export function ComplementaryExamDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  exam,
}: ComplementaryExamDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const deleteMutation = useDeleteComplementaryExam();

  // Obtener ID del paciente (mismo patrón)
  const getPacienteId = (): string | null => {
    if (!exam?.paciente) return null;
    
    if (typeof exam.paciente === 'string') {
      return exam.paciente;
    }
    
    if (typeof exam.paciente === 'object' && exam.paciente !== null) {
      // Convertir primero a unknown y luego a PacienteBasico
      const pacienteBasico = exam.paciente as unknown as PacienteBasico;
      return pacienteBasico.id || null;
    }
    
    return null;
  };

  const pacienteId = getPacienteId();

  // Usar useQuery para obtener datos completos del paciente cuando solo tenemos el ID
  const { data: pacienteData } = useQuery({
    queryKey: ['paciente', pacienteId],
    queryFn: () => (pacienteId ? getPacienteById(pacienteId) : null),
    enabled: !!pacienteId && typeof exam?.paciente === 'string',
    staleTime: 5 * 60 * 1000,
  });

  // Obtener objeto paciente completo (mismo patrón)
  const getPaciente = (): IPaciente | null => {
    if (!exam?.paciente) return null;
    
    // Si ya es un objeto completo IPaciente
    if (typeof exam.paciente === 'object') {
      // Verificamos si tiene las propiedades de IPaciente
      const pacienteObj = exam.paciente as unknown as Record<string, unknown>;
      if (pacienteObj.nombres !== undefined && pacienteObj.apellidos !== undefined) {
        // Convertir de unknown a IPaciente
        return exam.paciente as unknown as IPaciente;
      }
      // Si es un objeto básico, necesitamos los datos completos de pacienteData
      if (pacienteData) {
        return pacienteData;
      }
    }
    
    // Si es un string ID, usar los datos de pacienteData
    return pacienteData || null;
  };

  const paciente = getPaciente();

  if (!isOpen || !exam) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await deleteMutation.mutateAsync(exam.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al eliminar examen complementario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre completo del paciente (mismo patrón)
  const getFullName = (): string => {
    if (!paciente) return "Cargando...";
    
    // Verificar si el paciente tiene las propiedades necesarias
    const hasNames = paciente.nombres && paciente.apellidos;
    
    if (hasNames) {
      return `${paciente.apellidos}, ${paciente.nombres}`;
    }
    
    // Si no tiene nombres/apellidos directamente, intentar obtener del objeto
    // Convertir primero a unknown y luego a Record<string, unknown>
    const pacienteObj = paciente as unknown as Record<string, unknown>;
    const nombres = pacienteObj.nombres || pacienteObj.nombre || "";
    const apellidos = pacienteObj.apellidos || "";
    
    return `${apellidos}${apellidos && nombres ? ", " : ""}${nombres}`.trim() || "Paciente";
  };

  // Obtener cédula del paciente (mismo patrón)
  const getCedula = (): string => {
    if (!paciente) return "...";
    
    // Verificar si el paciente tiene cedula_pasaporte
    // Convertir primero a unknown y luego a Record<string, unknown>
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
          ¿Está seguro de que desea eliminar el examen complementario registrado de{" "}
          <span className="font-semibold">{getFullName()}</span> (CI:{" "}
          {getCedula()})? Esta acción no se puede deshacer.
        </p>

        {exam.resumen_examenes_complementarios && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Resumen:
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {exam.resumen_examenes_complementarios}
            </p>
          </div>
        )}

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
            {loading ? 'Eliminando...' : 'Eliminar examen'}
          </button>
        </div>
      </div>
    </Modal>
  );
}