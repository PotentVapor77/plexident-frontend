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
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
        className="w-full rounded border border-gray-300 p-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded border border-gray-300 p-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
    <div className="max-w-3xl mx-auto py-6">
      {/* DATOS PERSONALES */}
      <div className="mb-8 border-b pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Datos Personales
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Complete la información personal del usuario
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Campos obligatorios <span className="text-red-500">*</span>
          </div>
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

      {/* CREDENCIALES DE ACCESO */}
      <div className="mb-8 border-b pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Credenciales de Acceso
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Defina el acceso y permisos del usuario
            </p>
          </div>
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
            disabled={true} // ✅ Solo deshabilitado en modo edición
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

      {/* INFORMACIÓN DE CONTACTO */}
      <div className="mb-8 border-b pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Información de Contacto
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Datos de contacto del usuario
            </p>
          </div>
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

      {/* ESTADO DEL USUARIO */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Estado del Usuario
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configuración del sistema
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          {/* ✅ CORREGIDO: name="is_active" en lugar de "activo" */}
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

      {/* BOTONES */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
        <div />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={submitLoading}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
              mode === "create"
                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                : "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
            }`}
          >
            {submitLoading
              ? mode === "create"
                ? "Registrando..."
                : "Guardando..."
              : mode === "create"
              ? "Registrar Usuario"
              : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* NOTAS */}
      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2 font-medium">📋 Notas importantes:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Los campos marcados con <span className="text-red-500">*</span> son obligatorios
            </li>
            <li>El nombre de usuario debe ser único en el sistema</li>
            <li>El teléfono debe tener al menos 10 dígitos numéricos</li>
            <li>La contraseña debe tener al menos 8 caracteres</li>
            <li>El correo electrónico debe ser válido</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
