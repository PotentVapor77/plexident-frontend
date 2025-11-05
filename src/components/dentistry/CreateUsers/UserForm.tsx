// components/dentistry/CreateUsers/UserForm.tsx
import { useState } from "react";
import { createUser } from "../../../services/userService";
import { AxiosError } from 'axios';
import { useModal } from "../../../hooks/useModal";
import UserFormFields from "./UserFromFields";
import SuccessModal from "./SuccessModal";
import type { UserFormPageProps, UserFormData } from "../../../types/IUser"; // Cambiar import

// Cambiar el tipo de las props
export default function UserForm({ onUserCreated }: UserFormPageProps) {
  const [formData, setFormData] = useState<UserFormData>({
    status: true,
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    confirmar_contrasena: '',
    rol: 'asistente'
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
    if (!formData.correo.trim()) errors.push('Correo electrónico es obligatorio');
    if (!formData.rol) errors.push('Rol es obligatorio');
    if (!formData.contrasena) errors.push('Contraseña es obligatoria');
    if (!formData.confirmar_contrasena) errors.push('Confirmar contraseña es obligatorio');

    // Validaciones específicas de formato
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.push('El correo electrónico no es válido');
    }

    if (formData.contrasena && formData.contrasena.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      errors.push('Las contraseñas no coinciden');
    }

    if (formData.rol && !['admin', 'odontologo', 'asistente'].includes(formData.rol)) {
      errors.push('El rol seleccionado no es válido');
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      status: true,
      nombres: '',
      apellidos: '',
      correo: '',
      contrasena: '',
      confirmar_contrasena: '',
      rol: 'asistente'
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
      console.log('Datos del usuario a guardar:', formData);

      // Preparar datos para enviar al servicio (sin confirmar_contrasena)
      const userData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim(),
        contrasena: formData.contrasena,
        rol: formData.rol,
        status: formData.status
      };

      // Crear nuevo usuario
      await createUser(userData);

      resetForm();
      setSuccessMessage('Usuario registrado exitosamente');
      openSuccessModal();

      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err: unknown) {
      console.error('Error al guardar usuario:', err);

      if (err instanceof AxiosError && err.response?.data) {
        console.error('Datos de error del servidor:', err.response.data);

        let errorMessage = 'Error al guardar el usuario:\n';

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
        alert('Error de conexión al guardar el usuario');
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
            Registrar Nuevo Usuario
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete todos los campos obligatorios para registrar un nuevo usuario
          </p>
        </div>

        {/* Formulario */}
        <UserFormFields
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