// src/components/odontogram/treatmentPlan/SessionForm.tsx

import { useState, useEffect } from "react";
import { Calendar, Activity, StickyNote, Info } from "lucide-react";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import {
  useCreateSesionTratamiento,
  useSesionTratamiento,
  useUpdateSesionTratamiento,
} from "../../../hooks/treatmentPlan/useTreatmentSession";
import { useDiagnosticosDisponibles, usePlanTratamiento } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import type { Procedimiento, Prescripcion } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

// Componentes refactorizados

// Hooks refactorizados
import { useProcedimientos } from "../../../hooks/treatmentPlan/sessionFormHooks/useProcedimientos";
import { usePrescripciones } from "../../../hooks/treatmentPlan/sessionFormHooks/usePrescripciones";
import { useDiagnosticosFilter } from "../../../hooks/treatmentPlan/sessionFormHooks/useDiagnosticosFilter";
import { useSessionFormSubmit } from "../../../hooks/treatmentPlan/sessionFormHooks/useSessionFormSubmit";
import DiagnosticosSelector from "../selector/DiagnosticosSelector";
import ProcedimientosList from "../list/ProcedimientosList";
import PrescripcionesList from "../list/PrescripcionesList";
import { useAutoProcedimientosFromDiagnosticos } from "../../../hooks/treatmentPlan/sessionFormHooks/useAutoProcedimientosFromDiagnosticos";
import { usePacienteActivo } from "../../../context/PacienteContext";
import { useAvailableSlots } from "../../../hooks/treatmentPlan/sessionFormHooks/useAvailableSlots";
import { useAppointment } from "../../../hooks/appointments/useAppointment";
import { useAuth } from "../../../hooks/auth/useAuth";
import type { ICitaCreate, TipoConsulta } from "../../../types/appointments/IAppointment";

// ============================================================================
// STYLES & TOKENS
// ============================================================================

const STYLES = {
  input: "block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all duration-200",
  label: "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300",
  sectionTitle: "text-base font-semibold text-gray-900 dark:text-white",
  sectionDesc: "text-sm text-gray-500 dark:text-gray-400",
  card: "rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50",
  infoCard: "rounded-xl border border-blue-light-200 bg-blue-light-50/50 p-4 dark:border-blue-light-500/20 dark:bg-blue-light-500/5",
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
  const { user } = useAuth();
const { pacienteActivo } = usePacienteActivo();
useAuth();
const { createCita } = useAppointment();
const { data: plan } = usePlanTratamiento(planId);
const { slots, loading, error, loadSlots } = useAvailableSlots();
const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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

  // Hooks de datos
  const { data: sesionData, isLoading: loadingSesion } = useSesionTratamiento(
    mode === "edit" ? sesionId || null : null
  );
  const { data: diagnosticosDisponibles } = useDiagnosticosDisponibles(
    mode === "create" ? planId : null
  );
  const createSesionMutation = useCreateSesionTratamiento(planId);
  const updateSesionMutation = useUpdateSesionTratamiento(sesionId || "", planId);

  // Hooks refactorizados
  const {
    selectedDiagnosticos,
    setSelectedDiagnosticos,
    isFilterOpen,
    setIsFilterOpen,
    filtroDiagnostico,
    setFiltroDiagnostico,
    gruposDisponiblesTotal,
    diagnosticosAgrupados,
    gruposSeleccionados,
    gruposPorFiltro,
    getCurrentFilterLabel,
    handleToggleDiagnostico,
  } = useDiagnosticosFilter(diagnosticosDisponibles);

  const procedimientosHooks = useProcedimientos(
    formData.procedimientos,
    (procedimientos) => setFormData((prev) => ({ ...prev, procedimientos }))
  );

  useAutoProcedimientosFromDiagnosticos({
    autocompletar: mode === "create" && formData.autocompletar_diagnosticos,
    selectedDiagnosticos,
    procedimientos: formData.procedimientos,
    setProcedimientos: (procedimientosActualizados) =>
      setFormData((prev) => ({ ...prev, procedimientos: procedimientosActualizados })),
  });

  const prescripcionesHooks = usePrescripciones(
    formData.prescripciones,
    (prescripciones) => setFormData((prev) => ({ ...prev, prescripciones }))
  );
const getMotivoConsulta = () => {
    const numeroSesion =
      (sesionData as any)?.numero_sesion ??
      (sesionData as any)?.num_sesion ??
      1;

    return `Sesión #${numeroSesion} de tratamiento del plan "${plan?.titulo}"`;
  };
  const { handleSubmit, isSubmitting } = useSessionFormSubmit({
    formData,
    selectedDiagnosticos,
    mode,
    planId,
    sesionId,
    createMutation: createSesionMutation,
    updateMutation: updateSesionMutation,
    onSuccess,
    notify,
    selectedSlot,           
  getMotivoConsulta,     
  pacienteId: pacienteActivo?.id ?? null,
  odontologoId: user ? String(user.id) : null,
  });

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

      // Cargar diagnósticos si existen
      if (sesionData.diagnosticos_complicaciones) {
        setSelectedDiagnosticos(sesionData.diagnosticos_complicaciones);
      }
    }
  }, [mode, sesionData, planId, setSelectedDiagnosticos]);
  useEffect(() => {
    if (!formData.fecha_programada || !user?.id) return;

    // Por ahora 30 min; si luego usas duración dinámica, ajustas
    loadSlots(String(user.id), formData.fecha_programada, 30);
  }, [formData.fecha_programada, user?.id, loadSlots]);


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

  // ============================================================================
  // RENDER
  // ============================================================================

  if (mode === "edit" && loadingSesion) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="mx-auto h-8 w-8 animate-spin text-brand-500" />
          <p className="mt-2 text-sm text-gray-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
    {/* FECHA PROGRAMADA Y ESTADO */}
    <div className={STYLES.card}>
      <div className="mb-4 flex items-center gap-3">
        <Calendar className="h-5 w-5 text-gray-900 dark:text-white" />
        <h3 className={STYLES.sectionTitle}>Información General</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fecha_programada" className={STYLES.label}>
            Fecha programada *
          </label>
          <input
            type="date"
            id="fecha_programada"
            name="fecha_programada"
            value={formData.fecha_programada}
            onChange={handleInputChange}
            className={STYLES.input}
          />
        </div>

        <div>
          <label htmlFor="estado" className={STYLES.label}>
            Estado de la sesión *
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className={STYLES.input}
          >
            <option value="planificada">Planificada</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* AYUDA VISUAL PARA AGENDAR CITA VINCULADA */}
      {formData.fecha_programada && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className={STYLES.sectionDesc}>
              Seleccione un horario disponible para crear y vincular una cita a esta sesión.
            </p>
            {formData.cita_id && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Cita vinculada
              </span>
            )}
          </div>

          {loading && (
            <p className="text-xs text-gray-500">Cargando horarios disponibles...</p>
          )}

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          {!loading && !error && (
            slots.length === 0 ? (
              <p className="text-xs text-amber-600">
                No hay horarios disponibles para esta fecha según la agenda del odontólogo.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.map((slot, idx) => {
                  const isSelected = selectedSlot === slot.horainicio;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot.horainicio)}
                      className={[
                        "rounded-lg border px-2 py-1 text-xs font-medium transition-colors",
                        isSelected
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-800 hover:border-brand-500 hover:bg-brand-50",
                      ].join(" ")}
                    >
                      {slot.horainicio} – {slot.horafin}
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>

      {/* AUTOCOMPLETAR DIAGNÓSTICOS */}
      {mode === "create" && (
        <div className={STYLES.card}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="autocompletar_diagnosticos"
              checked={formData.autocompletar_diagnosticos}
              onChange={handleCheckboxChange}
              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">

                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Autocompletar con diagnósticos del odontograma
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Se cargarán automáticamente los procedimientos sugeridos basados en{" "}
                <span className="font-medium text-brand-600">{gruposDisponiblesTotal}</span>{" "}
                grupo{gruposDisponiblesTotal !== 1 ? "s" : ""} de diagnósticos (
                {diagnosticosDisponibles?.total_diagnosticos || 0} superficie
                {(diagnosticosDisponibles?.total_diagnosticos || 0) !== 1 ? "s" : ""})
              </p>
            </div>
          </label>
        </div>
      )}

      {/* DIAGNÓSTICOS */}
      {mode === "create" && formData.autocompletar_diagnosticos && (
        <DiagnosticosSelector
          diagnosticosDisponibles={diagnosticosDisponibles}
          selectedDiagnosticos={selectedDiagnosticos}
          diagnosticosAgrupados={diagnosticosAgrupados}
          gruposSeleccionados={gruposSeleccionados}
          filtroDiagnostico={filtroDiagnostico}
          isFilterOpen={isFilterOpen}
          gruposPorFiltro={gruposPorFiltro}
          getCurrentFilterLabel={getCurrentFilterLabel}
          onToggleDiagnostico={handleToggleDiagnostico}
          onSetFiltroDiagnostico={setFiltroDiagnostico}
          onSetIsFilterOpen={setIsFilterOpen}
        />
      )}

      {/* PROCEDIMIENTOS */}
      <ProcedimientosList
        procedimientos={formData.procedimientos}
        onAdd={procedimientosHooks.handleAdd}
        onRemove={procedimientosHooks.handleRemove}
        onChange={procedimientosHooks.handleChange}
      />

      {/* PRESCRIPCIONES */}
      <PrescripcionesList
        prescripciones={formData.prescripciones}
        onAdd={prescripcionesHooks.handleAdd}
        onRemove={prescripcionesHooks.handleRemove}
        onChange={prescripcionesHooks.handleChange}
      />

      {/* NOTAS */}
      <div className={STYLES.card}>
        <div className="mb-4 flex items-center gap-3">
          <StickyNote className="h-5 w-5 text-gray-900 dark:text-white" />
          <h3 className={STYLES.sectionTitle}>Notas de la sesión</h3>
        </div>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          rows={4}
          placeholder="Observaciones adicionales, complicaciones, recomendaciones..."
          className={STYLES.input}
        />
      </div>

      {/* INFORMACIÓN IMPORTANTE */}
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

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {mode === "create" ? "Crear sesión" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
