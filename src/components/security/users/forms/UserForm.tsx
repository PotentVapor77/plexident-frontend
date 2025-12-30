// src/components/users/forms/UserForm.tsx
import React, { useState } from "react";
import { AxiosError } from "axios";
import { useModal } from "../../../../hooks/useModal";
import UserFormFields from "./UserFormFields";
import SuccessModal from "../modals/SuccessModal";
import type {
  ICreateUserData,
  IUpdateUserData,
  IUserError,
} from "../../../../types/user/IUser";
import { generateUsername } from "../../../../utils/usernameGenerator";
import { useCreateUser, useUpdateUser } from "../../../../hooks/user/useUsers";
import { useNotification } from "../../../../context/notifications/NotificationContext";

export interface UserFormData {
  nombres: string;
  apellidos: string;
  username: string;
  telefono: string;
  correo: string;
  rol: string;
  password: string;
  confirm_password: string;
  is_active: boolean;
}

interface UserFormProps {
  onUserCreated?: () => void;
  mode?: "create" | "edit";
  initialData?: Partial<UserFormData>;
  userId?: string;
  notify: ReturnType<typeof useNotification>["notify"]; // ✅ Nueva prop obligatoria
}

type InputElement = HTMLInputElement | HTMLSelectElement;

export default function UserForm({
  onUserCreated,
  mode = "create",
  initialData,
  userId,
  notify, // ✅ Recibir notify
}: UserFormProps) {
  const [formData, setFormData] = useState({
    nombres: initialData?.nombres ?? "",
    apellidos: initialData?.apellidos ?? "",
    username: initialData?.username ?? "",
    telefono: initialData?.telefono ?? "",
    correo: initialData?.correo ?? "",
    rol: initialData?.rol ?? "",
    password: "",
    confirm_password: "",
    is_active: initialData?.is_active ?? true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleInputChange = (
    e: React.ChangeEvent<InputElement>
  ): void => {
    const target = e.target;
    const { name, value, type } = target;

    setFormData((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: (target as HTMLInputElement).checked };
      }

      const nextFormData: UserFormData = { ...prev, [name]: value };

      if (mode === "create" && (name === "nombres" || name === "apellidos")) {
        const nuevoUsername = generateUsername(
          name === "nombres" ? value : prev.nombres,
          name === "apellidos" ? value : prev.apellidos
        );
        return { ...nextFormData, username: nuevoUsername };
      }

      return nextFormData;
    });
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.nombres.trim()) errors.push("Los nombres son obligatorios");
    if (!formData.apellidos.trim())
      errors.push("Los apellidos son obligatorios");
    if (!formData.username.trim())
      errors.push("El nombre de usuario es obligatorio");
    if (!formData.telefono.trim())
      errors.push("El teléfono es obligatorio");
    if (!formData.correo.trim())
      errors.push("El correo electrónico es obligatorio");
    if (!formData.rol) errors.push("Debe seleccionar un rol");

    if (mode === "create") {
      if (!formData.password.trim())
        errors.push("La contraseña es obligatoria");
      if (formData.password.length < 8)
        errors.push("La contraseña debe tener al menos 8 caracteres");
      if (formData.password !== formData.confirm_password)
        errors.push("Las contraseñas no coinciden");
    }

    if (formData.username.length < 4)
      errors.push("El nombre de usuario debe tener al menos 4 caracteres");
    if (formData.telefono && !/^\d{10,}$/.test(formData.telefono)) {
      errors.push("El teléfono debe tener al menos 10 dígitos numéricos");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo))
      errors.push("El correo electrónico no es válido");

    return errors;
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      username: "",
      telefono: "",
      correo: "",
      rol: "",
      password: "",
      confirm_password: "",
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert("Errores de validación:\n" + validationErrors.join("\n"));
      return;
    }

    setSubmitLoading(true);

    try {
      const baseData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        username: formData.username.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        rol: formData.rol as ICreateUserData["rol"],
        is_active: formData.is_active,
      };

      if (mode === "create") {
        const userData: ICreateUserData = {
          ...baseData,
          password: formData.password,
        };
        await createUser.mutateAsync(userData);
        
        // ✅ Notificar SOLO después de crear exitosamente
        notify({
          type: "success",
          title: "Usuario creado",
          message: "Se creó el usuario correctamente.",
        });
      } else {
        if (!userId) throw new Error("Falta el id de usuario para editar");
        const userData: IUpdateUserData = baseData;
        await updateUser.mutateAsync({ id: userId, data: userData });
        
        // ✅ Notificar SOLO después de editar exitosamente
        notify({
          type: "warning",
          title: "Usuario actualizado",
          message: "Se actualizó el usuario correctamente.",
        });
      }

      resetForm();
      openSuccessModal();
      onUserCreated?.(); // Ejecutar callback DESPUÉS de éxito
      
    } catch (err: unknown) {
      // ❌ NO notificar en caso de error, solo mostrar mensaje específico
      let errorMessage = "❌ Error al guardar el usuario";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as IUserError;
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    closeSuccessModal();
    resetForm();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <UserFormFields
          formData={formData}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
          mode={mode}
        />
      </form>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        message={mode === "create" ? "Usuario creado correctamente" : "Usuario actualizado correctamente"}
      />
    </>
  );
}
