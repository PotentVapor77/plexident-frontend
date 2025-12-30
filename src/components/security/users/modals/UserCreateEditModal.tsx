// src/components/users/modals/UserEditModal.tsx
import { Modal } from "../../../ui/modal";
import UserForm from "../forms/UserForm";
import type { IUser } from "../../../../types/user/IUser";
import { useNotification } from "../../../../context/notifications/NotificationContext";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
}

export function UserCreateEditModal({ isOpen, onClose, user }: UserEditModalProps) {
  const { notify } = useNotification();

  if (!user) return null;

  const initials = `${user.nombres?.[0] ?? ""}${user.apellidos?.[0] ?? ""}`.toUpperCase();

  // ✅ Cerrar modal después de la actualización exitosa
  const handleUserUpdated = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-theme-xl bg-white dark:bg-gray-900"
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-light-100 bg-blue-light-25 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
                Editar Usuario
              </h2>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                Actualice la información del usuario del sistema
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-400 hover:bg-blue-light-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido con el formulario */}
      <div className="px-6 pt-5 pb-6 bg-gray-50 dark:bg-gray-dark max-h-[75vh] overflow-y-auto">
        {/* Cabecera con avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-light-50 text-brand-700 dark:bg-blue-light-900/40 dark:text-blue-light-100 flex items-center justify-center text-base font-semibold shadow-theme-sm">
            {initials || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user.apellidos}, {user.nombres}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.username} · {user.rol}
            </p>
          </div>
        </div>

        {/* ✅ UserForm con notify del contexto */}
        <UserForm
          mode="edit"
          userId={user.id}
          initialData={{
            nombres: user.nombres,
            apellidos: user.apellidos,
            username: user.username,
            telefono: user.telefono,
            correo: user.correo,
            rol: user.rol,
            is_active: user.is_active,
          }}
          onUserCreated={handleUserUpdated}
          notify={(notification) => notify(notification)}
        />
      </div>
    </Modal>
  );
}
