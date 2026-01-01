// src/components/familyBackground/forms/FamilyBackgroundForm.tsx

import { useState, useEffect } from "react";
import { FamilyBackgroundFormFields } from "./FamilyBackgroundFormFields";
import type {
  IFamilyBackground,
  IFamilyBackgroundCreate,
  IFamilyBackgroundUpdate,
} from "../../../../types/familyBackground/IFamilyBackground";

interface FamilyBackgroundFormProps {
  mode: "create" | "edit";
  initialData?: IFamilyBackground | null;
  onSubmit: (data: IFamilyBackgroundCreate | IFamilyBackgroundUpdate) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FamilyBackgroundForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FamilyBackgroundFormProps) {
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

  // Helper para obtener paciente ID
  const getPacienteId = (paciente: any): string => {
    if (!paciente) return "";
    if (typeof paciente === "string") return paciente;
    return paciente.id || "";
  };

  // Cargar datos iniciales
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
      // Reset para create
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paciente.trim()) {
      newErrors.paciente = "El ID del paciente es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof IFamilyBackgroundCreate, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (mode === "create") {
        await onSubmit(formData);
      } else {
        // En modo edit, excluir el campo paciente
        const { paciente, ...updateData } = formData;
        await onSubmit(updateData as IFamilyBackgroundUpdate);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FamilyBackgroundFormFields
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
        mode={mode}
        activo={activo}
        onActivoChange={mode === "edit" ? setActivo : undefined}
      />

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
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
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Crear Antecedentes
            </>
          ) : (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Actualizar Antecedentes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
