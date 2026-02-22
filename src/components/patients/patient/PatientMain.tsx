// src/components/patients/PatientMain.tsx

import { useState } from "react";
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
  const { notify } = useNotification();
  const { setPacienteActivo, pacienteActivo } = usePacienteActivo();

  // Estados para pacientes
  const [patientToView, setPatientToView] = useState<IPaciente | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<IPaciente | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<IPaciente | null>(null);

  // Modales para pacientes
  const {
    isOpen: isPatientViewModalOpen,
    openModal: openPatientViewModal,
    closeModal: closePatientViewModal,
  } = useModal();

  const {
    isOpen: isPatientCreateModalOpen,
    openModal: openPatientCreateModal,
    closeModal: closePatientCreateModal,
  } = useModal();

  const {
    isOpen: isPatientEditModalOpen,
    openModal: openPatientEditModal,
    closeModal: closePatientEditModal,
  } = useModal();

  const {
    isOpen: isPatientDeleteModalOpen,
    openModal: openPatientDeleteModal,
    closeModal: closePatientDeleteModal,
  } = useModal();

  // Hooks para datos
  const { removePaciente } = usePacientes();

  // -------------------------------------
  // Handlers para Pacientes
  // -------------------------------------
  const handleViewPatient = (patient: IPaciente) => {
    setPatientToView(patient);
    openPatientViewModal();
  };

  const handleEditPatient = (patient: IPaciente) => {
    setPatientToEdit(patient);
    openPatientEditModal();
  };

  const handleOpenDeletePatient = (patient: IPaciente) => {
    setPatientToDelete(patient);
    openPatientDeleteModal();
  };

  const handleActivatePatient = (patient: IPaciente) => {
    if (pacienteActivo?.id === patient.id) {
      setPacienteActivo(null);
      notify({
        type: "info",
        title: "Paciente desfijado",
        message: `${patient.nombres} ${patient.apellidos} ya no está fijado`,
      });
    } else {
      setPacienteActivo(patient);
      notify({
        type: "success",
        title: "Paciente fijado",
        message: `${patient.nombres} ${patient.apellidos} está ahora fijado.`,
      });
    }
  };

  const handlePatientCreated = () => {
    closePatientCreateModal();
  };

  const handleClosePatientEditModal = () => {
    closePatientEditModal();
    setPatientToEdit(null);
  };

  const handlePatientViewEdit = () => {
    if (patientToView) {
      const p = patientToView;
      setPatientToView(null);
      handleEditPatient(p);
      closePatientViewModal();
    }
  };

  const handlePatientDeleteFinished = async () => {
    if (patientToDelete?.id) {
      await removePaciente(patientToDelete.id);
    }
    closePatientDeleteModal();
    setPatientToDelete(null);
  };

  return (
    <>
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Pacientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los pacientes del centro odontológico
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openPatientCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Crear paciente
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="flex-1 min-h-0">
        <PatientTable
          onView={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleOpenDeletePatient}
          onActivate={handleActivatePatient}
        />
      </div>

      {/* =========================================== */}
      {/* MODALES PARA PACIENTES */}
      {/* =========================================== */}
      {patientToView && (
        <PacienteViewModal
          isOpen={isPatientViewModalOpen}
          onClose={closePatientViewModal}
          paciente={patientToView}
          onEdit={handlePatientViewEdit}
        />
      )}

      {/* Crear paciente */}
      <Modal
        isOpen={isPatientCreateModalOpen}
        onClose={closePatientCreateModal}
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
          <PatientForm onPatientCreated={handlePatientCreated} notify={notify} />
        </>
      </Modal>

      {/* Editar paciente */}
      {patientToEdit && (
        <Modal
          isOpen={isPatientEditModalOpen}
          onClose={handleClosePatientEditModal}
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
            <PatientForm
              mode="edit"
              patientId={patientToEdit.id}
              initialData={patientToEdit}
              onPatientCreated={handleClosePatientEditModal}
              notify={notify}
            />
          </>
        </Modal>
      )}

      {/* Eliminar paciente */}
      {patientToDelete && (
        <PatientDeleteModal
          isOpen={isPatientDeleteModalOpen}
          onClose={closePatientDeleteModal}
          patient={patientToDelete}
          onDeleted={handlePatientDeleteFinished}
          notify={notify}
        />
      )}
    </>
  );
}