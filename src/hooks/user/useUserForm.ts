/**
 * ============================================================================
 * HOOK: useUserForm
 * ============================================================================
 * - Maneja el estado del formulario de usuario
 * - ✅ SIN ANY: Todos los tipos explícitos
 * - ✅ CORREGIDO: password en lugar de contrasena
 * - ✅ AÑADIDO: Validaciones completas
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { IUser } from '../../types/user/IUser';

export interface UserFormData {
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  password: string;
}

export interface UserFormErrors {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  rol?: string;
  password?: string;
}

const initialFormData: UserFormData = {
  nombres: '',
  apellidos: '',
  telefono: '',
  correo: '',
  rol: 'asistente',
  password: '',
};

export function useUserForm(initialUser?: IUser | null) {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof UserFormData, boolean>>({
    nombres: false,
    apellidos: false,
    telefono: false,
    correo: false,
    rol: false,
    password: false,
  });

  /**
   * Cargar datos del usuario al editar
   */
  useEffect(() => {
    if (initialUser) {
      setFormData({
        nombres: initialUser.nombres,
        apellidos: initialUser.apellidos,
        telefono: initialUser.telefono,
        correo: initialUser.correo,
        rol: initialUser.rol,
        password: '', // No cargar contraseña existente
      });
      // Al editar, marcar todos como touched excepto password
      setTouched({
        nombres: true,
        apellidos: true,
        telefono: true,
        correo: true,
        rol: true,
        password: false,
      });
    } else {
      setFormData(initialFormData);
      setTouched({
        nombres: false,
        apellidos: false,
        telefono: false,
        correo: false,
        rol: false,
        password: false,
      });
    }
    setErrors({});
  }, [initialUser]);

  /**
   * Validar un campo específico
   */
  const validateField = useCallback((name: keyof UserFormData, value: string): string | undefined => {
    switch (name) {
      case 'nombres':
        if (!value.trim()) return 'Los nombres son requeridos';
        if (value.trim().length < 2) return 'Los nombres deben tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Los nombres solo pueden contener letras';
        break;

      case 'apellidos':
        if (!value.trim()) return 'Los apellidos son requeridos';
        if (value.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Los apellidos solo pueden contener letras';
        break;

      case 'telefono':
        if (!value.trim()) return 'El teléfono es requerido';
        if (!/^\d{10}$/.test(value)) return 'El teléfono debe tener exactamente 10 dígitos';
        break;

      case 'correo':
        if (!value.trim()) return 'El correo es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El correo no es válido';
        break;

      case 'password':
        // Solo validar si es usuario nuevo o si se está cambiando la contraseña
        if (!initialUser && !value.trim()) {
          return 'La contraseña es requerida para nuevos usuarios';
        }
        if (value && value.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        break;

      case 'rol':
        if (!value) return 'El rol es requerido';
        if (!['admin', 'odontologo', 'asistente'].includes(value)) {
          return 'Rol inválido';
        }
        break;
    }
    return undefined;
  }, [initialUser]);

  /**
   * Validar todo el formulario
   */
  const validate = useCallback((): boolean => {
    const newErrors: UserFormErrors = {};

    // Validar cada campo
    (Object.keys(formData) as Array<keyof UserFormData>).forEach(key => {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof UserFormData;

    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Validar el campo si ya fue touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Manejar blur (cuando el usuario sale del campo)
   */
  const handleBlur = useCallback((fieldName: keyof UserFormData) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  }, [formData, validateField]);

  /**
   * Manejar cambio de valor directo (para selects personalizados)
   */
  const handleValueChange = useCallback((
    fieldName: keyof UserFormData,
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
      telefono: false,
      correo: false,
      rol: false,
      password: false,
    });
  }, []);

  /**
   * Establecer un error específico (para errores del servidor)
   */
  const setFieldError = useCallback((fieldName: keyof UserFormData, error: string) => {
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
   * Marcar todos los campos como touched (útil al submit)
   */
  const touchAllFields = useCallback(() => {
    setTouched({
      nombres: true,
      apellidos: true,
      telefono: true,
      correo: true,
      rol: true,
      password: true,
    });
  }, []);

  return {
    // Estado
    formData,
    errors,
    touched,
    
    // Acciones
    handleInputChange,
    handleBlur,
    handleValueChange,
    validate,
    reset,
    setFieldError,
    clearErrors,
    touchAllFields,
    
    // Estados derivados
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(formData) !== JSON.stringify(initialFormData),
    isEditing: !!initialUser,
  };
}
