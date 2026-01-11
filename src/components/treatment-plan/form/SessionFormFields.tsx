// src/components/odontogram/treatmentPlan/SessionFormFields.tsx

import { Calendar, Activity, Info, AlertCircle, StickyNote } from "lucide-react";

// ============================================================================
// STYLES & TOKENS
// ============================================================================

const STYLES = {
  input: "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all duration-200",
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  helpText: "mt-1.5 text-xs text-gray-500 dark:text-gray-400",
  section: "space-y-6",
  sectionHeader: "mb-6 flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700",
  sectionTitle: "text-lg font-semibold text-gray-900 dark:text-white",
  infoCard: "rounded-xl border border-blue-light-200 bg-blue-light-50/50 p-4 dark:border-blue-light-500/20 dark:bg-blue-light-500/5",
  warningCard: "rounded-xl border border-warning-200 bg-warning-50/50 p-4 dark:border-warning-500/20 dark:bg-warning-500/5",
};

// ============================================================================
// PROPS
// ============================================================================

interface SessionFormFieldsProps {
  formData: {
    fecha_programada: string;
    estado: string;
    notas: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  mode: "create" | "edit";
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionFormFields({
  formData,
  onChange,
  mode,
  disabled = false,
}: SessionFormFieldsProps) {
  return (
    <div className="space-y-8">
      {/* ======================================================================
          FECHA PROGRAMADA Y ESTADO
      ====================================================================== */}
      <section className={STYLES.section}>
        <div className={STYLES.sectionHeader}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
            <Calendar className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className={STYLES.sectionTitle}>Configuración de la sesión</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Defina cuándo se realizará el tratamiento
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Fecha programada */}
          <div>
            <label htmlFor="fecha_programada" className={STYLES.label}>
              Fecha programada <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="fecha_programada"
                name="fecha_programada"
                value={formData.fecha_programada}
                onChange={onChange}
                disabled={disabled}
                className={`${STYLES.input} pl-10`}
                required
              />
            </div>
            <p className={STYLES.helpText}>
              Fecha en la que se planifica realizar la sesión
            </p>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="estado" className={STYLES.label}>
              Estado de la sesión <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={onChange}
                disabled={disabled}
                className={`${STYLES.input} pl-10`}
              >
                <option value="planificada">Planificada</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <p className={STYLES.helpText}>
              Estado actual del tratamiento programado
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* ======================================================================
          NOTAS DE LA SESIÓN
      ====================================================================== */}
      <section className={STYLES.section}>
        <div className={STYLES.sectionHeader}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <StickyNote className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className={STYLES.sectionTitle}>Notas de la sesión</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Observaciones y comentarios adicionales
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="notas" className={STYLES.label}>
            Observaciones clínicas
          </label>
          <textarea
            id="notas"
            name="notas"
            value={formData.notas}
            onChange={onChange}
            disabled={disabled}
            rows={4}
            placeholder="Agregue información relevante sobre el tratamiento, precauciones especiales, reacciones del paciente..."
            className={`${STYLES.input} resize-y`}
          />
          <p className={STYLES.helpText}>
            Máximo 500 caracteres · Visibles en el historial clínico
          </p>
        </div>
      </section>

      {/* ======================================================================
          INFORMACIÓN ADICIONAL
      ====================================================================== */}
      <div className={STYLES.infoCard}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-light-600 dark:text-blue-light-400" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              Información importante
            </p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-light-500" />
                <span>La fecha programada puede modificarse antes de completar la sesión</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-light-500" />
                <span>Las sesiones completadas quedan protegidas contra ediciones accidentales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-light-500" />
                <span>Las notas son visibles para todo el equipo médico</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mensaje adicional solo en modo crear */}
      {mode === "create" && (
        <div className={STYLES.warningCard}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">
                Próximos pasos
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                No olvide agregar los procedimientos y prescripciones necesarios para esta sesión
                en las secciones siguientes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
