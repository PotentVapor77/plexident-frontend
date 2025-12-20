import React, { useState, useEffect } from 'react';
import { createPaciente, updatePaciente } from '../../../services/patient/patientService';
import type { IPaciente, IPacienteCreate, IPacienteUpdate, Sexo } from '../../../types/patient/IPatient';
import { PacienteFormFields } from './PatientFormFields';

interface PacienteFormProps {
  paciente?: IPaciente | null;
  actionType: 'create' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
}

export const PacienteForm: React.FC<PacienteFormProps> = ({
  paciente,
  actionType,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<IPacienteCreate | IPacienteUpdate>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (actionType === 'edit' && paciente) {
      setFormData({
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        sexo: paciente.sexo,
        edad: paciente.edad,
        condicion_edad: paciente.condicion_edad,
        cedula_pasaporte: paciente.cedula_pasaporte,
        fecha_nacimiento: paciente.fecha_nacimiento,
        telefono: paciente.telefono,
        correo: paciente.correo || '',
        direccion: paciente.direccion || '',
        contacto_emergencia_nombre: paciente.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: paciente.contacto_emergencia_telefono || '',
        embarazada: paciente.embarazada || undefined,
        motivo_consulta: paciente.motivo_consulta || '',
        enfermedad_actual: paciente.enfermedad_actual || ''
      });
    } else {
      setFormData({
        nombres: '',
        apellidos: '',
        sexo: '' as Sexo,
        edad: 0,
        condicion_edad: '' as any,
        cedula_pasaporte: '',
        fecha_nacimiento: '',
        telefono: ''
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [paciente, actionType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico al escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.nombres?.trim()) newErrors.nombres = ['Los nombres son obligatorios'];
    if (!formData.apellidos?.trim()) newErrors.apellidos = ['Los apellidos son obligatorios'];
    if (!formData.sexo) newErrors.sexo = ['Debe seleccionar el sexo'];
    if (!formData.edad || formData.edad <= 0) newErrors.edad = ['La edad debe ser mayor a 0'];
    if (!formData.condicion_edad) newErrors.condicion_edad = ['Debe seleccionar la condición de edad'];
    if (!formData.cedula_pasaporte?.trim()) newErrors.cedula_pasaporte = ['La cédula es obligatoria'];
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = ['La fecha de nacimiento es obligatoria'];
    if (!formData.telefono?.trim()) newErrors.telefono = ['El teléfono es obligatorio'];

    // Validación embarazada
    if (formData.sexo === 'M' && formData.embarazada === 'SI') {
      newErrors.embarazada = ['Un paciente masculino no puede estar embarazado'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      if (actionType === 'create') {
        await createPaciente(formData as IPacienteCreate);
      } else {
        if (!paciente?.id) throw new Error('ID de paciente no encontrado');
        await updatePaciente(paciente.id, formData as IPacienteUpdate);
      }
      onSuccess();
    } catch (error: any) {
      setSubmitError(error.message || 'Error al guardar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {actionType === 'create' ? 'Nuevo Paciente' : 'Editar Paciente'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <PacienteFormFields 
            formData={formData} 
            onChange={handleChange} 
            errors={errors} 
          />
          
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{actionType === 'create' ? 'Crear Paciente' : 'Actualizar'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
