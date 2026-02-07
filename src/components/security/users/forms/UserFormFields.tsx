// src/components/users/forms/UserFormFields.tsx
import React from "react";
import type { UserFormData } from "./UserForm";

interface UserFormFieldsProps {
  formData: UserFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: "create" | "edit";
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  minLength?: number;
  disabled?: boolean;
  className?: string;
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  min,
  max,
  minLength,
  disabled = false,
  className = "",
}: InputFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        minLength={minLength}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  className?: string;
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  className = "",
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
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

export default function UserFormFields({
  formData,
  onInputChange,
  onReset,
  submitLoading,
  mode,
}: UserFormFieldsProps) {
  return (
    <div className="space-y-8">
      {/* ✅ Sección: Datos Personales - AZUL */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Datos Personales
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Nombres"
            name="nombres"
            value={formData.nombres}
            onChange={onInputChange}
            required
            placeholder="Ej: Juan Carlos"
          />
          <InputField
            label="Apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={onInputChange}
            required
            placeholder="Ej: Pérez García"
          />
        </div>
      </div>

      {/* ✅ Sección: Credenciales de Acceso - PÚRPURA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Credenciales de Acceso
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Nombre de Usuario"
            name="username"
            value={formData.username}
            onChange={onInputChange}
            required
            placeholder="Ej: jperez"
            minLength={4}
            disabled={true}
          />

          <SelectField
            label="Rol del Sistema"
            name="rol"
            value={formData.rol}
            onChange={onInputChange}
            options={[
              { value: "Administrador", label: "Administrador" },
              { value: "Odontologo", label: "Odontólogo" },
              { value: "Asistente", label: "Asistente" },
            ]}
            required
          />

          {mode === "create" && (
            <>
              <InputField
                label="Contraseña"
                name="password"
                value={formData.password}
                onChange={onInputChange}
                type="password"
                required
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
              <InputField
                label="Confirmar Contraseña"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={onInputChange}
                type="password"
                required
                placeholder="Repetir contraseña"
                minLength={8}
              />
            </>
          )}
        </div>
      </div>

      {/* ✅ Sección: Información de Contacto - VERDE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Información de Contacto
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={onInputChange}
            type="tel"
            required
            placeholder="Ej: 0991234567"
            minLength={10}
          />
          <InputField
            label="Correo Electrónico"
            name="correo"
            value={formData.correo}
            onChange={onInputChange}
            type="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>
      </div>

      {/* ✅ Sección: Estado del Usuario - GRIS */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Estado del Usuario
          </h3>
        </div>

        <div>
          <CheckboxField
            label="Usuario Activo"
            name="is_active"
            checked={formData.is_active}
            onChange={onInputChange}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Los usuarios inactivos no podrán iniciar sesión en el sistema
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
            mode === "create" ? "Registrar Usuario" : "Guardar Cambios"
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
            <p className="font-semibold mb-1">📋 Notas importantes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
              <li>El nombre de usuario debe ser único en el sistema</li>
              <li>El teléfono debe tener al menos 10 dígitos numéricos</li>
              <li>La contraseña debe tener al menos 8 caracteres</li>
              <li>El correo electrónico debe ser válido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
