// src/components/patients/consultations/table/ConsultationTable.tsx

import { useState, useEffect } from 'react';
import type { IConsultation } from '../../../../types/consultations/IConsultation';
import type { IPaciente } from '../../../../types/patient/IPatient';
import { getPacienteById } from '../../../../services/patient/patientService';

interface ConsultationTableProps {
  consultations: IConsultation[];
  isLoading: boolean;
  onView: (consultation: IConsultation) => void;
  onEdit: (consultation: IConsultation) => void;
  onDelete: (consultation: IConsultation) => void;
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

export function ConsultationTable({
  consultations,
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
}: ConsultationTableProps) {
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
    consultations.forEach(consultation => {
      if (typeof consultation.paciente === "string") {
        void ensurePatientInCache(consultation.paciente);
      }
    });
  }, [consultations]);

  // ✅ Función helper para obtener objeto paciente
  const getPacienteObject = (consultation: IConsultation): IPaciente | null => {
    const p = consultation.paciente;
    if (typeof p === "object" && p !== null) return p as IPaciente;
    if (typeof p === "string") return pacienteCache[p] || null;
    return null;
  };

  // ✅ Función helper para obtener nombre del paciente
  const getPatientName = (consultation: IConsultation): string => {
    const paciente = getPacienteObject(consultation);
    if (paciente) {
      return `${paciente.nombres} ${paciente.apellidos}`.trim();
    }
    return consultation.paciente_nombre || "Paciente";
  };

  // ✅ Función helper para obtener iniciales
  const getPatientInitials = (consultation: IConsultation): string => {
    const paciente = getPacienteObject(consultation);
    if (paciente) {
      const first = paciente.nombres?.charAt(0)?.toUpperCase() || "P";
      const last = paciente.apellidos?.charAt(0)?.toUpperCase() || "";
      return `${first}${last}`;
    }
    return "P";
  };

  // ✅ Función helper para obtener cédula
  const getPatientId = (consultation: IConsultation): string => {
    const paciente = getPacienteObject(consultation);
    if (paciente) {
      return paciente.cedula_pasaporte || paciente.id.substring(0, 8) || "N/A";
    }
    if (typeof consultation.paciente === "string") {
      return consultation.paciente.substring(0, 8);
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
            Cargando consultas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con información del paciente fijado */}
    
      {/* Header con buscador y selector de tamaño */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder={
              pacienteActivo 
                ? "Buscar por motivo de consulta dentro del paciente fijado..." 
                : "Buscar por paciente o motivo de consulta..."
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
                Fecha Consulta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Motivo de Consulta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Diagnóstico
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
            {consultations.length === 0 ? (
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
                          ? `No se encontraron consultas para "${searchTerm}" en este paciente`
                          : `No hay consultas registradas para ${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
                        : searchTerm 
                          ? 'No se encontraron resultados' 
                          : 'No hay registros de consultas'}
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
              consultations.map((consultation) => {
                const patientName = getPatientName(consultation);
                const patientInitials = getPatientInitials(consultation);
                const patientId = getPatientId(consultation);

                return (
                  <tr
                    key={consultation.id}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(consultation.fecha_consulta).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="max-w-xs truncate" title={consultation.motivo_consulta}>
                        {consultation.motivo_consulta}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {consultation.diagnostico ? (
                        <div className="max-w-xs truncate" title={consultation.diagnostico}>
                          {consultation.diagnostico}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sin diagnóstico</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(consultation.fecha_creacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          consultation.activo
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {consultation.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(consultation)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onEdit(consultation)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(consultation)}
                          disabled={!consultation.activo}
                          className={`${
                            !consultation.activo
                              ? "text-red-300 dark:text-red-500 cursor-not-allowed opacity-50"
                              : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          }`}
                          title={!consultation.activo ? "Consultas inactivas no se pueden eliminar" : "Borrar definitivamente"}
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
            <span className="font-medium">{totalPages}</span> ({totalCount} consultas totales)
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