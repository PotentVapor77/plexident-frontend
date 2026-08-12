// frontend/src/components/appointments/HistorialModal.tsx

import React from 'react';
import { Modal } from '../ui/modal';
import type { IHistorialResponse } from '../../types/appointments/IAppointment';

interface HistorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  historialCita: IHistorialResponse | null;
  loading?: boolean;
}

const HistorialModal: React.FC<HistorialModalProps> = ({
  isOpen,
  onClose,
  historialCita,
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl p-0 max-h-[85vh] overflow-hidden"
      showCloseButton={true}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-3xl">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            📋 Historial de Cambios
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
              <p className="text-gray-500">Cargando historial...</p>
            </div>
          ) : !historialCita ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se pudo cargar el historial</p>
            </div>
          ) : (
            <>
              {/* Info de la cita */}
              <div className="mb-6 p-4 bg-gradient-to-r from-brand-50 to-brand-50 rounded-lg border border-brand-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">👤 Paciente:</span>{' '}
                  <span className="text-brand-700">{historialCita.paciente}</span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">📊 Total de cambios:</span>{' '}
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-brand-600 text-white rounded-full font-bold ml-2">
                    {historialCita.total_cambios}
                  </span>
                </p>
              </div>

              {/* Lista de cambios */}
              {historialCita.historial.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 text-lg font-medium">
                    No hay cambios registrados
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Esta cita no tiene modificaciones en su historial
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historialCita.historial.map((cambio, index) => {
                    // Determinar color según la acción
                    const colorMap: Record<string, { border: string; bg: string; icon: string }> = {
                      CREACION: { border: 'border-green-500', bg: 'bg-green-50', icon: '✨' },
                      MODIFICACION: { border: 'border-brand-500', bg: 'bg-brand-50', icon: '✏️' },
                      REPROGRAMACION: { border: 'border-yellow-500', bg: 'bg-yellow-50', icon: '🔄' },
                      CANCELACION: { border: 'border-red-500', bg: 'bg-red-50', icon: '❌' },
                      CAMBIO_ESTADO: { border: 'border-purple-500', bg: 'bg-purple-50', icon: '🔔' }
                    };
                    
                    const colors = colorMap[cambio.accion] || { border: 'border-gray-500', bg: 'bg-gray-50', icon: '📌' };

                    return (
                      <div
                        key={cambio.id || index}
                        className={`border-l-4 ${colors.border} pl-4 py-3 rounded-r ${colors.bg} hover:shadow-md transition-shadow`}
                      >
                        {/* Header del cambio */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{colors.icon}</span>
                            <span className="text-sm font-semibold text-gray-800">
                              {cambio.accion_display}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                            {new Date(cambio.fecha_cambio).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Descripción */}
                        {cambio.descripcion && (
                          <p className="text-sm text-gray-700 mb-2 pl-7">
                            {cambio.descripcion}
                          </p>
                        )}

                        {/* Usuario */}
                        <p className="text-xs text-gray-600 pl-7">
                          👤 Por:{' '}
                          <span className="font-medium text-gray-800">
                            {cambio.usuario_nombre}
                          </span>
                        </p>

                       {/* Detalles de cambios (si existen) */}
                        {(cambio.datos_anteriores || cambio.datos_nuevos) && (
                          <details className="mt-3 pl-7">
                            <summary className="text-xs text-brand-600 cursor-pointer hover:text-brand-800 font-medium">
                              🔍 Ver detalles técnicos
                            </summary>
                            <div className="mt-2 p-3 bg-white rounded border border-gray-200 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cambio.datos_anteriores && (
                                  <div>
                                    <p className="font-semibold text-red-700 mb-2">❌ Antes:</p>
                                    <div className="space-y-1 text-gray-700">
                                      {Object.entries(cambio.datos_anteriores).map(([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="font-medium">{key}:</span>
                                          <span className="text-red-600">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {cambio.datos_nuevos && (
                                  <div>
                                    <p className="font-semibold text-green-700 mb-2">✅ Después:</p>
                                    <div className="space-y-1 text-gray-700">
                                      {Object.entries(cambio.datos_nuevos).map(([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="font-medium">{key}:</span>
                                          <span className="text-green-600">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HistorialModal;
