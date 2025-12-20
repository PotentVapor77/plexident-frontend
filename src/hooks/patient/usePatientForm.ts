/**
 * ============================================================================
 * HOOK: usePatientForm
 * ============================================================================
 * ✅ CORREGIDO: Errores de ESLint no-case-declarations
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { IPatient, PatientSex } from '../../types/patient/IPatient';
import { CEDULA_REGEX, TELEFONO_REGEX, EMAIL_REGEX } from '../../types/patient/IPatient';

export interface PatientFormData {
  nombres: string;
  apellidos: string;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  sexo: PatientSex;
  direccion: string;
  telefono: string;
  correo: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  alergias: string;
  enfermedades_sistemicas: string;
  habitos: string;
}

export interface PatientFormErrors {
  nombres?: string;
  apellidos?: string;
  cedula_pasaporte?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  alergias?: string;
  enfermedades_sistemicas?: string;
  habitos?: string;
}

const initialFormData: PatientFormData = {
  nombres: '',
  apellidos: '',
  cedula_pasaporte: '',
  fecha_nacimiento: '',
  sexo: 'M',
  direccion: '',
  telefono: '',
  correo: '',
  contacto_emergencia_nombre: '',
  contacto_emergencia_telefono: '',
  alergias: '',
  enfermedades_sistemicas: '',
  habitos: '',
};

export function usePatientForm(initialPatient?: IPatient | null) {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof PatientFormData, boolean>>({
    nombres: false,
    apellidos: false,
    cedula_pasaporte: false,
    fecha_nacimiento: false,
    sexo: false,
    direccion: false,
    telefono: false,
    correo: false,
    contacto_emergencia_nombre: false,
    contacto_emergencia_telefono: false,
    alergias: false,
    enfermedades_sistemicas: false,
    habitos: false,
  });

  /**
   * Cargar datos del paciente al editar
   */
  useEffect(() => {
    if (initialPatient) {
      setFormData({
        nombres: initialPatient.nombres,
        apellidos: initialPatient.apellidos,
        cedula_pasaporte: initialPatient.cedula_pasaporte,
        fecha_nacimiento: initialPatient.fecha_nacimiento,
        sexo: initialPatient.sexo,
        direccion: initialPatient.direccion,
        telefono: initialPatient.telefono,
        correo: initialPatient.correo,
        contacto_emergencia_nombre: initialPatient.contacto_emergencia_nombre,
        contacto_emergencia_telefono: initialPatient.contacto_emergencia_telefono,
        alergias: initialPatient.alergias || '',
        enfermedades_sistemicas: initialPatient.enfermedades_sistemicas || '',
        habitos: initialPatient.habitos || '',
      });
      setTouched({
        nombres: true,
        apellidos: true,
        cedula_pasaporte: true,
        fecha_nacimiento: true,
        sexo: true,
        direccion: true,
        telefono: true,
        correo: true,
        contacto_emergencia_nombre: true,
        contacto_emergencia_telefono: true,
        alergias: false,
        enfermedades_sistemicas: false,
        habitos: false,
      });
    } else {
      setFormData(initialFormData);
      setTouched({
        nombres: false,
        apellidos: false,
        cedula_pasaporte: false,
        fecha_nacimiento: false,
        sexo: false,
        direccion: false,
        telefono: false,
        correo: false,
        contacto_emergencia_nombre: false,
        contacto_emergencia_telefono: false,
        alergias: false,
        enfermedades_sistemicas: false,
        habitos: false,
      });
    }
    setErrors({});
  }, [initialPatient]);

  /**
   * Validar un campo específico
   * ✅ CORREGIDO: Bloques con llaves en cada case
   */
  const validateField = useCallback((
    name: keyof PatientFormData,
    value: string
  ): string | undefined => {
    switch (name) {
      case 'nombres': {
        if (!value.trim()) return 'Los nombres son requeridos';
        if (value.trim().length < 2) return 'Los nombres deben tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'Los nombres solo pueden contener letras';
        }
        break;
      }

      case 'apellidos': {
        if (!value.trim()) return 'Los apellidos son requeridos';
        if (value.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'Los apellidos solo pueden contener letras';
        }
        break;
      }

      case 'cedula_pasaporte': {
        if (!value.trim()) return 'La cédula/pasaporte es requerida';
        if (!CEDULA_REGEX.test(value) && value.length < 6) {
          return 'Debe tener 10 dígitos (cédula) o al menos 6 caracteres (pasaporte)';
        }
        break;
      }

      case 'fecha_nacimiento': {
        if (!value) return 'La fecha de nacimiento es requerida';
        const fechaNac = new Date(value);
        const hoy = new Date();
        if (fechaNac > hoy) {
          return 'La fecha de nacimiento no puede ser futura';
        }
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        if (edad > 120) {
          return 'La edad no puede ser mayor a 120 años';
        }
        break;
      }

      case 'sexo': {
        if (!value) return 'El sexo es requerido';
        if (!['M', 'F', 'O'].includes(value)) {
          return 'Sexo inválido';
        }
        break;
      }

      case 'direccion': {
        if (!value.trim()) return 'La dirección es requerida';
        if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres';
        break;
      }

      case 'telefono': {
        if (!value.trim()) return 'El teléfono es requerido';
        if (!TELEFONO_REGEX.test(value)) {
          return 'El teléfono debe tener exactamente 10 dígitos';
        }
        break;
      }

      case 'correo': {
        if (!value.trim()) return 'El correo es requerido';
        if (!EMAIL_REGEX.test(value)) {
          return 'El correo no es válido';
        }
        break;
      }

      case 'contacto_emergencia_nombre': {
        if (!value.trim()) return 'El nombre del contacto de emergencia es requerido';
        if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres';
        break;
      }

      case 'contacto_emergencia_telefono': {
        if (!value.trim()) return 'El teléfono del contacto de emergencia es requerido';
        if (!TELEFONO_REGEX.test(value)) {
          return 'El teléfono debe tener exactamente 10 dígitos';
        }
        break;
      }

      case 'alergias':
      case 'enfermedades_sistemicas':
      case 'habitos':
        // Campos opcionales sin validación específica
        break;

      default:
        break;
    }
    return undefined;
  }, []);

  /**
   * Validar todo el formulario
   */
  const validate = useCallback((): boolean => {
    const newErrors: PatientFormErrors = {};

    (Object.keys(formData) as Array<keyof PatientFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  /**
   * Manejar cambios en inputs
   */
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PatientFormData;

    setFormData(prev => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Manejar blur
   */
  const handleBlur = useCallback((fieldName: keyof PatientFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  }, [formData, validateField]);

  /**
   * Manejar cambio de valor directo
   */
  const handleValueChange = useCallback((
    fieldName: keyof PatientFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Resetear formulario
   */
  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({
      nombres: false,
      apellidos: false,
      cedula_pasaporte: false,
      fecha_nacimiento: false,
      sexo: false,
      direccion: false,
      telefono: false,
      correo: false,
      contacto_emergencia_nombre: false,
      contacto_emergencia_telefono: false,
      alergias: false,
      enfermedades_sistemicas: false,
      habitos: false,
    });
  }, []);

  /**
   * Establecer un error específico
   */
  const setFieldError = useCallback((
    fieldName: keyof PatientFormData,
    error: string
  ) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  }, []);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Marcar todos los campos como touched
   */
  const touchAllFields = useCallback(() => {
    setTouched({
      nombres: true,
      apellidos: true,
      cedula_pasaporte: true,
      fecha_nacimiento: true,
      sexo: true,
      direccion: true,
      telefono: true,
      correo: true,
      contacto_emergencia_nombre: true,
      contacto_emergencia_telefono: true,
      alergias: true,
      enfermedades_sistemicas: true,
      habitos: true,
    });
  }, []);

  /**
   * Calcular edad del paciente
   */
  const getEdad = useCallback((): number | null => {
    if (!formData.fecha_nacimiento) return null;
    
    const hoy = new Date();
    const fechaNac = new Date(formData.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth() - fechaNac.getMonth();
    
    if (mesActual < 0 || (mesActual === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  }, [formData.fecha_nacimiento]);

  return {
    formData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleValueChange,
    validate,
    reset,
    setFieldError,
    clearErrors,
    touchAllFields,
    getEdad,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(formData) !== JSON.stringify(initialFormData),
    isEditing: !!initialPatient,
  };
}
