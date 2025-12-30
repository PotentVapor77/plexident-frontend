// src/components/users/table/UserTable.tsx
/**
 * ============================================================================
 * COMPONENT: Tabla de Usuarios
 * ============================================================================
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
  useDeleteUser,
} from "../../../../hooks/user/useUsers";
import type { IUser } from "../../../../types/user/IUser";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import { UserPermissionsModal } from "../modals/UserPermissionsModal"; // Nuevo import

interface UserTableProps {
  onEdit?: (user: IUser) => void;
  onView?: (user: IUser) => void;
  onDelete?: (user: IUser) => void;
  onPermissions?: (user: IUser) => void; // Nueva prop opcional
}

export function UserTable({ onEdit, onView, onDelete, onPermissions }: UserTableProps) {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<IUser | null>(null); // Estado para usuario seleccionado
  
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

    if (
      !confirm(`¿Estás seguro de eliminar al usuario "${user.username}"?`)
    ) {
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
  // RENDER: LOADING
  // ========================================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando usuarios...
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: ERROR
  // ========================================================================
  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error al cargar usuarios
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error || "Error desconocido"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: MAIN
  // ========================================================================
  return (
    <div className="space-y-4">
      {/* Header con buscador */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o correo..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-sm">No se encontraron usuarios</p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user: IUser) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {user.nombres.charAt(0)}
                          {user.apellidos.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user.nombres} {user.apellidos}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.correo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.rol === "Administrador"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : user.rol === "Odontologo"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {/* Botón Ver */}
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      
                      {/* Botón Permisos - SIEMPRE VISIBLE pero bloqueado para Admin */} 
                        <button
                          onClick={() => handlePermissions(user)}
                          disabled={user.rol === "Administrador"}
                          className={`${
                            user.rol === "Administrador"
                              ? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-not-allowed"
                              : "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          }`}
                          title={
                            user.rol === "Administrador"
                              ? "Administradores no pueden modificar permisos"
                              : "Gestionar permisos"
                          }
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </button>

                      
                      {/* Botón Editar */}
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Editar"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      
                      {/* Botón Eliminar */}
                        <button
                            onClick={() => handleDeleteClick(user)}
                            className={`${
                              !user.is_active
                                ? "text-red-300 dark:text-red-500 cursor-not-allowed opacity-50"
                                : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            }`}
                            title={
                              !user.is_active
                                ? "Usuarios inactivos no se pueden eliminar"
                                : "Eliminar"
                            }
                            disabled={!user.is_active || deleteUserMutation.isPending}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando página{" "}
            <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.total_pages}</span> (
            {pagination.count} usuarios totales)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_previous}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
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