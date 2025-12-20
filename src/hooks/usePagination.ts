// hooks/usePagination.ts
import { useState, useMemo } from "react";

interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  currentData: T[];
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const usePagination = <T>(
  data: T[] | undefined | null,  // ✅ Acepta undefined/null
  itemsPerPage: number
): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Asegurar que data sea un array válido
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const totalPages = useMemo(
    () => Math.ceil(safeData.length / itemsPerPage) || 1,  // ✅ Mínimo 1 página
    [safeData.length, itemsPerPage]
  );

  const currentData = useMemo(
    () =>
      safeData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [safeData, currentPage, itemsPerPage]
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    canGoNext,
    canGoPrev,
  };
};

export default usePagination;
