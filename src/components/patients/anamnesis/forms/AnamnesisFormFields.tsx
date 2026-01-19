// src/components/patients/anamnesis/forms/AnamnesisFormFields.tsx

import React from 'react';

export interface AnamnesisFormData {
  // Paciente
  paciente: string;
  
  // ========== ANTECEDENTES PERSONALES ==========
  
  // Alergias específicas
  alergia_antibiotico: string;
  alergia_antibiotico_otro: string;
  alergia_anestesia: string;
  alergia_anestesia_otro: string;
  
  // Hemorragias / Problemas de coagulación (✅ CAMBIADO)
  hemorragias: string;
  hemorragias_detalle: string; // ✅ NUEVO
  
  // Enfermedades y condiciones
  vih_sida: string;
  vih_sida_otro: string;
  tuberculosis: string;
  tuberculosis_otro: string;
  asma: string;
  asma_otro: string;
  diabetes: string;
  diabetes_otro: string;
  hipertension_arterial: string; // ✅ CAMBIADO
  hipertension_arterial_otro: string; // ✅ CAMBIADO
  enfermedad_cardiaca: string;
  enfermedad_cardiaca_otro: string; // ✅ CAMBIADO
  otro_antecedente_personal: string; // ✅ NUEVO
  
  // ========== ANTECEDENTES FAMILIARES ==========
  
  // Antecedentes familiares completos
  cardiopatia_familiar: string;
  cardiopatia_familiar_otro: string;
  hipertension_familiar: string;
  hipertension_familiar_otro: string;
  enfermedad_cerebrovascular_familiar: string; // ✅ NUEVO
  enfermedad_cerebrovascular_familiar_otro: string; // ✅ NUEVO
  endocrino_metabolico_familiar: string; // ✅ NUEVO
  endocrino_metabolico_familiar_otro: string; // ✅ NUEVO
  cancer_familiar: string;
  cancer_familiar_otro: string;
  tuberculosis_familiar: string; // ✅ NUEVO
  tuberculosis_familiar_otro: string; // ✅ NUEVO
  enfermedad_mental_familiar: string;
  enfermedad_mental_familiar_otro: string;
  enfermedad_infecciosa_familiar: string; // ✅ NUEVO
  enfermedad_infecciosa_familiar_otro: string; // ✅ NUEVO
  malformacion_familiar: string; // ✅ NUEVO
  malformacion_familiar_otro: string; // ✅ NUEVO
  otro_antecedente_familiar: string; // ✅ NUEVO
  
  // ========== HÁBITOS Y OBSERVACIONES ==========
  habitos: string;
  observaciones: string;
  
  // ========== ESTADO ==========
  activo: boolean;
}

interface AnamnesisFormFieldsProps {
  formData: AnamnesisFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: 'create' | 'edit';
  pacienteNombre?: string;
}

// Opciones para los select
const antibioticoOptions = [
  { value: 'NO', label: 'No' },
  { value: 'PENICILINA', label: 'Penicilina' },
  { value: 'AMOXICILINA', label: 'Amoxicilina' },
  { value: 'CEFALEXINA', label: 'Cefalexina' },
  { value: 'AZITROMICINA', label: 'Azitromicina' },
  { value: 'CLARITROMICINA', label: 'Claritromicina' },
  { value: 'OTRO', label: 'Otro' },
];

const anestesiaOptions = [
  { value: 'NO', label: 'No' },
  { value: 'LIDOCAINA', label: 'Lidocaína' },
  { value: 'ARTICAINA', label: 'Articaina' },
  { value: 'MEPIVACAINA', label: 'Mepivacaina' },
  { value: 'BUPIVACAINA', label: 'Bupivacaina' },
  { value: 'PRILOCAINA', label: 'Prilocaina' },
  { value: 'OTRO', label: 'Otro' },
];

const hemorragiasOptions = [
  { value: 'NO', label: 'No' },
  { value: 'SI', label: 'Sí' },
];

const vihSidaOptions = [
  { value: 'NEGATIVO', label: 'Negativo' },
  { value: 'POSITIVO_TRATADO', label: 'Positivo - En tratamiento' },
  { value: 'POSITIVO_NO_TRATADO', label: 'Positivo - Sin tratamiento' },
  { value: 'NO_SABE', label: 'No sabe / No realizado' },
  { value: 'RESTRICCION', label: 'Prefiere no decir' },
  { value: 'INDETERMINADO', label: 'Resultado indeterminado' },
  { value: 'OTRO', label: 'Otro' },
];

const tuberculosisOptions = [
  { value: 'NO', label: 'No' },
  { value: 'TRATADA_CURADA', label: 'Tratada y curada' },
  { value: 'ACTIVA_TRATAMIENTO', label: 'Activa - En tratamiento' },
  { value: 'ACTIVA_NO_TRATAMIENTO', label: 'Activa - Sin tratamiento' },
  { value: 'CONTACTO', label: 'Contacto con enfermo' },
  { value: 'VACUNA_BCG', label: 'Solo vacuna BCG' },
  { value: 'OTRO', label: 'Otro' },
];

const asmaOptions = [
  { value: 'NO', label: 'No' },
  { value: 'LEVE_INTERMITENTE', label: 'Leve Intermitente' },
  { value: 'LEVE_PERSISTENTE', label: 'Leve Persistente' },
  { value: 'MODERADA_PERSISTENTE', label: 'Moderada Persistente' },
  { value: 'GRAVE_PERSISTENTE', label: 'Grave Persistente' },
  { value: 'INDUCIDA_EJERCICIO', label: 'Inducida por ejercicio' },
  { value: 'OTRO', label: 'Otro' },
];

const diabetesOptions = [
  { value: 'NO', label: 'No' },
  { value: 'TIPO_1', label: 'Tipo 1 (Insulinodependiente)' },
  { value: 'TIPO_2', label: 'Tipo 2' },
  { value: 'GESTACIONAL', label: 'Gestacional' },
  { value: 'PREDIABETES', label: 'Prediabetes' },
  { value: 'LADA', label: 'LADA (Diabetes autoinmune latente)' },
  { value: 'OTRO', label: 'Otro' },
];

const hipertensionArterialOptions = [
  { value: 'NO', label: 'No' },
  { value: 'CONTROLADA', label: 'Controlada con medicación' },
  { value: 'LIMITROFE', label: 'Límite/Borderline' },
  { value: 'NO_CONTROLADA', label: 'No controlada' },
  { value: 'RESISTENTE', label: 'Hipertensión resistente' },
  { value: 'MALIGNA', label: 'Hipertensión maligna' },
  { value: 'OTRO', label: 'Otro' },
];

const enfermedadCardiacaOptions = [
  { value: 'NO', label: 'No' },
  { value: 'CARDIOPATIA_ISQUEMICA', label: 'Cardiopatía isquémica' },
  { value: 'INSUFICIENCIA_CARDIACA', label: 'Insuficiencia cardíaca' },
  { value: 'ARRITMIA', label: 'Arritmias' },
  { value: 'VALVULOPATIA', label: 'Valvulopatía' },
  { value: 'CARDIOMIOPATIA', label: 'Cardiomiopatía' },
  { value: 'OTRO', label: 'Otro' },
];

// ✅ NUEVAS OPCIONES
const enfermedadCerebrovascularOptions = [
  { value: 'NO', label: 'No' },
  { value: 'ACCIDENTE_CEREBROVASCULAR', label: 'Accidente cerebrovascular' },
  { value: 'ICTUS', label: 'Ictus' },
  { value: 'ANEURISMA', label: 'Aneurisma cerebral' },
  { value: 'DEMENCIA_VASCULAR', label: 'Demencia vascular' },
  { value: 'OTRO', label: 'Otro' },
];

const endocrinoMetabolicoOptions = [
  { value: 'NO', label: 'No' },
  { value: 'TIROIDES', label: 'Enfermedad tiroidea' },
  { value: 'OBESIDAD', label: 'Obesidad' },
  { value: 'DISLIPIDEMIA', label: 'Dislipidemia' },
  { value: 'SINDROME_METABOLICO', label: 'Síndrome metabólico' },
  { value: 'OTRO', label: 'Otro' },
];

const cancerOptions = [
  { value: 'NO', label: 'No' },
  { value: 'PULMON', label: 'Cáncer de pulmón' },
  { value: 'MAMA', label: 'Cáncer de mama' },
  { value: 'COLON', label: 'Cáncer de colon' },
  { value: 'PROSTATA', label: 'Cáncer de próstata' },
  { value: 'LEUCEMIA', label: 'Leucemia' },
  { value: 'OTRO', label: 'Otro' },
];

const enfermedadMentalOptions = [
  { value: 'NO', label: 'No' },
  { value: 'DEPRESION', label: 'Depresión' },
  { value: 'ESQUIZOFRENIA', label: 'Esquizofrenia' },
  { value: 'TRASTORNO_BIPOLAR', label: 'Trastorno bipolar' },
  { value: 'ANSIEDAD', label: 'Trastorno de ansiedad' },
  { value: 'DEMENCIA', label: 'Demencia' },
  { value: 'OTRO', label: 'Otro' },
];

const enfermedadInfecciosaOptions = [
  { value: 'NO', label: 'No' },
  { value: 'HEPATITIS', label: 'Hepatitis' },
  { value: 'COVID', label: 'COVID-19 grave' },
  { value: 'NEUMONIA', label: 'Neumonía recurrente' },
  { value: 'INFECCION_URINARIA', label: 'Infección urinaria recurrente' },
  { value: 'OTRO', label: 'Otro' },
];

const malformacionOptions = [
  { value: 'NO', label: 'No' },
  { value: 'CARDIACA', label: 'Malformación cardíaca' },
  { value: 'NEURAL', label: 'Malformación del tubo neural' },
  { value: 'ESQUELETICA', label: 'Malformación esquelética' },
  { value: 'FACIAL', label: 'Malformación facial' },
  { value: 'OTRO', label: 'Otro' },
];

const familiarOptions = [
  { value: 'NO', label: 'Ninguno' },
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'ABUELOS', label: 'Abuelos' },
  { value: 'HERMANOS', label: 'Hermanos' },
  { value: 'TIO', label: 'Tíos' },
  { value: 'OTRO', label: 'Otro familiar' },
];

export default function AnamnesisFormFields({
  formData,
  onInputChange,
  onReset,
  submitLoading,
  mode,
  pacienteNombre,
}: AnamnesisFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* ✅ Información del paciente */}
      {pacienteNombre && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Identificación del paciente
            </h3>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl shadow-md">
                {pacienteNombre.charAt(0).toUpperCase()}
                {pacienteNombre.split(' ')[1]?.charAt(0).toUpperCase() || ''}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base text-gray-900 dark:text-white">
                  {pacienteNombre}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paciente fijado activamente
              </span>
            </div>
            <div className="mt-4 flex gap-2 rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
              <span className="text-base flex-shrink-0">📌</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                  <span className="font-semibold">Nota:</span> Este registro se asociará automáticamente al paciente fijado. Para cambiar de paciente, regrese a la pestaña "Gestión de Pacientes" y fije otro paciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Sección principal: Antecedentes Personales */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Antecedentes Personales
          </h3>
        </div>

        <div className="space-y-6">
          {/* Subsección: Alergias */}
          <div className=" dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                 Alergias ⚠️
              </h4>
            </div>

            <div className="space-y-4">
              {/* Alergia a antibióticos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alergia a Medicamentos
                </label>
                <select
                  name="alergia_antibiotico"
                  value={formData.alergia_antibiotico}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {antibioticoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.alergia_antibiotico === 'OTRO' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Especificar antibiótico *
                    </label>
                    <input
                      type="text"
                      name="alergia_antibiotico_otro"
                      value={formData.alergia_antibiotico_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Ej: Ciprofloxacino, Vancomicina"
                      className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Alergia a anestesia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alergia a anestesia
                </label>
                <select
                  name="alergia_anestesia"
                  value={formData.alergia_anestesia}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {anestesiaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.alergia_anestesia === 'OTRO' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Especificar anestesia *
                    </label>
                    <input
                      type="text"
                      name="alergia_anestesia_otro"
                      value={formData.alergia_anestesia_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Ej: Bupivacaina, Ropivacaina"
                      className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subsección: Hemorragias / Problemas de coagulación */}
          <div className=" dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-red-700 dark:text-red-400">
                Hemorragias / Problemas de coagulación 🩸
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Hemorragias o problemas de coagulación?
                </label>
                <select
                  name="hemorragias"
                  value={formData.hemorragias}
                  onChange={onInputChange}
                  className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                >
                  {hemorragiasOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.hemorragias === 'SI' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detalle de hemorragias / problemas de coagulación
                    <span className="text-xs text-gray-500 ml-2">(opcional)</span>
                  </label>
                  <textarea
                    name="hemorragias_detalle"
                    value={formData.hemorragias_detalle}
                    onChange={onInputChange}
                    rows={3}
                    placeholder="Ej: Tratamiento anticoagulante (warfarina), hemofilia, problemas plaquetarios, frecuencia de hemorragias, etc."
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subsección: Enfermedades y condiciones personales */}
          <div className=" dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                 Enfermedades y condiciones personales
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VIH/SIDA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VIH/SIDA
                </label>
                <select
                  name="vih_sida"
                  value={formData.vih_sida}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {vihSidaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.vih_sida === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="vih_sida_otro"
                      value={formData.vih_sida_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar estado VIH/SIDA"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Tuberculosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tuberculosis
                </label>
                <select
                  name="tuberculosis"
                  value={formData.tuberculosis}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {tuberculosisOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.tuberculosis === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="tuberculosis_otro"
                      value={formData.tuberculosis_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar estado tuberculosis"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Asma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asma
                </label>
                <select
                  name="asma"
                  value={formData.asma}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {asmaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.asma === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="asma_otro"
                      value={formData.asma_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar tipo de asma"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Diabetes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diabetes
                </label>
                <select
                  name="diabetes"
                  value={formData.diabetes}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {diabetesOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.diabetes === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="diabetes_otro"
                      value={formData.diabetes_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar tipo de diabetes"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Hipertensión arterial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hipertensión arterial
                </label>
                <select
                  name="hipertension_arterial"
                  value={formData.hipertension_arterial}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {hipertensionArterialOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.hipertension_arterial === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="hipertension_arterial_otro"
                      value={formData.hipertension_arterial_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar tipo de hipertensión"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Enfermedad cardíaca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enfermedad cardíaca
                </label>
                <select
                  name="enfermedad_cardiaca"
                  value={formData.enfermedad_cardiaca}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {enfermedadCardiacaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.enfermedad_cardiaca === 'OTRO' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="enfermedad_cardiaca_otro"
                      value={formData.enfermedad_cardiaca_otro}
                      onChange={onInputChange}
                      required
                      placeholder="Especificar enfermedad cardíaca"
                      className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Otros antecedentes personales */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Otros antecedentes personales
                  <span className="text-xs text-gray-500 ml-2">(opcional)</span>
                </label>
                <textarea
                  name="otro_antecedente_personal"
                  value={formData.otro_antecedente_personal}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Otras enfermedades o condiciones no listadas anteriormente"
                  className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Sección 4: Antecedentes familiares */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Antecedentes familiares
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cardiopatía familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardiopatía
            </label>
            <select
              name="cardiopatia_familiar"
              value={formData.cardiopatia_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {familiarOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.cardiopatia_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="cardiopatia_familiar_otro"
                  value={formData.cardiopatia_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar familiar"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Hipertensión familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hipertensión arterial
            </label>
            <select
              name="hipertension_familiar"
              value={formData.hipertension_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {familiarOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.hipertension_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="hipertension_familiar_otro"
                  value={formData.hipertension_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar familiar"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Enfermedad cerebrovascular familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad cerebrovascular
            </label>
            <select
              name="enfermedad_cerebrovascular_familiar"
              value={formData.enfermedad_cerebrovascular_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {enfermedadCerebrovascularOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.enfermedad_cerebrovascular_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="enfermedad_cerebrovascular_familiar_otro"
                  value={formData.enfermedad_cerebrovascular_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Endocrino-metabólico familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endocrino-metabólico
            </label>
            <select
              name="endocrino_metabolico_familiar"
              value={formData.endocrino_metabolico_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {endocrinoMetabolicoOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.endocrino_metabolico_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="endocrino_metabolico_familiar_otro"
                  value={formData.endocrino_metabolico_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Cáncer familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cáncer
            </label>
            <select
              name="cancer_familiar"
              value={formData.cancer_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {cancerOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.cancer_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="cancer_familiar_otro"
                  value={formData.cancer_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo de cáncer"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Tuberculosis familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tuberculosis
            </label>
            <select
              name="tuberculosis_familiar"
              value={formData.tuberculosis_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {familiarOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.tuberculosis_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="tuberculosis_familiar_otro"
                  value={formData.tuberculosis_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar familiar"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Enfermedad mental familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedades mentales
            </label>
            <select
              name="enfermedad_mental_familiar"
              value={formData.enfermedad_mental_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {enfermedadMentalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.enfermedad_mental_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="enfermedad_mental_familiar_otro"
                  value={formData.enfermedad_mental_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Enfermedad infecciosa familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad infecciosa
            </label>
            <select
              name="enfermedad_infecciosa_familiar"
              value={formData.enfermedad_infecciosa_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {enfermedadInfecciosaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.enfermedad_infecciosa_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="enfermedad_infecciosa_familiar_otro"
                  value={formData.enfermedad_infecciosa_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Malformación familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Malformación
            </label>
            <select
              name="malformacion_familiar"
              value={formData.malformacion_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {malformacionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.malformacion_familiar === 'OTRO' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="malformacion_familiar_otro"
                  value={formData.malformacion_familiar_otro}
                  onChange={onInputChange}
                  required
                  placeholder="Especificar tipo"
                  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Otros antecedentes familiares */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Otros antecedentes familiares
              <span className="text-xs text-gray-500 ml-2">(opcional)</span>
            </label>
            <textarea
              name="otro_antecedente_familiar"
              value={formData.otro_antecedente_familiar}
              onChange={onInputChange}
              rows={3}
              placeholder="Otras enfermedades familiares no listadas anteriormente"
              className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sección 5: Hábitos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Hábitos
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hábitos
            <span className="text-xs text-gray-500 ml-2">
              (tabaco, alcohol, drogas, bruxismo, higiene bucal, etc.)
            </span>
          </label>
          <textarea
            name="habitos"
            value={formData.habitos}
            onChange={onInputChange}
            rows={3}
            placeholder="Ej: Fuma 10 cigarrillos/día, consume alcohol los fines de semana, bruxismo nocturno"
            className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-orange-600 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* Sección 6: Observaciones generales */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Observaciones generales
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observaciones
            <span className="text-xs text-gray-500 ml-2">
              (cualquier información adicional relevante para la historia clínica)
            </span>
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={onInputChange}
            rows={4}
            placeholder="Notas adicionales, precauciones especiales, recomendaciones"
            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-blue-600 dark:text-white resize-none"
          />
        </div>
      </div>

      {/* Sección 7: Estado (solo en edición) */}
      {mode === 'edit' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={onInputChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Activo
              </label>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${formData.activo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
            >
              {formData.activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los reportes.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onReset}
          disabled={submitLoading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Limpiar
        </button>
        <button
          type="submit"
          disabled={submitLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitLoading && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {mode === 'create' ? 'Guardar Anamnesis' : 'Actualizar Anamnesis'}
        </button>
      </div>
    </div>
  );
}