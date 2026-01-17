// src/components/patients/consultations/ConsultationMain.tsx

import { useState } from 'react';
import { ConsultationViewModal } from './modals/ConsultationViewModal';
import { ConsultationDeleteModal } from './modals/ConsultationDeleteModal';
import { useModal } from '../../../hooks/useModal';
import { usePacienteActivo } from '../../../context/PacienteContext';
import type { IConsultation } from '../../../types/consultations/IConsultation';
import { useConsultations } from '../../../hooks/consultations/useConsultation';
import { ConsultationTable } from './table/ConsultationTable';

// ✅ Interface para props
interface ConsultationMainProps {
  onEditConsultation?: (consultation: IConsultation) => void;
}

export default function ConsultationMain({ onEditConsultation }: ConsultationMainProps) {
  const { pacienteActivo } = usePacienteActivo();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // ✅ Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const [consultationToView, setConsultationToView] = useState<IConsultation | null>(null);
  const [consultationToDelete, setConsultationToDelete] = useState<IConsultation | null>(null);

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

  // ✅ Hook para obtener consultas
  const { data, isLoading } = useConsultations({
    page: currentPage,
    page_size: pageSize,
    // ✅ Filtro por paciente activo
    paciente: pacienteActivo?.id,
    // ✅ Búsqueda
    search: searchTerm,
  });

  const consultations = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  // Handlers
  const handleViewConsultation = (consultation: IConsultation) => {
    setConsultationToView(consultation);
    openViewModal();
  };

  const handleEditConsultation = (consultation: IConsultation) => {
    // ✅ Usar la prop onEditConsultation si está disponible
    if (onEditConsultation) {
      onEditConsultation(consultation);
    }
  };

  const handleOpenDeleteConsultation = (consultation: IConsultation) => {
    setConsultationToDelete(consultation);
    openDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    closeDeleteModal();
    setConsultationToDelete(null);
  };

  const handleViewEdit = () => {
    if (consultationToView && onEditConsultation) {
      onEditConsultation(consultationToView);
      closeViewModal();
      setConsultationToView(null);
    }
  };

  // ✅ Handler para búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a primera página al buscar
  };

  return (
    <>
      {/* Tabla principal */}
      <ConsultationTable
        consultations={consultations}
        isLoading={isLoading}
        onView={handleViewConsultation}
        onEdit={handleEditConsultation}
        onDelete={handleOpenDeleteConsultation}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalCount={totalCount}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        // ✅ Props para búsqueda y paciente
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        pacienteActivo={pacienteActivo}
      />

      {/* Ver consulta */}
      {consultationToView && (
        <ConsultationViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          consultation={consultationToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Eliminar consulta */}
      {consultationToDelete && (
        <ConsultationDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          consultation={consultationToDelete}
        />
      )}
    </>
  );
}