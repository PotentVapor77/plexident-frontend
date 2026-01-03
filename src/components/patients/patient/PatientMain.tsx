// src/components/patients/PatientMain.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PatientTable } from "./table/PatientTable";
import { PacienteViewModal } from "./modals/PatientViewModal";
import PatientForm from "./forms/PatientForm";
import type { IPaciente } from "../../../types/patient/IPatient";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import { PatientDeleteModal } from "./modals/PatientDeleteModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { usePacientes } from "../../../hooks/patient/usePatients";
import { usePacienteActivo } from "../../../context/PacienteContext";

export default function PatientMain() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { setPacienteActivo, pacienteActivo } = usePacienteActivo(); 

  const [patientToView, setPatientToView] = useState<IPaciente | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<IPaciente | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<IPaciente | null>(null);

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isCreateModalOpen,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();
  const { removePaciente } = usePacientes();
  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  // -------------------------------------

  const handleViewPatient = (patient: IPaciente) => {
    setPatientToView(patient);
    openViewModal();
  };

  const handleEditPatient = (patient: IPaciente) => {
    setPatientToEdit(patient);
    openEditModal();
  };

  const handleOpenDeletePatient = (patient: IPaciente) => {
    setPatientToDelete(patient);
    openDeleteModal();
  };

  const handleActivatePatient = (patient: IPaciente) => {
    // Si es el mismo paciente, desfijarlo
    if (pacienteActivo?.id === patient.id) {
      setPacienteActivo(null);
      notify({
        type: "info",
        title: "Paciente desfijado",
        message: `${patient.nombres} ${patient.apellidos} ya no está fijado`,
      });
    } else {
      // Si es otro paciente o no hay ninguno fijado, fijarlo
      setPacienteActivo(patient);
      notify({
        type: "success",
        title: "Paciente fijado",
        message: `${patient.nombres} ${patient.apellidos} está ahora fijado. Accede al menú Odontograma para ver su información`,
      });
    }
  };

  // ✅ Solo cierra el modal - La notificación se muestra en PatientForm cuando es exitoso
  const handlePatientCreated = () => {
    closeCreateModal();
  };

  // ✅ Solo cierra modal y limpia estado - La notificación se muestra en PatientForm cuando es exitoso
  const handleCloseEditModal = () => {
    closeEditModal();
    setPatientToEdit(null);
    navigate("/pacientes");
  };

  const handleViewEdit = () => {
    if (patientToView) {
      const p = patientToView;
      setPatientToView(null);
      handleEditPatient(p);
      closeViewModal();
    }
  };

  const handleDeleteFinished = async () => {
    if (patientToDelete?.id) {
      await removePaciente(patientToDelete.id); // ✅ Esto invalida TODO
    }
    closeDeleteModal();
    setPatientToDelete(null);
  };

  return (
    <>
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Pacientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los pacientes del centro odontológico
            </p>
          </div>

          <div className="flex gap-3">
            {/* Botón crear */}
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Crear paciente
            </button>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <PatientTable
        onView={handleViewPatient}
        onEdit={handleEditPatient}
        onDelete={handleOpenDeletePatient}
        onActivate={handleActivatePatient}
      />

      {/* Ver paciente */}
      {patientToView && (
        <PacienteViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          paciente={patientToView}
          onEdit={handleViewEdit}
        />
      )}

      {/* Crear paciente */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
      >
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                Registrar nuevo paciente
              </h5>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Complete los datos del nuevo paciente del sistema
              </p>
            </div>
          </div>
          {/* ✅ Pasa notify para que muestre la notificación solo si es exitoso */}
          <PatientForm 
            onPatientCreated={handlePatientCreated}
            notify={notify}
          />
        </>
      </Modal>

      {/* Editar paciente */}
      {patientToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
        >
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                  Editar paciente
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Actualice la información del paciente del sistema
                </p>
              </div>
            </div>
            {/* ✅ Pasa notify para que muestre la notificación solo si es exitoso */}
            <PatientForm
              mode="edit"
              patientId={patientToEdit.id}
              initialData={patientToEdit}
              onPatientCreated={handleCloseEditModal}
              notify={notify}
            />
          </>
        </Modal>
      )}

      {/* Eliminar paciente */}
      {patientToDelete && (
        <PatientDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          patient={patientToDelete}
          onDeleted={handleDeleteFinished}
          notify={notify} // ✅ Pasa notify para que muestre la notificación solo si es exitoso
        />
      )}
    </>
  );
}
