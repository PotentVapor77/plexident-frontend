// src/components/ui/pagination/Pagination.tsx

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { PaginationProps } from "./types";


const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 35, 50];

/**
 * ============================================================================
 * PAGINATION
 * Componente global de paginación. Único punto de cambio para
 * actualizar el diseño de paginación en toda la aplicación.
 *
 * Uso:
 *   <Pagination
 *     pagination={paginationNormalized}
 *     pageSize={pageSize}
 *     onPageChange={handlePageChange}
 *     onPageSizeChange={handlePageSizeChange}
 *     isLoading={isLoading}
 *     entityLabel="historiales"
 *   />
 * ============================================================================
 */
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
  className = "",
  entityLabel = "registros",
}) => {
  // No renderizar si hay una sola página y no hay selector de filas
  if (pagination.totalPages <= 1 && !onPageSizeChange) return null;

  // ── Cálculo de páginas visibles con ellipsis ──────────────────────────────
  const pageItems = useMemo<(number | "...")[]>(() => {
    const { page, totalPages } = pagination;

    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(
        (p) =>
          p === 1 ||
          p === totalPages ||
          Math.abs(p - page) <= 1
      )
      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
        if (idx > 0 && typeof arr[idx - 1] === "number") {
          if (p - (arr[idx - 1] as number) > 1) acc.push("...");
        }
        acc.push(p);
        return acc;
      }, []);
  }, [pagination]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
    >
      {/* ── Izquierda: info + selector de filas ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Contador */}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Página{" "}
          <span className="font-medium">{pagination.page}</span> de{" "}
          <span className="font-medium">{pagination.totalPages}</span>
          {" "}·{" "}
          <span className="font-medium">{pagination.count}</span>{" "}
          {entityLabel}
        </span>

        {/* Selector de filas por página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Mostrar:
            </label>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={isLoading}
                className="pl-8 pr-6 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Derecha: controles de navegación ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Anterior */}
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious || isLoading}
            aria-label="Página anterior"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Números de página */}
          {pageItems.map((item, idx) =>
            item === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1.5 text-sm text-gray-400 dark:text-gray-500 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                disabled={isLoading}
                aria-label={`Ir a página ${item}`}
                aria-current={item === pagination.page ? "page" : undefined}
                className={`min-w-[36px] px-2 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                  item === pagination.page
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {item}
              </button>
            )
          )}

          {/* Siguiente */}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || isLoading}
            aria-label="Página siguiente"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Pagination);