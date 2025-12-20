import React, { useState } from 'react';
import type { IPaciente } from '../../types/patient/IPatient';
import { PacienteForm } from './forms/PatientForm';
import { PacienteReactivateModal } from './modals/PacienteReactivateModal';
import { PacienteDeleteModal } from './modals/PatientDeleteModal';
import { PacienteViewModal } from './modals/PatientViewModal';
import { PacienteTable } from './table/PatientTable';
import {SuccessModal} from './modals/SuccessModal';


export const PacienteMain: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);
  const [actionType, setActionType] = useState<'create' | 'edit'>('create');
  const [successMessage, setSuccessMessage] = useState('');

  const handleNewPaciente = () => {
    setSelectedPaciente(null);
    setActionType('create');
    setShowForm(true);
  };

  const handleEdit = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    setActionType('edit');
    setShowForm(true);
  };

  const handleView = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    setShowViewModal(true);
  };

  const handleDelete = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    if (paciente.activo) {
      setShowDeleteModal(true);
    } else {
      setShowReactivateModal(true);
    }
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setShowForm(false);
    setShowDeleteModal(false);
    setShowReactivateModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los pacientes del centro odontológico
          </p>
        </div>
        <button
          onClick={handleNewPaciente}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <PacienteTable
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {showForm && (
        <PacienteForm
          paciente={selectedPaciente}
          actionType={actionType}
          onClose={() => {
            setShowForm(false);
            setSelectedPaciente(null);
          }}
          onSuccess={() => handleSuccess(
            actionType === 'create' 
              ? 'Paciente creado exitosamente' 
              : 'Paciente actualizado exitosamente'
          )}
        />
      )}

            {showViewModal && (
        <PacienteViewModal
          isOpen={showViewModal}
          paciente={selectedPaciente}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPaciente(null);
          }}
          onEdit={() => {
            if (!selectedPaciente) return;
            handleEdit(selectedPaciente);
          }}
        />
      )}

      {showDeleteModal && selectedPaciente && (
        <PacienteDeleteModal
          paciente={selectedPaciente}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPaciente(null);
          }}
          onSuccess={() => handleSuccess('Paciente eliminado exitosamente')}
        />
      )}

      {showReactivateModal && selectedPaciente && (
        <PacienteReactivateModal
          paciente={selectedPaciente}
          onClose={() => {
            setShowReactivateModal(false);
            setSelectedPaciente(null);
          }}
          onSuccess={() => handleSuccess('Paciente reactivado exitosamente')}
        />
      )}

       {showSuccess && (
          <SuccessModal
            isOpen={showSuccess}  // ✅ AGREGAR ESTE PROP
            message={successMessage}
            onClose={() => setShowSuccess(false)}
            onRegisterAnother={() => {
              setShowSuccess(false);
              handleNewPaciente(); // Reinicia para nuevo paciente
            }}
          />
        )}
    </div>
  );
};
