// src/components/odontogram/treatmentPlan/ProcedimientosList.tsx

import { Plus, Trash2, Stethoscope } from "lucide-react";
import Button from "../../ui/button/Button";
import type { Procedimiento } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

const STYLES = {
  input: "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all duration-200",
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  card: "rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50",
  cardInner: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800",
  iconButton: "rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-900/20 dark:hover:text-error-400 transition-colors",
  sectionTitle: "text-base font-semibold text-gray-900 dark:text-white",
  sectionDesc: "text-sm text-gray-500 dark:text-gray-400",
};

interface ProcedimientosListProps {
  procedimientos: Procedimiento[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof Procedimiento, value: string | number | boolean) => void;
}

export default function ProcedimientosList({
  procedimientos,
  onAdd,
  onRemove,
  onChange,
}: ProcedimientosListProps) {
  return (
    <section className={STYLES.card}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={STYLES.sectionTitle}>Procedimientos Clínicos</h3>
          <p className={STYLES.sectionDesc}>
            Registre los tratamientos a realizar en esta sesión
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          startIcon={<Plus className="h-4 w-4" />}
        >
          Agregar Procedimiento
        </Button>
      </div>

      {procedimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
          <Stethoscope className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Sin procedimientos
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Agregue procedimientos clínicos usando el botón superior.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {procedimientos.map((proc, index) => (
  <div key={proc.id ?? index} className={STYLES.cardInner}>
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Procedimiento #{index + 1}
        </h4>

        {proc.autogenerado && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            Sugerido
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className={STYLES.iconButton}
        title="Eliminar procedimiento"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    <div className="space-y-4">
      <div>
        <label htmlFor={`proc-desc-${index}`} className={STYLES.label}>
          Descripción
        </label>
        <input
          type="text"
          id={`proc-desc-${index}`}
          value={proc.descripcion}
          onChange={(e) => onChange(index, "descripcion", e.target.value)}
          placeholder="Ej: Profilaxis completa, Resina compuesta..."
          className={STYLES.input}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`proc-diente-${index}`} className={STYLES.label}>
            Diente
          </label>
          <input
            type="text"
            id={`proc-diente-${index}`}
            value={proc.diente || ""}
            onChange={(e) => onChange(index, "diente", e.target.value)}
            placeholder="Ej: 11"
            maxLength={2}
            className={`${STYLES.input} text-center`}
          />
        </div>

        <div>
          <label htmlFor={`proc-superficie-${index}`} className={STYLES.label}>
            Superficie
          </label>
          <input
            type="text"
            id={`proc-superficie-${index}`}
            value={proc.superficie || ""}
            onChange={(e) => onChange(index, "superficie", e.target.value)}
            placeholder="O, M, D"
            className={`${STYLES.input} text-center uppercase`}
          />
        </div>
      </div>
    </div>
  </div>
))}

        </div>
      )}
    </section>
  );
}
