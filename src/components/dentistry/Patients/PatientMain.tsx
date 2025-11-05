// dentist/PatientMain.tsx
import { useState, useMemo } from "react";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import usePagination from "../../../hooks/usePagination";
import { usePatients } from "../../../hooks/usePatients";
import { usePatientForm } from "../../../hooks/usePatientForm";
import { SearchBar } from "../../common/SearchBar";
import { Pagination } from "../../common/Pagination";
import { PatientTable } from "../../tables/PetientTable/PatientTable";
import { PatientForm } from "./PatientForm";
import { PatientViewModal } from "./PatientViewModal";
import { PatientDeleteModal } from "./PatientDeleteModal";
import type { IPatient } from "../../../types/IPatient";
 
export default function PatientMain() {
  const itemsPerPage = 4;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [successType, setSuccessType] = useState<"edit" | "delete">("edit");

  // Hooks personalizados
  const {
    patients,
    loading,
    error,
    handleUpdatePatient,
    handleDeletePatient,
  } = usePatients();

  const {
    formData,
    selectedPatient,
    resetForm,
    handleInputChange,
    validateFormData,
    preparePatientData,
    loadPatientData,
  } = usePatientForm();

  // Estados para modales
  const [patientToDelete, setPatientToDelete] = useState<IPatient | null>(null);

  // Modales
  const {
    isOpen: isPatientModalOpen,
    openModal: openPatientModal,
    closeModal: closePatientModal,
  } = useModal();
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
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return patients.filter((patient: IPatient) =>
      patient.nombres.toLowerCase().includes(lowerSearchTerm) ||
      patient.apellidos.toLowerCase().includes(lowerSearchTerm) ||
      patient.cedula_pasaporte.toLowerCase().includes(lowerSearchTerm) ||
      (patient.telefono &&
        patient.telefono.toLowerCase().includes(lowerSearchTerm)) ||
      (patient.correo &&
        patient.correo.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, patients]);

  // Paginación
  const {
    currentPage: page,
    totalPages,
    currentData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    canGoNext,
    canGoPrev,
  } = usePagination<IPatient>(filteredData, itemsPerPage);

  // Handlers
  const handleEditPatient = (patient: IPatient) => {
    loadPatientData(patient);
    openPatientModal();
  };

  const handleViewPatient = (patient: IPatient) => {
    loadPatientData(patient);
    openViewModal();
  };

  const handleDeletePatientClick = (patient: IPatient) => {
    setPatientToDelete(patient);
    openDeleteModal();
  };

  const handleSubmitPatient = async () => {
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert("Errores de validación:\n" + validationErrors.join("\n"));
      return;
    }

    setSubmitLoading(true);

    try {
      const patientData = preparePatientData();

      if (selectedPatient) {
        await handleUpdatePatient(selectedPatient.id, patientData);

        closePatientModal();
        resetForm();

        setSuccessType("edit");
        openSuccessModal();
      }
    } catch (err) {
      console.error("Error al guardar paciente:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      await handleDeletePatient(patientToDelete.id);

      closeDeleteModal();
      setPatientToDelete(null);

      setSuccessType("delete");
      openSuccessModal();
    } catch (err) {
      console.error("Error al eliminar paciente:", err);
      alert("Error al eliminar el paciente");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500 dark:text-gray-400">
          Cargando pacientes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div >

      {/* Header sin botón de crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Gestión de Pacientes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los pacientes del sistema odontológico
          </p>
        </div>
        
        {/* Mostrar contador de usuarios */}
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {patients.length} paciente(s) registrado(s)
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, apellido, cédula, teléfono, correo o estado..."
          resultsCount={filteredData.length}
        />
      </div>

      {/* Tabla de pacientes */}
      <div className="mb-6">
        <PatientTable
          patients={patients}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatientClick}
          currentData={currentData}
        />
      </div>

      {/* Paginación */}
      {filteredData.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            currentStart={(page - 1) * itemsPerPage + 1}
            currentEnd={Math.min(page * itemsPerPage, filteredData.length)}
            totalItems={filteredData.length}
          />
        </div>
      )}

      {/* Modales */}
      <PatientForm
        isOpen={isPatientModalOpen}
        onClose={() => {
          closePatientModal();
          resetForm();
        }}
        onSubmit={handleSubmitPatient}
        formData={formData}
        onInputChange={handleInputChange}
        loading={submitLoading}
        patient={selectedPatient}
      />

      <PatientViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        patient={selectedPatient}
        onEdit={() => {
          closeViewModal();
          if (selectedPatient) handleEditPatient(selectedPatient);
        }}
      />

      <PatientDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          setPatientToDelete(null);
        }}
        patient={patientToDelete}
        onConfirm={confirmDeletePatient}
      />

      {/* Modal de Éxito */}
      <Modal isOpen={isSuccessModalOpen} onClose={closeSuccessModal} className="max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 dark:bg-green-900/20">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {successType === "edit"
              ? "¡Actualización Exitosa!"
              : "¡Eliminación Exitosa!"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {successType === "edit"
              ? "Paciente actualizado exitosamente"
              : "Paciente eliminado exitosamente"}
          </p>
          <button
            onClick={closeSuccessModal}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}
