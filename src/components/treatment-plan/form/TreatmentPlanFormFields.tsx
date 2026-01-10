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
      {/* ======================================================================
          TÍTULO DEL PLAN
      ====================================================================== */}
      <div>
        <label
          htmlFor="titulo"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Título del plan *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={onChange}
          disabled={disabled}
          required
          placeholder="Ej: Plan de rehabilitación oral completa"
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nombre descriptivo que identifique el plan de tratamiento
        </p>
      </div>

      {/* ======================================================================
          NOTAS GENERALES
      ====================================================================== */}
      <div>
        <label
          htmlFor="notas_generales"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          <ClipboardList className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Notas generales
        </label>
        <textarea
          id="notas_generales"
          name="notas_generales"
          value={formData.notas_generales}
          onChange={onChange}
          disabled={disabled}
          rows={5}
          placeholder="Observaciones, objetivos del tratamiento, consideraciones especiales, antecedentes relevantes..."
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Información adicional sobre el plan de tratamiento
        </p>
      </div>

      {/* ======================================================================
          USAR ÚLTIMO ODONTOGRAMA (Solo en modo crear)
      ====================================================================== */}
      {mode === "create" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="usar_ultimo_odontograma"
              name="usar_ultimo_odontograma"
              checked={formData.usar_ultimo_odontograma}
              onChange={onCheckboxChange}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <label
                htmlFor="usar_ultimo_odontograma"
                className="block text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer"
              >
                Usar último odontograma registrado
              </label>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Se vinculará automáticamente el odontograma más reciente del paciente. 
                Esto permite que las sesiones de tratamiento puedan autocompletar diagnósticos 
                desde ese odontograma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          INFORMACIÓN ADICIONAL
      ====================================================================== */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Información importante
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
            <span>
              El título del plan debe ser descriptivo y permitir identificar fácilmente 
              el tipo de tratamiento
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
            <span>
              Las notas generales son visibles para todo el equipo médico
            </span>
          </li>
          {mode === "create" && (
            <li className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
              <span>
                Si activa la vinculación con el odontograma, las sesiones podrán 
                autocompletar los diagnósticos disponibles
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
