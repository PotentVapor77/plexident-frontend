// src/components/odontogram/treatmentPlan/TreatmentPlanForm.tsx

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { usePacientes } from "../../../hooks/patient/usePatients";
import { mapFrontendPlanToPayload } from "../../../mappers/treatmentPlanMapper";
import type { TreatmentPlanFormData } from "../../../core/types/treatmentPlan.types";
import type { IPaciente } from "../../../types/patient/IPatient";
import { Search, X } from "lucide-react";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useCreatePlanTratamiento, usePlanTratamiento, useUpdatePlanTratamiento } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import { ZodError } from "zod";
import { treatmentPlanFormSchema } from "../../../core/schemas/treatmentPlan.schema";
import { useDebounce } from "../../../hooks/useDebounce";

// ============================================================================
// PROPS
// ============================================================================

interface TreatmentPlanFormProps {
  mode: "create" | "edit";
  planId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanForm({
  mode,
  planId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
  onCancel,
}: TreatmentPlanFormProps) {
  const { notify } = useNotification();

  // Estados del formulario
  const [formData, setFormData] = useState<TreatmentPlanFormData>({
    paciente: pacienteId || "",
    titulo: "",
    notas_generales: "",
    usar_ultimo_odontograma: true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState("");
  const debouncedSearch = useDebounce(searchPaciente, 300);
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);

  // Hooks
  const { data: planData, isLoading: loadingPlan } = usePlanTratamiento(
    mode === "edit" ? planId || null : null
  );

  const createPlanMutation = useCreatePlanTratamiento(pacienteId);
  const updatePlanMutation = useUpdatePlanTratamiento(planId || "", pacienteId);

  const { pacientes, isLoading: loadingPacientes } = usePacientes({
  page: 1,
  page_size: 100,
  search: debouncedSearch,
});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cargar datos del plan en modo edición
  useEffect(() => {
    if (mode === "edit" && planData) {
      setFormData({
        paciente: planData.paciente ?? pacienteId ?? "",
        titulo: planData.titulo,
        notas_generales: planData.notas_generales || "",
        usar_ultimo_odontograma: !!planData.version_odontograma,
      });
    }
  }, [mode, planData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleSelectPaciente = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    setFormData((prev) => ({
      ...prev,
      paciente: paciente.id,
    }));
    setSearchPaciente("");
    setShowPacienteDropdown(false);
  };

  const handleClearPaciente = () => {
    setSelectedPaciente(null);
    setFormData((prev) => ({
      ...prev,
      paciente: "",
    }));
  };

  const validateFormData = (): string[] => {
  try {
    treatmentPlanFormSchema.parse(formData);
    return [];
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues.map(err => {
        const fieldPath = err.path.length > 0 ? err.path.join(".") : "formulario";
        return `${String(fieldPath)}: ${err.message}`;
      });
    }
    return ["Error de validación desconocido"];
  }
};

  const resetForm = () => {
    setFormData({
      paciente: pacienteId || "",
      titulo: "",
      notas_generales: "",
      usar_ultimo_odontograma: true,
    });
    setSelectedPaciente(null);
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
      const payload = mapFrontendPlanToPayload(formData);

      if (mode === "create") {
        await createPlanMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Plan creado",
          message: "El plan de tratamiento se registró correctamente.",
        });
      } else {
        if (!planId) throw new Error("Falta el ID del plan para editar");
        await updatePlanMutation.mutateAsync({
          titulo: payload.titulo,
          notas_generales: payload.notas_generales,
        });
        notify({
          type: "warning",
          title: "Plan actualizado",
          message: "El plan de tratamiento se actualizó correctamente.",
        });
      }

      resetForm();
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar el plan de tratamiento";
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

  if (mode === "edit" && loadingPlan) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando plan...</span>
      </div>
    );
  }
  const getInitial = (value: string | null | undefined): string =>
  (value ?? "").toString().charAt(0);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================================
          SELECTOR DE PACIENTE (Solo en modo crear sin paciente fijado)
      ====================================================================== */}
      {!pacienteId && mode === "create" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar Paciente *
          </label>

          {selectedPaciente ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold">
                {getInitial(selectedPaciente?.nombres)}
                {getInitial(selectedPaciente?.apellidos)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedPaciente.nombres} {selectedPaciente.apellidos}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  CI: {selectedPaciente.cedula_pasaporte}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearPaciente}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    value={searchPaciente}
    onChange={(e) => {
      setSearchPaciente(e.target.value);
      setShowPacienteDropdown(true);
    }}
    onFocus={() => setShowPacienteDropdown(true)}
    placeholder="Buscar paciente por nombre o cédula..."
    className="block w-full pl-10 pr-10 py-3 border ..."
  />
  {/* NUEVO: Spinner mientras busca */}
  {loadingPacientes && searchPaciente && (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )}
</div>
          )}

          {!selectedPaciente && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Debe seleccionar un paciente para continuar
            </p>
          )}
        </div>
      )}

      {/* ======================================================================
          INFORMACIÓN DEL PACIENTE FIJADO
      ====================================================================== */}
      {pacienteId && pacienteNombreCompleto && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Paciente activo
          </p>
          <p className="text-blue-900 dark:text-blue-100 font-semibold mt-1">
            {pacienteNombreCompleto}
          </p>
        </div>
      )}

      {/* ======================================================================
          TÍTULO DEL PLAN
      ====================================================================== */}
      <div>
        <label
          htmlFor="titulo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Título del plan *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleInputChange}
          required
          placeholder="Ej: Plan de rehabilitación oral completa"
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* ======================================================================
          NOTAS GENERALES
      ====================================================================== */}
      <div>
        <label
          htmlFor="notas_generales"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Notas generales
        </label>
        <textarea
          id="notas_generales"
          name="notas_generales"
          value={formData.notas_generales}
          onChange={handleInputChange}
          rows={4}
          placeholder="Observaciones, objetivos del tratamiento, consideraciones especiales..."
          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
        />
      </div>

      {/* ======================================================================
          USAR ÚLTIMO ODONTOGRAMA (Solo en modo crear)
      ====================================================================== */}
      {mode === "create" && (
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="usar_ultimo_odontograma"
            name="usar_ultimo_odontograma"
            checked={formData.usar_ultimo_odontograma}
            onChange={handleCheckboxChange}
            className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <div>
            <label
              htmlFor="usar_ultimo_odontograma"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Usar último odontograma registrado
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Se vinculará automáticamente el odontograma más reciente del paciente
            </p>
          </div>
        </div>
      )}

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
        <Button
          type="submit"
          variant="primary"
          disabled={submitLoading || (!formData.paciente && !pacienteId)}
        >
          {submitLoading
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? "Crear plan"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
