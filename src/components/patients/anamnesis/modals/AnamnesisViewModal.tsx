// src/components/patients/anamnesis/modals/AnamnesisViewModal.tsx

import type { IAnamnesis } from '../../../../types/anamnesis/IAnamnesis';
import { Modal } from '../../../ui/modal';

interface AnamnesisViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  anamnesis: IAnamnesis | null;
  onEdit?: () => void;
}

export function AnamnesisViewModal({
  isOpen,
  onClose,
  anamnesis,
  onEdit,
}: AnamnesisViewModalProps) {
  if (!anamnesis) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
            Ver Anamnesis General
          </h5>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Información detallada de la anamnesis del paciente
            </p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              anamnesis.activo 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {anamnesis.activo ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paciente</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {anamnesis.paciente_nombre}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de registro</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(anamnesis.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo de Consulta */}
          {(anamnesis.motivo_consulta || anamnesis.enfermedad_actual) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Motivo de Consulta
                </h3>
              </div>
              <div className="space-y-3">
                {anamnesis.motivo_consulta && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Motivo:
                    </p>
                    <p className="text-gray-900 dark:text-white">{anamnesis.motivo_consulta}</p>
                  </div>
                )}
                {anamnesis.enfermedad_actual && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Enfermedad actual:
                    </p>
                    <p className="text-gray-900 dark:text-white">{anamnesis.enfermedad_actual}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alergias */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alergias ⚠️</h3>
            </div>
            {anamnesis.tiene_alergias ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      El paciente tiene alergias
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {anamnesis.alergias_detalle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <span className="text-xl">✓</span>
                <p>No presenta alergias conocidas</p>
              </div>
            )}
          </div>

          {/* Antecedentes */}
          {(anamnesis.antecedentes_personales || anamnesis.antecedentes_familiares) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Antecedentes
                </h3>
              </div>
              <div className="space-y-4">
                {anamnesis.antecedentes_personales && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Antecedentes personales:
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {anamnesis.antecedentes_personales}
                    </p>
                  </div>
                )}
                {anamnesis.antecedentes_familiares && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Antecedentes familiares:
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {anamnesis.antecedentes_familiares}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Problemas Médicos Críticos */}
          {(anamnesis.problemas_coagulacion || anamnesis.problemas_anestesicos) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  🚨 Problemas Médicos Críticos
                </h3>
              </div>
              <div className="space-y-4">
                {anamnesis.problemas_coagulacion && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">🩸</span>
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                          Problemas de coagulación
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {anamnesis.problemas_coagulacion_detalle}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {anamnesis.problemas_anestesicos && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-600 text-xl">💉</span>
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                          Problemas con anestésicos locales
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {anamnesis.problemas_anestesicos_detalle}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medicamentos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                💊 Medicamentos
              </h3>
            </div>
            {anamnesis.toma_medicamentos ? (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  El paciente toma medicamentos actualmente
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {anamnesis.medicamentos_actuales}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>No toma medicamentos actualmente</span>
              </div>
            )}
          </div>

          {/* Hábitos y Otros */}
          {(anamnesis.habitos || anamnesis.otros) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hábitos y Otros
                </h3>
              </div>
              <div className="space-y-4">
                {anamnesis.habitos && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Hábitos:
                    </p>
                    <p className="text-gray-900 dark:text-white">{anamnesis.habitos}</p>
                  </div>
                )}
                {anamnesis.otros && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Otros:
                    </p>
                    <p className="text-gray-900 dark:text-white">{anamnesis.otros}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>
                  {new Date(anamnesis.fecha_creacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium">Última modificación:</p>
                <p>
                  {new Date(anamnesis.fecha_modificacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {anamnesis.creado_por && (
                <div>
                  <p className="font-medium">Creado por:</p>
                  <p>{anamnesis.creado_por}</p>
                </div>
              )}
              {anamnesis.actualizado_por && (
                <div>
                  <p className="font-medium">Actualizado por:</p>
                  <p>{anamnesis.actualizado_por}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}
