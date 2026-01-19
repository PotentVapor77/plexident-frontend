// src/components/vitalSigns/modals/VitalSignsCreateEditModal.tsx

import { useEffect, useState } from "react";
import { Modal } from "../../../ui/modal";
import type {
  IVitalSigns,
  IVitalSignsCreate,
  IVitalSignsUpdate,
  IPacienteBasico,
} from "../../../../types/vitalSigns/IVitalSigns";
import type { IPaciente } from "../../../../types/patient/IPatient";
import {
  useCreateVitalSigns,
  useUpdateVitalSigns,
} from "../../../../hooks/vitalSigns/useVitalSigns";
import { VitalSignsFormFields } from "../forms/VitalSignsFormFields";

interface VitalSignsCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: IVitalSigns | null;
  vitalId?: string;
  onVitalSaved?: () => void;
  notify?: (message: string, type: "success" | "error") => void;
  pacienteActivo?: IPaciente | null;
}

export function VitalSignsCreateEditModal({
  isOpen,
  onClose,
  mode,
  initialData,
  vitalId,
  onVitalSaved,
  notify,
  pacienteActivo,
}: VitalSignsCreateEditModalProps) {
  const createMutation = useCreateVitalSigns();
  const updateMutation = useUpdateVitalSigns();

  const [formData, setFormData] = useState<IVitalSignsCreate>({
    paciente: pacienteActivo?.id || "",
    fecha_consulta: "",  // ✅ Añadido
    motivo_consulta: "", // ✅ Añadido
    enfermedad_actual: "", // ✅ Añadido
    observaciones: "", // ✅ Añadido
    temperatura: null,
    pulso: null,
    frecuencia_respiratoria: null,
    presion_arterial: "",
  });

  const [activo, setActivo] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPacienteId = (
    paciente: string | IPacienteBasico | undefined
  ): string => {
    if (!paciente) return "";
    if (typeof paciente === "string") return paciente;
    return paciente.id || "";
  };

  // ✅ FIX: Inicializar correctamente los datos en modo edit
  useEffect(() => {
    if (initialData && mode === "edit") {
      console.log("InitialData en modo edit:", initialData); // Para debug
      
      setFormData({
        paciente: getPacienteId(initialData.paciente),
        // ✅ IMPORTANTE: Incluir todos los campos de consulta
        fecha_consulta: initialData.fecha_consulta || "",
        motivo_consulta: initialData.motivo_consulta || "",
        enfermedad_actual: initialData.enfermedad_actual || "",
        observaciones: initialData.observaciones || "",
        // Campos originales
        temperatura: initialData.temperatura ?? null,
        pulso: initialData.pulso ?? null,
        frecuencia_respiratoria: initialData.frecuencia_respiratoria ?? null,
        presion_arterial: initialData.presion_arterial || "",
      });
      setActivo(initialData.activo ?? true);
    } else if (mode === "create") {
      // ✅ Inicializar con fecha de hoy en modo create
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        paciente: pacienteActivo?.id || "",
        fecha_consulta: today,
        motivo_consulta: "",
        enfermedad_actual: "",
        observaciones: "",
        temperatura: null,
        pulso: null,
        frecuencia_respiratoria: null,
        presion_arterial: "",
      });
      setActivo(true);
    }
  }, [initialData, mode, pacienteActivo]);

  // ✅ Actualizar formData cuando cambia pacienteActivo (solo en modo create)
  useEffect(() => {
    if (mode === "create" && pacienteActivo?.id && !initialData) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        paciente: pacienteActivo.id,
        fecha_consulta: today, // ✅ Añadir fecha por defecto
      }));
    }
  }, [pacienteActivo, mode, initialData]);

  if (!isOpen) return null;

  const title =
    mode === "create" ? "Nuevo Registro Médico" : "Editar Registro Médico";
  const subtitle =
    mode === "create"
      ? "Registra una nueva consulta con signos vitales del paciente."
      : "Actualiza la información de la consulta y signos vitales.";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    //  Validar campos de consulta
    if (!formData.fecha_consulta?.trim()) {
      newErrors.fecha_consulta = "La fecha de consulta es obligatoria.";
    }

    if (!formData.motivo_consulta?.trim()) {
      newErrors.motivo_consulta = "El motivo de consulta es obligatorio.";
    }

    if (!formData.paciente.trim()) {
      newErrors.paciente = "El paciente es obligatorio.";
    }

    // Validaciones de constantes vitales (opcionales)
    if (
      formData.temperatura !== null &&
      formData.temperatura !== undefined &&
      (formData.temperatura < 30 || formData.temperatura > 45)
    ) {
      newErrors.temperatura = "Temperatura fuera de rango esperado (30-45°C).";
    }

    if (
      formData.pulso !== null &&
      formData.pulso !== undefined &&
      (formData.pulso < 20 || formData.pulso > 220)
    ) {
      newErrors.pulso = "Pulso fuera de rango esperado (20-220 lpm).";
    }

    if (
      formData.frecuencia_respiratoria !== null &&
      formData.frecuencia_respiratoria !== undefined &&
      (formData.frecuencia_respiratoria < 5 ||
        formData.frecuencia_respiratoria > 60)
    ) {
      newErrors.frecuencia_respiratoria =
        "Frecuencia respiratoria fuera de rango esperado (5-60 rpm).";
    }

    // Validar presión arterial si se proporciona
    if (formData.presion_arterial) {
      const paRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!paRegex.test(formData.presion_arterial)) {
        newErrors.presion_arterial = "Formato inválido. Use: 120/80";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    field: keyof IVitalSignsCreate,
    value: string | number | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as string]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field as string];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log("Errores de validación:", errors); // Para debug
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        // ✅ Incluir todos los campos al crear
        const createData: IVitalSignsCreate = {
          paciente: formData.paciente,
          fecha_consulta: formData.fecha_consulta,
          motivo_consulta: formData.motivo_consulta,
          enfermedad_actual: formData.enfermedad_actual,
          observaciones: formData.observaciones,
          temperatura: formData.temperatura ?? null,
          pulso: formData.pulso ?? null,
          frecuencia_respiratoria: formData.frecuencia_respiratoria ?? null,
          presion_arterial: formData.presion_arterial,
        };
        
        console.log("Enviando datos de creación:", createData); // Para debug
        await createMutation.mutateAsync(createData);
        notify?.("Registro médico creado exitosamente", "success");
      } else if (mode === "edit" && vitalId) {
        // ✅ Incluir todos los campos al actualizar
        const updateData: IVitalSignsUpdate = {
          fecha_consulta: formData.fecha_consulta,
          motivo_consulta: formData.motivo_consulta,
          enfermedad_actual: formData.enfermedad_actual,
          observaciones: formData.observaciones,
          temperatura: formData.temperatura ?? null,
          pulso: formData.pulso ?? null,
          frecuencia_respiratoria: formData.frecuencia_respiratoria ?? null,
          presion_arterial: formData.presion_arterial,
          activo,
        };
        
        console.log("Enviando datos de actualización:", updateData); // Para debug
        await updateMutation.mutateAsync({ id: vitalId, data: updateData });
        notify?.("Registro médico actualizado exitosamente", "success");
      }

      onVitalSaved?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar registro médico:", error);
      notify?.(
        error instanceof Error
          ? error.message
          : "Error al guardar registro médico",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <VitalSignsFormFields
          formData={formData}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
          activo={activo}
          onActivoChange={setActivo}
          pacienteActivo={mode === "create" ? pacienteActivo : undefined}
        />

        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : mode === "create" ? (
              "Registrar Consulta y Signos"
            ) : (
              "Actualizar Registro"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}