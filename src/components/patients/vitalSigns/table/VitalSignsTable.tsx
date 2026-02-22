// src/components/vitalSigns/table/VitalSignsTable.tsx

import { useState } from "react";
import { useVitalSigns } from "../../../../hooks/vitalSigns/useVitalSigns";
import type { IVitalSigns } from "../../../../types/vitalSigns/IVitalSigns";
import { getPacienteById } from "../../../../services/patient/patientService";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { useAuth } from "../../../../hooks/auth/useAuth";
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  User,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Wind,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const { user } = useAuth();

  const { vitalSigns, pagination, isLoading, isError, error } = useVitalSigns({
    page,
    pageSize,
    search,
    paciente: pacienteId,
  });

  const isAdmin = user?.rol === "Administrador";

  // ✅ FILTRAR: Solo mostrar activos para no administradores
  const vitalList = isAdmin 
    ? (vitalSigns ?? [])
    : (vitalSigns ?? []).filter(v => v.activo);

  const ensurePatientInCache = async (id: string) => {
    if (pacienteCache[id]) return;
    try {
      const paciente = await getPacienteById(id);
      setPacienteCache((prev) => ({ ...prev, [id]: paciente }));
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
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
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

  const getEstadoColor = (activo: boolean) => {
    return activo
      ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800'
      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando registros médicos y datos del paciente...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-error-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar registros médicos
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error || "Error desconocido"}
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
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, cédula..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 appearance-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
        <div className="overflow-x-auto custom-scrollbar max-h-[calc(75vh-20rem)]">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Consulta</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[220px]">Signos vitales</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[140px]">Fecha consulta</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
                )}
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {vitalList.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron registros médicos
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {search ? 'Intenta con otros términos de búsqueda' : 'No hay registros médicos'}
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
                vitalList.map((v) => {
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
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {/* Paciente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                            {patientInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {patientName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              CI: {patientId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Consulta */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {tieneConsulta ? (
                            <div className="space-y-1">
                              {v.motivo_consulta && (
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">Motivo:</span>
                                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                                    {truncateText(v.motivo_consulta || "No especificado", 50)}
                                  </p>
                                </div>
                              )}
                              {v.enfermedad_actual && (
                                <div className="text-xs">
                                  <span className="font-medium text-gray-600 dark:text-gray-500">Enf. actual:</span>
                                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                    {truncateText(v.enfermedad_actual, 60)}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                              Sin datos de consulta
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Signos vitales */}
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Temperatura</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {v.temperatura ?? "-"}°C
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-error-600 dark:text-error-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Pulso</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {v.pulso ?? "-"} lpm
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Frec. Resp.</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {v.frecuencia_respiratoria ?? "-"} rpm
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Presión Art.</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {v.presion_arterial || "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fecha consulta */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(v.fecha_consulta || v.fecha_creacion)}
                        </div>
                      </td>

                      {/* ✅ Estado - Solo para Administrador */}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(v.activo)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${v.activo ? 'bg-success-500' : 'bg-gray-400'}`} />
                            {v.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      )}

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1">
                          {/* Ver */}
                          {onView && (
                            <button
                              onClick={() => handleView(v)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          {/* Editar */}
                          {onEdit && (
                            <button
                              onClick={() => handleEdit(v)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Eliminar */}
                          {onDelete && (
                            <button
                              onClick={() => handleDeleteClick(v)}
                              disabled={!v.activo}
                              className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                                !v.activo
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                                  : "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                              }`}
                              title={!v.activo ? "No se puede eliminar" : "Eliminar registro"}
                            >
                              <Trash2 className="h-4 w-4" />
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
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {vitalList.length} de {pagination?.count || 0} registros médicos
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Página <span className="font-medium">{pagination.page}</span> de{" "}
            <span className="font-medium">{pagination.totalPages}</span> • Total: {pagination.count}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevious}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
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