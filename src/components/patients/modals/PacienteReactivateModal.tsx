import React, { useState } from 'react';
import { togglePacienteStatus } from '../../../services/patient/patientService';
import type { IPaciente } from '../../../types/patient/IPatient';


interface PacienteReactivateModalProps {
  paciente: IPaciente;
  onClose: () => void;
  onSuccess: () => void;
}

export const PacienteReactivateModal: React.FC<PacienteReactivateModalProps> = ({
  paciente,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    setLoading(true);
    setError(null);

    try {
      await togglePacienteStatus(paciente.id);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al reactivar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
            Reactivar Paciente
          </h3>

          <p className="mt-2 text-sm text-gray-500 text-center">
            ¿Estás seguro de que deseas reactivar al paciente{' '}
            <span className="font-semibold text-gray-900">
              {paciente.nombres} {paciente.apellidos}
            </span>?
          </p>

          <p className="mt-2 text-xs text-green-600 text-center">
            El paciente volverá a estar activo en el sistema.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Reactivando...</span>
              </>
            ) : (
              <span>Reactivar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
