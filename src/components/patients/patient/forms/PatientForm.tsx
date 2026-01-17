// src/components/patients/forms/PatientForm.tsx

import { useState, useEffect } from "react"; // ✅ Agregar useEffect
import { AxiosError } from "axios";
import { useModal } from "../../../../hooks/useModal";
import { useCreatePaciente, useUpdatePaciente } from "../../../../hooks/patient/usePatients";
import type { CondicionEdad, Embarazada, IPacienteCreate, IPacienteError, IPacienteUpdate, Sexo } from "../../../../types/patient/IPatient";
import PatientFormFields from "./PatientFormFields";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import { SuccessModal } from "../modals/SuccessModal";

export interface PatientFormData {
  nombres: string;
  apellidos: string;
  sexo: Sexo | "";
  edad: number;
  condicion_edad: CondicionEdad | "";
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  telefono: string;
  correo: string;
  direccion: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  embarazada?: Embarazada;
  activo: boolean;
}

interface PatientFormProps {
  onPatientCreated?: () => void;
  mode?: "create" | "edit";
  initialData?: Partial<PatientFormData>;
  patientId?: string;
  notify: ReturnType<typeof useNotification>["notify"]; 
}

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export default function PatientForm({
  onPatientCreated,
  mode = "create",
  initialData,
  patientId,
  notify, 
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nombres: initialData?.nombres ?? "",
    apellidos: initialData?.apellidos ?? "",
    sexo: initialData?.sexo ?? "",
    edad: initialData?.edad ?? 0,
    condicion_edad: initialData?.condicion_edad ?? "",
    cedula_pasaporte: initialData?.cedula_pasaporte ?? "",
    fecha_nacimiento: initialData?.fecha_nacimiento ?? "",
    fecha_ingreso: initialData?.fecha_ingreso ?? "",
    telefono: initialData?.telefono ?? "",
    correo: initialData?.correo ?? "",
    direccion: initialData?.direccion ?? "",
    contacto_emergencia_nombre: initialData?.contacto_emergencia_nombre ?? "",
    contacto_emergencia_telefono: initialData?.contacto_emergencia_telefono ?? "",
    embarazada: initialData?.embarazada,
    activo: initialData?.activo ?? true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  const createPaciente = useCreatePaciente();
  const updatePaciente = useUpdatePaciente();

  // ✅ ESTABLECER FECHA_INGRESO AUTOMÁTICAMENTE EN MODO CREATE
  useEffect(() => {
    if (mode === 'create' && !formData.fecha_ingreso) {
      setFormData(prev => ({
        ...prev,
        fecha_ingreso: new Date().toISOString().split('T')[0]
      }));
    }
  }, [mode, formData.fecha_ingreso]);

  const handleInputChange = (
    e: React.ChangeEvent<InputElement>
  ): void => {
    const target = e.target;
    const { name, value } = target;

    // Si cambia el sexo a Masculino, limpiar embarazada
    if (name === "sexo" && value === "M") {
      setFormData((prev) => ({
        ...prev,
        sexo: value as Sexo,
        embarazada: undefined,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.nombres.trim()) errors.push("Los nombres son obligatorios");
    if (!formData.apellidos.trim()) errors.push("Los apellidos son obligatorios");
    if (!formData.sexo) errors.push("Debe seleccionar el sexo");
    if (!formData.edad || formData.edad <= 0) errors.push("La edad debe ser mayor a 0");
    if (!formData.condicion_edad) errors.push("Debe seleccionar la condición de edad");
    if (!formData.cedula_pasaporte.trim()) errors.push("La cédula es obligatoria");
    if (!formData.fecha_nacimiento) errors.push("La fecha de nacimiento es obligatoria");
    if (!formData.fecha_ingreso) errors.push("La fecha de ingreso es obligatoria");
    if (!formData.telefono.trim()) errors.push("El teléfono es obligatorio");
    if (!formData.direccion.trim()) errors.push("La dirección es obligatoria");

    if (formData.sexo === "M" && formData.embarazada === "SI") {
      errors.push("Un paciente masculino no puede estar embarazado");
    }

    if (formData.sexo === "F" && !formData.embarazada) {
      errors.push("Debe indicar si la paciente está embarazada");
    }

    if (formData.telefono && !/^\d{10,}$/.test(formData.telefono)) {
      errors.push("El teléfono debe tener al menos 10 dígitos numéricos");
    }

    if (formData.cedula_pasaporte && formData.cedula_pasaporte.length < 10) {
      errors.push("La cédula/pasaporte debe tener al menos 10 caracteres");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      errors.push("El correo electrónico no es válido");
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      sexo: "",
      edad: 0,
      condicion_edad: "",
      cedula_pasaporte: "",
      fecha_nacimiento: "",
      fecha_ingreso: new Date().toISOString().split('T')[0], // ✅ Restablecer con fecha actual
      telefono: "",
      correo: "",
      direccion: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
      embarazada: undefined,
      activo: true,
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
        sexo: formData.sexo as Sexo,
        edad: formData.edad,
        condicion_edad: formData.condicion_edad as CondicionEdad,
        cedula_pasaporte: formData.cedula_pasaporte.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        fecha_ingreso: formData.fecha_ingreso,
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        contacto_emergencia_nombre: formData.contacto_emergencia_nombre.trim() || undefined,
        contacto_emergencia_telefono: formData.contacto_emergencia_telefono.trim() || undefined,
        embarazada: formData.embarazada,
        activo: formData.activo,
      };

      if (mode === "create") {
        const pacienteData: IPacienteCreate = baseData;
        await createPaciente.mutateAsync(pacienteData);
        
        notify({
          type: "success",
          title: "Paciente creado",
          message: "Se creó el paciente correctamente.",
        });
      } else {
        if (!patientId) throw new Error("Falta el id de paciente para editar");
        const pacienteData: IPacienteUpdate = baseData;
        await updatePaciente.mutateAsync({ id: patientId, data: pacienteData });
        
        notify({
          type: "warning",
          title: "Paciente actualizado",
          message: "Se actualizó el paciente correctamente.",
        });
      }

      resetForm();
      openSuccessModal();
      onPatientCreated?.();
      
    } catch (err: unknown) {
      let errorMessage = "❌ Error al guardar el paciente";

      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as IPacienteError;
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
      <form onSubmit={handleSubmit} className="flex flex-col">
        <PatientFormFields
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
        message={
          mode === "create"
            ? "¡Paciente registrado exitosamente!"
            : "¡Paciente actualizado exitosamente!"
        }
      />
    </>
  );
}
