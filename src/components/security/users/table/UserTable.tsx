// src/components/users/table/UserTable.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
  useDeleteUser,
} from "../../../../hooks/user/useUsers";
import type { IUser } from "../../../../types/user/IUser";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import { UserPermissionsModal } from "../modals/UserPermissionsModal";
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Key, 
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Shield,
  Filter,
  Mail,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";

interface UserTableProps {
  onEdit?: (user: IUser) => void;
  onView?: (user: IUser) => void;
  onDelete?: (user: IUser) => void;
  onPermissions?: (user: IUser) => void;
}

export function UserTable({ onEdit, onView, onDelete, onPermissions }: UserTableProps) {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<IUser | null>(null);
  
  const debouncedSearch = useDebounce(search, 400);

  const { users, pagination, isLoading, isError, error, refetch } = useUsers({
    page,
    page_size: pageSize,
    search: debouncedSearch,
  });

  const deleteUserMutation = useDeleteUser();

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleDeleteClick = async (user: IUser) => {
    if (onDelete) {
      onDelete(user);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.username}"?`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(user.id);
      notify({
        type: "success",
        title: "Usuario eliminado",
        message: `Se eliminó el usuario ${user.username} correctamente.`,
      });
      refetch();
    } catch (err) {
      notify({
        type: "error",
        title: "Error al eliminar usuario",
        message: "No se pudo eliminar el usuario. Intente nuevamente.",
      });
      console.error(err);
    }
  };

  const handleEdit = (user: IUser) => {
    console.log("Editar usuario:", user);
    navigate(`/usuarios/${user.id}/editar`);
    onEdit?.(user);
  };

  const handleView = (user: IUser) => {
    onView?.(user);
  };

  const handlePermissions = (user: IUser) => {
    setSelectedUserForPermissions(user);
    onPermissions?.(user);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
  };

  const closePermissionsModal = () => {
    setSelectedUserForPermissions(null);
  };

  // ========================================================================
  // STYLE HELPERS (siguiendo los patrones de UI del sistema)
  // ========================================================================
  const getRoleBadgeStyles = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "Odontologo":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "Asistente":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  // ========================================================================
  // LOADING STATE (siguiendo el patrón de las otras tablas)
  // ========================================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando usuarios del sistema...
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE (siguiendo el patrón de las otras tablas)
  // ========================================================================
  if (isError) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-error-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar usuarios
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error || "Error desconocido"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm font-medium text-error-700 hover:text-error-800 dark:text-error-300 dark:hover:text-error-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: MAIN (siguiendo el patrón de las tablas del sistema)
  // ========================================================================
  return (
    <div className="space-y-4">
      {/* Header con estadísticas rápidas - siguiendo patrón de PatientMain */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          

          {/* Estadísticas rápidas con badges */}
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 border border-success-200 dark:bg-success-900/30 dark:border-success-800">
              <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
              <span className="text-sm font-medium text-success-700 dark:text-success-400">
                {users?.filter(u => u.is_active).length || 0} Activos
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                {users?.filter(u => !u.is_active).length || 0} Inactivos
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y selector de página - siguiendo patrón de todas las tablas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o correo..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar:
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Indicador de búsqueda activa - siguiendo patrón de ClinicalRecordManagement */}
      {search && (
        <div className="bg-blue-light-50 border border-blue-light-200 text-blue-light-700 p-3 rounded-lg dark:bg-blue-light-900/20 dark:border-blue-light-800 dark:text-blue-light-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Buscando: "{search}"
              </span>
            </div>
            <button
              onClick={() => setSearch("")}
              className="text-sm text-blue-light-700 hover:text-blue-light-900 dark:text-blue-light-400 dark:hover:text-blue-light-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Tabla - siguiendo el patrón exacto de todas las tablas del sistema */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 w-full">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Usuario</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Nombre Completo</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Correo</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Teléfono</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Rol</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[100px]">Estado</th>
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[220px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron usuarios
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {search ? "Intenta con otros términos de búsqueda" : "No hay usuarios registrados en el sistema"}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="mt-3 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: IUser) => (
                  <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Usuario con iniciales - siguiendo patrón de PatientTable */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                          {getInitials(user.nombres, user.apellidos)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nombre Completo */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.nombres} {user.apellidos}
                      </span>
                    </td>

                    {/* Correo - con icono como en las otras tablas */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {user.correo}
                      </div>
                    </td>

                    {/* Teléfono - con icono */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {user.telefono || "-"}
                      </div>
                    </td>

                    {/* Rol - con badge como en las tablas */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyles(user.rol)}`}>
                        {user.rol === "Administrador" && <Shield className="h-3 w-3" />}
                        {user.rol}
                      </span>
                    </td>

                    {/* Estado - con badge como en las tablas */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.is_active
                          ? "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800"
                          : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-success-500" : "bg-gray-400"}`} />
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Acciones - siguiendo el patrón exacto de las tablas */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex justify-end gap-1">
    {/* Ver */}
    {onView && (
      <button
        onClick={() => handleView(user)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
        title="Ver detalles alv"
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">Ver detalles</span>
      </button>
    )}

    {/* Permisos - BOTÓN DE LLAVE */}
    {onPermissions && (
      <button
        onClick={() => handlePermissions(user)}
        disabled={user.rol === "Administrador"}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
          user.rol === "Administrador"
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
            : "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
        }`}
        title={user.rol === "Administrador" ? "Administradores no pueden modificar permisos" : "Gestionar permisos"}
      >
        <Key className="h-4 w-4" />
        <span className="sr-only">Gestionar permisos</span>
      </button>
    )}

    {/* Editar */}
    {onEdit && (
      <button
        onClick={() => handleEdit(user)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
        title="Editar"
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Editar</span>
      </button>
    )}

    {/* Eliminar */}
    {onDelete && (
      <button
        onClick={() => handleDeleteClick(user)}
        disabled={!user.is_active || deleteUserMutation.isPending}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
          !user.is_active || deleteUserMutation.isPending
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
            : "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
        }`}
        title={!user.is_active ? "Usuarios inactivos no se pueden eliminar" : "Eliminar usuario"}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Eliminar</span>
      </button>
    )}
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer con total de registros - siguiendo patrón de todas las tablas */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {users.length} de {pagination?.count || 0} usuarios
        </div>
      </div>

      {/* Paginación - siguiendo patrón de todas las tablas */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Página <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.total_pages}</span> • Total: {pagination.count} usuarios
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_previous}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-notabledrop transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Permisos */}
      {selectedUserForPermissions && (
        <UserPermissionsModal
          isOpen={!!selectedUserForPermissions}
          onClose={closePermissionsModal}
          user={selectedUserForPermissions}
        />
      )}
    </div>
  );
}