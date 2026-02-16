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
  Edit, 
  Trash2, 
  Key, 
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Filter
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
  // STYLE HELPERS (siguiendo la guía de UI)
  // ========================================================================
  const getRoleBadgeStyles = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Odontologo":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Asistente":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadgeStyles = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  };

  // ========================================================================
  // RENDER: LOADING
  // ========================================================================
  if (isLoading) {
    return (
      <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
        <div className="border-b border-gray-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Gestión de Usuarios
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cargando listado de usuarios...
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Cargando usuarios...
          </p>
        </div>
      </section>
    );
  }

  // ========================================================================
  // RENDER: ERROR
  // ========================================================================
  if (isError) {
    return (
      <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
        <div className="border-b border-gray-300 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 border border-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Gestión de Usuarios
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Error al cargar los datos
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Error al cargar usuarios
          </h4>
          <p className="text-sm text-gray-600 text-center mb-4 max-w-md">
            {error || "No se pudo cargar la información de usuarios. Intente nuevamente."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-xs text-gray-500">
              Error en la carga de datos
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ========================================================================
  // RENDER: MAIN
  // ========================================================================
  return (
    <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
      {/* Encabezado de sección - siguiendo el patrón de las otras secciones */}
      <div className="border-b border-gray-300 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Gestión de Usuarios del Sistema
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Administración de usuarios, roles y permisos
              </p>
            </div>
          </div>
          
          {/* Estadísticas rápidas - siguiendo patrón de badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                {users.filter(u => u.is_active).length} Activos
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <XCircle className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">
                {users.filter(u => !u.is_active).length} Inactivos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros - siguiendo patrón UI */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
            />
          </div>
          
          {/* Selector de página - usando el mismo patrón que en las tablas */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Filtros rápidos - opcional, pero siguiendo el patrón */}
        {search && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filtro activo:</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <Filter className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-700">"{search}"</span>
              <button
                onClick={() => setSearch("")}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de usuarios CON SCROLL PERSONALIZADO */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Contenedor con scroll horizontal personalizado */}
        <div className="overflow-x-auto custom-scrollbar">
          {/* Contenedor con ancho mínimo para evitar deformación */}
          <div className="min-w-[1000px] lg:min-w-full">
            {/* Encabezado de tabla */}
            <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50">
              <div className="col-span-2 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Usuario</p>
              </div>
              <div className="col-span-2 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Nombre Completo</p>
              </div>
              <div className="col-span-2 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Correo</p>
              </div>
              <div className="col-span-1 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Teléfono</p>
              </div>
              <div className="col-span-1 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Rol</p>
              </div>
              <div className="col-span-1 p-3">
                <p className="text-xs font-semibold text-gray-800 uppercase">Estado</p>
              </div>
              <div className="col-span-3 p-3 text-right">
                <p className="text-xs font-semibold text-gray-800 uppercase">Acciones</p>
              </div>
            </div>

            {/* Filas de la tabla */}
            <div className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <div className="p-8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200 mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      No se encontraron usuarios
                    </h4>
                    <p className="text-sm text-gray-500 text-center mb-4">
                      {search ? "No hay resultados para tu búsqueda" : "No hay usuarios registrados en el sistema"}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                users.map((user: IUser) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Usuario */}
                    <div className="col-span-2 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-9 w-9">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {user.nombres.charAt(0)}
                            {user.apellidos.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nombre Completo */}
                    <div className="col-span-2 p-3 flex items-center">
                      <p className="text-sm text-gray-900">
                        {user.nombres} {user.apellidos}
                      </p>
                    </div>

                    {/* Correo */}
                    <div className="col-span-2 p-3 flex items-center">
                      <p className="text-sm text-gray-600">
                        {user.correo}
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="col-span-1 p-3 flex items-center">
                      <p className="text-sm text-gray-600">
                        {user.telefono || "-"}
                      </p>
                    </div>

                    {/* Rol - usando badge con icono como en el estilo */}
                    <div className="col-span-1 p-3 flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeStyles(user.rol)}`}
                      >
                        {user.rol === "Administrador" && <Shield className="h-3 w-3 mr-1" />}
                        {user.rol}
                      </span>
                    </div>

                    {/* Estado - usando badge con icono y colores semánticos */}
                    <div className="col-span-1 p-3 flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyles(user.is_active)}`}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </div>

                    {/* Acciones - con estados hover y disabled */}
                    <div className="col-span-3 p-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePermissions(user)}
                        disabled={user.rol === "Administrador"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.rol === "Administrador"
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        }`}
                        title={
                          user.rol === "Administrador"
                            ? "Administradores no pueden modificar permisos"
                            : "Gestionar permisos"
                        }
                      >
                        <Key className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={!user.is_active || deleteUserMutation.isPending}
                        className={`p-1.5 rounded-lg transition-colors ${
                          !user.is_active || deleteUserMutation.isPending
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        }`}
                        title={
                          !user.is_active
                            ? "Usuarios inactivos no se pueden eliminar"
                            : "Eliminar"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paginación - siguiendo el patrón de las tablas */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando página{" "}
            <span className="font-medium text-gray-900">{pagination.page}</span> de{" "}
            <span className="font-medium text-gray-900">{pagination.total_pages}</span> •{" "}
            <span className="font-medium text-gray-900">{pagination.count}</span> usuarios totales
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_previous}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Pie de sección - siguiendo el patrón de las otras secciones */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-xs text-gray-500">
              {users.length} usuarios cargados • Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>
          <span className="text-xs text-gray-400">
            Total en sistema: {pagination?.count || 0}
          </span>
        </div>
      </div>

      {/* Modal de Permisos */}
      {selectedUserForPermissions && (
        <UserPermissionsModal
          isOpen={!!selectedUserForPermissions}
          onClose={closePermissionsModal}
          user={selectedUserForPermissions}
        />
      )}
    </section>
  );
}