// src/components/stomatognathicExam/table/StomatognathicExamTable.tsx

import { useState, useEffect } from "react";
import { useStomatognathicExams } from "../../../../hooks/stomatognathicExam/useStomatognathicExam";
import type { IStomatognathicExam, IPacienteBasico } from "../../../../types/stomatognathicExam/IStomatognathicExam";
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
  AlertCircle,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const { user } = useAuth();

  const { exams, pagination, isLoading, isError, error } = useStomatognathicExams({
    page,
    pageSize,
    search,
    paciente: pacienteId, 
  });

  const isAdmin = user?.rol === "Administrador";

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
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  const getEstadoColor = (activo: boolean) => {
    return activo
      ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800'
      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
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
          <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando exámenes estomatognáticos...
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
              Error al cargar exámenes
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
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
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, cédula..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <select
              value={pageSize}
              onChange={e => {
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
        <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-20rem)]">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Patologías</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[140px]">Fecha registro</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
                )}
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {examList.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron exámenes estomatognáticos
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {search ? 'Intenta con otros términos de búsqueda' : 'No hay exámenes registrados'}
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

                      {/* Patologías */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Activity className={`h-4 w-4 ${
                            tienePatologias ? "text-error-600 dark:text-error-400" : "text-success-600 dark:text-success-400"
                          }`} />
                          <span className={`font-medium ${
                            tienePatologias ? "text-error-600 dark:text-error-400" : "text-success-600 dark:text-success-400"
                          }`}>
                            {patologiasResumen}
                          </span>
                        </div>
                        {tienePatologias && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-700 border border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800">
                            <AlertCircle className="h-2.5 w-2.5" />
                            Requiere atención
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {fechaFormateada}
                        </div>
                      </td>

                      {/* Estado - Solo para Administrador */}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(exam.activo)}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${exam.activo ? 'bg-success-500' : 'bg-gray-400'}`} />
                            {exam.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      )}

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1">
                          {/* Ver */}
                          {onView && (
                            <button
                              onClick={() => handleView(exam)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          {/* Editar */}
                          {onEdit && (
                            <button
                              onClick={() => handleEdit(exam)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Eliminar */}
                          {onDelete && (
                            <button
                              onClick={() => handleDeleteClick(exam)}
                              disabled={!exam.activo}
                              className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                                !exam.activo
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                                  : "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                              }`}
                              title={!exam.activo ? "No se puede eliminar" : "Eliminar examen"}
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
          Mostrando {examList.length} de {pagination?.count || 0} exámenes
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