import { Modal } from "../../../../components/ui/modal";
import Badge, { type BadgeColor } from "../../../../components/ui/badge/Badge";
import type { IUser } from "../../../../types/user/IUser";

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onEdit: () => void;
}

export function UserViewModal({ isOpen, onClose, user, onEdit }: UserViewModalProps) {
  if (!user) return null;

  const getFullName = (): string => {
    return `${user.apellidos}, ${user.nombres}`;
  };

  const getStatusText = (status: boolean): string => status ? "Activo" : "Inactivo";
  const getStatusColor = (status: boolean): BadgeColor => status ? "success" : "error";

  const getRoleBadgeColor = (rol: string): BadgeColor => {
    switch (rol) {
      case "Administrador":
        return "error";
      case "Odontologo":
        return "info";
      case "Asistente":
        return "warning";
      default:
        return "primary";
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const initials = `${user.nombres?.[0] ?? ""}${user.apellidos?.[0] ?? ""}`.toUpperCase();

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div>
              <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
                Perfil de Usuario
              </h2>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                Sistema de Gestión · Control de Acceso
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge size="sm" color={getStatusColor(user.activo)}>
              {getStatusText(user.activo)}
            </Badge>
            <Badge size="sm" color={getRoleBadgeColor(user.rol)}>
              {user.rol}
            </Badge>
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

      {/* Cabecera principal */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-light-50 text-brand-700 dark:bg-blue-light-900/40 dark:text-blue-light-100 flex items-center justify-center text-lg font-semibold shadow-theme-sm">
              {initials || "U"}
            </div>
            <div>
              <p className="text-theme-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Usuario del Sistema
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {getFullName()}
              </p>
              <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-1">
                @{user.username} · ID: {user.id}
              </p>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="flex flex-col gap-2 text-theme-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Teléfono</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user.telefono}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Correo</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px] text-right">
                {user.correo}
              </span>
            </div>
          </div>

          {/* Fechas */}
          <div className="flex flex-col gap-2 text-theme-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Creado</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(user.fecha_creacion)}
              </span>
            </div>
            {user.fecha_modificacion && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Modificado</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(user.fecha_modificacion)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-6 py-5 bg-gray-50 dark:bg-gray-dark">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Información del Usuario */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Usuario
            </h3>
            <dl className="space-y-2 text-theme-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Nombres completos</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {user.nombres}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Apellidos completos</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-medium">
                  {user.apellidos}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Nombre de usuario</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  @{user.username}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Rol en el sistema</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  <Badge color={getRoleBadgeColor(user.rol)}>
                    {user.rol}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>

          {/* Permisos y Acceso */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Control de Acceso
            </h3>
            <dl className="space-y-2 text-theme-sm">
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 dark:text-gray-400">Estado de acceso</dt>
                <dd>
                  <Badge color={getStatusColor(user.activo)}>
                    {getStatusText(user.activo)}
                  </Badge>
                </dd>
              </div>
              {user.creado_por && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Creado por usuario ID</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    #{user.creado_por}
                  </dd>
                </div>
              )}
              {user.actualizado_por && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Última modificación por</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    Usuario ID #{user.actualizado_por}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Permisos según Rol */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-4 lg:col-span-2">
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Permisos del Rol: {user.rol}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-theme-sm">
              {user.rol === "Administrador" && (
                <>
                  <PermissionItem text="Gestión completa del sistema" />
                  <PermissionItem text="Administrar usuarios" />
                  <PermissionItem text="Configurar parámetros" />
                  <PermissionItem text="Acceso a reportes" />
                </>
              )}
              {user.rol === "Odontologo" && (
                <>
                  <PermissionItem text="Gestión de pacientes" color="blue" />
                  <PermissionItem text="Historias clínicas" color="blue" />
                  <PermissionItem text="Odontograma digital" color="blue" />
                  <PermissionItem text="Gestión de citas" color="blue" />
                </>
              )}
              {user.rol === "Asistente" && (
                <>
                  <PermissionItem text="Programar citas" color="yellow" />
                  <PermissionItem text="Ver pacientes (solo lectura)" color="yellow" />
                  <PermissionItem text="Gestión de agenda" color="yellow" />
                  <PermissionItem text="Enviar notificaciones" color="yellow" />
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cerrar
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Editar Usuario
        </button>
      </div>
    </Modal>
  );
}

// Componente auxiliar para permisos
function PermissionItem({ text, color = "green" }: { text: string; color?: "green" | "blue" | "yellow" }) {
  const colorClasses = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    yellow: "text-yellow-600 dark:text-yellow-400"
  };

  return (
    <div className={`flex items-center gap-2 ${colorClasses[color]}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
