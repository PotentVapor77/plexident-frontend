// src/components/stomatognathicExam/table/StomatognathicExamTable.tsx

import { useState, useEffect } from "react";
import { useStomatognathicExams } from "../../../../hooks/stomatognathicExam/useStomatognathicExam";
import type { IStomatognathicExam, IPacienteBasico } from "../../../../types/stomatognathicExam/IStomatognathicExam";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { useAuth } from "../../../../hooks/auth/useAuth"; // ✅ AGREGAR

interface StomatognathicExamTableProps {
  onEdit?: (exam: IStomatognathicExam) => void;
  onView?: (exam: IStomatognathicExam) => void;
  onDelete?: (exam: IStomatognathicExam) => void;
  pacienteId?: string;
}

interface PacienteCache {
  [key: string]: IPacienteBasico | IPaciente;
}

export function StomatognathicExamTable({
  onEdit,
  onView,
  onDelete,
  pacienteId,
}: StomatognathicExamTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [pacienteCache, setPacienteCache] = useState<PacienteCache>({});
  const { user } = useAuth(); // ✅ AGREGAR

  const { exams, pagination, isLoading, isError, error } = useStomatognathicExams({
    page,
    pageSize,
    search,
    paciente: pacienteId, 
  });

  const isAdmin = user?.rol === "Administrador"; // ✅ AGREGAR

  // ✅ FILTRAR: Solo mostrar activos para no administradores
  const examList = isAdmin 
    ? (exams ?? [])
    : (exams ?? []).filter(e => e.activo);

  // Calcular total de regiones anormales
  const calculateTotalRegionesAnormales = (exam: IStomatognathicExam): number => {
    if (exam.examen_sin_patologia) return 0;
    
    const regiones = [
      // ATM
      exam.atm_absceso || exam.atm_fibroma || exam.atm_herpes || exam.atm_ulcera || exam.atm_otra_patologia,
      // Mejillas
      exam.mejillas_absceso || exam.mejillas_fibroma || exam.mejillas_herpes || exam.mejillas_ulcera || exam.mejillas_otra_patologia,
      // Maxilar Inferior
      exam.maxilar_inferior_absceso || exam.maxilar_inferior_fibroma || exam.maxilar_inferior_herpes || exam.maxilar_inferior_ulcera || exam.maxilar_inferior_otra_patologia,
      // Maxilar Superior
      exam.maxilar_superior_absceso || exam.maxilar_superior_fibroma || exam.maxilar_superior_herpes || exam.maxilar_superior_ulcera || exam.maxilar_superior_otra_patologia,
      // Paladar
      exam.paladar_absceso || exam.paladar_fibroma || exam.paladar_herpes || exam.paladar_ulcera || exam.paladar_otra_patologia,
      // Piso de Boca
      exam.piso_boca_absceso || exam.piso_boca_fibroma || exam.piso_boca_herpes || exam.piso_boca_ulcera || exam.piso_boca_otra_patologia,
      // Carrillos
      exam.carrillos_absceso || exam.carrillos_fibroma || exam.carrillos_herpes || exam.carrillos_ulcera || exam.carrillos_otra_patologia,
      // Glándulas Salivales
      exam.glandulas_salivales_absceso || exam.glandulas_salivales_fibroma || exam.glandulas_salivales_herpes || exam.glandulas_salivales_ulcera || exam.glandulas_salivales_otra_patologia,
      // Ganglios
      exam.ganglios_absceso || exam.ganglios_fibroma || exam.ganglios_herpes || exam.ganglios_ulcera || exam.ganglios_otra_patologia,
      // Lengua
      exam.lengua_absceso || exam.lengua_fibroma || exam.lengua_herpes || exam.lengua_ulcera || exam.lengua_otra_patologia,
      // Labios
      exam.labios_absceso || exam.labios_fibroma || exam.labios_herpes || exam.labios_ulcera || exam.labios_otra_patologia,
    ];
    
    return regiones.filter(Boolean).length;
  };

  // Calcular si tiene patologías
  const calculateTienePatologias = (exam: IStomatognathicExam): boolean => {
    if (exam.examen_sin_patologia) return false;
    
    return calculateTotalRegionesAnormales(exam) > 0;
  };

  // Formatear fecha correctamente
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  const ensurePatientInCache = async (id: string) => {
    if (pacienteCache[id]) return;
    try {
      const paciente = await getPacienteById(id);
      // Convertir IPaciente a IPacienteBasico para consistencia
      const pacienteBasico: IPacienteBasico = {
        id: paciente.id,
        cedula_pasaporte: paciente.cedula_pasaporte || "",
        primer_nombre: paciente.nombres?.split(" ")[0] || "",
        segundo_nombre: paciente.nombres?.split(" ")[1] || undefined,
        primer_apellido: paciente.apellidos?.split(" ")[0] || "",
        segundo_apellido: paciente.apellidos?.split(" ")[1] || undefined,
        sexo: paciente.sexo as 'M' | 'F',
        edad: paciente.edad || 0,
        condicion_edad: paciente.condicion_edad || "",
      };
      setPacienteCache(prev => ({ ...prev, [id]: pacienteBasico }));
    } catch (e) {
      console.error("Error fetching patient:", e);
    }
  };

  // Cargar pacientes en caché cuando se monta el componente
  useEffect(() => {
    examList.forEach(exam => {
      if (typeof exam.paciente === "string") {
        void ensurePatientInCache(exam.paciente);
      }
    });
  }, [examList]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleView = (exam: IStomatognathicExam) => {
    onView?.(exam);
  };

  const handleEdit = (exam: IStomatognathicExam) => {
    onEdit?.(exam);
  };

  const handleDeleteClick = (exam: IStomatognathicExam) => {
    onDelete?.(exam);
  };

  const getPacienteObject = (exam: IStomatognathicExam): IPacienteBasico | null => {
    const p = exam.paciente;
    if (typeof p === "object" && p !== null) return p as IPacienteBasico;
    if (typeof p === "string") return pacienteCache[p] as IPacienteBasico || null;
    return null;
  };

  const getPatientName = (exam: IStomatognathicExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente) {
      const nombres = [paciente.primer_nombre, paciente.segundo_nombre].filter(Boolean).join(" ");
      const apellidos = [paciente.primer_apellido, paciente.segundo_apellido].filter(Boolean).join(" ");
      return `${nombres} ${apellidos}`.trim();
    }
    return "Paciente";
  };

  const getPatientInitials = (exam: IStomatognathicExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente) {
      const first = paciente.primer_nombre?.charAt(0)?.toUpperCase() || "P";
      const last = paciente.primer_apellido?.charAt(0)?.toUpperCase() || "";
      return `${first}${last}`;
    }
    return "P";
  };

  const getPatientId = (exam: IStomatognathicExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente)
      return paciente.cedula_pasaporte || paciente.id.substring(0, 8) || "N/A";
    if (typeof exam.paciente === "string") return exam.paciente.substring(0, 8);
    return "N/A";
  };

  // Calcular resumen de patologías - CORREGIDO
  const getPatologiasResumen = (exam: IStomatognathicExam): string => {
    if (exam.examen_sin_patologia) return "Sin patologías";
    
    const patologiasCount = calculateTotalRegionesAnormales(exam);
    
    if (patologiasCount === 0) return "Sin patologías";
    
    // Solo mostrar "X regiones" si hay patologías
    return `${patologiasCount} región${patologiasCount > 1 ? 'es' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando exámenes estomatognáticos...
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
              Error al cargar exámenes
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error?.toString() || "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con buscador */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, cédula..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar
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

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Patologías
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Fecha registro
              </th>
              {/* ✅ Ocultar columna Estado para no administradores */}
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Estado
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {examList.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4} 
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">No se encontraron exámenes</p>
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
              examList.map(exam => {
                const patientName = getPatientName(exam);
                const patientInitials = getPatientInitials(exam);
                const patientId = getPatientId(exam);
                const patologiasResumen = getPatologiasResumen(exam);
                const tienePatologias = calculateTienePatologias(exam);
                const fechaFormateada = formatDate(exam.fecha_creacion);

                return (
                  <tr
                    key={exam.id}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      tienePatologias ? "bg-red-50/50 dark:bg-red-900/5" : ""
                    }`}
                  >
                    {/* Paciente */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600  text-white font-semibold shadow-md shadow-purple-500/30">
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

                    {/* Patologías - CORREGIDO */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            tienePatologias ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                          }`}>
                            {patologiasResumen}
                          </span>
                        </div>
                        {tienePatologias && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Requiere atención
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Fecha - CORREGIDO */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {fechaFormateada}
                      </div>
                    </td>

                    {/* ✅ Estado - Solo para Administrador */}
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            exam.activo
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {exam.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => handleView(exam)}
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
                            onClick={() => handleEdit(exam)}
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(exam)}
                            disabled={!exam.activo}
                            className={`transition-colors ${
                              exam.activo
                                ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                : "cursor-not-allowed text-red-300 opacity-50 dark:text-red-500"
                            }`}
                            title={
                              !exam.activo
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

      {/* Paginación */}
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
