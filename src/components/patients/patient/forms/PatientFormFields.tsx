// src/components/patients/forms/PatientFormFields.tsx

import React, { useRef, useState, useEffect } from "react";
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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isDateValid, setIsDateValid] = useState(true);
  const [dateValue, setDateValue] = useState("");
  // ❌ ELIMINADO: const [fechaRegistro] = useState(new Date().toISOString().split('T')[0]);

  // Calcular fecha máxima (hoy)
  const maxDate = new Date().toISOString().split('T')[0];

  // ✅ Función para calcular edad desde fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad >= 0 ? edad : 0;
  };

  // ✅ Calcular la condición de edad automáticamente
  const calcularCondicionEdad = (edad: number): string => {
    if (edad === 0) return "M"; // Meses para recién nacidos
    if (edad < 1) return "D"; // Días
    if (edad < 2) return "M"; // Meses
    return "A"; // Años
  };

  // Sincronizar el valor de fecha cuando cambia formData
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      if (formData.fecha_nacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setDateValue(formData.fecha_nacimiento);
      } else {
        try {
          const date = new Date(formData.fecha_nacimiento);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setDateValue(`${year}-${month}-${day}`);
          } else {
            setDateValue("");
          }
        } catch {
          setDateValue("");
        }
      }
    } else {
      setDateValue("");
    }
  }, [formData.fecha_nacimiento]);

  // ✅ Manejo personalizado del cambio de fecha CON CÁLCULO AUTOMÁTICO DE EDAD
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    setDateValue(value);
    
    if (value > maxDate) {
      setIsDateValid(false);
      return;
    }
    
    setIsDateValid(true);
    
    // ✅ Calcular edad automáticamente
    const edad = calcularEdad(value);
    const condicionEdad = calcularCondicionEdad(edad);
    
    // ✅ Actualizar fecha de nacimiento
    const simulatedEventFecha = {
      target: {
        name: "fecha_nacimiento",
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(simulatedEventFecha);
    
    // ✅ Actualizar edad automáticamente
    const simulatedEventEdad = {
      target: {
        name: "edad",
        value: edad.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(simulatedEventEdad);
    
    // ✅ Actualizar condición de edad automáticamente
    const simulatedEventCondicion = {
      target: {
        name: "condicion_edad",
        value: condicionEdad
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onInputChange(simulatedEventCondicion);
  };

  const handleCalendarIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleClearDate = () => {
    setDateValue("");
    setIsDateValid(true);
    
    const simulatedEvent = {
      target: {
        name: "fecha_nacimiento",
        value: ""
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(simulatedEvent);
    
    // Limpiar edad también
    const simulatedEventEdad = {
      target: {
        name: "edad",
        value: "0"
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(simulatedEventEdad);
  };

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

          {/* ✅ EDAD - BLOQUEADA Y CALCULADA AUTOMÁTICAMENTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Edad * (calculada automáticamente)
            </label>
            <div className="relative">
              <input
                type="number"
                name="edad"
                value={formData.edad || ""}
                readOnly
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Se calcula automáticamente desde la fecha de nacimiento
            </p>
          </div>

          {/* ✅ CONDICIÓN DE EDAD - CALCULADA AUTOMÁTICAMENTE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condición de Edad * (automática)
            </label>
            <select
              name="condicion_edad"
              value={formData.condicion_edad}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
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

          {/* ✅ FECHA DE NACIMIENTO - Calcula edad automáticamente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Nacimiento * (calcula edad automática)
            </label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                name="fecha_nacimiento"
                value={dateValue}
                onChange={handleDateChange}
                required
                max={maxDate}
                className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors appearance-none ${
                  !isDateValid 
                    ? 'border-red-300 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{
                  colorScheme: 'dark light',
                  cursor: 'pointer',
                }}
              />
              <button
                type="button"
                onClick={handleCalendarIconClick}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                aria-label="Abrir selector de fecha"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </button>
              
              {dateValue && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Limpiar fecha"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>
            {!isDateValid && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                La fecha de nacimiento no puede ser futura
              </p>
            )}
            {dateValue && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                ✅ Edad calculada: {formData.edad} {formData.condicion_edad === 'A' ? 'años' : formData.condicion_edad === 'M' ? 'meses' : 'días'}
              </p>
            )}
          </div>

          {/* ✅ FECHA DE REGISTRO - AUTOMÁTICA Y BLOQUEADA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Registro (automática)
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.fecha_ingreso}
                readOnly
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Se crea automáticamente al crear el paciente
            </p>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
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

      {/* Contacto de Emergencia */}
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

      {/* Estado del Paciente */}
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
              <li>✨ <strong>La edad se calcula automáticamente</strong> al seleccionar la fecha de nacimiento</li>
              <li>🔒 La fecha de registro se establece automáticamente</li>
              <li>Haga clic en el ícono 📅 para abrir el selector de fecha</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
