// src/components/patients/backgrounds/BackgroundsMain.tsx

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useModal } from '../../../hooks/useModal';
import { useNotification } from '../../../context/notifications/NotificationContext';
import { BackgroundsTable } from './table/BackgroundsTable';
import { BackgroundsCreateEditModal } from './modals/BackgroundsCreateEditModal';
import { BackgroundsViewModal } from './modals/BackgroundsViewModal';
import { BackgroundsDeleteModal } from './modals/BackgroundsDeleteModal';
import type { IAntecedenteCombinado } from '../../../hooks/backgrounds/useBackgrounds';
import { useDesactivarTodosAntecedentesPorPaciente } from '../../../hooks/backgrounds/useBackgrounds';
import BackgroundsForm from './forms/BackgroundsForm';

export default function BackgroundsMain() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const { notify } = useNotification();
  const [selectedBackground, setSelectedBackground] = useState<IAntecedenteCombinado | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
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

  const desactivarTodosAntecedentes = useDesactivarTodosAntecedentesPorPaciente();

  if (!pacienteId) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-red-800 dark:text-red-200">Error: No se encontró el ID del paciente</p>
      </div>
    );
  }

  const handleEdit = (background: IAntecedenteCombinado) => {
    setSelectedBackground(background);
    openEditModal();
  };

  const handleView = (background: IAntecedenteCombinado) => {
    setSelectedBackground(background);
    openViewModal();
  };

  const handleDelete = (background: IAntecedenteCombinado) => {
    setSelectedBackground(background);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!pacienteId) return;

    try {
      await desactivarTodosAntecedentes.mutateAsync(pacienteId);

      notify({
        type: 'success',
        title: '✅ Antecedentes desactivados',
        message: 'Todos los antecedentes se marcaron como inactivos correctamente.',
      });
      
      closeDeleteModal();
      setSelectedBackground(null);
    } catch (error) {
      console.error('Error al desactivar antecedentes:', error);
      notify({
        type: 'error',
        title: '❌ Error',
        message: 'No se pudieron desactivar los antecedentes.',
      });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    notify({
      type: 'success',
      title: 'Antecedentes creados',
      message: 'Los antecedentes se crearon correctamente.',
    });
  };

  const getAntecedentesParaModales = () => {
    if (!selectedBackground) return { personal: null, familiar: null };
    
    if (selectedBackground.tipo === 'personal') {
      return {
        personal: {
          id: selectedBackground.id,
          paciente: selectedBackground.paciente,
          activo: selectedBackground.activo,
          alergia_antibiotico: selectedBackground.alergia_antibiotico || '',
          alergia_antibiotico_otro: selectedBackground.alergia_antibiotico_otro,
          alergia_anestesia: selectedBackground.alergia_anestesia || '',
          alergia_anestesia_otro: selectedBackground.alergia_anestesia_otro,
          hemorragias: selectedBackground.hemorragias || '',
          hemorragias_detalle: selectedBackground.hemorragias_detalle,
          vih_sida: selectedBackground.vih_sida || '',
          vih_sida_otro: selectedBackground.vih_sida_otro,
          tuberculosis: selectedBackground.tuberculosis || '',
          tuberculosis_otro: selectedBackground.tuberculosis_otro,
          asma: selectedBackground.asma || '',
          asma_otro: selectedBackground.asma_otro,
          diabetes: selectedBackground.diabetes || '',
          diabetes_otro: selectedBackground.diabetes_otro,
          hipertension_arterial: selectedBackground.hipertension_arterial || '',
          hipertension_arterial_otro: selectedBackground.hipertension_arterial_otro,
          enfermedad_cardiaca: selectedBackground.enfermedad_cardiaca || '',
          enfermedad_cardiaca_otro: selectedBackground.enfermedad_cardiaca_otro,
          otros_antecedentes_personales: selectedBackground.otros_antecedentes_personales,
          habitos: selectedBackground.habitos,
          observaciones: selectedBackground.observaciones,
        },
        familiar: null,
      };
    } else {
      return {
        personal: null,
        familiar: {
          id: selectedBackground.id,
          paciente: selectedBackground.paciente,
          activo: selectedBackground.activo,
          cardiopatia_familiar: selectedBackground.cardiopatia_familiar || '',
          cardiopatia_familiar_otro: selectedBackground.cardiopatia_familiar_otro,
          hipertension_arterial_familiar: selectedBackground.hipertension_arterial_familiar || '',
          hipertension_arterial_familiar_otro: selectedBackground.hipertension_arterial_familiar_otro,
          enfermedad_vascular_familiar: selectedBackground.enfermedad_vascular_familiar || '',
          enfermedad_vascular_familiar_otro: selectedBackground.enfermedad_vascular_familiar_otro,
          endocrino_metabolico_familiar: selectedBackground.endocrino_metabolico_familiar || '',
          endocrino_metabolico_familiar_otro: selectedBackground.endocrino_metabolico_familiar_otro,
          cancer_familiar: selectedBackground.cancer_familiar || '',
          cancer_familiar_otro: selectedBackground.cancer_familiar_otro,
          tipo_cancer: selectedBackground.tipo_cancer,
          tipo_cancer_otro: selectedBackground.tipo_cancer_otro,
          tuberculosis_familiar: selectedBackground.tuberculosis_familiar || '',
          tuberculosis_familiar_otro: selectedBackground.tuberculosis_familiar_otro,
          enfermedad_mental_familiar: selectedBackground.enfermedad_mental_familiar || '',
          enfermedad_mental_familiar_otro: selectedBackground.enfermedad_mental_familiar_otro,
          enfermedad_infecciosa_familiar: selectedBackground.enfermedad_infecciosa_familiar || '',
          enfermedad_infecciosa_familiar_otro: selectedBackground.enfermedad_infecciosa_familiar_otro,
          malformacion_familiar: selectedBackground.malformacion_familiar || '',
          malformacion_familiar_otro: selectedBackground.malformacion_familiar_otro,
          otros_antecedentes_familiares: selectedBackground.otros_antecedentes_familiares,
        },
      };
    }
  };

  const modalData = getAntecedentesParaModales();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Antecedentes Médicos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {pacienteId 
              ? 'Gestión de antecedentes personales y familiares del paciente'
              : 'Gestión de antecedentes médicos de todos los pacientes'}
          </p>
        </div>
        {!showCreateForm && pacienteId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Antecedentes
          </button>
        )}
      </div>

      {showCreateForm && pacienteId && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crear Antecedentes
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <BackgroundsForm
            mode="create"
            pacienteId={pacienteId}
            onBackgroundCreated={handleCreateSuccess}
            notify={notify}
          />
        </div>
      )}

      {!showCreateForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <BackgroundsTable
            pacienteId={pacienteId}
            showPatientColumn={false}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      )}

      {pacienteId && (
        <>
          <BackgroundsCreateEditModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            mode="edit"
            backgroundPersonal={modalData.personal}
            backgroundFamiliar={modalData.familiar}
            pacienteId={pacienteId}
          />

          <BackgroundsViewModal
            isOpen={isViewModalOpen}
            onClose={closeViewModal}
            backgroundPersonal={modalData.personal}
            backgroundFamiliar={modalData.familiar}
            onEdit={() => {
              closeViewModal();
              openEditModal();
            }}
          />

          <BackgroundsDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            background={selectedBackground}
            onDeleted={handleDeleteConfirm}
            notify={notify}
          />
        </>
      )}
    </div>
  );
}