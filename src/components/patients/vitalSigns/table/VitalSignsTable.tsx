// src/components/vitalSigns/table/VitalSignsTable.tsx

import { useState } from "react";
import { useVitalSigns } from "../../../../hooks/vitalSigns/useVitalSigns";
import type { IVitalSigns } from "../../../../types/vitalSigns/IVitalSigns";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IPaciente } from "../../../../types/patient/IPatient";

interface VitalSignsTableProps {
  onEdit?: (vital: IVitalSigns) => void;
  onView?: (vital: IVitalSigns) => void;
  onDelete?: (vital: IVitalSigns) => void;
  pacienteId?: string;
}

interface PacienteCache {
  [key: string]: IPaciente;
}

export function VitalSignsTable({
  onEdit,
  onView,
  onDelete,
  pacienteId,
}: VitalSignsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");

  const [pacienteCache, setPacienteCache] = useState<PacienteCache>({});

  const { vitalSigns, pagination, isLoading, isError, error } = useVitalSigns({
    page,
    pageSize,
    search,
    paciente: pacienteId,
  });

  const vitalList = vitalSigns ?? [];

  const ensurePatientInCache = async (id: string) => {
    if (pacienteCache[id]) return;
    try {
      const paciente = await getPacienteById(id);
      setPacienteCache(prev => ({ ...prev, [id]: paciente }));
    } catch {
      // noop
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleView = (v: IVitalSigns) => {
    onView?.(v);
  };

  const handleEdit = (v: IVitalSigns) => {
    onEdit?.(v);
  };

  const handleDeleteClick = (v: IVitalSigns) => {
    onDelete?.(v);
  };

  const getPacienteObject = (v: IVitalSigns): IPaciente | null => {
    const p = v.paciente;
    if (typeof p === "object" && p !== null) return p as IPaciente;
    if (typeof p === "string") return pacienteCache[p] ?? null;
    return null;
  };

  const getPatientName = (v: IVitalSigns): string => {
    const paciente = getPacienteObject(v);
    if (paciente) return `${paciente.nombres} ${paciente.apellidos}`.trim();
    return "Paciente";
  };

  const getPatientInitials = (v: IVitalSigns): string => {
    const paciente = getPacienteObject(v);
    if (paciente) {
      const first = paciente.nombres?.charAt(0)?.toUpperCase() || "P";
      const last = paciente.apellidos?.charAt(0)?.toUpperCase() || "";
      return `${first}${last}`;
    }
    return "P";
  };

  const getPatientId = (v: IVitalSigns): string => {
    const paciente = getPacienteObject(v);
    if (paciente)
      return paciente.cedula_pasaporte || paciente.id.substring(0, 8) || "N/A";
    if (typeof v.paciente === "string") return v.paciente.substring(0, 8);
    return "N/A";
  };

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

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando registros médicos y datos del paciente...
          </p>
        </div>
      </div>
    );
  }

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
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-5.75a.75.75 0 011.5 0v1.5a.75.75 0 01-1.5 0v-1.5zm0-7a.75.75 0 011.5 0v5.5a.75.75 0 01-1.5 0v-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error al cargar registros médicos
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error || "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, cédula, motivo de consulta..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar:
          </label>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Consulta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Signos vitales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Fecha consulta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {vitalList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">No se encontraron registros médicos</p>
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
              vitalList.map(v => {
                const paciente = getPacienteObject(v);
                if (!paciente && typeof v.paciente === "string") {
                  void ensurePatientInCache(v.paciente);
                }

                const patientName = getPatientName(v);
                const patientInitials = getPatientInitials(v);
                const patientId = getPatientId(v);

                const tieneConsulta = v.motivo_consulta || v.enfermedad_actual;

                return (
                  <tr
                    key={v.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold shadow-md shadow-blue-500/30">
                          {patientInitials}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {patientName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            CI {patientId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {tieneConsulta ? (
                          <>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              <span className="font-semibold">Motivo:</span>{" "}
                              {truncateText(v.motivo_consulta || "No especificado", 50)}
                            </div>
                            {v.enfermedad_actual && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="font-medium">Enf. actual:</span>{" "}
                                {truncateText(v.enfermedad_actual, 60)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Sin datos de consulta
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">
                          {v.temperatura ?? "-"}°C
                        </span>{" "}
                        · Pulso:{" "}
                        <span className="font-semibold">
                          {v.pulso ?? "-"} lpm
                        </span>{" "}
                        · FR:{" "}
                        <span className="font-semibold">
                          {v.frecuencia_respiratoria ?? "-"} rpm
                        </span>{" "}
                        · PA:{" "}
                        <span className="font-semibold">
                          {v.presion_arterial || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(v.fecha_consulta || v.fecha_creacion)}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          v.activo
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {v.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => handleView(v)}
                            className="text-blue-600 transition-colors hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={() => handleEdit(v)}
                            className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Editar"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.586 3.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l9.586-8.758z"
                              />
                            </svg>
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(v)}
                            disabled={!v.activo}
                            className={`transition-colors ${
                              v.activo
                                ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                : "cursor-not-allowed text-red-300 opacity-50 dark:text-red-500"
                            }`}
                            title={
                              !v.activo
                                ? "Registros inactivos no se pueden eliminar"
                                : "Eliminar"
                            }
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.867 19.142L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:flex-row">
          <div>
            Mostrando página{" "}
            <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.totalPages}</span> (
            {pagination.count} registros)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevious}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}