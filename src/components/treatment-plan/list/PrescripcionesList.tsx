// src/components/odontogram/treatmentPlan/PrescripcionesList.tsx

import { Plus, Trash2, Pill } from "lucide-react";
import Button from "../../ui/button/Button";
import type { Prescripcion } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

const STYLES = {
    input: "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all duration-200",
    label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
    card: "rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50",
    cardInner: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800",
    iconButton: "rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-900/20 dark:hover:text-error-400 transition-colors",
    sectionTitle: "text-base font-semibold text-gray-900 dark:text-white",
    sectionDesc: "text-sm text-gray-500 dark:text-gray-400",
};

interface PrescripcionesListProps {
    prescripciones: Prescripcion[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof Prescripcion, value: string) => void;
}

export default function PrescripcionesList({
  prescripciones,
  onAdd,
  onRemove,
  onChange,
}: PrescripcionesListProps) {
  return (
    <div className={STYLES.card}>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={STYLES.sectionTitle}>
            <span className="mr-2 inline-flex items-center text-brand-500">
              <Pill className="h-5 w-5" />
            </span>
            Prescripciones y Recetas
          </h3>
          <p className={STYLES.sectionDesc}>
            Medicación recetada durante la sesión
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          startIcon={<Plus className="h-4 w-4" />}
        >
          Agregar Medicamento
        </Button>
      </div>

      {prescripciones.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 p-4 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-600">Sin prescripciones</p>
          <p className="text-xs text-gray-500">
            No se han registrado medicamentos para esta sesión.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescripciones.map((presc, index) => (
            <div key={presc.id ?? index} className={STYLES.cardInner}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  Medicamento #{index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className={STYLES.iconButton}
                  title="Eliminar prescripción"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={STYLES.label}>Medicamento</label>
                  <input
                    type="text"
                    value={presc.medicamento ?? ""}
                    onChange={(e) => onChange(index, "medicamento", e.target.value)}
                    placeholder="Nombre del medicamento (Genérico / Comercial)"
                    className={STYLES.input}
                  />
                </div>

                <div>
                  <label className={STYLES.label}>Dosis</label>
                  <input
                    type="text"
                    value={presc.dosis ?? ""}
                    onChange={(e) => onChange(index, "dosis", e.target.value)}
                    placeholder="Ej: 500 mg"
                    className={STYLES.input}
                  />
                </div>

                <div>
                  <label className={STYLES.label}>Frecuencia</label>
                  <input
                    type="text"
                    value={presc.frecuencia ?? ""}
                    onChange={(e) => onChange(index, "frecuencia", e.target.value)}
                    placeholder="Ej: Cada 8 horas"
                    className={STYLES.input}
                  />
                </div>

                <div>
                  <label className={STYLES.label}>Duración</label>
                  <input
                    type="text"
                    value={presc.duracion ?? ""}
                    onChange={(e) => onChange(index, "duracion", e.target.value)}
                    placeholder="Ej: Por 5 días"
                    className={STYLES.input}
                  />
                </div>

                <div>
                  <label className={STYLES.label}>Vía de administración</label>
                  <input
                    type="text"
                    value={presc.via_administracion ?? ""}
                    onChange={(e) =>
                      onChange(index, "via_administracion", e.target.value)
                    }
                    placeholder="Oral, tópica, sublingual..."
                    className={STYLES.input}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={STYLES.label}>Indicaciones adicionales</label>
                  <textarea
                    value={presc.indicaciones ?? ""}
                    onChange={(e) =>
                      onChange(index, "indicaciones", e.target.value)
                    }
                    placeholder="Instrucciones especiales..."
                    rows={2}
                    className={STYLES.input}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}