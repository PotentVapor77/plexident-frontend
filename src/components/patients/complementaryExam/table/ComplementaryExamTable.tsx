// src/components/patients/complementaryExam/table/ComplementaryExamTable.tsx 

import { useState, useEffect, useMemo } from 'react';
import type { IComplementaryExam } from '../../../../types/complementaryExam/IComplementaryExam';
import { useComplementaryExams } from '../../../../hooks/complementaryExam/useComplementaryExam';
import { getPacienteById } from '../../../../services/patient/patientService';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { useAuth } from '../../../../hooks/auth/useAuth'; 
import {
  Eye,
  Edit2,
  Trash2,
  User,
  Calendar,
  FileText,
  ClipboardList,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';
import { Pagination, SearchBar, type PaginationState } from '../../../ui/pagination';

interface ComplementaryExamTableProps {
  onEdit?: (exam: IComplementaryExam) => void;
  onView?: (exam: IComplementaryExam) => void;
  onDelete?: (exam: IComplementaryExam) => void;
  pacienteId?: string;
}

interface PacienteCache {
  [key: string]: IPaciente;
}

export function ComplementaryExamTable({
  onEdit,
  onView,
  onDelete,
  pacienteId,
}: ComplementaryExamTableProps) {
  // Estados de paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [pacienteCache, setPacienteCache] = useState<PacienteCache>({});
  
  const debouncedSearch = useDebounce(searchTerm, 400);
  const { user } = useAuth(); 
  const isAdmin = user?.rol === "Administrador";

  const { 
    complementaryExams, 
    pagination: examPagination, 
    isLoading, 
    isError, 
    error,
  } = useComplementaryExams({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch,
    paciente: pacienteId,
    activo: isAdmin ? undefined : true,
  });

  // Resetear página cuando cambia la búsqueda o el pageSize
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  // Normalizar la paginación para que coincida con PaginationState
  const paginationNormalized = useMemo((): PaginationState | undefined => {
    if (!examPagination) return undefined;

    return {
      count: examPagination.total_count,
      page: examPagination.current_page,
      pageSize: examPagination.page_size,
      totalPages: examPagination.total_pages,
      hasNext: examPagination.current_page < examPagination.total_pages,
      hasPrevious: examPagination.current_page > 1,
    };
  }, [examPagination]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para reintentar (usando React Query internamente)
  const handleRetry = () => {
    // React Query reintenta automáticamente, pero podemos forzar una recarga
    window.location.reload();
  };

  const ensurePatientInCache = async (id: string) => {
    if (pacienteCache[id]) return;
    try {
      const paciente = await getPacienteById(id);
      setPacienteCache((prev) => ({ ...prev, [id]: paciente }));
    } catch {
      // noop
    }
  };

  const getPacienteObject = (exam: IComplementaryExam): IPaciente | null => {
    const p = exam.paciente;
    if (typeof p === 'object' && p !== null) return p as IPaciente;
    if (typeof p === 'string') return pacienteCache[p] ?? null;
    return null;
  };

  const getPatientName = (exam: IComplementaryExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente) return `${paciente.nombres} ${paciente.apellidos}`.trim();
    return 'Paciente';
  };

  const getPatientInitials = (exam: IComplementaryExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente) {
      const first = paciente.nombres?.charAt(0)?.toUpperCase() || 'P';
      const last = paciente.apellidos?.charAt(0)?.toUpperCase() || '';
      return `${first}${last}`;
    }
    return 'P';
  };

  const getPatientId = (exam: IComplementaryExam): string => {
    const paciente = getPacienteObject(exam);
    if (paciente) return paciente.cedula_pasaporte || paciente.id.substring(0, 8) || 'N/A';
    if (typeof exam.paciente === 'string') return exam.paciente.substring(0, 8);
    return 'N/A';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Fecha inválida';
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const getEstadoColor = (activo: boolean) => {
    return activo
      ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800'
      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  // Cargar pacientes en caché
  useEffect(() => {
    complementaryExams.forEach(exam => {
      if (typeof exam.paciente === "string") {
        ensurePatientInCache(exam.paciente);
      }
    });
  }, [complementaryExams]);

  // LOADING STATE
  if (isLoading && !complementaryExams.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando exámenes complementarios...
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (isError && !complementaryExams.length) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-error-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar exámenes complementarios
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error || 'Error desconocido'}
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 text-sm text-error-700 dark:text-error-300 underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <SearchBar
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Buscar por paciente, cédula..."
      />

      {/* Tabla */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Pedido</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Informe</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
                )}
                <th scope="col" className="px-6 py-3 font-medium min-w-[140px]">Fecha</th>
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {complementaryExams.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No se encontraron exámenes complementarios
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm 
                          ? 'Intenta con otros términos de búsqueda' 
                          : 'No hay exámenes registrados'}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="mt-3 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                complementaryExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Paciente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                          {getPatientInitials(exam)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getPatientName(exam)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            CI: {getPatientId(exam)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Pedido */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {exam.pedido_examenes === 'SI' ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                              <ClipboardList className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                              <span className="font-semibold text-brand-600 dark:text-brand-400">
                                Sí solicitado
                              </span>
                            </div>
                            {exam.pedido_examenes_detalle && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {truncateText(exam.pedido_examenes_detalle, 60)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <ClipboardList className="h-4 w-4" />
                            <span className="italic">No solicitado</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Informe */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {exam.informe_examenes !== 'NINGUNO' ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                              <FileCheck className="h-4 w-4 text-success-600 dark:text-success-400" />
                              <span className="font-semibold">{exam.informe_examenes}</span>
                            </div>
                            {exam.informe_examenes_detalle && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {truncateText(exam.informe_examenes_detalle, 60)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <FileCheck className="h-4 w-4" />
                            <span className="italic">Sin informe</span>
                          </div>
                        )}
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

                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(exam.fecha_modificacion || exam.fecha_creacion)}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(exam)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={() => onEdit(exam)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(exam)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Contador de registros */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {complementaryExams.length} de {examPagination?.total_count || 0} exámenes
        </div>
      </div>

      {/* Paginación */}
      {paginationNormalized && (
        <Pagination
          pagination={paginationNormalized}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          entityLabel="exámenes"
        />
      )}
    </div>
  );
}