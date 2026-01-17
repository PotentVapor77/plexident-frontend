// src/components/patients/anamnesis/forms/AnamnesisFormFields.tsx

import React from 'react';

export interface AnamnesisFormData {
  paciente: string;
  tiene_alergias: boolean;
  alergias_detalle: string;
  antecedentes_personales: string;
  antecedentes_familiares: string;
  problemas_coagulacion: boolean;
  problemas_coagulacion_detalle: string;
  problemas_anestesicos: boolean;
  problemas_anestesicos_detalle: string;
  toma_medicamentos: boolean;
  medicamentos_actuales: string;
  habitos: string;
  otros: string;
  activo: boolean;
}

interface AnamnesisFormFieldsProps {
  formData: AnamnesisFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: 'create' | 'edit';
  pacienteNombre?: string;
}

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
      {/* ✅ Información del paciente - DISEÑO MEJORADO */}
      {pacienteNombre && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
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

            {/* Badge de paciente fijado */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Paciente fijado activamente
              </span>
            </div>

            {/* Nota informativa */}
            <div className="mt-4 flex gap-2 rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
              <span className="text-base flex-shrink-0">📌</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                  <span className="font-semibold">Nota:</span> Este registro
                  se asociará automáticamente al paciente fijado. Para
                  cambiar de paciente, regrese a la pestaña "Gestión de
                  Pacientes" y fije otro paciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección 2: Alergias */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alergias ⚠️
          </h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="tiene_alergias"
              checked={formData.tiene_alergias}
              onChange={onInputChange}
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ¿El paciente tiene alergias?
            </span>
          </label>

          {formData.tiene_alergias && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detalle de alergias *
              </label>
              <textarea
                name="alergias_detalle"
                value={formData.alergias_detalle}
                onChange={onInputChange}
                rows={3}
                required={formData.tiene_alergias}
                placeholder="Ej: Alérgico a la penicilina, reacción cutánea al látex"
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-red-600 dark:text-white resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección 3: Antecedentes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Antecedentes
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Antecedentes personales
              <span className="text-xs text-gray-500 ml-2">
                (enfermedades, cirugías, hospitalizaciones)
              </span>
            </label>
            <textarea
              name="antecedentes_personales"
              value={formData.antecedentes_personales}
              onChange={onInputChange}
              rows={3}
              placeholder="Ej: Hipertensión controlada desde 2020, apendicectomía en 2015"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Antecedentes familiares
              <span className="text-xs text-gray-500 ml-2">
                (enfermedades hereditarias)
              </span>
            </label>
            <textarea
              name="antecedentes_familiares"
              value={formData.antecedentes_familiares}
              onChange={onInputChange}
              rows={3}
              placeholder="Ej: Padre con diabetes tipo 2, madre con hipertensión"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sección 4: Problemas Médicos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            🚨 Problemas Médicos Críticos
          </h3>
        </div>

        <div className="space-y-6">
          {/* Problemas de coagulación */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="problemas_coagulacion"
                checked={formData.problemas_coagulacion}
                onChange={onInputChange}
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                ¿Problemas de coagulación?
              </span>
            </label>

            {formData.problemas_coagulacion && (
              <textarea
                name="problemas_coagulacion_detalle"
                value={formData.problemas_coagulacion_detalle}
                onChange={onInputChange}
                rows={2}
                required={formData.problemas_coagulacion}
                placeholder="Ej: Toma warfarina 5mg diario, INR: 2.5"
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-red-600 dark:text-white resize-none"
              />
            )}
          </div>

          {/* Problemas con anestésicos */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="problemas_anestesicos"
                checked={formData.problemas_anestesicos}
                onChange={onInputChange}
                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                ¿Problemas con anestésicos locales?
              </span>
            </label>

            {formData.problemas_anestesicos && (
              <textarea
                name="problemas_anestesicos_detalle"
                value={formData.problemas_anestesicos_detalle}
                onChange={onInputChange}
                rows={2}
                required={formData.problemas_anestesicos}
                placeholder="Ej: Reacción alérgica a lidocaína (taquicardia, mareo)"
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-red-600 dark:text-white resize-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sección 5: Medicamentos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            💊 Medicamentos
          </h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="toma_medicamentos"
              checked={formData.toma_medicamentos}
              onChange={onInputChange}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ¿Toma medicamentos actualmente?
            </span>
          </label>

          {formData.toma_medicamentos && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medicamentos actuales (detallado) *
              </label>
              <textarea
                name="medicamentos_actuales"
                value={formData.medicamentos_actuales}
                onChange={onInputChange}
                rows={4}
                required={formData.toma_medicamentos}
                placeholder="Ej: Losartán 50mg - 1 tableta en la mañana (hipertensión)&#10;Metformina 850mg - 1 tableta cada 12 horas (diabetes)"
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-green-600 dark:text-white resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección 6: Hábitos y Otros */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Hábitos y Otros
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hábitos
              <span className="text-xs text-gray-500 ml-2">
                (tabaco, alcohol, bruxismo, etc.)
              </span>
            </label>
            <textarea
              name="habitos"
              value={formData.habitos}
              onChange={onInputChange}
              rows={3}
              placeholder="Ej: No fuma, consume alcohol ocasionalmente (fines de semana), bruxismo nocturno"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Otros
              <span className="text-xs text-gray-500 ml-2">
                (información adicional relevante)
              </span>
            </label>
            <textarea
              name="otros"
              value={formData.otros}
              onChange={onInputChange}
              rows={3}
              placeholder="Cualquier otra información no contemplada anteriormente"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sección 7: Estado */}
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
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              formData.activo
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
