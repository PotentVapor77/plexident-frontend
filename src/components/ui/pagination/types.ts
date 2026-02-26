// src/components/ui/pagination/types.ts

/**
 * Estado de paginación — interfaz única compartida por todas las tablas.
 * Viene normalizada desde el backend (via useClinicalRecords, usePacientes, etc.)
 * o calculada localmente en modo paciente fijado.
 */
export interface PaginationState {
  count: number;       // Total de registros
  page: number;        // Página actual (1-based)
  pageSize: number;    // Registros por página
  totalPages: number;  // Total de páginas
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Props del componente Pagination
 */
export interface PaginationProps {
  pagination: PaginationState;
  /** Página actual (controlado desde el padre) */
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Opcional: si no se pasa, oculta el selector de filas */
  onPageSizeChange?: (size: number) => void;
  /** Opciones del selector de filas. Por defecto: [5, 10, 20, 35, 50] */
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
  /** Texto del label contador. Por defecto: "registros" */
  entityLabel?: string;
}

/**
 * Props de la barra de búsqueda — separada para poder usarse sola
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Si se pasa onPageSizeChange + pageSize, renderiza el selector de filas inline */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}