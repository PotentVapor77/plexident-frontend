// src/components/patients/backgrounds/table/BackgroundsTable.tsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { IAntecedenteCombinado } from '../../../../hooks/backgrounds/useBackgrounds';
import { useAntecedentes } from '../../../../hooks/backgrounds/useBackgrounds';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { useAuth } from '../../../../hooks/auth/useAuth'; // ✅ AGREGAR

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { user } = useAuth(); // ✅ AGREGAR

  const isAdmin = user?.rol === 'Administrador'; // ✅ AGREGAR

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { antecedentes, pagination, isLoading, isError, error } = useAntecedentes({
    paciente: pacienteId,
    page,
    page_size: pageSize,
    search: debouncedSearch,
  });

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
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  const getEstadoAntecedentes = useCallback((agrupado: AntecedentesAgrupados): string => {
    // Si no hay antecedentes registrados
    if (!agrupado.personal && !agrupado.familiar) {
      return 'No registrado';
    }

    const personalActivo = agrupado.personal?.activo;
    const familiarActivo = agrupado.familiar?.activo;

    // Si ambos están activos
    if (personalActivo === true && familiarActivo === true) {
      return 'Activo';
    }

    // Si ambos están inactivos
    if (personalActivo === false && familiarActivo === false) {
      return 'Inactivo';
    }

    // Si al menos uno está activo
    if (personalActivo === true || familiarActivo === true) {
      return 'Parcial';
    }

    return 'Inactivo';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando antecedentes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
              {error?.toString() || 'Error desconocido'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (antecedentesAgrupados.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {searchInput ? 'No se encontraron resultados' : 'No hay antecedentes registrados'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {searchInput
            ? 'Intenta con otra búsqueda por nombre o cédula.'
            : pacienteId
              ? 'Este paciente no tiene antecedentes registrados.'
              : 'Comience creando los antecedentes médicos de los pacientes.'}
        </p>
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con buscador */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Buscar por paciente, cédula..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Alergias
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Condiciones Personales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Antecedentes Familiares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Última modificación
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
            {antecedentesAgrupados.map((agrupado) => {
              const estado = getEstadoAntecedentes(agrupado);
              const isActivo = estado === 'Activo' || estado === 'Solo personal' || estado === 'Solo familiar' || estado === 'Parcial';
              
              return (
                <tr
                  key={agrupado.pacienteId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Paciente */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold shadow-md shadow-blue-500/30">
                        {agrupado.pacienteInitials}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {agrupado.pacienteNombre}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          CI {agrupado.pacienteCedula}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Creación: {formatDate(agrupado.fechaCreacion)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Alergias */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {agrupado.personal ? (
                        <>
                          {agrupado.personal.alergia_antibiotico !== 'NO' && agrupado.personal.alergia_antibiotico && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 mr-1 mb-1">
                              Antibiótico
                            </span>
                          )}
                          {agrupado.personal.alergia_anestesia !== 'NO' && agrupado.personal.alergia_anestesia && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 mr-1 mb-1">
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
                    <div className="text-sm text-gray-900 dark:text-white">
                      {agrupado.personal ? (
                        <>
                          {agrupado.personal.diabetes !== 'NO' && agrupado.personal.diabetes && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 mr-1 mb-1">
                              Diabetes
                            </span>
                          )}
                          {agrupado.personal.hipertension_arterial !== 'NO' && agrupado.personal.hipertension_arterial && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 mr-1 mb-1">
                              HTA
                            </span>
                          )}
                          {agrupado.personal.asma !== 'NO' && agrupado.personal.asma && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 mr-1 mb-1">
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
                    <div className="text-sm text-gray-900 dark:text-white">
                      {agrupado.familiar ? (
                        <>
                          {agrupado.familiar.cancer_familiar !== 'NO' && agrupado.familiar.cancer_familiar && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 mr-1 mb-1">
                              Cáncer
                            </span>
                          )}
                          {agrupado.familiar.cardiopatia_familiar !== 'NO' && agrupado.familiar.cardiopatia_familiar && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 mr-1 mb-1">
                              Cardiopatía
                            </span>
                          )}
                          {agrupado.familiar.endocrino_metabolico_familiar !== 'NO' && agrupado.familiar.endocrino_metabolico_familiar && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mr-1 mb-1">
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
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(agrupado.fechaModificacion || agrupado.fechaCreacion)}
                    </div>
                  </td>

                  {/* ✅ Estado - Solo para Administrador */}
                  {isAdmin && (
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          estado === 'Activo' || estado === 'Solo personal' || estado === 'Solo familiar'
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : estado === 'Parcial'
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : estado === 'No registrado'
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {estado}
                      </span>
                    </td>
                  )}

                  {/* Acciones */}
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(agrupado)}
                        className="text-blue-600 transition-colors hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <button
                        onClick={() => handleEdit(agrupado)}
                        className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Editar"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(agrupado)}
                        disabled={!isActivo}
                        className={`transition-colors ${
                          !isActivo
                            ? 'cursor-not-allowed text-red-300 opacity-50 dark:text-red-500'
                            : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        title={
                          !isActivo
                            ? 'Registros inactivos no se pueden eliminar'
                            : 'Eliminar'
                        }
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando página <span className="font-medium">{page}</span> de{" "}
            <span className="font-medium">{pagination.total_pages}</span> ({pagination.total_count || 0} antecedentes totales)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.total_pages}
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
