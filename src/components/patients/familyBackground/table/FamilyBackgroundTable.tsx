// src/components/familyBackground/table/FamilyBackgroundTable.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFamilyBackgrounds } from "../../../../hooks/familyBackground/useFamilyBackgrounds";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IFamilyBackground } from "../../../../types/familyBackground/IFamilyBackground";
import type { IPacienteBasico } from "../../../../types/personalBackground/IPersonalBackground";
import {
  contarAntecedentesActivos,
  tieneAntecedentesCriticos,
} from "../../../../types/familyBackground/IFamilyBackground";

interface FamilyBackgroundTableProps {
  onView?: (background: IFamilyBackground) => void;
  onEdit?: (background: IFamilyBackground) => void;
  onDelete?: (background: IFamilyBackground) => void;
}

interface PacienteCache {
  [key: string]: IPacienteBasico;
}

export function FamilyBackgroundTable({
  onView,
  onEdit,
  onDelete,
}: FamilyBackgroundTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [pacienteCache, setPacienteCache] = useState<PacienteCache>({});

  const { backgrounds, pagination, isLoading, isError, error } =
    useFamilyBackgrounds({
      page,
      page_size: pageSize,
      search,
    });

  const backgroundsList = backgrounds ?? [];

  // Extraer IDs de pacientes únicos para consultar
  const pacienteIds = Array.from(
    new Set(
      backgroundsList
        .filter((bg) => typeof bg.paciente === "string")
        .map((bg) => bg.paciente as string)
    )
  );

  // Consultar pacientes por sus IDs
  const { data: pacientesData, isLoading: isLoadingPacientes } = useQuery({
    queryKey: ["pacientesForFamilyBackgrounds", pacienteIds],
    queryFn: async () => {
      if (pacienteIds.length === 0) return {};

      const cache: PacienteCache = {};
      await Promise.all(
        pacienteIds.map(async (id) => {
          try {
            const paciente = await getPacienteById(id);
            cache[id] = {
              id: paciente.id,
              nombres: paciente.nombres,
              apellidos: paciente.apellidos,
              cedula_pasaporte: paciente.cedula_pasaporte,
            };
          } catch (error) {
            console.error(`Error obteniendo paciente ${id}:`, error);
            cache[id] = {
              id,
              nombres: "Desconocido",
              apellidos: "",
              cedula_pasaporte: "N/A",
            };
          }
        })
      );
      return cache;
    },
    enabled: pacienteIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Actualizar cache cuando se obtienen datos de pacientes
  useEffect(() => {
    if (pacientesData) {
      setPacienteCache((prev) => ({ ...prev, ...pacientesData }));
    }
  }, [pacientesData]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleView = (background: IFamilyBackground) => {
    onView?.(background);
  };

  const handleEdit = (background: IFamilyBackground) => {
    onEdit?.(background);
  };

  const handleDeleteClick = (background: IFamilyBackground) => {
    onDelete?.(background);
  };

  // ✅ Función para obtener el objeto paciente (si es string, busca en cache)
  const getPacienteObject = (
    background: IFamilyBackground
  ): IPacienteBasico | null => {
    const paciente = background.paciente;

    if (typeof paciente === "object" && paciente !== null) {
      return paciente;
    }

    if (typeof paciente === "string") {
      return pacienteCache[paciente] || null;
    }

    return null;
  };

  // ✅ Función para obtener nombre del paciente
  const getPatientName = (background: IFamilyBackground): string => {
    const pacienteObj = getPacienteObject(background);
    if (pacienteObj) {
      return (
        `${pacienteObj.nombres || ""} ${pacienteObj.apellidos || ""}`.trim() ||
        "Paciente"
      );
    }
    return "Paciente";
  };

  // ✅ Función para obtener iniciales del paciente
  const getPatientInitials = (background: IFamilyBackground): string => {
    const pacienteObj = getPacienteObject(background);
    if (pacienteObj) {
      const firstInitial =
        pacienteObj.nombres?.charAt(0)?.toUpperCase() || "P";
      const lastInitial =
        pacienteObj.apellidos?.charAt(0)?.toUpperCase() || "";
      return `${firstInitial}${lastInitial}`;
    }
    return "P";
  };

  // ✅ Función para obtener ID del paciente
  const getPatientId = (background: IFamilyBackground): string => {
    const pacienteObj = getPacienteObject(background);
    if (pacienteObj) {
      return (
        pacienteObj.cedula_pasaporte ||
        pacienteObj.id.substring(0, 8) ||
        "N/A"
      );
    }

    // Si es string (UUID) y no está en cache
    if (typeof background.paciente === "string") {
      return background.paciente.substring(0, 8);
    }

    return "N/A";
  };

  // Función para formatear la fecha en formato DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  // LOADING (incluye loading de pacientes)
  if (isLoading || (pacienteIds.length > 0 && isLoadingPacientes)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando antecedentes y datos del paciente...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
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
              Error al cargar antecedentes
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
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
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, cédula..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar:
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Antecedentes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Registro
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
            {backgroundsList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">No se encontraron antecedentes</p>
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
              backgroundsList.map((background) => {
                const totalAntecedentes = contarAntecedentesActivos(background);
                const tieneCriticos = tieneAntecedentesCriticos(background);
                const pacienteObj = getPacienteObject(background);

                // Si no tenemos datos del paciente aún, mostrar skeleton
                if (
                  !pacienteObj &&
                  typeof background.paciente === "string"
                ) {
                  return (
                    <tr key={background.id} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          </div>
                          <div className="ml-4">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                            <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const patientName = getPatientName(background);
                const patientInitials = getPatientInitials(background);
                const patientId = getPatientId(background);

                return (
                  <tr
                    key={background.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      tieneCriticos ? "bg-red-50 dark:bg-red-900/10" : ""
                    }`}
                  >
                    {/* Paciente - Avatar con color azul consistente */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md shadow-blue-500/30">
                            {patientInitials}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {patientName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            CI: {patientId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Antecedentes */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tieneCriticos && (
                          <span
                            className="text-yellow-500"
                            title="Múltiples antecedentes familiares"
                          >
                            ⚠️
                          </span>
                        )}
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {totalAntecedentes > 0 ? (
                            <>
                              <span className="font-medium">
                                {totalAntecedentes}
                              </span>{" "}
                              antecedente{totalAntecedentes !== 1 && "s"}
                            </>
                          ) : (
                            <span className="text-gray-400">
                              Sin antecedentes
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fecha - USANDO EL FORMATO DD/MM/YYYY */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(background.fecha_creacion)}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          background.activo
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {background.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => handleView(background)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
                        )}

                        {onEdit && (
                          <button
                            onClick={() => handleEdit(background)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
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
                        )}

                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(background)}
                            disabled={!background.activo} // ✅ BLOQUEADO si inactivo
                            className={`transition-colors ${
                              background.activo
                                ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                : "text-red-300 dark:text-red-500 cursor-not-allowed opacity-50"
                            }`}
                            title={
                              !background.activo
                                ? "Antecedentes inactivos no se pueden eliminar"
                                : "Eliminar"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando página <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.total_pages}</span> (
            {pagination.count} antecedentes totales)
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
    </div>
  );
}