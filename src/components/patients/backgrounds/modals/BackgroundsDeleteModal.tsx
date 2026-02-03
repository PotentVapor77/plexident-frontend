// src/components/patients/backgrounds/modals/BackgroundsDeleteModal.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../../ui/modal';
import { useNotification } from '../../../../context/notifications/NotificationContext';
import { getPacienteById } from '../../../../services/patient/patientService';
import type { IAntecedenteCombinado } from '../../../../hooks/backgrounds/useBackgrounds';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { 
  useDesactivarTodosAntecedentesPorPaciente 
} from '../../../../hooks/backgrounds/useBackgrounds';

interface BackgroundsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  background: IAntecedenteCombinado | null;
  onDeleted?: () => void;
  notify: ReturnType<typeof useNotification>['notify'];
}

interface PacienteBasico {
  id: string;
  nombres?: string;
  apellidos?: string;
  cedula_pasaporte?: string;
  [key: string]: unknown;
}

export function BackgroundsDeleteModal({
  isOpen,
  onClose,
  background,
  onDeleted,
  notify,
}: BackgroundsDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const desactivarPorPaciente = useDesactivarTodosAntecedentesPorPaciente();

  // Obtener ID del paciente (similar al StomatognathicExamDeleteModal)
  const getPacienteId = (): string | null => {
    if (!background?.paciente) return null;
    
    if (typeof background.paciente === 'string') {
      return background.paciente;
    }
    
    if (typeof background.paciente === 'object' && background.paciente !== null) {
      const pacienteBasico = background.paciente as PacienteBasico;
      return pacienteBasico.id || null;
    }
    
    return null;
  };

  const pacienteId = getPacienteId();

  // Usar useQuery para obtener datos completos del paciente cuando solo tenemos el ID
  const { data: pacienteData } = useQuery({
    queryKey: ['paciente', pacienteId],
    queryFn: () => (pacienteId ? getPacienteById(pacienteId) : null),
    enabled: !!pacienteId && typeof background?.paciente === 'string',
    staleTime: 5 * 60 * 1000,
  });

  // Obtener objeto paciente completo (similar al StomatognathicExamDeleteModal)
  const getPaciente = (): IPaciente | null => {
    if (!background?.paciente) return null;
    
    // Si ya es un objeto completo IPaciente
    if (typeof background.paciente === 'object') {
      // Verificamos si tiene las propiedades de IPaciente
      const pacienteObj = background.paciente as Record<string, unknown>;
      if (pacienteObj.nombres !== undefined && pacienteObj.apellidos !== undefined) {
        return background.paciente as unknown as IPaciente;
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

  if (!isOpen || !background) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      // Obtener el ID del paciente para la mutación
      let pacienteIdParaMutacion: string;
      
      if (typeof background.paciente === 'string') {
        pacienteIdParaMutacion = background.paciente;
      } else if (background.paciente && typeof background.paciente === 'object') {
        const pacienteObj = background.paciente as PacienteBasico;
        if ('id' in pacienteObj) {
          pacienteIdParaMutacion = pacienteObj.id;
        } else {
          throw new Error('No se pudo obtener el ID del paciente');
        }
      } else {
        throw new Error('No se pudo obtener el ID del paciente');
      }
      
      // Desactivar TODOS los antecedentes del paciente
      await desactivarPorPaciente.mutateAsync(pacienteIdParaMutacion);

      if (onDeleted) {
        onDeleted();
      }
      
      onClose();
    } catch (error) {
      console.error('Error al desactivar antecedentes:', error);
      notify({
        type: 'error',
        title: '❌ Error',
        message: 'No se pudieron desactivar los antecedentes.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre completo del paciente (igual que en StomatognathicExamDeleteModal)
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

  // Obtener cédula del paciente (igual que en StomatognathicExamDeleteModal)
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
          Confirmar desactivación
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          ¿Está seguro de que desea desactivar los antecedentes médicos registrados de{' '}
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
            {loading ? "Desactivando..." : "Desactivar antecedentes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}