// src/components/patients/consultations/forms/ConsultationFormFields.tsx

import React from 'react';

export interface ConsultationFormData {
  paciente: string;
  fecha_consulta: string;
  motivo_consulta: string;
  enfermedad_actual: string;
  observaciones: string;
  activo: boolean;
}

interface ConsultationFormFieldsProps {
  formData: ConsultationFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: 'create' | 'edit';
  pacienteNombre?: string;
}

export default function ConsultationFormFields({
  formData,
  onInputChange,
  onReset,
  submitLoading,
  mode,
  pacienteNombre,
}: ConsultationFormFieldsProps) {
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

      {/* Sección 1: Fecha y Datos Básicos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 Fecha y Datos Básicos
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Consulta *
            </label>
            <input
              type="date"
              name="fecha_consulta"
              value={formData.fecha_consulta}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Motivo de Consulta */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🩺 Motivo de Consulta *
          </h3>
        </div>

        <div>
          <textarea
            name="motivo_consulta"
            value={formData.motivo_consulta}
            onChange={onInputChange}
            rows={4}
            required
            placeholder="Describa el motivo principal de la consulta..."
            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-blue-600 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Ej: Dolor en muela posterior derecha, inflamación de encías, control rutinario, etc.
          </p>
        </div>
      </div>

      {/* Sección 3: Enfermedad Actual */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            ⚕️ Enfermedad Actual *
          </h3>
        </div>

        <div>
          <textarea
            name="enfermedad_actual"
            value={formData.enfermedad_actual}
            onChange={onInputChange}
            rows={5}
            required
            placeholder="Describa detalladamente la enfermedad o condición actual del paciente..."
            className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-red-600 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Incluya síntomas, evolución, tratamientos previos, etc.
          </p>
        </div>
      </div>

      {/* Sección 6: Observaciones */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📝 Observaciones Adicionales
          </h3>
        </div>

        <div>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={onInputChange}
            rows={4}
            placeholder="Cualquier observación adicional relevante..."
            className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-orange-600 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Notas sobre comportamiento del paciente, recomendaciones especiales, etc.
          </p>
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
          Las consultas inactivas no aparecerán en las búsquedas ni en los reportes.
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
          {mode === 'create' ? 'Guardar Consulta' : 'Actualizar Consulta'}
        </button>
      </div>
    </div>
  );
}