// src/components/users/modals/UserDeleteModal.tsx

import type { IUser } from "../../../../types/user/IUser";
import { Modal } from "../../../../components/ui/modal";
import { useDeleteUser } from "../../../../hooks/user/useUsers"; // ✅ Importar el hook
import { useNotification } from "../../../../context/notifications/NotificationContext";

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onDeleted?: () => void;
}

export function UserDeleteModal({
  isOpen,
  onClose,
  user,
  onDeleted,
}: UserDeleteModalProps) {
  const { notify } = useNotification(); // ✅ Usar el hook directamente
  const deleteUserMutation = useDeleteUser(); // ✅ Usar el hook de eliminación

  const getFullName = (): string => {
    if (!user) return "";
    return `${user.apellidos}, ${user.nombres}`;
  };

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    try {
      // ✅ Usar el hook que automáticamente invalida las queries
      await deleteUserMutation.mutateAsync(user.id);
      
      // ✅ Notificar después de eliminar exitosamente
      notify({
        type: "error",
        title: "Usuario eliminado",
        message: `Se eliminó el usuario ${getFullName()} correctamente.`,
      });

      // ✅ Cerrar modal
      onClose();
      
      // ✅ Ejecutar callback si existe
      onDeleted?.();
    } catch (error) {
      notify({
        type: "error",
        title: "Error al eliminar",
        message: "No se pudo eliminar el usuario. Intente nuevamente.",
      });
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}  className="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Confirmar Eliminación
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          ¿Está seguro de que desea eliminar al usuario{" "}
          <strong>{getFullName()}</strong>
          {user.username && ` (@${user.username})`}? Esta acción no se puede
          deshacer.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar Usuario"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
