// src/components/vitalSigns/VitalSignsMain.tsx

import { useState } from "react";
import { VitalSignsTable } from "./table/VitalSignsTable";
import { VitalSignsViewModal } from "./modals/VitalSignsViewModal";
import { VitalSignsDeleteModal } from "./modals/VitalSignsDeleteModal";

import type { IVitalSigns } from "../../../types/vitalSigns/IVitalSigns";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useVitalSigns } from "../../../hooks/vitalSigns/useVitalSigns";
import { usePacienteActivo } from "../../../context/PacienteContext";
import type { IPaciente } from "../../../types/patient/IPatient";

// Importar Anamnesis
import AnamnesisMain from "../anamnesis/AnamnesisMain";
import { AnamnesisCreateEditModal } from "../anamnesis/modals/AnamnesisCreateEditModal";
import type { IAnamnesis } from "../../../types/anamnesis/IAnamnesis";

// Importar Exámenes Estomatognáticos
import { StomatognathicExamTable } from "../stomatognathicExam/table/StomatognathicExamTable";
import { StomatognathicExamViewModal } from "../stomatognathicExam/modals/StomatognathicExamViewModal";
import { StomatognathicExamCreateEditModal } from "../stomatognathicExam/modals/StomatognathicExamCreateEditModal";
import { StomatognathicExamDeleteModal } from "../stomatognathicExam/modals/StomatognathicExamDeleteModal";
import type { IStomatognathicExam } from "../../../types/stomatognathicExam/IStomatognathicExam";
import { useStomatognathicExams } from "../../../hooks/stomatognathicExam/useStomatognathicExam";
import { VitalSignsCreateEditModal } from "./modals/VitalSignsCreateEditModal";

// Definir tipos de pestañas (SIN CONSULTAS)
type TabType = "anamnesis-general" | "signos-vitales" | "estomatognatico";

export default function VitalSignsMain() {
  const { notify } = useNotification();
  const { removeVitalSign } = useVitalSigns();
  const { removeExam } = useStomatognathicExams();
  const { pacienteActivo } = usePacienteActivo();

  const [activeTab, setActiveTab] = useState<TabType>("signos-vitales");

  // Estados para anamnesis
  const [anamnesisToEdit, setAnamnesisToEdit] = useState<IAnamnesis | null>(null);

  // Estados para exámenes estomatognáticos
  const [examToView, setExamToView] = useState<IStomatognathicExam | null>(null);
  const [examToEdit, setExamToEdit] = useState<IStomatognathicExam | null>(null);
  const [examToDelete, setExamToDelete] = useState<IStomatognathicExam | null>(null);

  // Estados para signos vitales (ahora incluyen consultas)
  const [vitalToView, setVitalToView] = useState<IVitalSigns | null>(null);
  const [vitalToEdit, setVitalToEdit] = useState<IVitalSigns | null>(null);
  const [vitalToDelete, setVitalToDelete] = useState<IVitalSigns | null>(null);

  // Modales para anamnesis
  const {
    isOpen: isAnamnesisCreateModalOpen,
    openModal: openAnamnesisCreateModal,
    closeModal: closeAnamnesisCreateModal,
  } = useModal();

  const {
    isOpen: isAnamnesisEditModalOpen,
    openModal: openAnamnesisEditModal,
    closeModal: closeAnamnesisEditModal,
  } = useModal();

  // Modales para exámenes estomatognáticos
  const {
    isOpen: isExamViewModalOpen,
    openModal: openExamViewModal,
    closeModal: closeExamViewModal,
  } = useModal();

  const {
    isOpen: isExamCreateModalOpen,
    openModal: openExamCreateModal,
    closeModal: closeExamCreateModal,
  } = useModal();

  const {
    isOpen: isExamEditModalOpen,
    openModal: openExamEditModal,
    closeModal: closeExamEditModal,
  } = useModal();

  const {
    isOpen: isExamDeleteModalOpen,
    openModal: openExamDeleteModal,
    closeModal: closeExamDeleteModal,
  } = useModal();

  // Modales para signos vitales (ahora incluyen consultas)
  const {
    isOpen: isVitalViewModalOpen,
    openModal: openVitalViewModal,
    closeModal: closeVitalViewModal,
  } = useModal();

  const {
    isOpen: isVitalCreateModalOpen,
    openModal: openVitalCreateModal,
    closeModal: closeVitalCreateModal,
  } = useModal();

  const {
    isOpen: isVitalEditModalOpen,
    openModal: openVitalEditModal,
    closeModal: closeVitalEditModal,
  } = useModal();

  const {
    isOpen: isVitalDeleteModalOpen,
    openModal: openVitalDeleteModal,
    closeModal: closeVitalDeleteModal,
  } = useModal();

  // Handlers para Anamnesis
  const handleCreateAnamnesis = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message: "Para gestionar anamnesis, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openAnamnesisCreateModal();
  };

  const handleEditAnamnesis = (anamnesis: IAnamnesis) => {
    setAnamnesisToEdit(anamnesis);
    openAnamnesisEditModal();
  };

  const handleCloseAnamnesisCreateModal = () => {
    closeAnamnesisCreateModal();
  };

  const handleCloseAnamnesisEditModal = () => {
    closeAnamnesisEditModal();
    setAnamnesisToEdit(null);
  };

  // Handlers para Exámenes Estomatognáticos
  const handleViewExam = (exam: IStomatognathicExam) => {
    setExamToView(exam);
    openExamViewModal();
  };

  const handleEditExam = (exam: IStomatognathicExam) => {
    setExamToEdit(exam);
    openExamEditModal();
  };

  const handleCreateExam = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message: "Para registrar un examen, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openExamCreateModal();
  };

  const handleOpenDeleteExam = (exam: IStomatognathicExam) => {
    setExamToDelete(exam);
    openExamDeleteModal();
  };

  const handleExamViewEdit = () => {
    if (examToView) {
      const e = examToView;
      setExamToView(null);
      handleEditExam(e);
      closeExamViewModal();
    }
  };

  const handleExamDeleteFinished = async () => {
    if (!examToDelete) return;
    try {
      await removeExam(examToDelete.id);
      notify({
        type: "success",
        title: "¡Eliminación Exitosa!",
        message: "El examen estomatognático se desactivó correctamente.",
      });
      closeExamDeleteModal();
      setExamToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar examen",
      });
    }
  };

  // Handlers para Signos Vitales (ahora incluyen consultas)
  const handleViewVital = (vital: IVitalSigns) => {
    setVitalToView(vital);
    openVitalViewModal();
  };

  const handleEditVital = (vital: IVitalSigns) => {
    setVitalToEdit(vital);
    openVitalEditModal();
  };

  const handleCreateVital = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message: "Para registrar consultas y signos vitales, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openVitalCreateModal();
  };

  const handleOpenDeleteVital = (vital: IVitalSigns) => {
    setVitalToDelete(vital);
    openVitalDeleteModal();
  };

  const handleVitalCreated = () => {
    closeVitalCreateModal();
  };

  const handleCloseVitalEditModal = () => {
    closeVitalEditModal();
    setVitalToEdit(null);
  };

  const handleVitalViewEdit = () => {
    if (vitalToView) {
      const v = vitalToView;
      setVitalToView(null);
      handleEditVital(v);
      closeVitalViewModal();
    }
  };

  const handleVitalDeleteFinished = async () => {
    if (!vitalToDelete) return;
    try {
      await removeVitalSign(vitalToDelete.id);
      notify({
        type: "success",
        title: "Registro médico eliminado",
        message: "El registro médico (consulta y signos vitales) se desactivó correctamente.",
      });
      closeVitalDeleteModal();
      setVitalToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar registro médico",
      });
    }
  };

  const handleNotify = (message: string, type: "success" | "error") => {
    notify({
      type,
      title: type === "success" ? "Éxito" : "Error",
      message,
    });
  };

  const tabs = [
    {
      id: "signos-vitales",
      label: "Registros Médicos",
      icon: "📋",
      description: "Consultas y constantes vitales integradas",
    },
    {
      id: "anamnesis-general",
      label: "Anamnesis General",
      icon: "📋",
      description: "Información de antecedentes médicos",
    },
    {
      id: "estomatognatico",
      label: "Exámenes Estomatognáticos",
      icon: "👄",
      description: "Exámenes de regiones orales y faciales",
    },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "anamnesis-general":
        return (
          <>
            {!pacienteActivo && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Nota:</strong> Para gestionar anamnesis, primero debe fijar un paciente desde
                    la vista principal de "Gestión de Pacientes".
                  </p>
                </div>
              </div>
            )}
            <AnamnesisMain onEditAnamnesis={handleEditAnamnesis} />
          </>
        );

      case "estomatognatico":
        return (
          <>
            {pacienteActivo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📌</span>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Mostrando examen estomatognatico del paciente fijado:
                      </p>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {pacienteActivo.nombres} {pacienteActivo.apellidos}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            CI: {pacienteActivo.cedula_pasaporte} • 
                            {pacienteActivo.sexo === 'M' ? ' 👨 Masculino' : ' 👩 Femenino'} • 
                            Edad: {pacienteActivo.edad}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filtrado por paciente
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!pacienteActivo && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Nota:</strong> Para gestionar exámenes, primero debe fijar un paciente desde
                    la vista principal de "Gestión de Pacientes".
                  </p>
                </div>
              </div>
            )}
            <StomatognathicExamTable
              onView={handleViewExam}
              onEdit={handleEditExam}
              onDelete={handleOpenDeleteExam}
              pacienteId={pacienteActivo?.id}
            />
          </>
        );

      case "signos-vitales":
        return (
          <>
            {pacienteActivo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📌</span>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Mostrando registros médicos del paciente fijado:
                      </p>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {pacienteActivo.nombres} {pacienteActivo.apellidos}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            CI: {pacienteActivo.cedula_pasaporte} • 
                            {pacienteActivo.sexo === 'M' ? ' 👨 Masculino' : ' 👩 Femenino'} • 
                            Edad: {pacienteActivo.edad}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filtrado por paciente
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!pacienteActivo && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Nota:</strong> Para gestionar registros médicos (consultas y signos vitales), 
                    primero debe fijar un paciente desde la vista principal de "Gestión de Pacientes".
                  </p>
                </div>
              </div>
            )}
            <VitalSignsTable
              onView={handleViewVital}
              onEdit={handleEditVital}
              onDelete={handleOpenDeleteVital}
              pacienteId={pacienteActivo?.id}
            />
          </>
        );

      default:
        return null;
    }
  };

  const renderActionButton = () => {
    switch (activeTab) {
      case "anamnesis-general":
        return (
          <button
            onClick={handleCreateAnamnesis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={!pacienteActivo}
          >
            + Crear Anamnesis
          </button>
        );
      case "estomatognatico":
        return (
          <button
            onClick={handleCreateExam}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={!pacienteActivo}
          >
            + Registrar Examen
          </button>
        );
      case "signos-vitales":
        return (
          <button
            onClick={handleCreateVital}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={!pacienteActivo}
          >
            + Nuevo Registro Médico
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión Clínica - Detalles del Paciente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los aspectos clínicos de los pacientes (consultas, signos vitales, anamnesis, exámenes)
            </p>
          </div>

          <div className="flex gap-3">
            {renderActionButton()}
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }
                `}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div
                    className={`text-xs mt-1 ${
                      activeTab === tab.id
                        ? "text-blue-500 dark:text-blue-300"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Actual
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-6">{renderTabContent()}</div>

      {/* Modales para Anamnesis */}
      {pacienteActivo && (
        <AnamnesisCreateEditModal
          isOpen={isAnamnesisCreateModalOpen}
          onClose={handleCloseAnamnesisCreateModal}
          mode="create"
          pacienteId={pacienteActivo.id}
          pacienteNombre={`${pacienteActivo.nombres} ${pacienteActivo.apellidos}`}
        />
      )}

      {anamnesisToEdit && (
        <AnamnesisCreateEditModal
          isOpen={isAnamnesisEditModalOpen}
          onClose={handleCloseAnamnesisEditModal}
          mode="edit"
          anamnesis={anamnesisToEdit}
          pacienteId={anamnesisToEdit.paciente}
          pacienteNombre={anamnesisToEdit.paciente_nombre || "Paciente"}
        />
      )}

      {/* Modales para Exámenes Estomatognáticos */}
      {examToView && (
        <StomatognathicExamViewModal
          isOpen={isExamViewModalOpen}
          onClose={closeExamViewModal}
          exam={examToView}
          onEdit={handleExamViewEdit}
        />
      )}

      {isExamCreateModalOpen && (
        <StomatognathicExamCreateEditModal
          isOpen={isExamCreateModalOpen}
          onClose={closeExamCreateModal}
          mode="create"
          initialData={null}
          examId={undefined}
          notify={handleNotify}
          pacienteActivo={pacienteActivo}
        />
      )}

      {examToEdit && (
        <StomatognathicExamCreateEditModal
          isOpen={isExamEditModalOpen}
          onClose={() => {
            closeExamEditModal();
            setExamToEdit(null);
          }}
          mode="edit"
          initialData={examToEdit}
          examId={examToEdit.id}
          notify={handleNotify}
          pacienteActivo={pacienteActivo}
        />
      )}

      {examToDelete && (
        <StomatognathicExamDeleteModal
          isOpen={isExamDeleteModalOpen}
          onClose={closeExamDeleteModal}
          exam={examToDelete}
          onDeleted={handleExamDeleteFinished}
          notify={handleNotify}
        />
      )}

      {/* Modales para Signos Vitales (ahora incluyen consultas) */}
      {vitalToView && (
        <VitalSignsViewModal
          isOpen={isVitalViewModalOpen}
          onClose={closeVitalViewModal}
          vital={vitalToView}
          onEdit={handleVitalViewEdit}
        />
      )}

      {isVitalCreateModalOpen && (
        <VitalSignsCreateEditModal
          isOpen={isVitalCreateModalOpen}
          onClose={closeVitalCreateModal}
          mode="create"
          initialData={null}
          vitalId={undefined}
          onVitalSaved={handleVitalCreated}
          notify={handleNotify}
          pacienteActivo={pacienteActivo as IPaciente | null}
        />
      )}

      {vitalToEdit && (
        <VitalSignsCreateEditModal
          isOpen={isVitalEditModalOpen}
          onClose={handleCloseVitalEditModal}
          mode="edit"
          initialData={vitalToEdit}
          vitalId={vitalToEdit.id}
          onVitalSaved={handleCloseVitalEditModal}
          notify={handleNotify}
        />
      )}

      {vitalToDelete && (
        <VitalSignsDeleteModal
          isOpen={isVitalDeleteModalOpen}
          onClose={closeVitalDeleteModal}
          vital={vitalToDelete}
          onDeleted={handleVitalDeleteFinished}
          notify={handleNotify}
        />
      )}
    </>
  );
}