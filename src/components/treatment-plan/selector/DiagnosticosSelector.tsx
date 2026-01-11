// src/components/odontogram/treatmentPlan/DiagnosticosSelector.tsx

import { ChevronDown, CheckCircle2 } from "lucide-react";
import type { DiagnosticoSnapshot } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import {
  formatTreatmentSurfaces,
  type GroupedTreatmentDiagnostic,
} from "../../../core/utils/groupTreatmentDiagnostics";
import {
  FILTER_OPTIONS,
  MAP_FILTRO_A_MATCHER,
  type FiltroDiagnostico,
} from "../../../hooks/treatmentPlan/sessionFormHooks/useDiagnosticosFilter";

const STYLES = {
  card: "rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50",
  sectionTitle: "text-base font-semibold text-gray-900 dark:text-white",
  sectionDesc: "text-sm text-gray-500 dark:text-gray-400",
  badge:
    "inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10 dark:bg-brand-400/10 dark:text-brand-400 dark:ring-brand-400/20",
};

interface DiagnosticosSelectorProps {
  diagnosticosDisponibles: any;
  selectedDiagnosticos: DiagnosticoSnapshot[];
  diagnosticosAgrupados: GroupedTreatmentDiagnostic[];
  gruposSeleccionados: GroupedTreatmentDiagnostic[];
  filtroDiagnostico: FiltroDiagnostico;
  isFilterOpen: boolean;
  gruposPorFiltro: Record<string, number>;
  getCurrentFilterLabel: () => string;
  onToggleDiagnostico: (group: GroupedTreatmentDiagnostic) => void;
  onSetFiltroDiagnostico: (filtro: FiltroDiagnostico) => void;
  onSetIsFilterOpen: (open: boolean) => void;
}

export default function DiagnosticosSelector({
  diagnosticosDisponibles,
  selectedDiagnosticos,
  diagnosticosAgrupados,
  gruposSeleccionados,
  filtroDiagnostico,
  isFilterOpen,
  gruposPorFiltro,
  getCurrentFilterLabel,
  onToggleDiagnostico,
  onSetFiltroDiagnostico,
  onSetIsFilterOpen,
}: DiagnosticosSelectorProps) {
  return (
    <div className={STYLES.card}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={STYLES.sectionTitle}>Diagnósticos del odontograma</h3>
          <p className={STYLES.sectionDesc}>
            Selecciona solo los diagnósticos relevantes para esta sesión.
          </p>
        </div>
      </div>

      {/* Dropdown de filtros + Contador */}
      <div className="mb-4 flex items-center gap-3">
        {/* Dropdown de filtros */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => onSetIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <span>{getCurrentFilterLabel()}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-gray-800">
              {FILTER_OPTIONS.map((option) => {
                const gruposCount = gruposPorFiltro[option.value] ?? 0;
                let superficiesCount = 0;
                const todos = diagnosticosDisponibles?.diagnosticos ?? [];

                if (option.value === "todos") {
                  superficiesCount = todos.length;
                } else if (option.value === "nuevos") {
                  superficiesCount = todos.filter(
                    (d: any) => d.es_nuevo === true
                  ).length;
                } else {
                  const matcher = MAP_FILTRO_A_MATCHER[option.value];
                  if (matcher) {
                    superficiesCount = todos.filter(
                      (d: any) => d.categoria && matcher(d.categoria)
                    ).length;
                  }
                }

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSetFiltroDiagnostico(option.value as FiltroDiagnostico);
                      onSetIsFilterOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors dark:hover:bg-gray-700"
                  >
                    {/* Checkbox visual */}
                    <div className="flex h-5 w-5 items-center justify-center">
                      {filtroDiagnostico === option.value && (
                        <CheckCircle2 className="h-5 w-5 text-brand-500" />
                      )}
                    </div>

                    {/* Label */}
                    <span className="flex-1 font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>

                    {/* Contador de grupos + totales */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium dark:bg-gray-700">
                        {gruposCount}
                      </span>
                      <span>{superficiesCount} sup.</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Contador de seleccionados */}
        <div className={STYLES.badge}>
          {gruposSeleccionados.length} grupo
          {gruposSeleccionados.length !== 1 ? "s" : ""} seleccionado
          {gruposSeleccionados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid de diagnósticos */}
      {diagnosticosAgrupados.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay diagnósticos para el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {diagnosticosAgrupados.map((group) => {
            const isGroupSelected = group.diagnostico_ids.some((id) =>
              selectedDiagnosticos.some((d) => d.id === id)
            );

            return (
              <button
                key={group.groupId}
                type="button"
                onClick={() => onToggleDiagnostico(group)}
                className="flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all hover:shadow-sm"
                style={{
                  borderLeftColor: group.color_hex,
                  borderLeftWidth: "4px",
                  backgroundColor: isGroupSelected
                    ? `${group.color_hex}15`
                    : "white",
                  borderColor: isGroupSelected
                    ? group.color_hex
                    : "#e5e7eb",
                }}
              >
                {/* Checkbox */}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isGroupSelected && (
                    <CheckCircle2
                      className="h-5 w-5"
                      style={{ color: group.color_hex }}
                    />
                  )}
                </div>

                {/* Contenido */}
                <div className="min-w-0 flex-1">
                  {/* Código FDI como círculo sólido (igual al txt) */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: group.color_hex || "#9ca3af" }}
                    >
                      {group.diente}
                    </div>

                    {/* Nombre */}
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {group.diagnostico_nombre}
                    </h4>

                    {group.count > 1 && (
                      <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20">
                        {group.count} superficie
                        {group.count > 1 ? "s" : ""}
                      </span>
                    )}

                    {/* Badge de nuevo */}
                    {group.es_nuevo && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                        Nuevo
                      </span>
                    )}
                  </div>

                  {/* Detalles */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {group.siglas} · {formatTreatmentSurfaces(group.superficies)} ·
                    Prioridad: {group.prioridad}
                  </p>

                  {/* Descripción */}
                  {group.descripcion && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {group.descripcion}
                    </p>
                  )}

                  {/* Categoría */}
                  {group.categoria && (
                    <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {group.categoria}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
