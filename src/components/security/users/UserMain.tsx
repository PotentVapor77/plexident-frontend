import { useState } from 'react';
import { UserTable } from './table/UserTable'; // ✅ RUTA CORREGIDA
import { UserViewModal } from './modals/UserViewModal';
import type { IUser } from '../../../types/user/IUser';
import { useModal } from '../../../hooks/useModal';

export default function UserMain() {
  const [userToView, setUserToView] = useState<IUser | null>(null);

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const handleViewUser = (user: IUser) => {
    setUserToView(user);
    openViewModal();
  };

  const handleEditUser = (user: IUser) => {
    console.log('Editar usuario:', user);
    alert('Funcionalidad de edición en desarrollo');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema odontológico
          </p>
        </div>
      </div>

      <UserTable onView={handleViewUser} onEdit={handleEditUser} />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        user={userToView}
        onEdit={() => {
          closeViewModal();
          if (userToView) handleEditUser(userToView);
        }}
      />
    </div>
  );
}
