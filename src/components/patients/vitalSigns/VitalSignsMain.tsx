// src/components/vitalSigns/VitalSignsMain.tsx

import { useState } from "react";
import { VitalSignsTable } from "./table/VitalSignsTable";
import { VitalSignsViewModal } from "./modals/VitalSignsViewModal";
import { VitalSignsCreateEditModal } from "./modals/VitalSignsCreateEditModal";
import { VitalSignsDeleteModal } from "./modals/VitalSignsDeleteModal";

import type { IVitalSigns } from "../../../types/vitalSigns/IVitalSigns";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useVitalSigns } from "../../../hooks/vitalSigns/useVitalSigns";

export default function VitalSignsMain() {
  const { notify } = useNotification();
  const { removeVitalSign } = useVitalSigns(); // mismo patrón que removeBackground [file:6]

  const [vitalToView, setVitalToView] = useState<IVitalSigns | null>(null);
  const [vitalToEdit, setVitalToEdit] = useState<IVitalSigns | null>(null);
  const [vitalToDelete, setVitalToDelete] = useState<IVitalSigns | null>(null);

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

  const handleViewVital = (vital: IVitalSigns) => {
    setVitalToView(vital);
    openViewModal();
  };

  const handleEditVital = (vital: IVitalSigns) => {
    setVitalToEdit(vital);
    openEditModal();
  };

  const handleOpenDeleteVital = (vital: IVitalSigns) => {
    setVitalToDelete(vital);
    openDeleteModal();
  };

  const handleVitalCreated = () => {
    closeCreateModal();
  };

  const handleCloseEditModal = () => {
    closeEditModal();
    setVitalToEdit(null);
  };

  const handleViewEdit = () => {
    if (vitalToView) {
      const v = vitalToView;
      setVitalToView(null);
      handleEditVital(v);
      closeViewModal();
    }
  };

  const handleDeleteFinished = async () => {
    if (!vitalToDelete) return;
    try {
      await removeVitalSign(vitalToDelete.id); // invalidateQueries → tabla refetch [file:6]
      notify({
        type: "success",
        title: "Signos vitales eliminados",
        message: "Los signos vitales se desactivaron correctamente.",
      });
      closeDeleteModal();
      setVitalToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Error al eliminar signos vitales",
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
            Signos vitales
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Administra las constantes vitales registradas de los pacientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
          Registrar signos vitales
        </button>
      </div>

      {/* Tabla principal */}
      <VitalSignsTable
        onView={handleViewVital}
        onEdit={handleEditVital}
        onDelete={handleOpenDeleteVital}
      />

      {/* Ver signos vitales */}
      {vitalToView && (
        <VitalSignsViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          vital={vitalToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear signos vitales */}
      {isCreateModalOpen && (
        <VitalSignsCreateEditModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          mode="create"
          initialData={null}
          vitalId={undefined}
          onVitalSaved={handleVitalCreated}
          notify={handleNotify}
        />
      )}

      {/* Editar signos vitales */}
      {vitalToEdit && (
        <VitalSignsCreateEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          initialData={vitalToEdit}
          vitalId={vitalToEdit.id}
          onVitalSaved={handleVitalCreated}
          notify={handleNotify}
        />
      )}

      {/* Eliminar signos vitales */}
      {vitalToDelete && (
        <VitalSignsDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          vital={vitalToDelete}
          onDeleted={handleDeleteFinished}
          notify={handleNotify}
        />
      )}
    </>
  );
}
