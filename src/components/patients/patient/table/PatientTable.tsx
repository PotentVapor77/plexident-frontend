// src/components/tables/PatientTable/PatientTable.tsx

import { useState } from "react";
import { usePacientes } from "../../../../hooks/patient/usePatients";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { useNavigate } from "react-router-dom";
import { usePacienteActivo } from "../../../../context/PacienteContext";
import { useAuth } from "../../../../hooks/auth/useAuth";
import {
  Eye,
  Edit2,
  Trash2,
  User,
  Phone,
  Calendar,
  FileText,
  Bookmark,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PatientTableProps {
  onEdit?: (paciente: IPaciente) => void;
  onView?: (paciente: IPaciente) => void;
  onDelete?: (paciente: IPaciente) => void;
  onToggleStatus?: (paciente: IPaciente) => void;
  onActivate: (patient: IPaciente) => void;
}

export function PatientTable({
  onEdit,
  onView,
  onDelete,
  onActivate,
}: PatientTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { pacienteActivo } = usePacienteActivo();
  const { user } = useAuth();
  
  const { pacientes, pagination, isLoading, isError, error } = usePacientes({
    page,
    page_size: pageSize,
    search,
  });

  const isAdmin = user?.rol === "Administrador";

  // ✅ FILTRAR PACIENTES: Solo mostrar activos para Odontólogo/Asistente
  const patientsList = isAdmin 
    ? (pacientes ?? []) 
    : (pacientes ?? []).filter(p => p.activo);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (paciente: IPaciente) => {
    console.log("Editar paciente:", paciente);
    navigate(`/pacientes/${paciente.id}/editar`);
    onEdit?.(paciente);
  };

  const handleView = (paciente: IPaciente) => {
    onView?.(paciente);
  };

  const handleDeleteClick = (paciente: IPaciente) => {
    onDelete?.(paciente);
  };
  
  const handleActivateClick = (paciente: IPaciente) => {
    onActivate(paciente);
  };

  const getCondicionEdadLabel = (cond: IPaciente["condicion_edad"]) => {
    switch (cond) {
      case "H":
        return "horas";
      case "D":
        return "días";
      case "M":
        return "meses";
      case "A":
        return "años";
      default:
        return "";
    }
  };
  
  const isPacienteActivo = (paciente: IPaciente) => {
    return pacienteActivo?.id === paciente.id;
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando pacientes...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (isError) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-error-400"
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
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar pacientes
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error || "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // TABLA
  return (
    <div className="space-y-4">
      {/* Header con buscador */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
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

      {/* Tabla */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="overflow-x-auto custom-scrollbar max-h-[calc(90vh-20rem)]">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Cédula/Pasaporte</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Edad</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Teléfono</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
                )}
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[180px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {patientsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron pacientes
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {search ? "Intenta con otros términos de búsqueda" : "No hay pacientes registrados"}
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
                patientsList.map((paciente) => {
                  const isActive = isPacienteActivo(paciente);

                  return (
                    <tr key={paciente.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {/* Paciente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                            {getInitials(paciente.nombres, paciente.apellidos)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {paciente.nombres} {paciente.apellidos}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              CI: {paciente.cedula_pasaporte}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {paciente.cedula_pasaporte}
                        </div>
                      </td>

                      {/* Edad */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {paciente.edad} {getCondicionEdadLabel(paciente.condicion_edad)}
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          {paciente.telefono}
                        </div>
                      </td>

                      {/* Estado - Solo para Administrador */}
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              paciente.activo
                                ? "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800"
                                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${paciente.activo ? "bg-success-500" : "bg-gray-400"}`} />
                            {paciente.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      )}

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1">
                          {/* Botón Fijar */}
                          <button
                            onClick={() => handleActivateClick(paciente)}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${
                              isActive
                                ? "text-success-600 bg-success-50 hover:bg-success-100 dark:text-success-400 dark:bg-success-900/30 dark:hover:bg-success-900/50"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            } transition-colors`}
                            title={isActive ? "Desfijar paciente" : "Fijar paciente"}
                          >
                            <Bookmark className="h-4 w-4" fill={isActive ? "currentColor" : "none"} />
                          </button>

                          {/* Botón Ver */}
                          {onView && (
                            <button
                              onClick={() => handleView(paciente)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          {/* Botón Editar */}
                          {onEdit && (
                            <button
                              onClick={() => handleEdit(paciente)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => handleDeleteClick(paciente)}
                            disabled={!paciente.activo}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                              !paciente.activo
                                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                                : "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                            }`}
                            title={!paciente.activo ? "No se puede eliminar" : "Eliminar paciente"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {patientsList.length} de {pagination?.count || 0} pacientes
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Página <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.total_pages}</span> • Total: {pagination.count}
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
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}