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

const usePagination = <T,>(
  data: T[],
  itemsPerPage: number
): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => 
    Math.ceil(data.length / itemsPerPage), 
    [data.length, itemsPerPage]
  );

  const currentData = useMemo(() => 
    data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), 
    [data, currentPage, itemsPerPage]
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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
    canGoPrev
  };
};

export default usePagination;