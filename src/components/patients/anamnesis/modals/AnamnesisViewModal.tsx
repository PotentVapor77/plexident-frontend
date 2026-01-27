// src/components/patients/anamnesis/modals/AnamnesisViewModal.tsx

import type { IAnamnesis } from '../../../../types/anamnesis/IAnamnesis';
import { Modal } from '../../../ui/modal';

interface AnamnesisViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  anamnesis: IAnamnesis | null;
  onEdit?: () => void;
}

// Helper function to format text labels
const formatLabel = (value: string): string => {
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "No especificada";
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return "Fecha inválida";
  }
};

// Helper function to format date and time
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "No especificada";
  try {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return "Fecha inválida";
  }
};

// ✅ Helper para obtener etiqueta de informe de exámenes
const getInformeExamenesLabel = (value: string): string => {
  const labels: Record<string, string> = {
    'NINGUNO': 'Ninguno',
    'BIOMETRIA': 'Biometría hemática',
    'QUIMICA_SANGUINEA': 'Química sanguínea',
    'RAYOS_X': 'Rayos X',
    'OTROS': 'Otros',
  };
  return labels[value] || formatLabel(value);
};

export function AnamnesisViewModal({
  isOpen,
  onClose,
  anamnesis,
  onEdit,
}: AnamnesisViewModalProps) {
  if (!isOpen || !anamnesis) return null;

  // Obtener iniciales del nombre del paciente
  const getPatientInitials = (): string => {
    const nombre = anamnesis.paciente_nombre || "";
    const partes = nombre.split(' ');
    const first = partes[0]?.[0]?.toUpperCase() || "P";
    const last = partes[1]?.[0]?.toUpperCase() || "";
    return `${first}${last}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <>
        {/* Encabezado del Modal */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-2xl mb-2">
            Perfil de Anamnesis
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
          {/* Información Principal del Paciente */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-2xl font-semibold shadow-lg flex-shrink-0">
                {getPatientInitials()}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {anamnesis.paciente_nombre}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Tipo: <span className="font-medium text-gray-900 dark:text-white">Anamnesis General</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de creación</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(anamnesis.fecha_creacion)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Última modificación</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(anamnesis.fecha_modificacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Antecedentes Personales - Alergias */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alergias ⚠️
              </h3>
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
                      : formatLabel(anamnesis.alergia_antibiotico)}
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
                      : formatLabel(anamnesis.alergia_anestesia)}
                </p>
              </div>
            </div>
          </div>

          {/* Antecedentes Personales - Hemorragias/Coagulación */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                🩸 Hemorragias / Problemas de coagulación
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className={anamnesis.hemorragias === 'SI' ? 'bg-red-50 dark:bg-red-900/20 rounded-lg p-4' : ''}>
                <p className={anamnesis.hemorragias === 'SI' ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                  {anamnesis.hemorragias === 'SI' ? 'Sí' : 'No'}
                </p>
                {anamnesis.hemorragias === 'SI' && anamnesis.hemorragias_detalle && (
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Detalle:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {anamnesis.hemorragias_detalle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Antecedentes Personales - Enfermedades y condiciones */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enfermedades y condiciones personales
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
                      : formatLabel(anamnesis.vih_sida)}
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
                      : formatLabel(anamnesis.tuberculosis)}
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
                      : formatLabel(anamnesis.asma)}
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
                      : formatLabel(anamnesis.diabetes)}
                </p>
              </div>

              {/* Hipertensión arterial */}
              <div className={anamnesis.hipertension_arterial !== 'NO' ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4' : 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4'}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hipertensión arterial:
                </p>
                <p className={anamnesis.hipertension_arterial !== 'NO' ? 'text-yellow-700 dark:text-yellow-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                  {anamnesis.hipertension_arterial === 'NO' 
                    ? 'No' 
                    : anamnesis.hipertension_arterial === 'OTRO' && anamnesis.hipertension_arterial_otro
                      ? `Otro: ${anamnesis.hipertension_arterial_otro}`
                      : formatLabel(anamnesis.hipertension_arterial)}
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
                    : anamnesis.enfermedad_cardiaca === 'OTRO' && anamnesis.enfermedad_cardiaca_otro
                      ? `Otro: ${anamnesis.enfermedad_cardiaca_otro}`
                      : formatLabel(anamnesis.enfermedad_cardiaca)}
                </p>
              </div>

              {/* Otros antecedentes personales */}
              {anamnesis.otro_antecedente_personal && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Otros antecedentes personales:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.otro_antecedente_personal}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Antecedentes Familiares */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
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
                      : formatLabel(anamnesis.cardiopatia_familiar)}
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
                      : formatLabel(anamnesis.hipertension_familiar)}
                </p>
              </div>

              {/* Enfermedad cerebrovascular familiar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enfermedad cerebrovascular:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {anamnesis.enfermedad_cerebrovascular_familiar === 'NO' 
                    ? 'Ninguno' 
                    : anamnesis.enfermedad_cerebrovascular_familiar === 'OTRO' && anamnesis.enfermedad_cerebrovascular_familiar_otro
                      ? `Otro: ${anamnesis.enfermedad_cerebrovascular_familiar_otro}`
                      : formatLabel(anamnesis.enfermedad_cerebrovascular_familiar)}
                </p>
              </div>

              {/* Endocrino-metabólico familiar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endocrino-metabólico:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {anamnesis.endocrino_metabolico_familiar === 'NO' 
                    ? 'Ninguno' 
                    : anamnesis.endocrino_metabolico_familiar === 'OTRO' && anamnesis.endocrino_metabolico_familiar_otro
                      ? `Otro: ${anamnesis.endocrino_metabolico_familiar_otro}`
                      : formatLabel(anamnesis.endocrino_metabolico_familiar)}
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
                      : formatLabel(anamnesis.cancer_familiar)}
                </p>
              </div>

              {/* Tuberculosis familiar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tuberculosis:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {anamnesis.tuberculosis_familiar === 'NO' 
                    ? 'Ninguno' 
                    : anamnesis.tuberculosis_familiar === 'OTRO' && anamnesis.tuberculosis_familiar_otro
                      ? `Otro: ${anamnesis.tuberculosis_familiar_otro}`
                      : formatLabel(anamnesis.tuberculosis_familiar)}
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
                      : formatLabel(anamnesis.enfermedad_mental_familiar)}
                </p>
              </div>

              {/* Enfermedad infecciosa familiar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enfermedad infecciosa:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {anamnesis.enfermedad_infecciosa_familiar === 'NO' 
                    ? 'Ninguno' 
                    : anamnesis.enfermedad_infecciosa_familiar === 'OTRO' && anamnesis.enfermedad_infecciosa_familiar_otro
                      ? `Otro: ${anamnesis.enfermedad_infecciosa_familiar_otro}`
                      : formatLabel(anamnesis.enfermedad_infecciosa_familiar)}
                </p>
              </div>

              {/* Malformación familiar */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Malformación:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {anamnesis.malformacion_familiar === 'NO' 
                    ? 'Ninguno' 
                    : anamnesis.malformacion_familiar === 'OTRO' && anamnesis.malformacion_familiar_otro
                      ? `Otro: ${anamnesis.malformacion_familiar_otro}`
                      : formatLabel(anamnesis.malformacion_familiar)}
                </p>
              </div>

              {/* Otros antecedentes familiares */}
              {anamnesis.otro_antecedente_familiar && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Otros antecedentes familiares:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {anamnesis.otro_antecedente_familiar}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ✅ NUEVA SECCIÓN: Exámenes Complementarios */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔬 Exámenes Complementarios
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Pedido de exámenes */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    anamnesis.pedido_examenes_complementarios === 'SI'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {anamnesis.pedido_examenes_complementarios === 'SI' ? '✓ Exámenes solicitados' : 'Sin solicitud de exámenes'}
                  </span>
                </div>
                
                {anamnesis.pedido_examenes_complementarios === 'SI' && anamnesis.pedido_examenes_complementarios_detalle && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detalle de exámenes solicitados:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-white dark:bg-gray-900 rounded-lg p-3">
                      {anamnesis.pedido_examenes_complementarios_detalle}
                    </p>
                  </div>
                )}
              </div>

              {/* Informe de exámenes */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Informe de exámenes realizados:
                  </p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    anamnesis.informe_examenes !== 'NINGUNO'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {getInformeExamenesLabel(anamnesis.informe_examenes)}
                  </span>
                </div>
                
                {anamnesis.informe_examenes !== 'NINGUNO' && anamnesis.informe_examenes_detalle && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resultados:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-white dark:bg-gray-900 rounded-lg p-3">
                      {anamnesis.informe_examenes_detalle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hábitos */}
          {anamnesis.habitos && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hábitos
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                  {anamnesis.habitos}
                </p>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {anamnesis.observaciones && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Observaciones generales
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                  {anamnesis.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>{formatDateTime(anamnesis.fecha_creacion)}</p>
              </div>
              <div>
                <p className="font-medium">Última modificación:</p>
                <p>{formatDateTime(anamnesis.fecha_modificacion)}</p>
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
              Editar Anamnesis
            </button>
          )}
        </div>
      </>
    </Modal>
  );
}
