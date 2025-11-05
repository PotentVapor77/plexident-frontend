// users/UserMain.tsx
import { useState, useMemo } from 'react';
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import usePagination from "../../../hooks/usePagination";
import { useUsers } from '../../../hooks/useUsers';
import { useUserForm } from '../../../hooks/useUserForm';
import { SearchBar } from "../../common/SearchBar";
import { Pagination } from "../../common/Pagination";
import { UserTable } from '../../tables/UserTable/UserTable';
import { UserForm } from "./UserForm";
import { UserViewModal } from './UserViewModal';
import { UserDeleteModal } from './UserDeleteModal';
import type { IUpdateUserData, IUser } from '../../../types/IUser';

export default function UserMain() {
  const itemsPerPage = 4;
  const [searchTerm, setSearchTerm] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successType, setSuccessType] = useState<"edit" | "delete">("edit");

  const { users, loading, error, handleUpdateUser, handleDeleteUser, fetchUsers } = useUsers();
  const { 
    formData, 
    selectedUser, 
    resetForm, 
    handleInputChange, 
    validateFormData, 
    prepareUserData,
    loadUserData 
  } = useUserForm();

  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const { isOpen: isUserModalOpen, openModal: openUserModal, closeModal: closeUserModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter((user) =>
      user.nombres.toLowerCase().includes(lowerSearchTerm) ||
      user.apellidos.toLowerCase().includes(lowerSearchTerm) ||
      user.correo.toLowerCase().includes(lowerSearchTerm) ||
      user.rol.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, users]);

  const {
    currentPage: page,
    totalPages,
    currentData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    canGoNext,
    canGoPrev
  } = usePagination(filteredData, itemsPerPage);

  const handleEditUser = (user: IUser) => {
    loadUserData(user);
    openUserModal();
  };

  const handleViewUser = (user: IUser) => {
    loadUserData(user);
    openViewModal();
  };

  const handleDeleteUserClick = (user: IUser) => {
    setUserToDelete(user);
    openDeleteModal();
  };

  const handleSubmitUser = async (formData: IUpdateUserData) => {
    const isEditing = !!selectedUser;
    const validationErrors = validateFormData(isEditing);
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitLoading(true);
    
    try {
      const userData = prepareUserData(isEditing);
      
      if (isEditing && selectedUser) {
        await handleUpdateUser(selectedUser.id, userData as IUpdateUserData);
        setSuccessType("edit");
      }
      
      await fetchUsers();
      closeUserModal();
      resetForm();
      openSuccessModal();
      
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      alert((err as Error).message || 'Error al guardar el usuario');
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await handleDeleteUser(userToDelete.id);
      closeDeleteModal();
      setUserToDelete(null);
      setSuccessType("delete");
      openSuccessModal();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert((err as Error).message || 'Error al eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div >
      {/* Header sin botón de crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema odontológico
          </p>
        </div>
        
        {/* Mostrar contador de usuarios */}
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {users.length} usuario(s) registrado(s)
        </div>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por nombre, apellido, correo o rol..."
        resultsCount={filteredData.length}
      />

      <UserTable
        users={users}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUserClick}
        currentData={currentData}
      />

      {filteredData.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          currentStart={((page - 1) * itemsPerPage) + 1}
          currentEnd={Math.min(page * itemsPerPage, filteredData.length)}
          totalItems={filteredData.length}
        />
      )}

      {/* Modal para editar usuario */}
      <UserForm
        isOpen={isUserModalOpen}
        onClose={() => { closeUserModal(); resetForm(); }}
        onSubmit={handleSubmitUser}
        formData={formData}
        onInputChange={handleInputChange}
        loading={submitLoading}
        user={selectedUser}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        user={selectedUser}
        onEdit={() => { closeViewModal(); handleEditUser(selectedUser!); }}
      />

      <UserDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { closeDeleteModal(); setUserToDelete(null); }}
        user={userToDelete}
        onConfirm={confirmDeleteUser}
      />

      {/* Modal de éxito actualizado (sin opción de creación) */}
      <Modal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} className="max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 dark:bg-green-900/20">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white/90">
            {successType === "edit" && "¡Actualización Exitosa!"}
            {successType === "delete" && "¡Eliminación Exitosa!"}
          </h3>
          <p className="text-gray-600 mb-6 dark:text-gray-400">
            {successType === "edit" && "Usuario actualizado exitosamente"}
            {successType === "delete" && "Usuario eliminado exitosamente"}
          </p>
          <button
            onClick={closeSuccessModal}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}