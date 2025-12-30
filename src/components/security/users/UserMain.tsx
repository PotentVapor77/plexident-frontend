// src/components/users/UserMain.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserTable } from "./table/UserTable";
import { UserViewModal } from "./modals/UserViewModal";
import UserForm from "./forms/UserForm";
import type { IUser } from "../../../types/user/IUser";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../../components/ui/modal";
import { UserDeleteModal } from "./modals/UserDeleteModal";
import { useNotification } from "../../../context/notifications/NotificationContext";

export default function UserMain() {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [userToView, setUserToView] = useState<IUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

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

  const handleViewUser = (user: IUser) => {
    setUserToView(user);
    openViewModal();
  };

  const handleEditUser = (user: IUser) => {
    setUserToEdit(user);
    openEditModal();
  };

  const handleOpenDeleteUser = (user: IUser) => {
    setUserToDelete(user);
    openDeleteModal();
  };

  // ✅ Solo cierra el modal - La notificación se muestra en UserForm cuando es exitoso
  const handleUserCreated = () => {
    closeCreateModal();
  };

  // ✅ Solo cierra modal y limpia estado - La notificación se muestra en UserForm cuando es exitoso
  const handleCloseEditModal = () => {
    closeEditModal();
    setUserToEdit(null);
    navigate("/usuarios");
  };

  const handleViewEdit = () => {
    if (userToView) {
      const u = userToView;
      setUserToView(null);
      handleEditUser(u);
      closeViewModal();
    }
  };

  // ✅ Solo cierra modal y limpia estado - La notificación se muestra en UserDeleteModal cuando es exitoso
  const handleDeleteFinished = () => {
    closeDeleteModal();
    setUserToDelete(null);
  };

  return (
    <>
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los usuarios del sistema odontológico
            </p>
          </div>

          <div className="flex gap-3">
            {/* Botón crear */}
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Crear usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <UserTable
        onEdit={handleEditUser}
        onView={handleViewUser}
        onDelete={handleOpenDeleteUser}
      />

      {/* Ver usuario */}
      {userToView && (
        <UserViewModal
          user={userToView}
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear usuario */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <>
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Registrar nuevo usuario
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Complete los datos del nuevo usuario del sistema
            </p>
          </div>
          <div className="px-6 pb-6">
            {/* ✅ Pasa notify para que muestre la notificación solo si es exitoso */}
            <UserForm 
              mode="create" 
              onUserCreated={handleUserCreated}
              notify={notify}
            />
          </div>
        </>
      </Modal>

      {/* Editar usuario */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {userToEdit && (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar usuario
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Actualice la información del usuario del sistema
              </p>
            </div>
            <div className="px-6 pb-6">
              {/* ✅ Pasa notify para que muestre la notificación solo si es exitoso */}
              <UserForm
                mode="edit"
                initialData={userToEdit}
                userId={userToEdit.id}
                onUserCreated={handleCloseEditModal}
                notify={notify}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Eliminar usuario */}
      {userToDelete && (
        <UserDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          user={userToDelete}
          onDeleted={handleDeleteFinished}
          notify={notify} // ✅ Pasa notify para que muestre la notificación solo si es exitoso
        />
      )}
    </>
  );
}
