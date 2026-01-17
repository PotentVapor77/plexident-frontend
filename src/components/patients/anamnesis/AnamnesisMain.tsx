// src/components/anamnesis/AnamnesisMain.tsx

import { useState } from 'react';
import { AnamnesisTable } from './table/AnamnesisTable';
import { AnamnesisViewModal } from './modals/AnamnesisViewModal';
import { AnamnesisDeleteModal } from './modals/AnamnesisDeleteModal';
import { useModal } from '../../../hooks/useModal';
import { usePacienteActivo } from '../../../context/PacienteContext';
import type { IAnamnesis } from '../../../types/anamnesis/IAnamnesis';
import { useAnamnesis } from '../../../hooks/anamnesis/useAnamnesis';


interface AnamnesisMainProps {
  onEditAnamnesis?: (anamnesis: IAnamnesis) => void;
}

export default function AnamnesisMain({ onEditAnamnesis }: AnamnesisMainProps) {
  const { pacienteActivo } = usePacienteActivo();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const [anamnesisToView, setAnamnesisToView] = useState<IAnamnesis | null>(null);
  const [anamnesisToDelete, setAnamnesisToDelete] = useState<IAnamnesis | null>(null);

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const { data, isLoading } = useAnamnesis({
    page: currentPage,
    page_size: pageSize,
    paciente: pacienteActivo?.id,
    search: searchTerm,
  });

  const anamnesisData = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const handleViewAnamnesis = (anamnesis: IAnamnesis) => {
    setAnamnesisToView(anamnesis);
    openViewModal();
  };

  const handleEditAnamnesis = (anamnesis: IAnamnesis) => {
    if (onEditAnamnesis) {
      onEditAnamnesis(anamnesis);
    }
  };

  const handleOpenDeleteAnamnesis = (anamnesis: IAnamnesis) => {
    setAnamnesisToDelete(anamnesis);
    openDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    closeDeleteModal();
    setAnamnesisToDelete(null);
  };

  const handleViewEdit = () => {
    if (anamnesisToView && onEditAnamnesis) {
      onEditAnamnesis(anamnesisToView);
      closeViewModal();
      setAnamnesisToView(null);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <>
      <AnamnesisTable
        anamnesisData={anamnesisData}
        isLoading={isLoading}
        onView={handleViewAnamnesis}
        onEdit={handleEditAnamnesis}
        onDelete={handleOpenDeleteAnamnesis}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalCount={totalCount}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        pacienteActivo={pacienteActivo}
      />

      {anamnesisToView && (
        <AnamnesisViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          anamnesis={anamnesisToView}
          onEdit={handleViewEdit}
        />
      )}

      {anamnesisToDelete && (
        <AnamnesisDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          anamnesis={anamnesisToDelete}
        />
      )}
    </>
  );
}