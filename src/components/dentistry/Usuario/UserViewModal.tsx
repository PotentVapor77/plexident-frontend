// users/UserViewModal.tsx
import { Modal } from "../../ui/modal";
import Badge, { type BadgeColor } from "../../ui/badge/Badge";
import type { UserViewModalProps } from "../../../types/IUser";


export function UserViewModal({ isOpen, onClose, user, onEdit }: UserViewModalProps) {
  
  // Función para obtener el texto del estado
  const getStatusText = (status: boolean | undefined): string => {
    if (status === undefined || status === null) {
      return "sin estado";
    }
    return status ? "Activo" : "Inactivo";
  };

   // Color del badge según el estado
  const getStatusColor = (status: boolean | undefined): BadgeColor => {
    if (status === undefined || status === null) {
      return "primary";
    }
    return status ? "success" : "error";
  };
  
  // Función para obtener el texto del rol
  const getRolText = (rol: string): string => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'odontologo': return 'Odontólogo';
      case 'asistente': return 'Asistente';
      default: return 'No especificado';
    }
  };

    // Color del badge según el rol
  const getRolColor = (rol: string): BadgeColor => {
    switch (rol) {
      case "admin": return "error";
      case "odontologo": return "warning";
      case "asistente": return "primary";
      default: return "primary";
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
              Información del Usuario
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detalles completos del usuario
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Información Personal</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombres</label>
                <p className="text-gray-800 dark:text-white/90">{user.nombres}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Apellidos</label>
                <p className="text-gray-800 dark:text-white/90">{user.apellidos}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Correo Electrónico</label>
                <p className="text-gray-800 dark:text-white/90">{user.correo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rol</label>
                <div className="mt-1">
                  <Badge size="sm" color={getRolColor(user.rol)}>
                    {getRolText(user.rol)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</label>
                <div className="mt-1">
                  <Badge size="sm" color={getStatusColor(user.status)}>
                    {getStatusText(user.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Sistema */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Información del Sistema</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Creación</label>
                  <p className="text-gray-800 dark:text-white/90">{formatDate(user.created_at)}</p>
                </div>
              )}
              {user.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Actualización</label>
                  <p className="text-gray-800 dark:text-white/90">{formatDate(user.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
          <button
            onClick={onEdit}
            type="button"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Editar Usuario
          </button>
        </div>
      </div>
    </Modal>
  );
}