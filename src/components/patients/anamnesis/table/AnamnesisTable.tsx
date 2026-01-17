// src/components/patients/anamnesis/table/AnamnesisTable.tsx

import { useState, useEffect } from 'react';
import type { IAnamnesis } from '../../../../types/anamnesis/IAnamnesis';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { getPacienteById } from '../../../../services/patient/patientService';

interface AnamnesisTableProps {
  anamnesisData: IAnamnesis[];
  isLoading: boolean;
  onView: (anamnesis: IAnamnesis) => void;
  onEdit: (anamnesis: IAnamnesis) => void;
  onDelete: (anamnesis: IAnamnesis) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  pacienteActivo?: IPaciente | null;
}

interface PacienteCache {
  [key: string]: IPaciente;
}

export function AnamnesisTable({
  anamnesisData,
  isLoading,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  hasNext,
  hasPrevious,
  pageSize,
  onPageSizeChange,
  searchTerm = '',
  onSearchChange,
  pacienteActivo,
}: AnamnesisTableProps) {
  const [pacienteCache, setPacienteCache] = useState<PacienteCache>({});

  // ✅ Función para cargar paciente en cache
  const ensurePatientInCache = async (id: string) => {
    if (pacienteCache[id]) return;
    try {
      const paciente = await getPacienteById(id);
      setPacienteCache(prev => ({ ...prev, [id]: paciente }));
    } catch (e) {
      console.error("Error fetching patient:", e);
    }
  };

  // ✅ Cargar pacientes en caché cuando cambia la data
  useEffect(() => {
    anamnesisData.forEach(anamnesis => {
      if (typeof anamnesis.paciente === "string") {
        void ensurePatientInCache(anamnesis.paciente);
      }
    });
  }, [anamnesisData]);

  // ✅ Función helper para obtener objeto paciente
  const getPacienteObject = (anamnesis: IAnamnesis): IPaciente | null => {
    const p = anamnesis.paciente;
    if (typeof p === "object" && p !== null) return p as IPaciente;
    if (typeof p === "string") return pacienteCache[p] || null;
    return null;
  };

  // ✅ Función helper para obtener nombre del paciente
  const getPatientName = (anamnesis: IAnamnesis): string => {
    const paciente = getPacienteObject(anamnesis);
    if (paciente) {
      return `${paciente.nombres} ${paciente.apellidos}`.trim();
    }
    return "Paciente";
  };

  // ✅ Función helper para obtener iniciales
  const getPatientInitials = (anamnesis: IAnamnesis): string => {
    const paciente = getPacienteObject(anamnesis);
    if (paciente) {
      const first = paciente.nombres?.charAt(0)?.toUpperCase() || "P";
      const last = paciente.apellidos?.charAt(0)?.toUpperCase() || "";
      return `${first}${last}`;
    }
    return "P";
  };

  // ✅ Función helper para obtener cédula
  const getPatientId = (anamnesis: IAnamnesis): string => {
    const paciente = getPacienteObject(anamnesis);
    if (paciente) {
      return paciente.cedula_pasaporte || paciente.id.substring(0, 8) || "N/A";
    }
    if (typeof anamnesis.paciente === "string") {
      return anamnesis.paciente.substring(0, 8);
    }
    return "N/A";
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando anamnesis...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con información del paciente fijado */}
      {pacienteActivo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📌</span>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Mostrando anamnesis del paciente fijado:
                </p>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pacienteActivo.nombres} {pacienteActivo.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CI: {pacienteActivo.cedula_pasaporte} • 
                      {pacienteActivo.sexo === 'M' ? ' 👨 Masculino' : ' 👩 Femenino'} • 
                      Edad: {pacienteActivo.edad}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Filtrado por paciente
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header con buscador y selector de tamaño */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder={
              pacienteActivo 
                ? "Buscar por motivo de consulta dentro del paciente fijado..." 
                : "Buscar por paciente o motivo..."
            }
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Selector de tamaño de página */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Mostrar:
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
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
                Alergias
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Riesgos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
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
            {anamnesisData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                    <p className="text-sm">
                      {pacienteActivo
                        ? searchTerm 
                          ? `No se encontraron anamnesis para "${searchTerm}" en este paciente`
                          : `No hay anamnesis registradas para ${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
                        : searchTerm 
                          ? 'No se encontraron resultados' 
                          : 'No hay registros de anamnesis'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => onSearchChange?.('')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              anamnesisData.map((anamnesis) => {
                const patientName = getPatientName(anamnesis);
                const patientInitials = getPatientInitials(anamnesis);
                const patientId = getPatientId(anamnesis);

                return (
                  <tr
                    key={anamnesis.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* ✅ Celda del paciente con cache */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* Avatar con iniciales */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold shadow-md shadow-blue-500/30">
                          {patientInitials}
                        </div>
                        <div className="ml-4">
                          {/* Nombre */}
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {patientName}
                          </div>
                          {/* Cédula */}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            CI {patientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {anamnesis.tiene_alergias ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          ⚠️ Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-1.5 flex-wrap">
                        {anamnesis.problemas_coagulacion && (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            title="Problemas de coagulación"
                          >
                            Coag.
                          </span>
                        )}
                        {anamnesis.problemas_anestesicos && (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            title="Problemas con anestésicos locales"
                          >
                            Anest.
                          </span>
                        )}
                        {anamnesis.toma_medicamentos && (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            title="Toma medicamentos actualmente"
                          >
                            Meds.
                          </span>
                        )}
                        {!anamnesis.problemas_coagulacion &&
                          !anamnesis.problemas_anestesicos &&
                          !anamnesis.toma_medicamentos && (
                            <span className="text-gray-400">-</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(anamnesis.fecha_creacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          anamnesis.activo
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {anamnesis.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(anamnesis)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onEdit(anamnesis)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(anamnesis)}
                          disabled={!anamnesis.activo}
                          className={`${
                            !anamnesis.activo
                              ? "text-red-300 dark:text-red-500 cursor-not-allowed opacity-50"
                              : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          }`}
                          title={!anamnesis.activo ? "Anamnesis inactivas no se pueden eliminar" : "Borrar definitivamente"}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
            <span className="font-medium">{totalPages}</span> ({totalCount} anamnesis totales)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
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
