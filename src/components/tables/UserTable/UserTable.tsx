// tables/UserTable/UserTable.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge, { type BadgeColor } from "../../ui/badge/Badge";
import type { IUser } from "../../../types/user/IUser";


interface UserTableProps {
  users: IUser[];
  onViewUser: (user: IUser) => void;
  onEditUser: (user: IUser) => void;
  onDeleteUser: (user: IUser) => void;
  currentData: IUser[];
}

export function UserTable({ 
  users, 
  onViewUser, 
  onEditUser, 
  onDeleteUser,
  currentData 
}: UserTableProps) {
  
  // Función para obtener el texto del estado
  const getStatusText = (status: boolean | undefined): string => {
    if (status === undefined || status === null) {
      return "sin estado";
    }
    return status ? "Activo" : "Inactivo";
  };

  // Función para obtener el color del badge según el estado
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
      default: return rol;
    }
  };

  // Función para obtener el color del badge según el rol
  const getRolColor = (rol: string): BadgeColor => {
    switch (rol) {
      case 'admin': return 'error';
      case 'odontologo': return 'warning';
      case 'asistente': return 'primary';
      default: return 'primary';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Todos los Usuarios
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Usuario</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Username</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Telefono</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Correo</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rol</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fecha Creación</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ultima Actualización</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Acciones</TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentData.length > 0 ? (
              currentData.map((user: IUser) => {
                const statusText = getStatusText(user.activo);
                const statusColor = getStatusColor(user.activo);
                const rolText = getRolText(user.rol);
                const rolColor = getRolColor(user.rol);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                  
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.nombres} {user.apellidos}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.username}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.telefono}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.correo}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={rolColor}>
                        {rolText}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={statusColor}>
                        {statusText}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.fecha_creacion? new Date(user.fecha_creacion).toLocaleDateString() : 'N/A'}
                    </TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.fecha_modificacion ? new Date(user.fecha_modificacion).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {/* Botón Ver */}
                        <button
                          onClick={() => onViewUser(user)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          title="Ver usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Botón Editar */}
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                          title="Editar usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => onDeleteUser(user)}
                          className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          title="Eliminar usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {users.length === 0 
                    ? "No hay usuarios registrados" 
                    : "No se encontraron resultados para la búsqueda"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}