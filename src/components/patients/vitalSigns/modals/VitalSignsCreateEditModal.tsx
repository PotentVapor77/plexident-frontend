// src/components/vitalSigns/modals/VitalSignsCreateEditModal.tsx

import { useEffect, useState } from "react";
import { Modal } from "../../../ui/modal";
import type {
  IVitalSigns,
  IVitalSignsCreate,
  IVitalSignsUpdate,
  IPacienteBasico,
} from "../../../../types/vitalSigns/IVitalSigns";
import type { IPaciente } from "../../../../types/patient/IPatient"; // ✅ AGREGAR
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
  // ✅ AGREGAR: Prop para paciente activo
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
  // ✅ RECIBIR: paciente activo
  pacienteActivo,
}: VitalSignsCreateEditModalProps) {
  const createMutation = useCreateVitalSigns();
  const updateMutation = useUpdateVitalSigns();

  const [formData, setFormData] = useState<IVitalSignsCreate>({
    // ✅ INICIALIZAR con paciente activo si está disponible
    paciente: pacienteActivo?.id || "",
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

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        paciente: getPacienteId(initialData.paciente),
        temperatura: initialData.temperatura ?? null,
        pulso: initialData.pulso ?? null,
        frecuencia_respiratoria: initialData.frecuencia_respiratoria ?? null,
        presion_arterial: initialData.presion_arterial || "",
      });
      setActivo(initialData.activo ?? true);
    } else if (mode === "create") {
      setFormData({
        paciente: pacienteActivo?.id || "",
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
      setFormData(prev => ({
        ...prev,
        paciente: pacienteActivo.id,
      }));
    }
  }, [pacienteActivo, mode, initialData]);

  if (!isOpen) return null;

  const title =
    mode === "create" ? "Registrar signos vitales" : "Editar signos vitales";
  const subtitle =
    mode === "create"
      ? "Registra una nueva toma de signos vitales del paciente."
      : "Actualiza la información de los signos vitales.";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente.trim()) {
      newErrors.paciente = "El paciente es obligatorio.";
    }

    if (
      formData.temperatura !== null &&
      (formData.temperatura! < 30 || formData.temperatura! > 45)
    ) {
      newErrors.temperatura = "Temperatura fuera de rango esperado.";
    }

    if (
      formData.pulso !== null &&
      (formData.pulso! < 20 || formData.pulso! > 220)
    ) {
      newErrors.pulso = "Pulso fuera de rango esperado.";
    }

    if (
      formData.frecuencia_respiratoria !== null &&
      (formData.frecuencia_respiratoria! < 5 ||
        formData.frecuencia_respiratoria! > 60)
    ) {
      newErrors.frecuencia_respiratoria =
        "Frecuencia respiratoria fuera de rango esperado.";
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        notify?.("Signos vitales registrados exitosamente", "success");
      } else if (mode === "edit" && vitalId) {
        const updateData: IVitalSignsUpdate = {
          temperatura: formData.temperatura ?? null,
          pulso: formData.pulso ?? null,
          frecuencia_respiratoria: formData.frecuencia_respiratoria ?? null,
          presion_arterial: formData.presion_arterial,
          activo,
        };
        await updateMutation.mutateAsync({ id: vitalId, data: updateData });
        notify?.("Signos vitales actualizados exitosamente", "success");
      }

      onVitalSaved?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar signos vitales:", error);
      notify?.(
        error instanceof Error
          ? error.message
          : "Error al guardar signos vitales",
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
          // ✅ Pasar paciente activo al formulario
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
              "Registrar signos vitales"
            ) : (
              "Actualizar signos vitales"
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