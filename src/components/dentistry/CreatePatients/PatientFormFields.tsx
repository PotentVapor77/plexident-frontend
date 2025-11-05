import React from 'react';
import Button from "../../ui/button/Button";
import type { PatientFormFieldsProps } from '../../../types/IPatient';


export default function PatientFormFields({
  formData,
  onSubmit,
  onInputChange,
  onReset,
  submitLoading
}: PatientFormFieldsProps) {
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
            placeholder="Ingrese los nombres del paciente"
            required
          />

          <FormField
            label="Apellidos *"
            name="apellidos"
            type="text"
            value={formData.apellidos}
            onChange={onInputChange}
            placeholder="Ingrese los apellidos del paciente"
            required
          />

          <FormField
            label="Cédula/Pasaporte * (10 dígitos)"
            name="cedula_pasaporte"
            type="text"
            value={formData.cedula_pasaporte}
            onChange={onInputChange}
            placeholder="Ej: 1709876543"
            required
          />

          <FormField
            label="Fecha de Nacimiento *"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={onInputChange}
            required
          />

          <SelectField
            label="Sexo *"
            name="sexo"
            value={formData.sexo}
            onChange={onInputChange}
            options={[
              { value: '', label: 'Seleccionar sexo' },
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Femenino' },
              { value: 'O', label: 'Otro' }
            ]}
            required
          />
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <FormField
            label="Dirección *"
            name="direccion"
            type="text"
            value={formData.direccion}
            onChange={onInputChange}
            placeholder="Ingrese la dirección completa"
            required
          />

          <FormField
            label="Teléfono * (10 dígitos)"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={onInputChange}
            placeholder="Ej: 0991234567"
            required
          />

          <FormField
            label="Correo Electrónico *"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={onInputChange}
            placeholder="correo@ejemplo.com"
            required
          />

          <FormField
            label="Contacto de Emergencia (Nombre) *"
            name="contacto_emergencia_nombre"
            type="text"
            value={formData.contacto_emergencia_nombre}
            onChange={onInputChange}
            placeholder="Nombre del contacto de emergencia"
            required
          />

          <FormField
            label="Contacto de Emergencia (Teléfono) * (10 dígitos)"
            name="contacto_emergencia_telefono"
            type="tel"
            value={formData.contacto_emergencia_telefono}
            onChange={onInputChange}
            placeholder="Ej: 0987654321"
            required
          />
        </div>
      </div>

      {/* Campos de texto largos - full width */}
      <div className="mt-6 space-y-4">
        <TextAreaField
          label="Alergias *"
          name="alergias"
          value={formData.alergias}
          onChange={onInputChange}
          rows={3}
          placeholder="Lista de alergias conocidas, medicamentos, alimentos, etc. Si no tiene alergias, escriba 'Ninguna'."
          required
        />

        <TextAreaField
          label="Enfermedades Sistémicas *"
          name="enfermedades_sistemicas"
          value={formData.enfermedades_sistemicas}
          onChange={onInputChange}
          rows={3}
          placeholder="Enfermedades crónicas o condiciones médicas como diabetes, hipertensión, asma, etc. Si no tiene, escriba 'Ninguna'."
          required
        />

        <TextAreaField
          label="Hábitos *"
          name="habitos"
          value={formData.habitos}
          onChange={onInputChange}
          rows={3}
          placeholder="Hábitos de vida, consumo de tabaco, alcohol, ejercicio, dieta, etc."
          required
        />
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
            Paciente Activo
          </span>
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onReset}
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Limpiar Formulario
        </button>
        <Button
          disabled={submitLoading}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitLoading ? 'Registrando...' : 'Registrar Paciente'}
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
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
}

// Componente para campos de textarea
interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows: number;
  placeholder?: string;
  required?: boolean;
}

function TextAreaField({ label, name, value, onChange, rows, placeholder, required }: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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