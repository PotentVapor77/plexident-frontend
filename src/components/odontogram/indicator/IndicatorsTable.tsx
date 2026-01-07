// src/components/odontogram/indicator/IndicatorsTable.tsx

import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, RotateCcw, Search, X } from "lucide-react";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";

interface IndicatorsTableProps {
  registros: BackendIndicadoresSaludBucal[];
  showInactivos: boolean;
  showPatientColumn?: boolean;
  onView?: (registro: BackendIndicadoresSaludBucal) => void;
  onEdit?: (registro: BackendIndicadoresSaludBucal) => void;
  onDelete?: (registro: BackendIndicadoresSaludBucal) => void;
  onRestore?: (registro: BackendIndicadoresSaludBucal) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export const IndicatorsTable: React.FC<IndicatorsTableProps> = ({
  registros,
  showInactivos,
  showPatientColumn = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
  search = "",
  onSearchChange,
}) => {
  // ============================================================================
  // SEARCH LOCAL + DEBOUNCE
  // ============================================================================

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (!onSearchChange) return;
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, search]);

  // ============================================================================
  // HELPERS PARA FORMATEAR VALORES
  // ============================================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return "N/A";
    return value.toFixed(2);
  };

  // ============================================================================
  // BADGES DE ESTADO
  // ============================================================================

  const getActivoBadge = (activo: boolean) => {
    return activo ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
        Inactivo
      </span>
    );
  };

  const getPeriodontalBadge = (value: string | null) => {
    if (!value) return <span className="text-gray-400 text-xs">N/A</span>;

    const labels: Record<string, { text: string; color: string }> = {
      SANO: {
        text: "Sano",
        color:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      },
      GINGIVITIS: {
        text: "Gingivitis",
        color:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      },
      PERIODONTITIS: {
        text: "Periodontitis",
        color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      },
    };
    const badge = labels[value] || {
      text: value,
      color: "bg-gray-50 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  const getOclusionBadge = (value: string | null) => {
    if (!value) return <span className="text-gray-400 text-xs">N/A</span>;

    const labels: Record<string, { text: string; color: string }> = {
      NORMAL: {
        text: "Normal",
        color:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      },
      CLASE_I: {
        text: "Clase I",
        color:
          "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
      },
      CLASE_II: {
        text: "Clase II",
        color:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      },
      CLASE_III: {
        text: "Clase III",
        color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      },
    };
    const badge = labels[value] || {
      text: value,
      color: "bg-gray-50 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  const getFluorosisBadge = (value: string | null) => {
    if (!value) return <span className="text-gray-400 text-xs">N/A</span>;

    const labels: Record<string, { text: string; color: string }> = {
      NORMAL: {
        text: "Normal",
        color:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      },
      CUESTIONABLE: {
        text: "Cuestionable",
        color:
          "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
      },
      MUY_LEVE: {
        text: "Muy Leve",
        color:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      },
      LEVE: {
        text: "Leve",
        color:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      },
      MODERADO: {
        text: "Moderado",
        color:
          "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      },
      SEVERO: {
        text: "Severo",
        color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      },
    };
    const badge = labels[value] || {
      text: value,
      color: "bg-gray-50 text-gray-700",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (!registros || registros.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm">
        {onSearchChange && (
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por fecha, enfermedad, oclusión..."
                className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors text-sm"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            No hay registros de indicadores
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {localSearch
              ? `No se encontraron resultados para "${localSearch}"`
              : "Cree un nuevo registro para comenzar"}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TABLA CON DATOS
  // ============================================================================

  return (
    <div>
      {onSearchChange && (
        <div className="bg-white dark:bg-gray-900 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-800 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Indicadores de salud bucal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Filtre por fecha, enfermedad periodontal, oclusión o fluorosis.
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por fecha, enfermedad, oclusión..."
                className="block w-full pl-9 pr-9 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors text-sm"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-b-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm flex flex-col">
        {/* Contenedor scrollable solo para la tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-130 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Fecha
                </th>

                {showPatientColumn && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    Paciente
                  </th>
                )}

                {showInactivos && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    Estado
                  </th>
                )}

                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Enfermedad Periodontal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Tipo de Oclusión
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Nivel de Fluorosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  OHI Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  OHI Cálculo
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {registros.map((registro) => (
                <tr
                  key={registro.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {formatDate(registro.fecha)}
                  </td>

                  {showPatientColumn && (
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 font-semibold text-xs flex-shrink-0">
                          {(registro.paciente_nombre?.charAt(0) || "?") +
                            (registro.paciente_apellido?.charAt(0) || "")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {registro.paciente_nombre || "N/A"}{" "}
                            {registro.paciente_apellido || ""}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            CI: {registro.paciente_cedula || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  {showInactivos && (
                    <td className="px-6 py-3 text-sm">
                      {getActivoBadge(registro.activo)}
                    </td>
                  )}

                  <td className="px-6 py-3 text-sm">
                    {getPeriodontalBadge(registro.enfermedad_periodontal)}
                  </td>

                  <td className="px-6 py-3 text-sm">
                    {getOclusionBadge(registro.tipo_oclusion)}
                  </td>

                  <td className="px-6 py-3 text-sm">
                    {getFluorosisBadge(registro.nivel_fluorosis)}
                  </td>

                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {formatValue(registro.ohi_promedio_placa)}
                  </td>

                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {formatValue(registro.ohi_promedio_calculo)}
                  </td>

                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(registro)}
                          className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/40 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {onEdit && registro.activo && (
                        <button
                          onClick={() => onEdit(registro)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/40 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {onDelete && registro.activo && (
                        <button
                          onClick={() => onDelete(registro)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/40 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {onRestore && !registro.activo && (
                        <button
                          onClick={() => onRestore(registro)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition-colors"
                          title="Restaurar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Total de registros{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {registros.length}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
