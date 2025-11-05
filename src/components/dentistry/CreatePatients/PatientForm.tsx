import { useState } from "react";
import { createPatient } from "../../../services/patientService";
import { AxiosError } from 'axios';

import { useModal } from "../../../hooks/useModal";
import PatientFormFields from "./PatientFormFields";
import SuccessModal from "./SuccessModal";
import type { IPatient, PatientFormProps } from "../../../types/IPatient";


type PatientFormData = Omit<IPatient, "id">;

export default function PatientForm({ onPatientCreated }: PatientFormProps) {

  const [formData, setFormData] = useState<PatientFormData>({
    status: true,
    nombres: '',
    apellidos: '',
    cedula_pasaporte: '',
    fecha_nacimiento: '',
    sexo: '',
    direccion: '',
    telefono: '',
    correo: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    alergias: '',
    enfermedades_sistemicas: '',
    habitos: ''
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Función para validar todos los campos obligatorios
  const validateFormData = (): string[] => {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!formData.nombres.trim()) errors.push('Nombres es obligatorio');
    if (!formData.apellidos.trim()) errors.push('Apellidos es obligatorio');
    if (!formData.cedula_pasaporte.trim()) errors.push('Cédula/Pasaporte es obligatorio');
    if (!formData.fecha_nacimiento) errors.push('Fecha de nacimiento es obligatoria');
    if (!formData.sexo) errors.push('Sexo es obligatorio');
    if (!formData.direccion.trim()) errors.push('Dirección es obligatoria');
    if (!formData.telefono.trim()) errors.push('Teléfono es obligatorio');
    if (!formData.correo.trim()) errors.push('Correo electrónico es obligatorio');
    if (!formData.contacto_emergencia_nombre.trim()) errors.push('Nombre de contacto de emergencia es obligatorio');
    if (!formData.contacto_emergencia_telefono.trim()) errors.push('Teléfono de contacto de emergencia es obligatorio');
    if (!formData.alergias.trim()) errors.push('Alergias es obligatorio');
    if (!formData.enfermedades_sistemicas.trim()) errors.push('Enfermedades sistémicas es obligatorio');
    if (!formData.habitos.trim()) errors.push('Hábitos es obligatorio');

    // Validaciones específicas de formato
    if (formData.cedula_pasaporte && !/^\d{10}$/.test(formData.cedula_pasaporte)) {
      errors.push('La cédula/pasaporte debe tener exactamente 10 dígitos numéricos');
    }
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono)) {
      errors.push('El teléfono debe tener exactamente 10 dígitos numéricos');
    }
    if (formData.contacto_emergencia_telefono && !/^\d{10}$/.test(formData.contacto_emergencia_telefono)) {
      errors.push('El teléfono de emergencia debe tener exactamente 10 dígitos numéricos');
    }
    if (formData.sexo && !['M', 'F', 'O'].includes(formData.sexo)) {
      errors.push('El sexo debe ser Masculino, Femenino u Otro');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      status: true,
      nombres: '',
      apellidos: '',
      cedula_pasaporte: '',
      fecha_nacimiento: '',
      sexo: '',
      direccion: '',
      telefono: '',
      correo: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      alergias: '',
      enfermedades_sistemicas: '',
      habitos: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitLoading(true);
    
      try {
    console.log('Datos del paciente a guardar:', formData);

    const patientData = {
      ...formData,
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      cedula_pasaporte: formData.cedula_pasaporte.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim(),
      contacto_emergencia_nombre: formData.contacto_emergencia_nombre.trim(),
      contacto_emergencia_telefono: formData.contacto_emergencia_telefono.trim(),
      alergias: formData.alergias.trim(),
      enfermedades_sistemicas: formData.enfermedades_sistemicas.trim(),
      habitos: formData.habitos.trim(),
    };

    // Crear nuevo paciente
    await createPatient(patientData);

    resetForm();
    setSuccessMessage('Paciente registrado exitosamente');
    openSuccessModal();

    if (onPatientCreated) {
      onPatientCreated();
    }
  } catch (err: unknown) {
    console.error('Error al guardar paciente:', err);

    if (err instanceof AxiosError && err.response?.data) {
      console.error('Datos de error del servidor:', err.response.data);

      let errorMessage = 'Error al guardar el paciente:\n';

      if (typeof err.response.data === 'object') {
        Object.keys(err.response.data).forEach(key => {
          const errorValue = (err.response!.data as Record<string, unknown>)[key];
          if (Array.isArray(errorValue)) {
            errorMessage += `${key}: ${errorValue[0]}\n`;
          } else {
            errorMessage += `${key}: ${String(errorValue)}\n`;
          }
        });
      } else {
        errorMessage += String(err.response.data);
      }

      alert(errorMessage);
    } else {
      alert('Error de conexión al guardar el paciente');
    }
  } finally {
    setSubmitLoading(false);
  }
  };

  const handleSuccessModalClose = () => {
    closeSuccessModal();
    setSuccessMessage(null);
  };

  const handleRegisterAnother = () => {
    handleSuccessModalClose();
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Registrar Nuevo Paciente
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete todos los campos obligatorios para registrar un nuevo paciente
          </p>
        </div>

        {/* Formulario */}
        <PatientFormFields
          formData={formData}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
        />
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        onRegisterAnother={handleRegisterAnother}
        message={successMessage}
      />
    </div>
  );
}