// src/components/odontogram/treatmentPlan/SessionForm.tsx

import { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import {
  mapFrontendSesionToPayload,
  generateTempId,
} from "../../../mappers/treatmentPlanMapper";
import type { Procedimiento, Prescripcion, DiagnosticoSnapshot } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import {
  Plus,
  Trash2,
  Pill,
  Stethoscope,
  Calendar,
  CheckCircle2,
  Activity,
  StickyNote
} from "lucide-react";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import {
  useCreateSesionTratamiento,
  useSesionTratamiento,
  useUpdateSesionTratamiento,
} from "../../../hooks/treatmentPlan/useTreatmentSession";
import { useDiagnosticosDisponibles } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import { sessionFormSchema } from "../../../core/schemas/treatmentPlan.schema";
import { ZodError } from "zod";
import { useDiagnosticosUltimaSesion } from "../../../hooks/treatmentPlan/useDiagnosticosUltimaSesion";

// ============================================================================
// STYLES & TOKENS
// ============================================================================

const STYLES = {
  input: "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all duration-200",
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  sectionTitle: "text-base font-semibold text-gray-900 dark:text-white",
  sectionDesc: "text-sm text-gray-500 dark:text-gray-400",
  card: "rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50",
  cardInner: "rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800",
  iconButton: "rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-900/20 dark:hover:text-error-400 transition-colors",
  badge: "inline-flex items-center rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10 dark:bg-brand-400/10 dark:text-brand-400 dark:ring-brand-400/20"
};

// ============================================================================
// PROPS
// ============================================================================

interface SessionFormProps {
  mode: "create" | "edit";
  planId: string;
  sesionId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionForm({
  mode,
  planId,
  sesionId,
  onSuccess,
  onCancel,
}: SessionFormProps) {
  const { notify } = useNotification();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    plan_tratamiento: planId,
    fecha_programada: "",
    autocompletar_diagnosticos: true,
    procedimientos: [] as Procedimiento[],
    prescripciones: [] as Prescripcion[],
    notas: "",
    cita_id: null as string | null,
    estado: "planificada" as "planificada" | "completada" | "cancelada" | "en_progreso",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Hooks
  const { data: sesionData, isLoading: loadingSesion } = useSesionTratamiento(
    mode === "edit" ? sesionId || null : null
  );

  const { data: diagnosticosDisponibles } = useDiagnosticosDisponibles(
    mode === "create" ? planId : null
  );

  // Hook para diagnósticos de última sesión
  const { data: ultimaSesionData } = useDiagnosticosUltimaSesion(
    mode === "create" ? planId : null
  );

  const createSesionMutation = useCreateSesionTratamiento(planId);
  const updateSesionMutation = useUpdateSesionTratamiento(
    sesionId || "",
    planId
  );

  

  const [selectedDiagnosticos, setSelectedDiagnosticos] =
    useState<DiagnosticoSnapshot[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

type FiltroDiagnostico =
  | "todos"
  | "ultimos"
  | "preventivo"
  | "ausencia"
  | "patologia-activa"
  | "tratamiento-realizado";

const [filtroDiagnostico, setFiltroDiagnostico] =
  useState<FiltroDiagnostico>("todos");

const MAP_FILTRO_A_MATCHER: Record<
  Exclude<FiltroDiagnostico, "todos" | "ultimos">,
  (value: string) => boolean
> = {
  preventivo: (v) => v.toLowerCase().includes("preventivo"),
  ausencia: (v) => v.toLowerCase().includes("ausen"),
  "patologia-activa": (v) =>
    v.toLowerCase().includes("patolog") && v.toLowerCase().includes("activa"),
  "tratamiento-realizado": (v) =>
    v.toLowerCase().includes("tratamiento") || v.toLowerCase().includes("realizado"),
};

const diagnosticosFiltrados = useMemo(() => {
  const todos = diagnosticosDisponibles?.diagnosticos ?? [];

  if (filtroDiagnostico === "todos") {
    return todos;
  }

  if (filtroDiagnostico === "ultimos") {
    return [...todos].sort((a, b) => b.prioridad - a.prioridad).slice(0, 10);
  }

  const matcher = MAP_FILTRO_A_MATCHER[filtroDiagnostico];
  return todos.filter((d) => d.categoria && matcher(d.categoria));
}, [diagnosticosDisponibles, filtroDiagnostico]);

const FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "ultimos", label: "Últimos 10" },
  { value: "preventivo", label: "Preventivo" },
  { value: "ausencia", label: "Ausencias" },
  { value: "patologia-activa", label: "Patología activa" },
  { value: "tratamiento-realizado", label: "Tratamiento realizado" },
];

const getCurrentFilterLabel = () => {
  return FILTER_OPTIONS.find((f) => f.value === filtroDiagnostico)?.label || "Filtro";
};

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (mode === "edit" && sesionData) {
      setFormData({
        plan_tratamiento: sesionData.plan_tratamiento ?? planId,
        fecha_programada: sesionData.fecha_programada || "",
        autocompletar_diagnosticos: false,
        procedimientos: sesionData.procedimientos || [],
        prescripciones: sesionData.prescripciones || [],
        notas: sesionData.notas || "",
        cita_id: sesionData.cita || null,
        estado: sesionData.estado,
      });
    }
  }, [mode, sesionData, planId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // --- Procedimientos ---

  const handleAddProcedimiento = () => {
    const newProcedimiento: Procedimiento = {
      id: generateTempId(),
      descripcion: "",
      diente: undefined,
      superficie: undefined,
      codigo: undefined,
      costo_estimado: undefined,
      duracion_estimada: undefined,
      completado: false,
      notas: undefined,
    };
    setFormData((prev) => ({
      ...prev,
      procedimientos: [...prev.procedimientos, newProcedimiento],
    }));
  };

  const handleRemoveProcedimiento = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      procedimientos: prev.procedimientos.filter((_, i) => i !== index),
    }));
  };

  const handleProcedimientoChange = (
    index: number,
    field: keyof Procedimiento,
    value: string | number | boolean
  ) => {
    const updatedProcs = formData.procedimientos.map((proc, i) =>
      i === index ? { ...proc, [field]: value } : proc
    );
    setFormData((prev) => ({ ...prev, procedimientos: updatedProcs }));

    if (field === "diente" && typeof value === "string") {
      const dienteRegex = /^[1-8][1-8]$/;
      if (value && !dienteRegex.test(value)) {
        // Validación silenciosa o podrías activar un estado de error local
      }
    }
  };

  // --- Prescripciones ---

  const handleAddPrescripcion = () => {
    const newPrescripcion: Prescripcion = {
      id: generateTempId(),
      medicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      via_administracion: undefined,
      indicaciones: undefined,
    };
    setFormData((prev) => ({
      ...prev,
      prescripciones: [...prev.prescripciones, newPrescripcion],
    }));
  };

  const handleRemovePrescripcion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prescripciones: prev.prescripciones.filter((_, i) => i !== index),
    }));
  };

  const handlePrescripcionChange = (
    index: number,
    field: keyof Prescripcion,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      prescripciones: prev.prescripciones.map((presc, i) =>
        i === index ? { ...presc, [field]: value } : presc
      ),
    }));
  };

  // --- Submit ---

  const validateFormData = (): string[] => {
    try {
      sessionFormSchema.parse(formData);
      return [];
    } catch (error) {
      if (error instanceof ZodError) {
        return error.issues.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
      }
      return ["Error de validación desconocido"];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      notify({
        type: "error",
        title: "Errores de validación",
        message: validationErrors.join("\n"),
      });
      return;
    }

    setSubmitLoading(true);
    try {
      // Payload base (fecha, procedimientos, prescripciones, etc.)
      const basePayload = mapFrontendSesionToPayload(formData);

      // Construir lista de diagnósticos seleccionados para enviar
      const diagnosticosSeleccionados =
        selectedDiagnosticos.length > 0
          ? selectedDiagnosticos
          : []; // si no selecciona ninguno, mandas array vacío

      if (mode === "create") {
        await createSesionMutation.mutateAsync({
          ...basePayload,
          diagnosticoscomplicaciones: diagnosticosSeleccionados,
        });
        notify({
          type: "success",
          title: "Sesión creada",
          message: "La sesión de tratamiento se registró correctamente.",
        });
      } else {
        if (!sesionId) {
          throw new Error("Falta el ID de la sesión para editar");
        }

        await updateSesionMutation.mutateAsync({
          fecha_programada: basePayload.fecha_programada,
          procedimientos: basePayload.procedimientos,
          prescripciones: basePayload.prescripciones,
          notas: basePayload.notas,
          estado: basePayload.estado,
          diagnosticoscomplicaciones: diagnosticosSeleccionados,
        });

        notify({
          type: "warning",
          title: "Sesión actualizada",
          message: "La sesión de tratamiento se actualizó correctamente.",
        });
      }

      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar la sesión de tratamiento";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) errorMessage = data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      notify({ type: "error", title: "Error", message: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (mode === "edit" && loadingSesion) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ======================================================================
          FECHA PROGRAMADA Y ESTADO
      ====================================================================== */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={STYLES.label}>
            Fecha programada <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              name="fecha_programada"
              value={formData.fecha_programada}
              onChange={handleInputChange}
              className={`${STYLES.input} pl-10`}

            />
          </div>
        </div>

        <div>
          <label className={STYLES.label}>
            Estado de la sesión <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className={`${STYLES.input} pl-10`}
            >
              <option value="planificada">Planificada</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================================
          AUTOCOMPLETAR DIAGNÓSTICOS (Solo en modo crear)
      ====================================================================== */}
      {mode === "create" && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
          <label className="flex cursor-pointer items-start gap-3">
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                name="autocompletar_diagnosticos"
                checked={formData.autocompletar_diagnosticos}
                onChange={handleCheckboxChange}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Autocompletar con diagnósticos del odontograma
              </span>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Se cargarán automáticamente los procedimientos sugeridos basados en los{" "}
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {diagnosticosDisponibles?.total_diagnosticos || 0}
                </span>{" "}
                diagnóstico(s) disponibles.
              </p>
            </div>
          </label>
        </div>
      )}
      {/* DIAGNÓSTICOS DISPONIBLES PARA ESTA SESIÓN */}
{mode === "create" && formData.autocompletar_diagnosticos && (
  <div className={STYLES.card}>
    <div className="mb-4 flex flex-col gap-4">
      <div>
        <h3 className={STYLES.sectionTitle}>
          Diagnósticos del odontograma
        </h3>
        <p className={STYLES.sectionDesc}>
          Selecciona solo los diagnósticos relevantes para esta sesión.
        </p>
      </div>

      {/* Dropdown de filtros + Contador */}
      <div className="flex items-center justify-between gap-3">
        {/* Dropdown de filtros */}
        <div className="relative w-full sm:w-56">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
          >
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {getCurrentFilterLabel()}
            </span>
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${
                isFilterOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFiltroDiagnostico(option.value as FiltroDiagnostico);
                    setIsFilterOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <input
                    type="checkbox"
                    checked={filtroDiagnostico === option.value}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="flex-1 text-gray-700">
                    {option.label}
                  </span>
                  {option.value === "todos" && (
                    <span className="text-xs font-medium text-gray-500">
                      ({diagnosticosDisponibles?.diagnosticos?.length ?? 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contador de seleccionados */}
        <div className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-50 px-3 py-2.5">
          <svg
            className="h-4 w-4 text-brand-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          <span className="text-sm font-semibold text-brand-700">
            {selectedDiagnosticos.length} seleccionados
          </span>
        </div>
      </div>
    </div>

    {/* Grid de diagnósticos */}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {diagnosticosFiltrados.length === 0 ? (
        <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">
            No hay diagnósticos para el filtro seleccionado.
          </p>
        </div>
      ) : (
        diagnosticosFiltrados.map((dx) => {
          const isSelected = selectedDiagnosticos.some(
            (d) => d.id === dx.id
          );
          return (
            <button
              key={dx.id}
              type="button"
              onClick={() => {
                setSelectedDiagnosticos((prev) =>
                  prev.some((d) => d.id === dx.id)
                    ? prev.filter((d) => d.id !== dx.id)
                    : [...prev, dx]
                );
              }}
              className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* Checkbox */}
              <div className="flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0 mt-0.5" style={{
                borderColor: isSelected ? "#3b82f6" : "#d1d5db",
                backgroundColor: isSelected ? "#3b82f6" : "white",
              }}>
                {isSelected && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: dx.color_hex || "#9ca3af" }}
                  >
                    {dx.diente}
                  </div>
                  <p className="text-sm font-semibold truncate text-gray-900">
                    {dx.diagnostico_nombre}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {dx.siglas} · {dx.superficie} · Prioridad: {dx.prioridad}
                </p>
                {dx.descripcion && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {dx.descripcion}
                  </p>
                )}
                {dx.categoria && (
                  <p className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {dx.categoria}
                  </p>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
)}

<div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* ======================================================================
          PROCEDIMIENTOS
      ====================================================================== */}
      <div className={STYLES.card}>
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={STYLES.sectionTitle}>
              <span className="mr-2 inline-flex items-center text-brand-500">
                <Stethoscope className="h-5 w-5" />
              </span>
              Procedimientos Clínicos
            </h3>
            <p className={STYLES.sectionDesc}>
              Registre los tratamientos a realizar en esta sesión
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProcedimiento}
            startIcon={<Plus className="h-4 w-4" />}
          >
            Agregar Procedimiento
          </Button>
        </div>

        <div className="space-y-4">
          {formData.procedimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Stethoscope className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                Sin procedimientos
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agregue procedimientos clínicos usando el botón superior.
              </p>
            </div>
          ) : (
            formData.procedimientos.map((proc, index) => (
              <div key={proc.id || index} className={`${STYLES.cardInner} group animate-in fade-in slide-in-from-bottom-2`}>
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                  <span className={STYLES.badge}>
                    Procedimiento #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProcedimiento(index)}
                    className={STYLES.iconButton}
                    title="Eliminar procedimiento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <label className={STYLES.label}>Descripción</label>
                    <input
                      type="text"
                      value={proc.descripcion}
                      onChange={(e) =>
                        handleProcedimientoChange(index, "descripcion", e.target.value)
                      }
                      placeholder="Ej: Profilaxis completa, Resina compuesta..."
                      className={STYLES.input}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={STYLES.label}>Diente</label>
                    <input
                      type="text"
                      value={proc.diente || ""}
                      onChange={(e) =>
                        handleProcedimientoChange(index, "diente", e.target.value)
                      }
                      placeholder="Ej: 11"
                      maxLength={2}
                      className={`${STYLES.input} text-center`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={STYLES.label}>Superficie</label>
                    <input
                      type="text"
                      value={proc.superficie || ""}
                      onChange={(e) =>
                        handleProcedimientoChange(index, "superficie", e.target.value)
                      }
                      placeholder="O, M, D"
                      className={`${STYLES.input} text-center uppercase`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================================
          PRESCRIPCIONES
      ====================================================================== */}
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
            onClick={handleAddPrescripcion}
            startIcon={<Plus className="h-4 w-4" />}
          >
            Agregar Medicamento
          </Button>
        </div>

        <div className="space-y-4">
          {formData.prescripciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Pill className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                Sin prescripciones
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No se han registrado medicamentos para esta sesión.
              </p>
            </div>
          ) : (
            formData.prescripciones.map((presc, index) => (
              <div key={presc.id || index} className={`${STYLES.cardInner} group animate-in fade-in slide-in-from-bottom-2`}>
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
                  <span className={STYLES.badge}>
                    Medicamento #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescripcion(index)}
                    className={STYLES.iconButton}
                    title="Eliminar prescripción"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={STYLES.label}>Medicamento</label>
                    <input
                      type="text"
                      value={presc.medicamento}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "medicamento", e.target.value)
                      }
                      placeholder="Nombre del medicamento (Genérico / Comercial)"
                      className={STYLES.input}
                    />
                  </div>

                  <div>
                    <label className={STYLES.label}>Dosis</label>
                    <input
                      type="text"
                      value={presc.dosis}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "dosis", e.target.value)
                      }
                      placeholder="Ej: 500 mg"
                      className={STYLES.input}
                    />
                  </div>

                  <div>
                    <label className={STYLES.label}>Frecuencia</label>
                    <input
                      type="text"
                      value={presc.frecuencia}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "frecuencia", e.target.value)
                      }
                      placeholder="Ej: Cada 8 horas"
                      className={STYLES.input}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={STYLES.label}>Duración</label>
                    <input
                      type="text"
                      value={presc.duracion}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "duracion", e.target.value)
                      }
                      placeholder="Ej: Por 5 días"
                      className={STYLES.input}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================================
          NOTAS
      ====================================================================== */}
      <div>
        <label className={STYLES.label}>
          <span className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notas de la sesión
          </span>
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          rows={4}
          placeholder="Observaciones adicionales sobre el paciente o el procedimiento..."
          className={`${STYLES.input} resize-y`}
        />
      </div>

      {/* ======================================================================
          BOTONES DE ACCIÓN
      ====================================================================== */}
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitLoading}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitLoading}
          startIcon={mode === "create" ? <Plus className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          {mode === "create" ? "Crear sesión" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
