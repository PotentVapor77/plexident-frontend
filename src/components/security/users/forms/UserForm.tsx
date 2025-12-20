import { useState } from "react";
import { createUser } from "../../../../services/user/userService";
import { AxiosError } from 'axios';
import { useModal } from "../../../../hooks/useModal";
import UserFormFields from "./UserFormFields";
import SuccessModal from "../modals/SuccessModal";
import type { ICreateUserData } from "../../../../types/user/IUser";

export interface UserFormData {
  nombres: string;
  apellidos: string;
  username: string;
  telefono: string;
  correo: string;
  rol: string;
  password: string;
  confirm_password: string;
  activo: boolean;
}

interface UserFormProps {
  onUserCreated?: () => void;
}

export default function UserForm({ onUserCreated }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nombres: '',
    apellidos: '',
    username: '',
    telefono: '',
    correo: '',
    rol: '',
    password: '',
    confirm_password: '',
    activo: true,
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen: isSuccessModalOpen, openModal: openSuccessModal, closeModal: closeSuccessModal } = useModal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.nombres.trim()) errors.push('Los nombres son obligatorios');
    if (!formData.apellidos.trim()) errors.push('Los apellidos son obligatorios');
    if (!formData.username.trim()) errors.push('El nombre de usuario es obligatorio');
    if (!formData.telefono.trim()) errors.push('El teléfono es obligatorio');
    if (!formData.correo.trim()) errors.push('El correo electrónico es obligatorio');
    if (!formData.rol) errors.push('Debe seleccionar un rol');
    if (!formData.password.trim()) errors.push('La contraseña es obligatoria');
    
    if (formData.username.length < 4) {
      errors.push('El nombre de usuario debe tener al menos 4 caracteres');
    }
    
    if (formData.telefono && !/^\d{10,}$/.test(formData.telefono)) {
      errors.push('El teléfono debe tener al menos 10 dígitos numéricos');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      errors.push('El correo electrónico no es válido');
    }
    
    if (formData.password && formData.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (formData.password !== formData.confirm_password) {
      errors.push('Las contraseñas no coinciden');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      username: '',
      telefono: '',
      correo: '',
      rol: '',
      password: '',
      confirm_password: '',
      activo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert('Errores de validación:\n' + validationErrors.join('\n'));
      return;
    }

    setSubmitLoading(true);
    
    try {
      const userData: ICreateUserData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        username: formData.username.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        rol: formData.rol as 'Administrador' | 'Odontologo' | 'Asistente',
        password: formData.password,
        activo: formData.activo,
      };

      console.log('📤 Enviando datos del Usuario:', userData);

      await createUser(userData);

      resetForm();
      setSuccessMessage('✅ Usuario registrado exitosamente');
      openSuccessModal();

      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err: unknown) {
      console.error('❌ Error al guardar usuario:', err);

      if (err instanceof AxiosError && err.response?.data) {
        console.error('📄 Datos de error del servidor:', err.response.data);

        let errorMessage = '❌ Error al guardar el usuario:\n\n';

        if (typeof err.response.data === 'object') {
          if (err.response.data.errors) {
            err.response.data.errors.forEach((error: { field?: string; message: string }) => {
              errorMessage += `• ${error.field || 'Error'}: ${error.message}\n`;
            });
          } else if (err.response.data.detail) {
            errorMessage += err.response.data.detail;
          } else if (err.response.data.non_field_errors) {
            err.response.data.non_field_errors.forEach((error: string) => {
              errorMessage += `• ${error}\n`;
            });
          } else {
            Object.keys(err.response.data).forEach(key => {
              const errorValue = (err.response!.data as Record<string, unknown>)[key];
              if (Array.isArray(errorValue)) {
                errorMessage += `• ${key}: ${errorValue[0]}\n`;
              } else {
                errorMessage += `• ${key}: ${String(errorValue)}\n`;
              }
            });
          }
        } else {
          errorMessage += String(err.response.data);
        }

        alert(errorMessage);
      } else if (err instanceof Error) {
        alert(`❌ Error: ${err.message}`);
      } else {
        alert('❌ Error de conexión al guardar el usuario. Verifique que el servidor esté funcionando.');
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
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Registro de Usuario
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete los datos del nuevo usuario del sistema
          </p>
        </div>

        <UserFormFields
          formData={formData}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
        />
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        onRegisterAnother={handleRegisterAnother}
        message={successMessage}
      />
    </div>
  );
}
