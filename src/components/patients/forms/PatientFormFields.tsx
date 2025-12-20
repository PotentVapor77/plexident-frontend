import React from 'react';
import type { IPacienteCreate, IPacienteUpdate } from '../../../types/patient/IPatient';

interface PacienteFormFieldsProps {
  formData: IPacienteCreate | IPacienteUpdate;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors?: Record<string, string[]>;
}

export const PacienteFormFields: React.FC<PacienteFormFieldsProps> = ({
  formData,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-6">
      {/* SECCIÓN A: DATOS PERSONALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.nombres 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Nombres completos"
          />
          {errors.nombres && (
            <p className="mt-1 text-sm text-red-600">{errors.nombres[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.apellidos 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Apellidos completos"
          />
          {errors.apellidos && (
            <p className="mt-1 text-sm text-red-600">{errors.apellidos[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
          <select
            name="sexo"
            value={formData.sexo || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad *</label>
          <input
            type="number"
            name="edad"
            value={formData.edad || ''}
            onChange={onChange}
            min="0"
            max="150"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condición *</label>
          <select
            name="condicion_edad"
            value={formData.condicion_edad || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="H">Horas</option>
            <option value="D">Días</option>
            <option value="M">Meses</option>
            <option value="A">Años</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.sexo === 'F' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Embarazada</label>
            <select
              name="embarazada"
              value={formData.embarazada || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="SI">Sí</option>
              <option value="NO">No</option>
            </select>
          </div>
        )}
      </div>

      {/* IDENTIFICACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cédula/Pasaporte *</label>
          <input
            type="text"
            name="cedula_pasaporte"
            value={formData.cedula_pasaporte || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.cedula_pasaporte 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="1234567890"
          />
          {errors.cedula_pasaporte && (
            <p className="mt-1 text-sm text-red-600">{errors.cedula_pasaporte[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento *</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTACTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono || ''}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.telefono 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="0999999999"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input
            type="email"
            name="correo"
            value={formData.correo || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* DIRECCIÓN Y EMERGENCIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <textarea
            name="direccion"
            value={formData.direccion || ''}
            onChange={onChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección completa"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto Emergencia</label>
          <input
            type="text"
            name="contacto_emergencia_nombre"
            value={formData.contacto_emergencia_nombre || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Emergencia</label>
          <input
            type="tel"
            name="contacto_emergencia_telefono"
            value={formData.contacto_emergencia_telefono || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SECCIÓN B Y C */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo Consulta</label>
        <textarea
          name="motivo_consulta"
          value={formData.motivo_consulta || ''}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedad Actual</label>
        <textarea
          name="enfermedad_actual"
          value={formData.enfermedad_actual || ''}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};
