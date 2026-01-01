// src/components/familyBackground/FamilyBackgroundMain.tsx

import { useState } from "react";
import { FamilyBackgroundTable } from "./table/FamilyBackgroundTable";
import { FamilyBackgroundViewModal } from "./modals/FamilyBackgroundViewModal";
import { FamilyBackgroundCreateEditModal } from "./modals/FamilyBackgroundCreateEditModal";
import { FamilyBackgroundDeleteModal } from "./modals/FamilyBackgroundDeleteModal";
import type { IFamilyBackground } from "../../../types/familyBackground/IFamilyBackground";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useFamilyBackgrounds } from "../../../hooks/familyBackground/useFamilyBackgrounds";

export default function FamilyBackgroundMain() {
  const { notify } = useNotification();
  const { removeBackground } = useFamilyBackgrounds();

  const [backgroundToView, setBackgroundToView] = useState<IFamilyBackground | null>(null);
  const [backgroundToEdit, setBackgroundToEdit] = useState<IFamilyBackground | null>(null);
  const [backgroundToDelete, setBackgroundToDelete] = useState<IFamilyBackground | null>(null);

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

  const handleViewBackground = (background: IFamilyBackground) => {
    setBackgroundToView(background);
    openViewModal();
  };

  const handleEditBackground = (background: IFamilyBackground) => {
    setBackgroundToEdit(background);
    openEditModal();
  };

  const handleOpenDeleteBackground = (background: IFamilyBackground) => {
    setBackgroundToDelete(background);
    openDeleteModal();
  };

  const handleBackgroundCreated = () => {
    closeCreateModal();
  };

  const handleCloseEditModal = () => {
    closeEditModal();
    setBackgroundToEdit(null);
  };

  const handleViewEdit = () => {
    if (backgroundToView) {
      const bg = backgroundToView;
      setBackgroundToView(null);
      handleEditBackground(bg);
      closeViewModal();
    }
  };

  const handleDeleteFinished = async () => {
    if (!backgroundToDelete) return;

    try {
      await removeBackground(backgroundToDelete.id);

      notify({
        type: "success",
        title: "Antecedentes eliminados",
        message: "Los antecedentes familiares se desactivaron correctamente.",
      });

      closeDeleteModal();
      setBackgroundToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar antecedentes",
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
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Antecedentes Familiares
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los antecedentes patológicos familiares de los pacientes
            </p>
          </div>
          {/* Botón crear */}
          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Crear antecedente
            </button>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <FamilyBackgroundTable
        onView={handleViewBackground}
        onEdit={handleEditBackground}
        onDelete={handleOpenDeleteBackground}
      />

      {/* Ver antecedente */}
      {backgroundToView && (
        <FamilyBackgroundViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          background={backgroundToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear antecedente */}
      <FamilyBackgroundCreateEditModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        mode="create"
        onBackgroundCreated={handleBackgroundCreated}
        notify={handleNotify}
      />

      {/* Editar antecedente */}
      {backgroundToEdit && (
        <FamilyBackgroundCreateEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          initialData={backgroundToEdit}
          backgroundId={backgroundToEdit.id}
          onBackgroundCreated={handleBackgroundCreated}
          notify={handleNotify}
        />
      )}

      {/* Eliminar antecedente */}
      {backgroundToDelete && (
        <FamilyBackgroundDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          background={backgroundToDelete}
          onDeleted={handleDeleteFinished}
        />
      )}
    </>
  );
}
