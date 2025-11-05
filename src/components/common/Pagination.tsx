// common/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  currentStart: number;
  currentEnd: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevPage,
  onNextPage,
  canGoPrev,
  canGoNext,
  currentStart,
  currentEnd,
  totalItems
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {currentStart} - {currentEnd} de {totalItems} registros
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onPrevPage} 
          disabled={!canGoPrev}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
        >
          Anterior
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button 
              key={pageNum} 
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-md text-sm ${
                currentPage === pageNum 
                  ? "bg-blue-500 text-white" 
                  : "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button 
          onClick={onNextPage} 
          disabled={!canGoNext}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}