import React from 'react';
import type { UserFormData } from './UserForm';

interface UserFormFieldsProps {
  formData: UserFormData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
  submitLoading: boolean;
}

// Componente auxiliar para campos de entrada
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
  type = 'text', 
  required = false,
  placeholder,
  min,
  max,
  minLength,
  disabled = false,
  className = ''
}: InputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// Componente auxiliar para select
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
  className = ''
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
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

// Componente auxiliar para checkbox
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
  className = '' 
}: CheckboxFieldProps) {
  return (
    <div className={className}>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </label>
    </div>
  );
}

export default function UserFormFields({
  formData,
  onSubmit,
  onInputChange,
  onReset,
  submitLoading
}: UserFormFieldsProps) {
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onInputChange({
      ...e,
      target: {
        ...e.target,
        name,
        value: checked.toString(),
        checked,
        type: 'checkbox'
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <form onSubmit={onSubmit} className="p-6 bg-white dark:bg-gray-900">
      {/* DATOS PERSONALES */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Datos Personales
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete la información personal del usuario
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Campos obligatorios <span className="text-red-500">*</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Credenciales de Acceso
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Defina el acceso y permisos del usuario
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre de Usuario"
            name="username"
            value={formData.username}
            onChange={onInputChange}
            required
            placeholder="Ej: jperez"
            minLength={4}
          />
          
          <SelectField
            label="Rol del Sistema"
            name="rol"
            value={formData.rol}
            onChange={onInputChange}
            options={[
              { value: 'Administrador', label: 'Administrador' },
              { value: 'Odontólogo', label: 'Odontólogo' },
              { value: 'Asistente', label: 'Asistente' }
            ]}
            required
          />
          
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
        </div>
      </div>

      {/* INFORMACIÓN DE CONTACTO */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Información de Contacto
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Datos de contacto del usuario
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Estado del Usuario
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configuración del sistema
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <CheckboxField
            label="Usuario Activo"
            name="activo"
            checked={formData.activo}
            onChange={handleCheckboxChange}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Los usuarios inactivos no podrán iniciar sesión en el sistema
          </p>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onReset}
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Limpiar Formulario
        </button>
        
        <button
          type="submit"
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registrando...
            </span>
          ) : (
            'Registrar Usuario'
          )}
        </button>
      </div>

      {/* NOTA AL PIE */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-2">📋 Notas importantes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</li>
            <li>El nombre de usuario debe ser único en el sistema</li>
            <li>El teléfono debe tener al menos 10 dígitos numéricos</li>
            <li>La contraseña debe tener al menos 8 caracteres</li>
            <li>El correo electrónico debe ser válido</li>
          </ul>
        </div>
      </div>
    </form>
  );
}
