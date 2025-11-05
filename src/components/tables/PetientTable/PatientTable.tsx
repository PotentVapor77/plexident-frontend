// tables/PatientTable.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge, { type BadgeColor } from "../../ui/badge/Badge";
import type { IPatient, PatientTableProps } from "../../../types/IPatient";


export function PatientTable({ 
  patients, 
  onViewPatient, 
  onEditPatient, 
  onDeletePatient,
  currentData 
}: PatientTableProps) {
  
  // Función para obtener el texto del estado según el booleano
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-full overflow-x-auto">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Todos los Pacientes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualización de los pacientes registrados
          </p>
        </div>
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-200 dark:border-gray-700">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Paciente
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Cédula/Pasaporte
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Contacto
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Información Adicional
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-300">
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.length > 0 ? (
              currentData.map((patient: IPatient) => {
                const statusText = getStatusText(patient.status);
                const badgeColor = getStatusColor(patient.status);
                
                return (
                  <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-sm dark:text-white">
                            {patient.nombres} {patient.apellidos}
                          </span>
                          <span className="block text-gray-500 text-xs dark:text-gray-400">
                            {patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toLocaleDateString() : 'Sin fecha'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-sm dark:text-gray-300">
                      {patient.cedula_pasaporte}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="text-gray-600 text-sm dark:text-gray-300">{patient.telefono}</div>
                      <div className="text-blue-600 text-xs dark:text-blue-400">{patient.correo}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={badgeColor}>
                        {statusText}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-sm dark:text-gray-300">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs">Alergias: {patient.alergias || "Ninguna"}</span>
                        <span className="text-xs">Enfermedades: {patient.enfermedades_sistemicas || "Ninguna"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        {/* Botón Ver */}
                        <button
                          onClick={() => onViewPatient(patient)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                          title="Ver paciente"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Botón Editar */}
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="p-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                          title="Editar paciente"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => onDeletePatient(patient)}
                          className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                          title="Eliminar paciente"
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
                  {patients.length === 0 
                    ? "No hay pacientes registrados" 
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