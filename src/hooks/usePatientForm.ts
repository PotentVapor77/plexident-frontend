// hooks/usePatientForm.ts
import { useState } from 'react';
import type { Patient } from '../services/patientService';

export interface PatientFormData {
  status: boolean;
  nombres: string;
  apellidos: string;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  sexo: string;
  direccion: string;
  telefono: string;
  correo: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  alergias: string;
  enfermedades_sistemicas: string;
  habitos: string;
}

export function usePatientForm(initialPatient: Patient | null = null) {
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

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient);

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
    setSelectedPatient(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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

  const preparePatientData = () => {
    return {
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
  };

  const loadPatientData = (patient: Patient) => {
    setSelectedPatient(patient);
    const formattedDate = patient.fecha_nacimiento 
      ? new Date(patient.fecha_nacimiento).toISOString().split('T')[0]
      : '';
    
    setFormData({
      status: patient.status ?? true,
      nombres: patient.nombres || '',
      apellidos: patient.apellidos || '',
      cedula_pasaporte: patient.cedula_pasaporte || '',
      fecha_nacimiento: formattedDate,
      sexo: patient.sexo || '',
      direccion: patient.direccion || '',
      telefono: patient.telefono || '',
      correo: patient.correo || '',
      contacto_emergencia_nombre: patient.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: patient.contacto_emergencia_telefono || '',
      alergias: patient.alergias || '',
      enfermedades_sistemicas: patient.enfermedades_sistemicas || '',
      habitos: patient.habitos || ''
    });
  };

  return {
    formData,
    selectedPatient,
    setSelectedPatient,
    resetForm,
    handleInputChange,
    validateFormData,
    preparePatientData,
    loadPatientData
  };
}