// src/components/clinicalRecord/filters/ClinicalRecordFilters.tsx

import React from "react";
import { Search, Filter, Calendar, X, User, CheckCircle, FileText } from "lucide-react";
import Button from "../../ui/button/Button";

/**
 * ============================================================================
 * TYPES
 * ============================================================================
 */
export interface ClinicalRecordFilterState {
  searchTerm: string;
  estadoFilter: string;
  fechaDesde: string;
  fechaHasta: string;
  odontologoFilter: string;
  completoFilter: string;
}

interface ClinicalRecordFiltersProps {
  filters: ClinicalRecordFilterState;
  onFilterChange: (filters: Partial<ClinicalRecordFilterState>) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  isLoading?: boolean;
  isPacienteContext?: boolean;
}

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */
const ESTADO_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "ABIERTO", label: "Abierto" },
  { value: "CERRADO", label: "Cerrado" },
];

const COMPLETO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "true", label: "Completos" },
  { value: "false", label: "Incompletos" },
];

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
const ClinicalRecordFilters: React.FC<ClinicalRecordFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFiltersCount,
  isLoading = false,
  isPacienteContext = false,
}) => {
  return (
    <div className="space-y-4">
      {/* ====================================================================
          BARRA PRINCIPAL DE BÚSQUEDA Y CONTROLES
      ==================================================================== */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, CI, motivo de consulta, odontólogo..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onFilterChange({ searchTerm: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botón de filtros avanzados */}
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className={`relative ${hasActiveFilters ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* ====================================================================
          PANEL DE FILTROS AVANZADOS (COLAPSABLE)
      ==================================================================== */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avanzados
            </h3>
            <button
              onClick={onToggleFilters}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fila 1: Estado y Completitud */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Estado del historial */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Estado del historial
              </label>
              <select
                value={filters.estadoFilter}
                onChange={(e) => onFilterChange({ estadoFilter: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                {ESTADO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Completitud */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Completitud
              </label>
              <select
                value={filters.completoFilter}
                onChange={(e) => onFilterChange({ completoFilter: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              >
                {COMPLETO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Odontólogo (solo en vista general) */}
            {!isPacienteContext && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Odontólogo
                </label>
                <input
                  type="text"
                  placeholder="Nombre del odontólogo"
                  value={filters.odontologoFilter}
                  onChange={(e) => onFilterChange({ odontologoFilter: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            )}
          </div>

          {/* Fila 2: Rango de fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha desde */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Fecha desde
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => onFilterChange({ fechaDesde: e.target.value })}
                  max={filters.fechaHasta || undefined}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Fecha hasta
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => onFilterChange({ fechaHasta: e.target.value })}
                  min={filters.fechaDesde || undefined}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Acciones */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-error-600 hover:bg-error-50 border-error-200 dark:text-error-400 dark:hover:bg-error-900/20"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar todos los filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          INDICADOR DE FILTROS ACTIVOS
      ==================================================================== */}
      {hasActiveFilters && !showFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={onToggleFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver detalles
              </button>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span className="text-xs">Filtrando...</span>
                </div>
              )}
              <button
                onClick={onClearFilters}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                aria-label="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          CHIPS DE FILTROS ACTIVOS
      ==================================================================== */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <FilterChip
              label={`Búsqueda: "${filters.searchTerm}"`}
              onRemove={() => onFilterChange({ searchTerm: "" })}
            />
          )}
          {filters.estadoFilter && (
            <FilterChip
              label={`Estado: ${ESTADO_OPTIONS.find(o => o.value === filters.estadoFilter)?.label}`}
              onRemove={() => onFilterChange({ estadoFilter: "" })}
            />
          )}
          {filters.completoFilter && (
            <FilterChip
              label={`Completitud: ${COMPLETO_OPTIONS.find(o => o.value === filters.completoFilter)?.label}`}
              onRemove={() => onFilterChange({ completoFilter: "" })}
            />
          )}
          {filters.odontologoFilter && (
            <FilterChip
              label={`Odontólogo: "${filters.odontologoFilter}"`}
              onRemove={() => onFilterChange({ odontologoFilter: "" })}
            />
          )}
          {filters.fechaDesde && (
            <FilterChip
              label={`Desde: ${new Date(filters.fechaDesde).toLocaleDateString('es-ES')}`}
              onRemove={() => onFilterChange({ fechaDesde: "" })}
            />
          )}
          {filters.fechaHasta && (
            <FilterChip
              label={`Hasta: ${new Date(filters.fechaHasta).toLocaleDateString('es-ES')}`}
              onRemove={() => onFilterChange({ fechaHasta: "" })}
            />
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * FILTER CHIP COMPONENT
 * ============================================================================
 */
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-full text-sm border border-brand-200 dark:border-brand-800">
      <span className="font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full p-0.5 transition-colors"
        aria-label={`Eliminar filtro: ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ClinicalRecordFilters;