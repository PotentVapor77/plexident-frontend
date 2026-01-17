// src/components/odontogram/treatmentPlan/TreatmentPlanFormFields.tsx

import { FileText, Calendar, User, ClipboardList } from "lucide-react";

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanFormFieldsProps {
  formData: {
    titulo: string;
    notas_generales: string;
    usar_ultimo_odontograma: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: "create" | "edit";
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanFormFields({
  formData,
  onChange,
  onCheckboxChange,
  mode,
  disabled = false,
}: TreatmentPlanFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* BLOQUE: Datos principales del plan */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-6 space-y-4">
        {/* Título del plan */}
        <div className="space-y-1">
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Título del plan <span className="text-red-500">*</span>
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={formData.titulo}
            onChange={onChange}
            disabled={disabled}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
            placeholder="Nombre descriptivo que identifique el plan de tratamiento"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nombre descriptivo que identifique el plan de tratamiento.
          </p>
        </div>

        {/* Notas generales */}
        <div className="space-y-1">
          <label
            htmlFor="notas_generales"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Notas generales
          </label>
          <textarea
            id="notas_generales"
            name="notas_generales"
            rows={4}
            value={formData.notas_generales}
            onChange={onChange}
            disabled={disabled}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
            placeholder="Información adicional sobre el plan de tratamiento"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Información adicional sobre el plan de tratamiento.
          </p>
        </div>
      </div>

      {/* BLOQUE: Uso de último odontograma (solo crear) */}
      {mode === "create" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <input
              id="usar_ultimo_odontograma"
              type="checkbox"
              name="usar_ultimo_odontograma"
              checked={formData.usar_ultimo_odontograma}
              onChange={onCheckboxChange}
              disabled={disabled}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-60"
            />
            <div>
              <label
                htmlFor="usar_ultimo_odontograma"
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Usar último odontograma registrado
              </label>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Se vinculará automáticamente el odontograma más reciente del paciente.
                Esto permite que las sesiones de tratamiento puedan autocompletar diagnósticos
                desde ese odontograma.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}