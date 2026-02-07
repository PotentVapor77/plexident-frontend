// src/components/patients/backgrounds/modals/BackgroundsViewModal.tsx

import type {
  IAntecedentePersonal,
  IAntecedenteFamiliar,
} from '../../../../types/backgrounds/IBackground';
import { Modal } from '../../../ui/modal';

interface BackgroundsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundPersonal: IAntecedentePersonal | null;
  backgroundFamiliar: IAntecedenteFamiliar | null;
  onEdit?: () => void;
  pacienteNombre?: string;
}

export function BackgroundsViewModal({
  isOpen,
  onClose,
  backgroundPersonal,
  backgroundFamiliar,
  onEdit,
  pacienteNombre = 'Paciente sin nombre',
}: BackgroundsViewModalProps) {
  // ✅ Validación mejorada: Si no hay ningún antecedente, mostrar mensaje
  if (!isOpen) return null;

  if (!backgroundPersonal && !backgroundFamiliar) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-2xl p-6"
      >
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay antecedentes disponibles
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron antecedentes médicos para mostrar
          </p>
          <div className="mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDisplayValue = (value?: string, defaultValue: string = 'No especificado'): string => {
    return value || defaultValue;
  };

  const getActiveBadge = () => {
    const isActivePersonal = backgroundPersonal?.activo !== false;
    const isActiveFamiliar = backgroundFamiliar?.activo !== false;
    
    if ((backgroundPersonal && !isActivePersonal) || (backgroundFamiliar && !isActiveFamiliar)) {
      return (
        <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs font-medium">
          ⚠️ Algunos antecedentes inactivos
        </div>
      );
    }
    
    return (
      <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
        ✓ Activo
      </div>
    );
  };

  // Extract initials from pacienteNombre
  const getInitials = () => {
    if (!pacienteNombre || pacienteNombre === 'Paciente sin nombre') return "PA";
    
    const parts = pacienteNombre.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return pacienteNombre.substring(0, 2).toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
                Antecedentes Médicos
              </h5>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Historial clínico detallado del paciente
              </p>
            </div>
            {getActiveBadge()}
          </div>
        </div>

        <div className="space-y-6">
          {/* Tarjeta de Información del Paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xl font-semibold shadow-lg flex-shrink-0">
                {getInitials()}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pacienteNombre}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {backgroundPersonal && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Antecedentes personales</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDateTime(backgroundPersonal.fecha_creacion)}
                        </p>
                      </div>
                    )}
                    {backgroundFamiliar && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Antecedentes familiares</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDateTime(backgroundFamiliar.fecha_creacion)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN D: ANTECEDENTES PERSONALES */}
          {backgroundPersonal && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Antecedentes Personales
                </h3>
              </div>

              <div className="space-y-4">
                {/* Grid de antecedentes personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columna 1 */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Alergia a Antibiótico
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.alergia_antibiotico)}
                      </p>
                      {backgroundPersonal.alergia_antibiotico_otro && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Especificación: {backgroundPersonal.alergia_antibiotico_otro}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Alergia a Anestesia
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.alergia_anestesia)}
                      </p>
                      {backgroundPersonal.alergia_anestesia_otro && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Especificación: {backgroundPersonal.alergia_anestesia_otro}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Hemorragias</p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.hemorragias)}
                      </p>
                      {backgroundPersonal.hemorragias_detalle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Detalle: {backgroundPersonal.hemorragias_detalle}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">VIH/SIDA</p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.vih_sida)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tuberculosis</p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.tuberculosis)}
                      </p>
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Asma</p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.asma)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Diabetes</p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.diabetes)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Hipertensión Arterial
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.hipertension_arterial)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Enfermedad Cardíaca
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundPersonal.enfermedad_cardiaca)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campos de texto largos */}
                {backgroundPersonal.habitos && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Hábitos</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{backgroundPersonal.habitos}</p>
                    </div>
                  </div>
                )}

                {backgroundPersonal.otros_antecedentes_personales && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Otros Antecedentes Personales
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {backgroundPersonal.otros_antecedentes_personales}
                      </p>
                    </div>
                  </div>
                )}

                {backgroundPersonal.observaciones && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Observaciones</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{backgroundPersonal.observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN E: ANTECEDENTES FAMILIARES */}
          {backgroundFamiliar && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Antecedentes Familiares
                </h3>
              </div>

              <div className="space-y-4">
                {/* Grid de antecedentes familiares */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columna 1 */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Cardiopatía Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.cardiopatia_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Hipertensión Arterial Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.hipertension_arterial_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Enfermedad Vascular Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.enfermedad_vascular_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Endócrino Metabólico Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.endocrino_metabolico_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Cáncer Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.cancer_familiar)}
                      </p>
                      {backgroundFamiliar.tipo_cancer && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Tipo: {backgroundFamiliar.tipo_cancer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Tuberculosis Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.tuberculosis_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Enfermedad Mental Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.enfermedad_mental_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Enfermedad Infecciosa Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.enfermedad_infecciosa_familiar)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Malformación Familiar
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {getDisplayValue(backgroundFamiliar.malformacion_familiar)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campos de texto largos */}
                {backgroundFamiliar.otros_antecedentes_familiares && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Otros Antecedentes Familiares
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {backgroundFamiliar.otros_antecedentes_familiares}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <p className="font-medium">Fecha de creación completa</p>
                <p className="mt-1">
                  {formatDateTime(backgroundPersonal?.fecha_creacion || backgroundFamiliar?.fecha_creacion)}
                </p>
              </div>
              <div>
                <p className="font-medium">Última modificación</p>
                <p className="mt-1">
                  {formatDateTime(backgroundPersonal?.fecha_modificacion || backgroundFamiliar?.fecha_modificacion)}
                </p>
              </div>
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
              Editar Antecedentes
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}