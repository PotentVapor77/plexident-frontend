// frontend/src/components/appointments/RecordatorioSendModal.tsx

import { useState } from 'react';
import {
  XMarkIcon,
  EnvelopeIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import type { IRecordatorioEnvio } from '../../types/appointments/IAppointment';
import { useRecordatorio } from '../../hooks/appointments/useRecordatorio';

interface RecordatorioSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  citaId: string;
  onSuccess?: () => void;
}

const RecordatorioSendModal = ({
  isOpen,
  onClose,
  citaId,
  onSuccess,
}: RecordatorioSendModalProps) => {
  const { enviarRecordatorio, loading } = useRecordatorio();

  const [formData, setFormData] = useState<IRecordatorioEnvio>({
    tipo_recordatorio: 'EMAIL',
    destinatario: 'PACIENTE',
    mensaje_personalizado: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    try {
      const resultado = await enviarRecordatorio(citaId, formData);

      if (resultado.exito) {
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (error) {
      // El hook ya muestra las notificaciones
      console.error('Error en handleSubmit:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      tipo_recordatorio: 'EMAIL',
      destinatario: 'PACIENTE',
      mensaje_personalizado: '',
    });
    onClose();
  };

  const getDestinatarioLabel = (destinatario: string) => {
    switch (destinatario) {
      case 'PACIENTE':
        return 'Paciente';
      case 'ODONTOLOGO':
        return 'Odontólogo';
      case 'AMBOS':
        return 'Paciente y Odontólogo';
      default:
        return destinatario;
    }
  };

  const getDestinatarioDescription = (destinatario: string) => {
    switch (destinatario) {
      case 'PACIENTE':
        return 'El recordatorio se enviará solo al paciente';
      case 'ODONTOLOGO':
        return 'El recordatorio se enviará solo al odontólogo';
      case 'AMBOS':
        return 'El recordatorio se enviará tanto al paciente como al odontólogo';
      default:
        return '';
    }
  };

  const getDestinatarioIcon = (destinatario: string) => {
    switch (destinatario) {
      case 'PACIENTE':
        return <UserIcon className="h-5 w-5" />;
      case 'ODONTOLOGO':
        return <UserIcon className="h-5 w-5" />;
      case 'AMBOS':
        return <UsersIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
                  <EnvelopeIcon className="h-6 w-6 text-white" />
                </div>
                Enviar Recordatorio
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">
                Envíe un recordatorio por email para la cita
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tipo de recordatorio (solo EMAIL por ahora) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de recordatorio
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-xs text-gray-500">
                  El recordatorio se enviará por correo electrónico
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Destinatario */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Destinatario <span className="text-red-500">*</span>
          </label>
          <select
            name="destinatario"
            value={formData.destinatario}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-gray-900"
          >
            <option value="PACIENTE">Paciente</option>
            <option value="ODONTOLOGO">Odontólogo</option>
            <option value="AMBOS">Ambos</option>
          </select>

          {/* Descripción del destinatario */}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                {getDestinatarioIcon(formData.destinatario)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {getDestinatarioLabel(formData.destinatario)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getDestinatarioDescription(formData.destinatario)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Nota:</span> El recordatorio incluirá automáticamente:
          </p>
          <ul className="text-xs text-blue-700 mt-2 list-disc list-inside space-y-1">
            <li>Fecha y hora de la cita</li>
            <li>Nombre del paciente y odontólogo</li>
            <li>Tipo de consulta</li>
            <li>Motivo de la consulta</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar Recordatorio'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RecordatorioSendModal;

