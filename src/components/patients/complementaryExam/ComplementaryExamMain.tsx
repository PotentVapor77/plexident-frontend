// src/components/complementaryExam/ComplementaryExamMain.tsx

import { useState } from 'react';
import { ComplementaryExamTable } from './table/ComplementaryExamTable';
import { ComplementaryExamCreateEditModal } from './modals/ComplementaryExamCreateEditModal';
import { ComplementaryExamViewModal } from './modals/ComplementaryExamViewModal';
import { ComplementaryExamDeleteModal } from './modals/ComplementaryExamDeleteModal';
import type { IComplementaryExam } from '../../../types/complementaryExam/IComplementaryExam';
import { SuccessModal } from '../patient';

interface ComplementaryExamMainProps {
  pacienteId: string;
}

export function ComplementaryExamMain({ pacienteId }: ComplementaryExamMainProps) {
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<IComplementaryExam | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreate = () => {
    setSelectedExam(null);
    setIsCreateEditModalOpen(true);
  };

  const handleEdit = (exam: IComplementaryExam) => {
    setSelectedExam(exam);
    setIsCreateEditModalOpen(true);
  };

  const handleView = (exam: IComplementaryExam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

  const handleDelete = (exam: IComplementaryExam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const handleCreateEditSuccess = () => {
    setSuccessMessage(
      selectedExam
        ? 'Examen complementario actualizado exitosamente'
        : 'Examen complementario creado exitosamente'
    );
    setIsSuccessModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSuccessMessage('Examen complementario eliminado exitosamente');
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exámenes Complementarios
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de solicitudes e informes de exámenes complementarios
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Examen
        </button>
      </div>

      {/* Información */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Registre las solicitudes de exámenes complementarios y sus resultados.
              Puede solicitar exámenes como radiografías, hemogramas, glucosa, etc.,
              y posteriormente registrar los informes con los hallazgos encontrados.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <ComplementaryExamTable
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        pacienteId={pacienteId}
      />

      {/* Modales */}
      <ComplementaryExamCreateEditModal
        isOpen={isCreateEditModalOpen}
        onClose={() => {
          setIsCreateEditModalOpen(false);
          setSelectedExam(null);
        }}
        onSuccess={handleCreateEditSuccess}
        exam={selectedExam}
        pacienteId={pacienteId}
      />

      <ComplementaryExamViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
      />

      <ComplementaryExamDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedExam(null);
        }}
        onSuccess={handleDeleteSuccess}
        exam={selectedExam}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
}
