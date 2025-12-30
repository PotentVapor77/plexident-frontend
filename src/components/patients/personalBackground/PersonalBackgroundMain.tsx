// src/components/personalBackground/PersonalBackgroundMain.tsx

import { useState } from "react";
import { PersonalBackgroundTable } from "./table/PersonalBackgroundTable";
import { PersonalBackgroundViewModal } from "./modals/PersonalBackgroundViewModal";
import { PersonalBackgroundCreateEditModal } from "./modals/PersonalBackgroundCreateEditModal";
import { PersonalBackgroundDeleteModal } from "./modals/PersonalBackgroundDeleteModal";
import type { IPersonalBackground } from "../../../types/personalBackground/IPersonalBackground";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { usePersonalBackgrounds } from "../../../hooks/personalBackground/usePersonalBackgrounds";

export default function PersonalBackgroundMain() {
  const { notify } = useNotification();
  
  // ✅ Hook con removeBackground para actualizar tabla
  const { removeBackground } = usePersonalBackgrounds();

  const [backgroundToView, setBackgroundToView] = useState<IPersonalBackground | null>(null);
  const [backgroundToEdit, setBackgroundToEdit] = useState<IPersonalBackground | null>(null);
  const [backgroundToDelete, setBackgroundToDelete] = useState<IPersonalBackground | null>(null);

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

  // -------------------------------------

  const handleViewBackground = (background: IPersonalBackground) => {
    setBackgroundToView(background);
    openViewModal();
  };

  const handleEditBackground = (background: IPersonalBackground) => {
    setBackgroundToEdit(background);
    openEditModal();
  };

  const handleOpenDeleteBackground = (background: IPersonalBackground) => {
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

  // ✅ CORREGIDO: Ejecuta removeBackground para actualizar tabla
  const handleDeleteFinished = async () => {
    if (!backgroundToDelete) return;

    try {
      // ✅ removeBackground → invalidateQueries → tabla refetch AUTOMÁTICO
      await removeBackground(backgroundToDelete.id);
      
      // ✅ Notificación de éxito
      notify({
        type: "success",
        title: "Antecedentes eliminados",
        message: "Los antecedentes personales se desactivaron correctamente.",
      });

      // Cerrar modal
      closeDeleteModal();
      setBackgroundToDelete(null);
    } catch (error) {
      // ✅ Notificación de error
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar antecedentes",
      });
    }
  };

  // ✅ Wrapper simplificado para notify
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
              Antecedentes Personales
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los antecedentes patológicos personales de los pacientes
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
      <PersonalBackgroundTable
        onView={handleViewBackground}
        onEdit={handleEditBackground}
        onDelete={handleOpenDeleteBackground}
      />

      {/* Ver antecedente */}
      {backgroundToView && (
        <PersonalBackgroundViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          background={backgroundToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear antecedente */}
      <PersonalBackgroundCreateEditModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        mode="create"
        onBackgroundCreated={handleBackgroundCreated}
        notify={handleNotify}
      />

      {/* Editar antecedente */}
      {backgroundToEdit && (
        <PersonalBackgroundCreateEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          backgroundId={backgroundToEdit.id}
          initialData={backgroundToEdit}
          notify={handleNotify}
        />
      )}

      {/* Eliminar antecedente */}
      {backgroundToDelete && (
        <PersonalBackgroundDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          background={backgroundToDelete}
          onDeleted={handleDeleteFinished} // ✅ Ahora ejecuta removeBackground
          notify={handleNotify}
        />
      )}
    </>
  );
}
