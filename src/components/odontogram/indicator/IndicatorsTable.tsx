// src/components/odontogram/indicator/IndicatorsTable.tsx

import { 
  Eye, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Search, 
  X, 
  Filter, 
  FileText, 
  AlertCircle, 
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Thermometer,
  Shield,
  Brain,
  Activity as ActivityIcon,
  Heart,
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertOctagon
} from "lucide-react";
import { useState, useEffect } from "react";
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
  // Propiedades de paginación
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
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
  page = 1,
  pageSize = 10,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Sincronizar el estado local con la prop search cuando cambie externamente
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // ============================================================================
  // HELPERS PARA FORMATEAR VALORES
  // ============================================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
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

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return value.toFixed(2);
  };

  // ============================================================================
  // BADGES DE ESTADO
  // ============================================================================

  const getEstadoColor = (activo: boolean) => {
    return activo
      ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800'
      : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  const getActivoBadge = (activo: boolean) => {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(activo)}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-success-500' : 'bg-gray-400'}`} />
        {activo ? "Activo" : "Inactivo"}
      </span>
    );
  };

  // ENFERMEDAD PERIODONTAL
  const getPeriodontalBadge = (value: string | null) => {
    if (!value) return (
      <div className="flex items-center gap-1.5">
        <ActivityIcon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );

    const labels: Record<string, { 
      text: string; 
      color: string; 
      icon: React.ReactNode;
      severity: 'low' | 'medium' | 'high' 
    }> = {
      SANO: {
        text: "Sano",
        color: "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        severity: 'low'
      },
      GINGIVITIS: {
        text: "Gingivitis",
        color: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        severity: 'medium'
      },
      PERIODONTITIS: {
        text: "Periodontitis",
        color: "bg-error-50 text-error-700 border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800",
        icon: <XCircle className="h-3.5 w-3.5" />,
        severity: 'high'
      },
    };

    const badge = labels[value] || {
      text: value,
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
      icon: <ActivityIcon className="h-3.5 w-3.5" />,
      severity: 'low'
    };

    return (
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
          <span className="flex items-center gap-1">
            {badge.icon}
            {badge.text}
          </span>
        </span>
        {/* Indicador visual de severidad */}
        <div className="flex items-center">
          {badge.severity === 'low' && (
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-3 rounded-full bg-success-500"></div>
              <div className="w-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          )}
          {badge.severity === 'medium' && (
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-3 rounded-full bg-warning-500"></div>
              <div className="w-1 h-3 rounded-full bg-warning-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          )}
          {badge.severity === 'high' && (
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-3 rounded-full bg-error-500"></div>
              <div className="w-1 h-3 rounded-full bg-error-500"></div>
              <div className="w-1 h-3 rounded-full bg-error-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // OCLUSIÓN
  const getOclusionBadge = (value: string | null) => {
    if (!value) return (
      <div className="flex items-center gap-1.5">
        <Brain className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );

    const labels: Record<string, { 
      text: string; 
      color: string; 
      icon: React.ReactNode;
      severity: 'low' | 'medium' | 'high' 
    }> = {
      NORMAL: {
        text: "Normal",
        color: "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        severity: 'low'
      },
      CLASE_I: {
        text: "Clase I",
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: <ActivityIcon className="h-3.5 w-3.5" />,
        severity: 'low'
      },
      CLASE_II: {
        text: "Clase II",
        color: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        severity: 'medium'
      },
      CLASE_III: {
        text: "Clase III",
        color: "bg-error-50 text-error-700 border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800",
        icon: <AlertOctagon className="h-3.5 w-3.5" />,
        severity: 'high'
      },
    };

    const badge = labels[value] || {
      text: value,
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
      icon: <Brain className="h-3.5 w-3.5" />,
      severity: 'low'
    };

    return (
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
          <span className="flex items-center gap-1">
            {badge.icon}
            {badge.text}
          </span>
        </span>
        <div className="flex flex-col items-center">
          {badge.severity === 'low' && (
            <BatteryLow className="h-3.5 w-3.5 text-success-500" />
          )}
          {badge.severity === 'medium' && (
            <BatteryMedium className="h-3.5 w-3.5 text-warning-500" />
          )}
          {badge.severity === 'high' && (
            <BatteryFull className="h-3.5 w-3.5 text-error-500" />
          )}
        </div>
      </div>
    );
  };

  // FLUOROSIS
  const getFluorosisBadge = (value: string | null) => {
    if (!value) return (
      <div className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );

    const labels: Record<string, { 
      text: string; 
      color: string; 
      icon: React.ReactNode;
      severity: 'none' | 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
      level: number;
    }> = {
      NORMAL: {
        text: "Normal",
        color: "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        severity: 'none',
        level: 0
      },
      CUESTIONABLE: {
        text: "Cuestionable",
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: <Shield className="h-3.5 w-3.5" />,
        severity: 'very-low',
        level: 1
      },
      MUY_LEVE: {
        text: "Muy Leve",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        icon: <Shield className="h-3.5 w-3.5" />,
        severity: 'low',
        level: 2
      },
      LEVE: {
        text: "Leve",
        color: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        severity: 'medium',
        level: 3
      },
      MODERADO: {
        text: "Moderado",
        color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        severity: 'high',
        level: 4
      },
      SEVERO: {
        text: "Severo",
        color: "bg-error-50 text-error-700 border-error-200 dark:bg-error-900/30 dark:text-error-400 dark:border-error-800",
        icon: <XCircle className="h-3.5 w-3.5" />,
        severity: 'very-high',
        level: 5
      },
    };

    const badge = labels[value] || {
      text: value,
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
      icon: <Shield className="h-3.5 w-3.5" />,
      severity: 'none',
      level: 0
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
            <span className="flex items-center gap-1">
              {badge.icon}
              {badge.text}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  const isLoading = false; // Puedes agregar una prop para esto si es necesario

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando indicadores de salud bucal...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Header con buscador - Estilo unificado */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por fecha, enfermedad periodontal, oclusión..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Mostrar:
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange?.(Number(e.target.value));
                  onPageChange?.(1);
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
        )}
      </div>

      {/* Tabla */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="overflow-x-auto custom-scrollbar">
          {registros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-gray-900">
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No se encontraron indicadores de salud bucal
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {localSearch ? 'Intenta con otros términos de búsqueda' : 'No hay indicadores registrados'}
              </p>
              {localSearch && (
                <button
                  onClick={handleClearSearch}
                  className="mt-3 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[1100px]">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[120px]">Fecha</th>
                  
                  {showPatientColumn && (
                    <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">Paciente</th>
                  )}

                  {showInactivos && (
                    <th scope="col" className="px-6 py-3 font-medium min-w-[100px]">Estado</th>
                  )}

                  <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <ActivityIcon className="h-3.5 w-3.5" />
                      Enf. Periodontal
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5" />
                      Oclusión
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Fluorosis
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[100px]">OHI Placa</th>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[100px]">OHI Cálculo</th>
                  <th scope="col" className="px-6 py-3 font-medium min-w-[100px]">OHI Gingivitis</th>

                  <th scope="col" className="px-6 py-3 text-right font-medium min-w-[140px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {registros.map((registro) => (
                  <tr
                    key={registro.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(registro.fecha)}
                      </div>
                    </td>

                    {/* Paciente (opcional) */}
                    {showPatientColumn && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                            {(registro.paciente_nombre?.charAt(0) || "P")}
                            {(registro.paciente_apellido?.charAt(0) || "")}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {registro.paciente_nombre || "Paciente"} {registro.paciente_apellido || ""}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              CI: {registro.paciente_cedula || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Estado (opcional) */}
                    {showInactivos && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActivoBadge(registro.activo)}
                      </td>
                    )}

                    {/* Enfermedad Periodontal */}
                    <td className="px-6 py-4">
                      {getPeriodontalBadge(registro.enfermedad_periodontal)}
                    </td>

                    {/* Oclusión */}
                    <td className="px-6 py-4">
                      {getOclusionBadge(registro.tipo_oclusion)}
                    </td>

                    {/* Fluorosis */}
                    <td className="px-6 py-4">
                      {getFluorosisBadge(registro.nivel_fluorosis)}
                    </td>

                    {/* OHI Placa */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-gray-400" />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatValue(registro.ohi_promedio_placa)}
                        </div>
                      </div>
                    </td>

                    {/* OHI Cálculo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-gray-400" />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatValue(registro.ohi_promedio_calculo)}
                        </div>
                      </div>
                    </td>

                    {/* OHI Gingivitis */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-gray-400" />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatValue(registro.gi_promedio_gingivitis)}
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        {/* Ver */}
                        {onView && (
                          <button
                            onClick={() => onView(registro)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {/* Editar - Solo si está activo */}
                        {onEdit && registro.activo && (
                          <button
                            onClick={() => onEdit(registro)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Eliminar - Solo si está activo */}
                        {onDelete && registro.activo && (
                          <button
                            onClick={() => onDelete(registro)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Restaurar - Solo si está inactivo */}
                        {onRestore && !registro.activo && (
                          <button
                            onClick={() => onRestore(registro)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-success-50 hover:text-success-600 dark:text-gray-400 dark:hover:bg-success-500/10 dark:hover:text-success-300 transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          Mostrando {registros.length} de {totalCount} indicadores de salud bucal
        </div>
      </div>

      {/* Paginación - Solo una instancia */}
      {onPageChange && totalPages > 1 && registros.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Página <span className="font-medium">{page}</span> de{" "}
            <span className="font-medium">{totalPages}</span> • Total: {totalCount}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
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
};