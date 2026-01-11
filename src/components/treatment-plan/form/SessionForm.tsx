// src/components/odontogram/treatmentPlan/SessionForm.tsx

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { mapFrontendSesionToPayload, generateTempId } from "../../../mappers/treatmentPlanMapper";
import type { SessionFormData } from "../../../core/types/treatmentPlan.types";
import type { Procedimiento, Prescripcion,  } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import {  Plus, Trash2, Pill, Stethoscope } from "lucide-react";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useCreateSesionTratamiento, useSesionTratamiento, useUpdateSesionTratamiento } from "../../../hooks/treatmentPlan/useTreatmentSession";
import { useDiagnosticosDisponibles } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import { sessionFormSchema } from "../../../core/schemas/treatmentPlan.schema";
import { ZodError } from "zod";

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
  const [formData, setFormData] = useState<SessionFormData>({
    plan_tratamiento: planId,
    fecha_programada: "",
    autocompletar_diagnosticos: true,
    procedimientos: [],
    prescripciones: [],
    notas: "",
    cita_id: null,
    estado: "planificada",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Hooks
  const { data: sesionData, isLoading: loadingSesion } = useSesionTratamiento(
    mode === "edit" ? sesionId || null : null
  );

  const { data: diagnosticosDisponibles } = useDiagnosticosDisponibles(
    mode === "create" ? planId : null
  );

  const createSesionMutation = useCreateSesionTratamiento(planId);
  const updateSesionMutation = useUpdateSesionTratamiento(sesionId || "", planId);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cargar datos de la sesión en modo edición
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
  }, [mode, sesionData]);

  // ============================================================================
  // HANDLERS - CAMPOS GENERALES
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ============================================================================
  // HANDLERS - PROCEDIMIENTOS
  // ============================================================================

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
  
  setFormData(prev => ({ ...prev, procedimientos: updatedProcs }));
  
  // Validación individual del procedimiento
  if (field === 'diente' && typeof value === 'string') {
    const dienteRegex = /^[1-8][1-8]$/;
    if (value && !dienteRegex.test(value)) {
      notify({
        type: 'warning',
        title: 'Código FDI inválido',
        message: 'Use formato de 2 dígitos (ej: 11, 46, 38)'
      });
    }
  }
};

  // ============================================================================
  // HANDLERS - PRESCRIPCIONES
  // ============================================================================

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

  // ============================================================================
  // VALIDACIÓN Y SUBMIT
  // ============================================================================

  const validateFormData = (): string[] => {
  try {
    sessionFormSchema.parse(formData);
    return []; 
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
    }
    return ["Error de validación desconocido"];
  }
};


  const resetForm = () => {
    setFormData({
      plan_tratamiento: planId,
      fecha_programada: "",
      autocompletar_diagnosticos: true,
      procedimientos: [],
      prescripciones: [],
      notas: "",
      cita_id: null,
      estado: "planificada",
    });
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
      const payload = mapFrontendSesionToPayload(formData);

      if (mode === "create") {
        await createSesionMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Sesión creada",
          message: "La sesión de tratamiento se registró correctamente.",
        });
      } else {
        if (!sesionId) throw new Error("Falta el ID de la sesión para editar");
        await updateSesionMutation.mutateAsync({
          fecha_programada: payload.fecha_programada,
          procedimientos: payload.procedimientos,
          prescripciones: payload.prescripciones,
          notas: payload.notas,
          estado: payload.estado,
        });
        notify({
          type: "warning",
          title: "Sesión actualizada",
          message: "La sesión de tratamiento se actualizó correctamente.",
        });
      }

      resetForm();
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar la sesión de tratamiento";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notify({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (mode === "edit" && loadingSesion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando sesión...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================================
          FECHA PROGRAMADA Y ESTADO
      ====================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="fecha_programada"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Fecha programada
          </label>
          <input
            type="date"
            id="fecha_programada"
            name="fecha_programada"
            value={formData.fecha_programada}
            onChange={handleInputChange}
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="estado"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          >
            <option value="planificada">Planificada</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* ======================================================================
          AUTOCOMPLETAR DIAGNÓSTICOS (Solo en modo crear)
      ====================================================================== */}
      {mode === "create" && (
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <input
            type="checkbox"
            id="autocompletar_diagnosticos"
            name="autocompletar_diagnosticos"
            checked={formData.autocompletar_diagnosticos}
            onChange={handleCheckboxChange}
            className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <div>
            <label
              htmlFor="autocompletar_diagnosticos"
              className="block text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer"
            >
              Autocompletar con diagnósticos del odontograma
            </label>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {diagnosticosDisponibles?.total_diagnosticos || 0} diagnóstico(s) disponibles
            </p>
          </div>
        </div>
      )}

      {/* ======================================================================
          PROCEDIMIENTOS
      ====================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Procedimientos
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProcedimiento}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        {formData.procedimientos.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <Stethoscope className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No hay procedimientos agregados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.procedimientos.map((proc, index) => (
              <div
                key={proc.id || index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Procedimiento #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProcedimiento(index)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Descripción del procedimiento *"
                    value={proc.descripcion}
                    onChange={(e) =>
                      handleProcedimientoChange(index, "descripcion", e.target.value)
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Diente (ej: 16)"
                      value={proc.diente || ""}
                      onChange={(e) =>
                        handleProcedimientoChange(index, "diente", e.target.value)
                      }
                      className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Superficie"
                      value={proc.superficie || ""}
                      onChange={(e) =>
                        handleProcedimientoChange(index, "superficie", e.target.value)
                      }
                      className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================================
          PRESCRIPCIONES
      ====================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prescripciones
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPrescripcion}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        {formData.prescripciones.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <Pill className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No hay prescripciones agregadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.prescripciones.map((presc, index) => (
              <div
                key={presc.id || index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Prescripción #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescripcion(index)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Medicamento *"
                    value={presc.medicamento}
                    onChange={(e) =>
                      handlePrescripcionChange(index, "medicamento", e.target.value)
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Dosis *"
                      value={presc.dosis}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "dosis", e.target.value)
                      }
                      className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Frecuencia (ej: c/8h)"
                      value={presc.frecuencia}
                      onChange={(e) =>
                        handlePrescripcionChange(index, "frecuencia", e.target.value)
                      }
                      className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Duración (ej: 7 días)"
                    value={presc.duracion}
                    onChange={(e) =>
                      handlePrescripcionChange(index, "duracion", e.target.value)
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================================
          NOTAS
      ====================================================================== */}
      <div>
        <label
          htmlFor="notas"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Notas de la sesión
        </label>
        <textarea
          id="notas"
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          rows={4}
          placeholder="Observaciones, hallazgos clínicos, reacciones del paciente..."
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
        />
      </div>

      {/* ======================================================================
          BOTONES DE ACCIÓN
      ====================================================================== */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitLoading}>
          {submitLoading
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
            ? "Crear sesión"
            : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
