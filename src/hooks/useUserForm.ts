// hooks/useUserForm.ts - CORREGIDO
import { useState } from 'react';
import type { IUser } from '../types/IUser';

export interface UserFormData {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmar_contrasena: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  status: boolean;
}

export function useUserForm(initialUser: IUser | null = null) {
  const [formData, setFormData] = useState<UserFormData>({
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    confirmar_contrasena: '',
    rol: 'asistente',
    status: true
  });

  const [selectedUser, setSelectedUser] = useState<IUser | null>(initialUser);

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      correo: '',
      contrasena: '',
      confirmar_contrasena: '',
      rol: 'asistente',
      status: true
    });
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateFormData = (isEditing: boolean = false): string[] => {
    const errors: string[] = [];

    if (!formData.nombres.trim()) errors.push('Nombres es obligatorio');
    if (!formData.apellidos.trim()) errors.push('Apellidos es obligatorio');
    if (!formData.correo.trim()) errors.push('Correo electrónico es obligatorio');
    if (!formData.rol) errors.push('Rol es obligatorio');

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.push('El correo electrónico no tiene un formato válido');
    }

    if (!isEditing) {
      if (!formData.contrasena) {
        errors.push('La contraseña es obligatoria para nuevos usuarios');
      } else if (formData.contrasena.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
    } else {
      if (formData.contrasena && formData.contrasena.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      errors.push('Las contraseñas no coinciden');
    }

    return errors;
  };

  const prepareUserData = (isEditing: boolean = false) => {
    const userData: any = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      correo: formData.correo.trim(),
      rol: formData.rol,
      status: formData.status
    };

    // ✅ CORREGIDO: Enviar 'contrasena' en texto plano (el backend la hashea)
    if (!isEditing || formData.contrasena) {
      userData.contrasena = formData.contrasena; // NO contrasena_hash
    }

    console.log('🔄 Prepared user data:', {
      ...userData,
      contrasena: userData.contrasena ? '***' : undefined
    });
    return userData;
  };

  const loadUserData = (user: IUser) => {
    setSelectedUser(user);
    setFormData({
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      contrasena: '',
      confirmar_contrasena: '',
      rol: user.rol || 'asistente',
      status: user.status ?? true
    });
  };

  return {
    formData,
    selectedUser,
    setSelectedUser,
    resetForm,
    handleInputChange,
    validateFormData,
    prepareUserData,
    loadUserData
  };
}