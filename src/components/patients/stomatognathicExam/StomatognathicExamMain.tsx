// src/components/stomatognathicExam/StomatognathicExamMain.tsx

import { useState } from "react";
import { StomatognathicExamTable } from "./table/StomatognathicExamTable";
import { StomatognathicExamViewModal } from "./modals/StomatognathicExamViewModal";
import { StomatognathicExamCreateEditModal } from "./modals/StomatognathicExamCreateEditModal";
import { StomatognathicExamDeleteModal } from "./modals/StomatognathicExamDeleteModal";

import type { IStomatognathicExam } from "../../../types/stomatognathicExam/IStomatognathicExam";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useStomatognathicExams } from "../../../hooks/stomatognathicExam/useStomatognathicExam";

export default function StomatognathicExamMain() {
  const { notify } = useNotification();
  const { removeExam } = useStomatognathicExams();

  const [examToView, setExamToView] = useState<IStomatognathicExam | null>(null);
  const [examToEdit, setExamToEdit] = useState<IStomatognathicExam | null>(null);
  const [examToDelete, setExamToDelete] = useState<IStomatognathicExam | null>(null);

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isCreateModalOpen,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const handleViewExam = (exam: IStomatognathicExam) => {
    setExamToView(exam);
    openViewModal();
  };

  const handleEditExam = (exam: IStomatognathicExam) => {
    setExamToEdit(exam);
    openEditModal();
  };

  const handleOpenDeleteExam = (exam: IStomatognathicExam) => {
    setExamToDelete(exam);
    openDeleteModal();
  };


  const handleCloseEditModal = () => {
    closeEditModal();
    setExamToEdit(null);
  };

  const handleViewEdit = () => {
    if (examToView) {
      const e = examToView;
      setExamToView(null);
      handleEditExam(e);
      closeViewModal();
    }
  };

  const handleDeleteFinished = async () => {
    if (!examToDelete) return;
    try {
      await removeExam(examToDelete.id);
      notify({
        type: "success",
        title: "¡Eliminación Exitosa!",
        message: "El examen estomatognático se desactivó correctamente.",
      });
      closeDeleteModal();
      setExamToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Error al eliminar examen estomatognático",
      });
    }
  };

  const handleNotify = (message: string, type: "success" | "error") => {
    notify({
      type,
      title: type === "success" ? "Éxito" : "Error",
      message,
    });
  };


  return (
    <>
      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exámenes Estomatognáticos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Administra los exámenes de regiones orales y faciales de los pacientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Registrar Examen
        </button>
      </div>

      {/* Tabla principal */}
      <StomatognathicExamTable
        onView={handleViewExam}
        onEdit={handleEditExam}
        onDelete={handleOpenDeleteExam}
      />

      {/* Ver examen */}
      {examToView && (
        <StomatognathicExamViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          exam={examToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear examen */}
      {isCreateModalOpen && (
        <StomatognathicExamCreateEditModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          mode="create"
          initialData={null}
          examId={undefined}
          notify={handleNotify}
        />
      )}

      {/* Editar examen */}
      {examToEdit && (
        <StomatognathicExamCreateEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          initialData={examToEdit}
          examId={examToEdit.id}
          notify={handleNotify}
        />
      )}

      {/* Eliminar examen */}
      {examToDelete && (
        <StomatognathicExamDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          exam={examToDelete}
          onDeleted={handleDeleteFinished}
          notify={handleNotify}
        />
      )}
    </>
  );
}