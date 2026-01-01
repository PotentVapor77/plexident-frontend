// src/components/familyBackground/modals/FamilyBackgroundCreateEditModal.tsx

import { useState, useEffect } from "react";
import { Modal } from "../../../ui/modal";
import type {
  IFamilyBackground,
  IFamilyBackgroundCreate,
  IFamilyBackgroundUpdate,
} from "../../../../types/familyBackground/IFamilyBackground";
import {
  useCreateFamilyBackground,
  useUpdateFamilyBackground,
} from "../../../../hooks/familyBackground/useFamilyBackgrounds";
import { FamilyBackgroundFormFields } from "../forms/FamilyBackgroundFormFields";
import type { IPacienteBasico } from "../../../../types/personalBackground/IPersonalBackground";

interface FamilyBackgroundCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: IFamilyBackground | null;
  backgroundId?: string;
  onBackgroundCreated?: () => void;
  notify?: (message: string, type: "success" | "error") => void;
}

export function FamilyBackgroundCreateEditModal({
  isOpen,
  onClose,
  mode,
  initialData,
  backgroundId,
  onBackgroundCreated,
  notify,
}: FamilyBackgroundCreateEditModalProps) {
  const createMutation = useCreateFamilyBackground();
  const updateMutation = useUpdateFamilyBackground();

  const [formData, setFormData] = useState<IFamilyBackgroundCreate>({
    paciente: "",
    cardiopatia_familiar: "NO",
    hipertension_arterial_familiar: "NO",
    enfermedad_vascular_familiar: "NO",
    cancer_familiar: "NO",
    enfermedad_mental_familiar: "NO",
    endocrino_metabolico_familiar: false,
    tuberculosis_familiar: false,
    enfermedad_infecciosa_familiar: false,
    malformacion_familiar: false,
    otros_antecedentes_familiares: "",
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
        cardiopatia_familiar: initialData.cardiopatia_familiar || "NO",
        hipertension_arterial_familiar: initialData.hipertension_arterial_familiar || "NO",
        enfermedad_vascular_familiar: initialData.enfermedad_vascular_familiar || "NO",
        cancer_familiar: initialData.cancer_familiar || "NO",
        enfermedad_mental_familiar: initialData.enfermedad_mental_familiar || "NO",
        otros_antecedentes_familiares: initialData.otros_antecedentes_familiares || "",
      });
      setActivo(initialData.activo ?? true);
    } else if (mode === "create") {
      // Reset form para create
      setFormData({
        paciente: "",
        cardiopatia_familiar: "NO",
        hipertension_arterial_familiar: "NO",
        enfermedad_vascular_familiar: "NO",
        cancer_familiar: "NO",
        enfermedad_mental_familiar: "NO",
        endocrino_metabolico_familiar: false,
        tuberculosis_familiar: false,
        enfermedad_infecciosa_familiar: false,
        malformacion_familiar: false,
        otros_antecedentes_familiares: "",
      });
      setActivo(true);
    }
  }, [initialData, mode]);

  if (!isOpen) return null;

  const title = mode === "create"
    ? "Crear Antecedentes Familiares"
    : "Editar Antecedentes Familiares";

  const subtitle = mode === "create"
    ? "Registra los antecedentes patológicos familiares del paciente"
    : "Actualiza la información de antecedentes familiares";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente.trim()) {
      newErrors.paciente = "El ID del paciente es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof IFamilyBackgroundCreate, value: string | boolean) => {
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
        notify?.("Antecedentes familiares creados exitosamente", "success");
      } else if (mode === "edit" && backgroundId) {
        const updateData: IFamilyBackgroundUpdate = {
          cardiopatia_familiar: formData.cardiopatia_familiar,
          hipertension_arterial_familiar: formData.hipertension_arterial_familiar,
          enfermedad_vascular_familiar: formData.enfermedad_vascular_familiar,
          cancer_familiar: formData.cancer_familiar,
          enfermedad_mental_familiar: formData.enfermedad_mental_familiar,
          endocrino_metabolico_familiar: formData.endocrino_metabolico_familiar,
          tuberculosis_familiar: formData.tuberculosis_familiar,
          enfermedad_infecciosa_familiar: formData.enfermedad_infecciosa_familiar,
          malformacion_familiar: formData.malformacion_familiar,
          otros_antecedentes_familiares: formData.otros_antecedentes_familiares,
        };

        await updateMutation.mutateAsync({
          id: backgroundId,
          data: updateData,
        });
        notify?.("Antecedentes familiares actualizados exitosamente", "success");
      }

      onBackgroundCreated?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar antecedentes familiares:", error);
      notify?.(
        error instanceof Error ? error.message : "Error al guardar antecedentes",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl" >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
        <FamilyBackgroundFormFields
          formData={formData}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
          activo={activo}
          onActivoChange={setActivo}
        />
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Guardando...
            </>
          ) : mode === "create" ? (
            "Crear Antecedentes"
          ) : (
            "Actualizar Antecedentes"
          )}
        </button>
      </div>
    </Modal>
  );
}
