// src/components/patients/backgrounds/forms/BackgroundsFormFields.tsx

import type { BackgroundFormData } from './BackgroundsForm';

interface BackgroundsFormFieldsProps {
  formData: BackgroundFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode?: "create" | "edit";
  activo?: boolean;
  pacienteNombre?: string;
}

export default function BackgroundsFormFields({
  formData,
  onInputChange,
  onCheckboxChange,
  mode = "create",
  activo = true,
  pacienteNombre,
}: BackgroundsFormFieldsProps) {
  const mostrarSeccionEstado = Boolean(onCheckboxChange || mode === "edit");

  return (
    <div className="space-y-6">
      {/* ✅ Información del paciente */}
      {pacienteNombre && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-brand-200 dark:border-brand-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-brand-500 to-brand-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Identificación del paciente
            </h3>
          </div>

          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xl shadow-md">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paciente fijado activamente
              </span>
            </div>
            <div className="mt-4 flex gap-2 rounded-md bg-brand-100 p-3 dark:bg-brand-900/30">
              <span className="text-base flex-shrink-0">📌</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-brand-900 dark:text-brand-200">
                  <span className="font-semibold">Nota:</span> Este registro se asociará automáticamente al paciente fijado. Para cambiar de paciente, regrese a la pestaña "Gestión de Pacientes" y fije otro paciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SECCIÓN D: ANTECEDENTES PERSONALES - AZUL */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-brand-200 dark:border-brand-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-brand-600 to-brand-700 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            D. Antecedentes Personales
          </h3>
        </div>

        <div className="space-y-6">
          {/* Subsección: Alergias */}
          <div className="dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                Alergias ⚠️
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* 1. Alergia a Antibiótico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alergia a Antibiótico *
                </label>
                <select
                  name="alergia_antibiotico"
                  value={formData.alergia_antibiotico}
                  onChange={onInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="NO">No</option>
                  <option value="PENICILINA">Penicilina/Amoxicilina</option>
                  <option value="SULFA">Sulfametoxazol/Bactrim</option>
                  <option value="CEFALOSPORINAS">Cefalosporinas</option>
                  <option value="MACROLIDOS">Macrólidos (Eritromicina)</option>
                  <option value="OTRO">Otro antibiótico</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otro antibiótico */}
              {formData.alergia_antibiotico === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Antibiótico *
                  </label>
                  <input
                    type="text"
                    name="alergia_antibiotico_otro"
                    value={formData.alergia_antibiotico_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Ej: Claritromicina, Azitromicina"
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                  />
                </div>
              )}

              {/* 2. Alergia a Anestesia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alergia a Anestesia *
                </label>
                <select
                  name="alergia_anestesia"
                  value={formData.alergia_anestesia}
                  onChange={onInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="NO">No</option>
                  <option value="LOCAL">Anestesia Local</option>
                  <option value="GENERAL">Anestesia General</option>
                  <option value="AMBAS">Ambas</option>
                  <option value="OTRO">Otro tipo</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otro tipo de anestesia */}
              {formData.alergia_anestesia === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Tipo de Anestesia *
                  </label>
                  <input
                    type="text"
                    name="alergia_anestesia_otro"
                    value={formData.alergia_anestesia_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar tipo de anestesia"
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subsección: Hemorragias */}
          <div className="dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-red-700 dark:text-red-400">
                Hemorragias / Problemas de coagulación 🩸
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hemorragias *
                </label>
                <select
                  name="hemorragias"
                  value={formData.hemorragias}
                  onChange={onInputChange}
                  required
                  className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  <option value="NO">No</option>
                  <option value="SI">Sí</option>
                </select>
              </div>
              
              {formData.hemorragias === 'SI' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detalles de Hemorragias *
                  </label>
                  <textarea
                    name="hemorragias_detalle"
                    value={formData.hemorragias_detalle || ''}
                    onChange={onInputChange}
                    required
                    rows={3}
                    placeholder="Tipo, frecuencia, tratamientos anticoagulantes, etc."
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subsección: Enfermedades y condiciones personales */}
          <div className="dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                Enfermedades y condiciones personales
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 3. VIH/SIDA */}
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
                  <option value="NEGATIVO">Negativo</option>
                  <option value="POSITIVO">Positivo</option>
                  <option value="DESCONOCIDO">No se ha realizado prueba</option>
                  <option value="OTRO">Otra condición inmunológica</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otra condición inmunológica */}
              {formData.vih_sida === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Condición Inmunológica *
                  </label>
                  <input
                    type="text"
                    name="vih_sida_otro"
                    value={formData.vih_sida_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar otra condición inmunológica"
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}

              {/* 4. Tuberculosis */}
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
                  <option value="NUNCA">Nunca</option>
                  <option value="TRATADA">Tratada anteriormente</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="DESCONOCIDO">No está seguro</option>
                  <option value="OTRO">Otra enfermedad pulmonar</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otra enfermedad pulmonar */}
              {formData.tuberculosis === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Enfermedad Pulmonar *
                  </label>
                  <input
                    type="text"
                    name="tuberculosis_otro"
                    value={formData.tuberculosis_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar otra enfermedad pulmonar"
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}

              {/* 5. Asma */}
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
                  <option value="NO">No</option>
                  <option value="LEVE">Leve</option>
                  <option value="MODERADA">Moderada</option>
                  <option value="SEVERA">Severa</option>
                  <option value="OTRO">Otra enfermedad respiratoria</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otra enfermedad respiratoria */}
              {formData.asma === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Enfermedad Respiratoria *
                  </label>
                  <input
                    type="text"
                    name="asma_otro"
                    value={formData.asma_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar otra enfermedad respiratoria"
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}

              {/* 6. Diabetes */}
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
                  <option value="NO">No</option>
                  <option value="PREDIABETICO">Prediabético</option>
                  <option value="TIPO_1">Tipo 1</option>
                  <option value="TIPO_2">Tipo 2</option>
                  <option value="GESTACIONAL">Gestacional</option>
                  <option value="OTRO">Otro tipo</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otro tipo de diabetes */}
              {formData.diabetes === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Tipo de Diabetes *
                  </label>
                  <input
                    type="text"
                    name="diabetes_otro"
                    value={formData.diabetes_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Ej: MODY, LADA, etc."
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}

              {/* 7. Hipertensión Arterial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hipertensión Arterial
                </label>
                <select
                  name="hipertension_arterial"
                  value={formData.hipertension_arterial}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="NO">No</option>
                  <option value="CONTROLADA">Controlada</option>
                  <option value="NO_CONTROLADA">No Controlada</option>
                  <option value="SIN_TRATAMIENTO">Sin Tratamiento</option>
                  <option value="OTRO">Otro trastorno cardiovascular</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otro trastorno cardiovascular */}
              {formData.hipertension_arterial === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Trastorno Cardiovascular *
                  </label>
                  <input
                    type="text"
                    name="hipertension_arterial_otro"
                    value={formData.hipertension_arterial_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar otro trastorno cardiovascular"
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}

              {/* 8. Enfermedad Cardíaca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enfermedad Cardíaca
                </label>
                <select
                  name="enfermedad_cardiaca"
                  value={formData.enfermedad_cardiaca}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="NO">No</option>
                  <option value="ARRITMIA">Arritmia</option>
                  <option value="INSUFICIENCIA">Insuficiencia Cardíaca</option>
                  <option value="CONGENITA">Congénita</option>
                  <option value="OTRO">Otra enfermedad cardíaca</option>
                </select>
              </div>

              {/* ✅ Campo condicional: Otra enfermedad cardíaca */}
              {formData.enfermedad_cardiaca === 'OTRO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especificar Enfermedad Cardíaca *
                  </label>
                  <input
                    type="text"
                    name="enfermedad_cardiaca_otro"
                    value={formData.enfermedad_cardiaca_otro || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Especificar otra enfermedad cardíaca"
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-yellow-600 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subsección: Hábitos y Observaciones */}
          <div className="dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                Hábitos y Observaciones
              </h4>
            </div>

            <div className="space-y-4">
              {/* 9. Hábitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hábitos
                </label>
                <textarea
                  name="habitos"
                  value={formData.habitos || ''}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Tabaco, alcohol, drogas, bruxismo, higiene bucal, etc."
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-orange-600 dark:text-white resize-none"
                />
              </div>

              {/* 10. Otros Antecedentes Personales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Otros Antecedentes Personales
                </label>
                <textarea
                  name="otros_antecedentes_personales"
                  value={formData.otros_antecedentes_personales || ''}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Otras enfermedades o condiciones no listadas anteriormente"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-orange-600 dark:text-white resize-none"
                />
              </div>

              {/* 11. Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones || ''}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Cualquier información adicional relevante"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-orange-600 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECCIÓN E: ANTECEDENTES FAMILIARES - PÚRPURA */}
      {/* ============================================= */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            E. Antecedentes Familiares
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Cardiopatía Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardiopatía Familiar
            </label>
            <select
              name="cardiopatia_familiar"
              value={formData.cardiopatia_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con cardiopatía */}
          {formData.cardiopatia_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Cardiopatía *
              </label>
              <input
                type="text"
                name="cardiopatia_familiar_otro"
                value={formData.cardiopatia_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 2. Hipertensión Arterial Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hipertensión Arterial Familiar
            </label>
            <select
              name="hipertension_arterial_familiar"
              value={formData.hipertension_arterial_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con hipertensión */}
          {formData.hipertension_arterial_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Hipertensión *
              </label>
              <input
                type="text"
                name="hipertension_arterial_familiar_otro"
                value={formData.hipertension_arterial_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 3. Enfermedad Vascular Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Vascular Familiar
            </label>
            <select
              name="enfermedad_vascular_familiar"
              value={formData.enfermedad_vascular_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con enfermedad vascular */}
          {formData.enfermedad_vascular_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Enfermedad Vascular *
              </label>
              <input
                type="text"
                name="enfermedad_vascular_familiar_otro"
                value={formData.enfermedad_vascular_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 4. Endócrino Metabólico Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endócrino Metabólico Familiar (Diabetes)
            </label>
            <select
              name="endocrino_metabolico_familiar"
              value={formData.endocrino_metabolico_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con endócrino metabólico */}
          {formData.endocrino_metabolico_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Enfermedad Endócrina *
              </label>
              <input
                type="text"
                name="endocrino_metabolico_familiar_otro"
                value={formData.endocrino_metabolico_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 5. Cáncer Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cáncer Familiar
            </label>
            <select
              name="cancer_familiar"
              value={formData.cancer_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con cáncer */}
          {formData.cancer_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Cáncer *
              </label>
              <input
                type="text"
                name="cancer_familiar_otro"
                value={formData.cancer_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* Tipo de Cáncer (condicional - aparece cuando cancer_familiar != NO) */}
          {formData.cancer_familiar !== 'NO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Cáncer
              </label>
              <select
                name="tipo_cancer"
                value={formData.tipo_cancer || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Seleccionar tipo</option>
                <option value="MAMA">Cáncer de Mama</option>
                <option value="PULMON">Cáncer de Pulmón</option>
                <option value="PROSTATA">Cáncer de Próstata</option>
                <option value="COLORRECTAL">Cáncer Colorrectal</option>
                <option value="CERVICOUTERINO">Cáncer Cervicouterino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          )}

          {/* ✅ Campo condicional: Otro tipo de cáncer */}
          {formData.tipo_cancer === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Tipo de Cáncer *
              </label>
              <input
                type="text"
                name="tipo_cancer_otro"
                value={formData.tipo_cancer_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Especificar otro tipo de cáncer"
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 6. Tuberculosis Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tuberculosis Familiar
            </label>
            <select
              name="tuberculosis_familiar"
              value={formData.tuberculosis_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con tuberculosis */}
          {formData.tuberculosis_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Tuberculosis *
              </label>
              <input
                type="text"
                name="tuberculosis_familiar_otro"
                value={formData.tuberculosis_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 7. Enfermedad Mental Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Mental Familiar
            </label>
            <select
              name="enfermedad_mental_familiar"
              value={formData.enfermedad_mental_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con enfermedad mental */}
          {formData.enfermedad_mental_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Enfermedad Mental *
              </label>
              <input
                type="text"
                name="enfermedad_mental_familiar_otro"
                value={formData.enfermedad_mental_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 8. Enfermedad Infecciosa Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Infecciosa Familiar
            </label>
            <select
              name="enfermedad_infecciosa_familiar"
              value={formData.enfermedad_infecciosa_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con enfermedad infecciosa */}
          {formData.enfermedad_infecciosa_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Enfermedad Infecciosa *
              </label>
              <input
                type="text"
                name="enfermedad_infecciosa_familiar_otro"
                value={formData.enfermedad_infecciosa_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 9. Malformación Familiar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Malformación Familiar
            </label>
            <select
              name="malformacion_familiar"
              value={formData.malformacion_familiar}
              onChange={onInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* ✅ Campo condicional: Otro familiar con malformación */}
          {formData.malformacion_familiar === 'OTRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especificar Familiar con Malformación *
              </label>
              <input
                type="text"
                name="malformacion_familiar_otro"
                value={formData.malformacion_familiar_otro || ''}
                onChange={onInputChange}
                required
                placeholder="Ej: Tío, primo, etc."
                className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white"
              />
            </div>
          )}

          {/* 10. Otros Antecedentes Familiares */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Otros Antecedentes Familiares
            </label>
            <textarea
              name="otros_antecedentes_familiares"
              value={formData.otros_antecedentes_familiares || ''}
              onChange={onInputChange}
              rows={3}
              placeholder="Información adicional relevante sobre antecedentes familiares"
              className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-purple-600 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sección: Estado (solo en edición) */}
      {mostrarSeccionEstado && (
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
                checked={activo}
                onChange={onCheckboxChange || onInputChange}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Activo
              </label>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                activo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los reportes.
          </p>
        </div>
      )}
    </div>
  );
}