// src/components/patients/forms/PatientFormFields.tsx

import React from "react";
import type { PatientFormData } from "./PatientForm";

interface PatientFormFieldsProps {
  formData: PatientFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: "create" | "edit";
}

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function CheckboxField({
  label,
  name,
  checked,
  onChange,
  className = "",
}: CheckboxFieldProps) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-center space-x-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      </label>
    </div>
  );
}

export default function PatientFormFields({
  formData,
  onInputChange,
  onReset,
  submitLoading,
  mode,
}: PatientFormFieldsProps) {
  return (
    <div className="space-y-8">
      {/* ✅ Sección A: Datos Personales - AZUL */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            A. Datos Personales
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombres *
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={onInputChange}
              required
              placeholder="Ej: Juan Carlos"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={onInputChange}
              required
              placeholder="Ej: Pérez García"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sexo *
            </label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={onInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            >
              <option value="">Seleccionar sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Edad *
            </label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={onInputChange}
              required
              min="0"
              max="150"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condición de Edad *
            </label>
            <select
              name="condicion_edad"
              value={formData.condicion_edad}
              onChange={onInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            >
              <option value="">Seleccionar</option>
              <option value="H">Horas</option>
              <option value="D">Días</option>
              <option value="M">Meses</option>
              <option value="A">Años</option>
            </select>
          </div>

          {formData.sexo === "F" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Embarazada? *
              </label>
              <select
                name="embarazada"
                value={formData.embarazada || ""}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
              >
                <option value="">Seleccionar</option>
                <option value="SI">Sí</option>
                <option value="NO">No</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Sección: Identificación - VERDE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cédula/Pasaporte * (mínimo 10 dígitos)
            </label>
            <input
              type="text"
              name="cedula_pasaporte"
              value={formData.cedula_pasaporte}
              onChange={onInputChange}
              required
              placeholder="Ej: 1709876543"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          {/* ✅ CORRECCIÓN: Eliminado placeholder del input date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={onInputChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
          </div>
        </div>
      </div>

      {/* ✅ Sección: Información de Contacto - PÚRPURA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información de Contacto
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección *
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={onInputChange}
              required
              placeholder="Ej: Av. Principal 123"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono * (mínimo 10 dígitos)
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={onInputChange}
              required
              placeholder="Ej: 0991234567"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={onInputChange}
              placeholder="ejemplo@correo.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ✅ Sección: Contacto de Emergencia - NARANJA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contacto de Emergencia
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Contacto
            </label>
            <input
              type="text"
              name="contacto_emergencia_nombre"
              value={formData.contacto_emergencia_nombre}
              onChange={onInputChange}
              placeholder="Nombre completo"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono del Contacto
            </label>
            <input
              type="tel"
              name="contacto_emergencia_telefono"
              value={formData.contacto_emergencia_telefono}
              onChange={onInputChange}
              placeholder="Ej: 0987654321"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ✅ Sección B: Motivo de Consulta - AMARILLO */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            B. Motivo de Consulta
          </h3>
        </div>

        <div>
          <textarea
            name="motivo_consulta"
            value={formData.motivo_consulta}
            onChange={onInputChange}
            rows={3}
            placeholder="Describa el motivo de consulta del paciente..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-none"
          />
        </div>
      </div>

      {/* ✅ Sección C: Enfermedad Actual - ROSA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            C. Enfermedad Actual
          </h3>
        </div>

        <div>
          <textarea
            name="enfermedad_actual"
            value={formData.enfermedad_actual}
            onChange={onInputChange}
            rows={3}
            placeholder="Describa la enfermedad actual del paciente..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-none"
          />
        </div>
      </div>

      {/* ✅ Sección: Estado del Paciente - GRIS */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estado del Paciente
          </h3>
        </div>

        <div>
          <CheckboxField
            label="Paciente Activo"
            name="activo"
            checked={formData.activo}
            onChange={onInputChange}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Los pacientes inactivos no podrán agendar citas ni recibir tratamientos hasta ser reactivados
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onReset}
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
        >
          Limpiar Formulario
        </button>
        <button
          type="submit"
          disabled={submitLoading}
          className={`px-6 py-3 text-sm font-medium text-white rounded-lg focus:ring-4 disabled:opacity-50 transition-colors ${
            mode === "edit"
              ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
        >
          {submitLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mode === "create" ? "Registrando..." : "Guardando..."}
            </span>
          ) : (
            mode === "create" ? "Registrar Paciente" : "Guardar Cambios"
          )}
        </button>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">📋 Información importante:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Los campos marcados con * son obligatorios</li>
              <li>La cédula/pasaporte debe ser única en el sistema</li>
              <li>El teléfono debe tener al menos 10 dígitos numéricos</li>
              <li>El correo electrónico debe ser válido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
