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
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SELECTOR DE PACIENTE (solo create sin paciente fijado) */}
        {!pacienteId && mode === "create" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Seleccionar Paciente <span className="text-red-500">*</span>
            </label>

            {selectedPaciente ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {getInitial(selectedPaciente?.nombres)}
                    {getInitial(selectedPaciente?.apellidos)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPaciente.nombres} {selectedPaciente.apellidos}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CI: {selectedPaciente.cedula_pasaporte}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearPaciente}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchPaciente}
                  onChange={(e) => {
                    setSearchPaciente(e.target.value);
                    setShowPacienteDropdown(true);
                  }}
                  onFocus={() => setShowPacienteDropdown(true)}
                  placeholder="Buscar paciente por nombre o cédula..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />

                {/* Dropdown de pacientes */}
                {showPacienteDropdown && searchPaciente && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingPacientes ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        Buscando pacientes...
                      </div>
                    ) : pacientes && pacientes.length > 0 ? (
                      pacientes.map((paciente: IPaciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => handleSelectPaciente(paciente)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                            {getInitial(paciente.nombres)}
                            {getInitial(paciente.apellidos)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {paciente.nombres} {paciente.apellidos}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              CI: {paciente.cedula_pasaporte}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron pacientes con "{searchPaciente}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!selectedPaciente && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Debe seleccionar un paciente para continuar.
              </p>
            )}
          </div>
        )}

        {/* PACIENTE FIJADO */}
        {pacienteId && pacienteNombreCompleto && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
              {getInitial(pacienteNombreCompleto.split(" ")[0])}
              {getInitial(pacienteNombreCompleto.split(" ")[1])}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente activo
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {pacienteNombreCompleto}
              </p>
            </div>
          </div>
        )}

        {/* BLOQUE: Datos del plan */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-6 space-y-4">
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
              onChange={handleInputChange}
              className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Ej: Plan integral de rehabilitación oral"
            />
          </div>

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
              onChange={handleInputChange}
              className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Observaciones globales del plan, prioridades de tratamiento, etc."
            />
          </div>

          {mode === "create" && (
            <div className="mt-2 flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-3 border border-blue-200 dark:border-blue-800">
              <input
                id="usar_ultimo_odontograma"
                type="checkbox"
                name="usar_ultimo_odontograma"
                checked={formData.usar_ultimo_odontograma}
                onChange={handleCheckboxChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="space-y-1">
                <label
                  htmlFor="usar_ultimo_odontograma"
                  className="text-sm font-medium text-blue-900 dark:text-blue-100"
                >
                  Usar último odontograma registrado
                </label>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Se vinculará automáticamente el odontograma más reciente del paciente al plan de
                  tratamiento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onCancel();
            }}
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
              ? "Crear plan"
              : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}