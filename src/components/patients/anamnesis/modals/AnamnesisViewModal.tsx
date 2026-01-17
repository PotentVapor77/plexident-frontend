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

          {/* Alergias */}

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alergias ⚠️</h3>
              </div>
              
              <div className="space-y-4">
                {/* Alergia a antibióticos */}
                <div className={anamnesis.alergia_antibiotico !== 'NO' ? 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4' : ''}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alergia a antibióticos:
                  </p>
                  <p className={anamnesis.alergia_antibiotico !== 'NO' ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.alergia_antibiotico === 'NO' 
                      ? 'No' 
                      : anamnesis.alergia_antibiotico === 'OTRO' && anamnesis.alergia_antibiotico_otro
                        ? `Otro: ${anamnesis.alergia_antibiotico_otro}`
                        : anamnesis.alergia_antibiotico.replace('_', ' ')}
                  </p>
                </div>

                {/* Alergia a anestesia */}
                <div className={anamnesis.alergia_anestesia !== 'NO' ? 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4' : ''}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alergia a anestesia:
                  </p>
                  <p className={anamnesis.alergia_anestesia !== 'NO' ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.alergia_anestesia === 'NO' 
                      ? 'No' 
                      : anamnesis.alergia_anestesia === 'OTRO' && anamnesis.alergia_anestesia_otro
                        ? `Otro: ${anamnesis.alergia_anestesia_otro}`
                        : anamnesis.alergia_anestesia}
                  </p>
                </div>

                {/* Otras alergias */}
                <div className={anamnesis.tiene_alergias ? 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4' : ''}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Otras alergias:
                  </p>
                  <p className={anamnesis.tiene_alergias ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.tiene_alergias ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Antecedentes Familiares */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Antecedentes Familiares
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cardiopatía familiar */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cardiopatía:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.cardiopatia_familiar === 'NO' 
                      ? 'Ninguno' 
                      : anamnesis.cardiopatia_familiar === 'OTRO' && anamnesis.cardiopatia_familiar_otro
                        ? `Otro: ${anamnesis.cardiopatia_familiar_otro}`
                        : anamnesis.cardiopatia_familiar}
                  </p>
                </div>

                {/* Hipertensión familiar */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hipertensión:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.hipertension_familiar === 'NO' 
                      ? 'Ninguno' 
                      : anamnesis.hipertension_familiar === 'OTRO' && anamnesis.hipertension_familiar_otro
                        ? `Otro: ${anamnesis.hipertension_familiar_otro}`
                        : anamnesis.hipertension_familiar}
                  </p>
                </div>

                {/* Diabetes familiar */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diabetes:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.diabetes_familiar === 'NO' 
                      ? 'Ninguno' 
                      : anamnesis.diabetes_familiar === 'OTRO' && anamnesis.diabetes_familiar_otro
                        ? `Otro: ${anamnesis.diabetes_familiar_otro}`
                        : anamnesis.diabetes_familiar}
                  </p>
                </div>

                {/* Cáncer familiar */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cáncer:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.cancer_familiar === 'NO' 
                      ? 'Ninguno' 
                      : anamnesis.cancer_familiar === 'OTRO' && anamnesis.cancer_familiar_otro
                        ? `Otro: ${anamnesis.cancer_familiar_otro}`
                        : anamnesis.cancer_familiar}
                  </p>
                </div>

                {/* Enfermedades mentales familiares */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enfermedades mentales:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.enfermedad_mental_familiar === 'NO' 
                      ? 'Ninguno' 
                      : anamnesis.enfermedad_mental_familiar === 'OTRO' && anamnesis.enfermedad_mental_familiar_otro
                        ? `Otro: ${anamnesis.enfermedad_mental_familiar_otro}`
                        : anamnesis.enfermedad_mental_familiar}
                  </p>
                </div>
              </div>
            </div>


            {/* Enfermedades y Condiciones */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Enfermedades y Condiciones
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VIH/SIDA */}
                <div className={anamnesis.vih_sida !== 'NEGATIVO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    VIH/SIDA:
                  </p>
                  <p className={anamnesis.vih_sida !== 'NEGATIVO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.vih_sida === 'NEGATIVO' 
                      ? 'Negativo' 
                      : anamnesis.vih_sida === 'OTRO' && anamnesis.vih_sida_otro
                        ? `Otro: ${anamnesis.vih_sida_otro}`
                        : anamnesis.vih_sida.replace('_', ' ')}
                  </p>
                </div>

                {/* Tuberculosis */}
                <div className={anamnesis.tuberculosis !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tuberculosis:
                  </p>
                  <p className={anamnesis.tuberculosis !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.tuberculosis === 'NO' 
                      ? 'No' 
                      : anamnesis.tuberculosis === 'OTRO' && anamnesis.tuberculosis_otro
                        ? `Otro: ${anamnesis.tuberculosis_otro}`
                        : anamnesis.tuberculosis.replace('_', ' ')}
                  </p>
                </div>

                {/* Asma */}
                <div className={anamnesis.asma !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asma:
                  </p>
                  <p className={anamnesis.asma !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.asma === 'NO' 
                      ? 'No' 
                      : anamnesis.asma === 'OTRO' && anamnesis.asma_otro
                        ? `Otro: ${anamnesis.asma_otro}`
                        : anamnesis.asma.replace('_', ' ')}
                  </p>
                </div>

                {/* Diabetes */}
                <div className={anamnesis.diabetes !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diabetes:
                  </p>
                  <p className={anamnesis.diabetes !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.diabetes === 'NO' 
                      ? 'No' 
                      : anamnesis.diabetes === 'OTRO' && anamnesis.diabetes_otro
                        ? `Otro: ${anamnesis.diabetes_otro}`
                        : anamnesis.diabetes.replace('_', ' ')}
                  </p>
                </div>

                {/* Hipertensión */}
                <div className={anamnesis.hipertension !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hipertensión:
                  </p>
                  <p className={anamnesis.hipertension !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.hipertension === 'NO' 
                      ? 'No' 
                      : anamnesis.hipertension === 'OTRO' && anamnesis.hipertension_otro
                        ? `Otro: ${anamnesis.hipertension_otro}`
                        : anamnesis.hipertension.replace('_', ' ')}
                  </p>
                </div>

                {/* Enfermedad cardíaca */}
                <div className={anamnesis.enfermedad_cardiaca !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enfermedad cardíaca:
                  </p>
                  <p className={anamnesis.enfermedad_cardiaca !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                    {anamnesis.enfermedad_cardiaca === 'NO' 
                      ? 'No' 
                      : anamnesis.enfermedad_cardiaca === 'OTRA' && anamnesis.enfermedad_cardiaca_otra
                        ? `Otra: ${anamnesis.enfermedad_cardiaca_otra}`
                        : anamnesis.enfermedad_cardiaca.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Problemas Médicos Críticos */}
            {(anamnesis.problemas_coagulacion === 'SI' || anamnesis.problemas_anestesicos) && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                    🚨 Problemas Médicos Críticos
                  </h3>
                </div>
                <div className="space-y-4">
                  {anamnesis.problemas_coagulacion === 'SI' && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 text-xl">🩸</span>
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                            Problemas de coagulación
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Paciente presenta problemas de coagulación
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
                            Paciente presenta problemas con anestésicos locales
                          </p>
                        </div>
                      </div>
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
