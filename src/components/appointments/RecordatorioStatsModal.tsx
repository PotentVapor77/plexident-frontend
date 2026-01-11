// frontend/src/components/appointments/RecordatorioStatsModal.tsx

import { useEffect, useState, useCallback } from 'react';
import {
  XMarkIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { useRecordatorio } from '../../hooks/appointments/useRecordatorio';
import { useNotification } from '../../context/notifications/NotificationContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  IRecordatorioEstadisticas,
} from '../../types/appointments/IAppointment';

interface RecordatorioStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecordatorioStatsModal = ({
  isOpen,
  onClose,
}: RecordatorioStatsModalProps) => {
  const { estadisticas, fetchEstadisticas, loading } = useRecordatorio();
  const { notify } = useNotification();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      await fetchEstadisticas();
      setLastUpdated(
        format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
      );
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, [fetchEstadisticas]);

  useEffect(() => {
    if (isOpen) {
      loadEstadisticas();
    }
  }, [isOpen, loadEstadisticas]);

  // Usar directamente estadisticas (IRecordatorioEstadisticas | null)
  const estadisticasData: IRecordatorioEstadisticas | null = estadisticas;

  const handleRefresh = async () => {
    await loadEstadisticas();
    notify({
      type: 'success',
      title: 'Estadísticas actualizadas',
      message: 'Las estadísticas se han actualizado correctamente',
    });
  };

  // Valores por defecto seguros
  const totalEnviados = estadisticasData?.total_enviados ?? 0;

  const porDestinatario =
    estadisticasData?.por_destinatario ?? {
      PACIENTE: 0,
      ODONTOLOGO: 0,
      AMBOS: 0,
    };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-sm">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                Estadísticas de Recordatorios
              </h2>
              <p className="text-sm text-gray-500 mt-2 ml-13">
                Análisis y métricas del sistema de recordatorios
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1 ml-13">
                  Última actualización: {lastUpdated}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Actualizar"
              >
                <svg
                  className={`h-5 w-5 text-gray-500 ${
                    loading ? 'animate-spin' : ''
                  }`}
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
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4" />
            <p className="text-gray-700 font-medium">Cargando estadísticas...</p>
          </div>
        ) : estadisticasData ? (
          <>
            {/* Métricas principales - Solo Total Enviados */}
            <div className="grid grid-cols-1 gap-4">
              {/* Total enviados */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Enviados
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalEnviados}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recordatorios enviados en total
                </p>
              </div>
            </div>

            {/* Distribución por destinatario */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribución por Destinatario
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Paciente */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Paciente
                      </p>
                      <p className="text-xs text-gray-500">
                        Recordatorios enviados solo al paciente
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {porDestinatario.PACIENTE}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalEnviados > 0
                      ? `${(
                          (porDestinatario.PACIENTE / totalEnviados) *
                          100
                        ).toFixed(1)}% del total`
                      : '0% del total'}
                  </p>
                </div>

                {/* Odontólogo */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Odontólogo
                      </p>
                      <p className="text-xs text-gray-500">
                        Recordatorios enviados solo al odontólogo
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {porDestinatario.ODONTOLOGO}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalEnviados > 0
                      ? `${(
                          (porDestinatario.ODONTOLOGO / totalEnviados) *
                          100
                        ).toFixed(1)}% del total`
                      : '0% del total'}
                  </p>
                </div>

                {/* Ambos */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UsersIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Ambos
                      </p>
                      <p className="text-xs text-gray-500">
                        Recordatorios enviados a paciente y odontólogo
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {porDestinatario.AMBOS}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalEnviados > 0
                      ? `${(
                          (porDestinatario.AMBOS / totalEnviados) *
                          100
                        ).toFixed(1)}% del total`
                      : '0% del total'}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                📊 Resumen del Sistema de Recordatorios
              </h4>
              <div className="space-y-3">
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>
                    <span className="font-semibold">
                      Total de recordatorios enviados:
                    </span>{' '}
                    {totalEnviados}
                  </li>
                  <li>
                    <span className="font-semibold">Distribución:</span>{' '}
                    {porDestinatario.PACIENTE} a pacientes,{' '}
                    {porDestinatario.ODONTOLOGO} a odontólogos,{' '}
                    {porDestinatario.AMBOS} a ambos
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              No hay estadísticas disponibles
            </p>
            <p className="text-gray-500 text-sm mt-2">
              No se han enviado recordatorios aún o hubo un error al cargar los
              datos.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RecordatorioStatsModal;