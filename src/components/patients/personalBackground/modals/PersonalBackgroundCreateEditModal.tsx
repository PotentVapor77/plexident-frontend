// src/components/personalBackground/modals/PersonalBackgroundCreateEditModal.tsx

import { useState, useEffect } from "react";
import { Modal } from "../../../ui/modal";
import type {
  IPacienteBasico,
  IPersonalBackground,
  IPersonalBackgroundCreate,
  IPersonalBackgroundUpdate
} from "../../../../types/personalBackground/IPersonalBackground";
import {
  useCreatePersonalBackground,
  useUpdatePersonalBackground
} from "../../../../hooks/personalBackground/usePersonalBackgrounds";
import { PersonalBackgroundFormFields } from "../forms/PersonalBackgroundFormFields";

interface PersonalBackgroundCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: IPersonalBackground | null;
  backgroundId?: string;
  onBackgroundCreated?: () => void;
  notify?: (message: string, type: "success" | "error") => void;
}

export function PersonalBackgroundCreateEditModal({
  isOpen,
  onClose,
  mode,
  initialData,
  backgroundId,
  onBackgroundCreated,
  notify,
}: PersonalBackgroundCreateEditModalProps) {
  const createMutation = useCreatePersonalBackground();
  const updateMutation = useUpdatePersonalBackground();

  const [formData, setFormData] = useState<IPersonalBackgroundCreate>({
    paciente: "",
    alergia_antibiotico: "NO",
    alergia_antibiotico_otro: "", // ✅ NUEVO
    alergia_anestesia: "NO",
    alergia_anestesia_otro: "", // ✅ NUEVO
    hemorragias: "NO",
    vih_sida: "NEGATIVO",
    tuberculosis: "NUNCA",
    asma: "NO",
    diabetes: "NO",
    diabetes_otro: "", // ✅ NUEVO
    hipertension_arterial: "NO",
    enfermedad_cardiaca: "NO",
    enfermedad_cardiaca_otro: "", // ✅ NUEVO
    // ❌ ELIMINADO: otros_antecedentes_personales
  });

  const [activo, setActivo] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejo seguro de IPacienteBasico | string
  const getPacienteId = (paciente: string | IPacienteBasico | undefined): string => {
    if (!paciente) return "";
    if (typeof paciente === "string") return paciente;
    return paciente.id || "";
  };

  // Cargar datos iniciales en modo edit
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        paciente: getPacienteId(initialData.paciente),
        alergia_antibiotico: initialData.alergia_antibiotico || "NO",
        alergia_antibiotico_otro: initialData.alergia_antibiotico_otro || "", // ✅ NUEVO
        alergia_anestesia: initialData.alergia_anestesia || "NO",
        alergia_anestesia_otro: initialData.alergia_anestesia_otro || "", // ✅ NUEVO
        hemorragias: initialData.hemorragias || "NO",
        vih_sida: initialData.vih_sida || "NEGATIVO",
        tuberculosis: initialData.tuberculosis || "NUNCA",
        asma: initialData.asma || "NO",
        diabetes: initialData.diabetes || "NO",
        diabetes_otro: initialData.diabetes_otro || "", // ✅ NUEVO
        hipertension_arterial: initialData.hipertension_arterial || "NO",
        enfermedad_cardiaca: initialData.enfermedad_cardiaca || "NO",
        enfermedad_cardiaca_otro: initialData.enfermedad_cardiaca_otro || "", // ✅ NUEVO
        // ❌ ELIMINADO: otros_antecedentes_personales
      });
      setActivo(initialData.activo ?? true);
    } else if (mode === "create") {
      // Reset form para create
      setFormData({
        paciente: "",
        alergia_antibiotico: "NO",
        alergia_antibiotico_otro: "",
        alergia_anestesia: "NO",
        alergia_anestesia_otro: "",
        hemorragias: "NO",
        vih_sida: "NEGATIVO",
        tuberculosis: "NUNCA",
        asma: "NO",
        diabetes: "NO",
        diabetes_otro: "",
        hipertension_arterial: "NO",
        enfermedad_cardiaca: "NO",
        enfermedad_cardiaca_otro: "",
      });
      setActivo(true);
    }
  }, [initialData, mode]);

  if (!isOpen) return null;

  const title = mode === "create"
    ? "Crear Antecedentes Personales"
    : "Editar Antecedentes Personales";

  const subtitle = mode === "create"
    ? "Registra los antecedentes patológicos del paciente"
    : "Actualiza la información de antecedentes";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente.trim()) {
      newErrors.paciente = "El ID del paciente es obligatorio";
    }

    // Validar campos OTRO si están seleccionados
    if (formData.alergia_antibiotico === "OTRO" && !formData.alergia_antibiotico_otro?.trim()) {
      newErrors.alergia_antibiotico_otro = "Debe especificar el tipo de antibiótico";
    }

    if (formData.alergia_anestesia === "OTRO" && !formData.alergia_anestesia_otro?.trim()) {
      newErrors.alergia_anestesia_otro = "Debe especificar el tipo de anestesia";
    }

    if (formData.enfermedad_cardiaca === "OTRA" && !formData.enfermedad_cardiaca_otro?.trim()) {
      newErrors.enfermedad_cardiaca_otro = "Debe especificar la enfermedad cardíaca";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof IPersonalBackgroundCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        notify?.("Antecedentes creados exitosamente", "success");
      } else if (mode === "edit" && backgroundId) {
        const updateData: IPersonalBackgroundUpdate = {
          alergia_antibiotico: formData.alergia_antibiotico,
          alergia_antibiotico_otro: formData.alergia_antibiotico_otro, // ✅ NUEVO
          alergia_anestesia: formData.alergia_anestesia,
          alergia_anestesia_otro: formData.alergia_anestesia_otro, // ✅ NUEVO
          hemorragias: formData.hemorragias,
          vih_sida: formData.vih_sida,
          tuberculosis: formData.tuberculosis,
          asma: formData.asma,
          diabetes: formData.diabetes,
          diabetes_otro: formData.diabetes_otro, // ✅ NUEVO
          hipertension_arterial: formData.hipertension_arterial,
          enfermedad_cardiaca: formData.enfermedad_cardiaca,
          enfermedad_cardiaca_otro: formData.enfermedad_cardiaca_otro, // ✅ NUEVO
          activo: activo,
          // ❌ ELIMINADO: otros_antecedentes_personales
        };

        await updateMutation.mutateAsync({
          id: backgroundId,
          data: updateData
        });
        notify?.("Antecedentes actualizados exitosamente", "success");
      }

      onBackgroundCreated?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar antecedentes:", error);
      notify?.(
        error instanceof Error ? error.message : "Error al guardar antecedentes",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
        </div>

        <PersonalBackgroundFormFields
          formData={formData}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
          activo={activo}
          onActivoChange={setActivo}
        />

        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : mode === "create" ? (
              "Crear Antecedentes"
            ) : (
              "Actualizar Antecedentes"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
