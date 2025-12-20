import React, { useState } from 'react';
import { deletePaciente } from '../../../services/patient/patientService';
import type { IPaciente } from '../../../types/patient/IPatient';


interface PacienteDeleteModalProps {
  paciente: IPaciente;
  onClose: () => void;
  onSuccess: () => void;
}

export const PacienteDeleteModal: React.FC<PacienteDeleteModalProps> = ({
  paciente,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deletePaciente(paciente.id);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
            Eliminar Paciente
          </h3>

          <p className="mt-2 text-sm text-gray-500 text-center">
            ¿Estás seguro de que deseas eliminar al paciente{' '}
            <span className="font-semibold text-gray-900">
              {paciente.nombres} {paciente.apellidos}
            </span>?
          </p>

          <p className="mt-2 text-xs text-red-600 text-center">
            Esta acción desactivará el paciente del sistema.
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
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Eliminar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
