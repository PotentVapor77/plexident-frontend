// src/components/patients/backgrounds/table/BackgroundsTable.tsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { IAntecedenteCombinado } from '../../../../hooks/backgrounds/useBackgrounds';
import { useAntecedentes } from '../../../../hooks/backgrounds/useBackgrounds';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { useAuth } from '../../../../hooks/auth/useAuth';
import {
  Eye,
  Edit2,
  Trash2,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Heart,
  Activity,
  FileText,
} from 'lucide-react';
import { SearchBar, Pagination } from '../../../ui/pagination';
import type { PaginationState } from '../../../ui/pagination';
import { useDebounce } from '../../../../hooks/useDebounce';

interface BackgroundsTableProps {
  pacienteId?: string;
  showPatientColumn?: boolean;
  onEdit?: (background: IAntecedenteCombinado) => void;
  onView?: (background: IAntecedenteCombinado) => void;
  onDelete?: (background: IAntecedenteCombinado) => void;
}

interface AntecedentesAgrupados {
  pacienteId: string;
  pacienteNombre: string;
  pacienteCedula: string;
  pacienteInitials: string;
  personal?: IAntecedenteCombinado;
  familiar?: IAntecedenteCombinado;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export function BackgroundsTable({
  pacienteId,
  onEdit,
  onView,
  onDelete,
}: BackgroundsTableProps) {
  // Estados de paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  
  const debouncedSearch = useDebounce(searchTerm, 400);
  const { user } = useAuth(); 

  const isAdmin = user?.rol === 'Administrador';

  const { 
    antecedentes, 
    pagination: bgPagination, 
    isLoading, 
    isError, 
    error,
  } = useAntecedentes({
    paciente: pacienteId,
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch,
  });

  // Resetear página cuando cambia la búsqueda o el pageSize
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  // Normalizar la paginación para que coincida con PaginationState
  const paginationNormalized = useMemo((): PaginationState | undefined => {
    if (!bgPagination) return undefined;

    return {
      count: bgPagination.total_count,
      page: bgPagination.current_page,
      pageSize: bgPagination.page_size,
      totalPages: bgPagination.total_pages,
      hasNext: bgPagination.current_page < bgPagination.total_pages,
      hasPrevious: bgPagination.current_page > 1,
    };
  }, [bgPagination]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Función para reintentar
  const handleRetry = () => {
    window.location.reload();
  };

  const isPacienteObject = useCallback((obj: unknown): obj is IPaciente => {
    if (!obj || typeof obj !== 'object') return false;
    const pacienteObj = obj as Record<string, unknown>;
    return (
      'nombres' in pacienteObj &&
      'apellidos' in pacienteObj &&
      'id' in pacienteObj &&
      'cedula_pasaporte' in pacienteObj
    );
  }, []);

  const getPatientName = useCallback((background: IAntecedenteCombinado): string => {
    if (background.paciente_nombre) {
      if (background.paciente_nombre.includes(',')) {
        const [apellido, ...nombreParts] = background.paciente_nombre.split(',').map(s => s.trim());
        const nombre = nombreParts.join(' ').trim();
        return `${nombre} ${apellido}`.trim();
      }
      return background.paciente_nombre.trim();
    }
    
    if (isPacienteObject(background.paciente)) {
      return `${background.paciente.nombres || ''} ${background.paciente.apellidos || ''}`.trim();
    }
    
    return 'Paciente';
  }, [isPacienteObject]);

  const getPatientInitials = useCallback((background: IAntecedenteCombinado): string => {
    const nombreCompleto = getPatientName(background);
    if (nombreCompleto === 'Paciente') return 'P';
    
    const partes = nombreCompleto.split(/\s+/).filter(Boolean);
    
    if (partes.length === 0) return 'P';
    
    const first = partes[0]?.charAt(0)?.toUpperCase() || 'P';
    
    if (partes.length > 1) {
      const last = partes[partes.length - 1]?.charAt(0)?.toUpperCase() || '';
      return `${first}${last}`;
    }
    
    return first;
  }, [getPatientName]);

  const getPatientId = useCallback((background: IAntecedenteCombinado): string => {
    if (background.paciente_cedula) {
      return background.paciente_cedula;
    }
    
    if (isPacienteObject(background.paciente)) {
      return background.paciente.cedula_pasaporte || 'N/A';
    }
    
    if (typeof background.paciente === 'string') {
      return background.paciente.substring(0, 8);
    }
    
    return 'N/A';
  }, [isPacienteObject]);

  const getPatientIdValue = useCallback((background: IAntecedenteCombinado): string => {
    if (typeof background.paciente === 'string') {
      return background.paciente;
    }
    return 'unknown';
  }, []);

  // Agrupar antecedentes por paciente
  const antecedentesAgrupados = useMemo(() => {
    if (!antecedentes) return [];
    
    const grouped = new Map<string, AntecedentesAgrupados>();

    antecedentes.forEach((bg) => {
      const pid = getPatientIdValue(bg);
      
      if (!grouped.has(pid)) {
        grouped.set(pid, {
          pacienteId: pid,
          pacienteNombre: getPatientName(bg),
          pacienteCedula: getPatientId(bg),
          pacienteInitials: getPatientInitials(bg),
          fechaCreacion: bg.fecha_creacion,
          fechaModificacion: bg.fecha_modificacion,
        });
      }

      const item = grouped.get(pid)!;
      
      if (bg.tipo === 'personal') {
        item.personal = bg;
      } else if (bg.tipo === 'familiar') {
        item.familiar = bg;
      }

      if (bg.fecha_modificacion && (!item.fechaModificacion || bg.fecha_modificacion > item.fechaModificacion)) {
        item.fechaModificacion = bg.fecha_modificacion;
      }
      if (bg.fecha_creacion && (!item.fechaCreacion || bg.fecha_creacion < item.fechaCreacion)) {
        item.fechaCreacion = bg.fecha_creacion;
      }
    });

    return Array.from(grouped.values());
  }, [antecedentes, getPatientName, getPatientId, getPatientInitials, getPatientIdValue]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Fecha inválida";
    }
  };

  const getEstadoAntecedentes = useCallback((agrupado: AntecedentesAgrupados): string => {
    if (!agrupado.personal && !agrupado.familiar) {
      return 'No registrado';
    }

    const personalActivo = agrupado.personal?.activo;
    const familiarActivo = agrupado.familiar?.activo;

    if (personalActivo === true && familiarActivo === true) {
      return 'Activo';
    }

    if (personalActivo === false && familiarActivo === false) {
      return 'Inactivo';
    }

    if (personalActivo === true || familiarActivo === true) {
      return 'Parcial';
    }

    return 'Inactivo';
  }, []);

  const getEstadoColor = useCallback((estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800';
      case 'Parcial':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'No registrado':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      case 'Inactivo':
        return 'bg-error-50 text-error-700 border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  }, []);

  const handleEdit = (antecedentesAgrupados: AntecedentesAgrupados) => {
    const background = antecedentesAgrupados.personal || antecedentesAgrupados.familiar;
    if (background) {
      onEdit?.(background);
    }
  };

  const handleView = (antecedentesAgrupados: AntecedentesAgrupados) => {
    const background = antecedentesAgrupados.personal || antecedentesAgrupados.familiar;
    if (background) {
      onView?.(background);
    }
  };

  const handleDeleteClick = (antecedentesAgrupados: AntecedentesAgrupados) => {
    const background = antecedentesAgrupados.personal || antecedentesAgrupados.familiar;
    if (background) {
      onDelete?.(background);
    }
  };

  if (isLoading && !antecedentes.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando antecedentes...</p>
        </div>
      </div>
    );
  }

  if (isError && !antecedentes.length) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-error-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar antecedentes
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error?.toString() || 'Error desconocido'}
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

  if (antecedentesAgrupados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {searchTerm ? 'No se encontraron resultados' : 'No hay antecedentes registrados'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {searchTerm
            ? 'Intenta con otra búsqueda por nombre o cédula.'
            : pacienteId
              ? 'Este paciente no tiene antecedentes registrados.'
              : 'Comience creando los antecedentes médicos de los pacientes.'}
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
      <div className="relative rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 w-full h-full flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">Paciente</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">Alergias</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Condiciones Personales</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Antecedentes Familiares</th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[140px]">Última modificación</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Estado</th>
                )}
                <th scope="col" className="px-6 py-3 text-right font-medium min-w-[140px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {antecedentesAgrupados.map((agrupado) => {
                const estado = getEstadoAntecedentes(agrupado);
                const isActivo = estado === 'Activo' || estado === 'Parcial';
                
                return (
                  <tr key={agrupado.pacienteId} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {/* Paciente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                          {agrupado.pacienteInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {agrupado.pacienteNombre}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            CI: {agrupado.pacienteCedula}
                          </span>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                            <Calendar className="h-3 w-3" />
                            Creación: {formatDate(agrupado.fechaCreacion)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Alergias */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {agrupado.personal ? (
                          <>
                            {agrupado.personal.alergia_antibiotico !== 'NO' && agrupado.personal.alergia_antibiotico && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700 border border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800">
                                <AlertCircle className="h-3 w-3" />
                                Antibiótico
                              </span>
                            )}
                            {agrupado.personal.alergia_anestesia !== 'NO' && agrupado.personal.alergia_anestesia && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                                <Activity className="h-3 w-3" />
                                Anestesia
                              </span>
                            )}
                            {(agrupado.personal.alergia_antibiotico === 'NO' || !agrupado.personal.alergia_antibiotico) &&
                              (agrupado.personal.alergia_anestesia === 'NO' || !agrupado.personal.alergia_anestesia) && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Sin alergias</span>
                              )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Condiciones Personales */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {agrupado.personal ? (
                          <>
                            {agrupado.personal.diabetes !== 'NO' && agrupado.personal.diabetes && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                <Activity className="h-3 w-3" />
                                Diabetes
                              </span>
                            )}
                            {agrupado.personal.hipertension_arterial !== 'NO' && agrupado.personal.hipertension_arterial && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                <Activity className="h-3 w-3" />
                                HTA
                              </span>
                            )}
                            {agrupado.personal.asma !== 'NO' && agrupado.personal.asma && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                <Activity className="h-3 w-3" />
                                Asma
                              </span>
                            )}
                            {(agrupado.personal.diabetes === 'NO' || !agrupado.personal.diabetes) &&
                              (agrupado.personal.hipertension_arterial === 'NO' || !agrupado.personal.hipertension_arterial) &&
                              (agrupado.personal.asma === 'NO' || !agrupado.personal.asma) && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Ninguna</span>
                              )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Antecedentes Familiares */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {agrupado.familiar ? (
                          <>
                            {agrupado.familiar.cancer_familiar !== 'NO' && agrupado.familiar.cancer_familiar && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700 border border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800">
                                <AlertCircle className="h-3 w-3" />
                                Cáncer
                              </span>
                            )}
                            {agrupado.familiar.cardiopatia_familiar !== 'NO' && agrupado.familiar.cardiopatia_familiar && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                <Heart className="h-3 w-3" />
                                Cardiopatía
                              </span>
                            )}
                            {agrupado.familiar.endocrino_metabolico_familiar !== 'NO' && agrupado.familiar.endocrino_metabolico_familiar && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800">
                                <Activity className="h-3 w-3" />
                                Diabetes
                              </span>
                            )}
                            {(!agrupado.familiar.cancer_familiar || agrupado.familiar.cancer_familiar === 'NO') &&
                              (!agrupado.familiar.cardiopatia_familiar || agrupado.familiar.cardiopatia_familiar === 'NO') &&
                              (!agrupado.familiar.endocrino_metabolico_familiar || agrupado.familiar.endocrino_metabolico_familiar === 'NO') && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Ninguno</span>
                              )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Última modificación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(agrupado.fechaModificacion || agrupado.fechaCreacion)}
                      </div>
                    </td>

                    {/* Estado - Solo para Administrador */}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(estado)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            estado === 'Activo' ? 'bg-success-500' :
                            estado === 'Parcial' ? 'bg-orange-500' :
                            estado === 'No registrado' ? 'bg-gray-400' :
                            'bg-error-500'
                          }`} />
                          {estado}
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => handleView(agrupado)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(agrupado)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(agrupado)}
                          disabled={!isActivo}
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                            !isActivo
                              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                              : "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
                          }`}
                          title={!isActivo ? "No se puede eliminar" : "Eliminar antecedente"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {antecedentesAgrupados.length} de {bgPagination?.total_count || 0} antecedentes
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
          entityLabel="pacientes"
        />
      )}
    </div>
  );
}