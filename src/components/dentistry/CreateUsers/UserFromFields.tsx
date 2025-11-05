// components/dentistry/CreateUsers/UserFormFields.tsx
import React from 'react';
import Button from "../../ui/button/Button";
import type { UserFormFieldsProps } from '../../../types/IUser';

export default function UserFormFields({
  formData,
  onSubmit,
  onInputChange,
  onReset,
  submitLoading
}: UserFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1 */}
        <div className="space-y-4">
          <FormField
            label="Nombres *"
            name="nombres"
            type="text"
            value={formData.nombres}
            onChange={onInputChange}
            placeholder="Ingrese los nombres del usuario"
            required
          />

          <FormField
            label="Apellidos *"
            name="apellidos"
            type="text"
            value={formData.apellidos}
            onChange={onInputChange}
            placeholder="Ingrese los apellidos del usuario"
            required
          />

          <FormField
            label="Correo Electrónico *"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={onInputChange}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <SelectField
            label="Rol *"
            name="rol"
            value={formData.rol}
            onChange={onInputChange}
            options={[
              { value: '', label: 'Seleccionar rol' },
              { value: 'asistente', label: 'Asistente' },
              { value: 'odontologo', label: 'Odontólogo' },
              { value: 'admin', label: 'Administrador' }
            ]}
            required
          />

          <FormField
            label="Contraseña * (mínimo 6 caracteres)"
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={onInputChange}
            placeholder="Mínimo 6 caracteres"
            required
          />

          <FormField
            label="Confirmar Contraseña *"
            name="confirmar_contrasena"
            type="password"
            value={formData.confirmar_contrasena}
            onChange={onInputChange}
            placeholder="Repita la contraseña"
            required
          />
        </div>
      </div>

      {/* Checkbox de estado */}
      <div className="mt-6 flex items-center">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={onInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Usuario Activo
          </span>
          
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onReset}
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
        >
          Limpiar Formulario
        </button>
        <Button
       
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          {submitLoading ? 'Registrando...' : 'Registrar Usuario'}
        </Button>
      </div>
    </form>
  );
}

// Componente para campos de input básicos
interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function FormField({ label, name, type, value, onChange, placeholder, required }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
      />
    </div>
  );
}

// Componente para campos de select
interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

function SelectField({ label, name, value, onChange, options, required }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}