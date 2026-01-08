// src/components/odontogram/indicator/IndicatorsForm.tsx

import { useState } from "react";
import { AxiosError } from "axios";
import { useModal } from "../../../hooks/useModal";
import { 
  useCreateIndicadoresSaludBucal, 
  useUpdateIndicadoresSaludBucal 
} from "../../../hooks/odontogram/useIndicadoresSaludBucal";
import type { IndicadoresSaludBucalCreatePayload } from "../../../core/types/odontograma.types";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import type { IPaciente } from "../../../types/patient/IPatient";
import IndicatorsFormFields from "./IndicatorsFormFields";
import { IndicatorsSuccessModal } from "./IndicatorsSuccessModal";
import { usePacientes } from "../../../hooks/patient/usePatients";
import { Search, X, User } from "lucide-react";
import Button from "../../ui/button/Button";

// ============================================================================
// TYPES
// ============================================================================

export interface IndicatorsFormData {
  paciente: string;
  activo: boolean;
  pieza_16_placa: number | null;
  pieza_16_calculo: number | null;
  pieza_11_placa: number | null;
  pieza_11_calculo: number | null;
  pieza_26_placa: number | null;
  pieza_26_calculo: number | null;
  pieza_36_placa: number | null;
  pieza_36_calculo: number | null;
  pieza_31_placa: number | null;
  pieza_31_calculo: number | null;
  pieza_46_placa: number | null;
  pieza_46_calculo: number | null;
  ohi_promedio_placa: number | null;
  ohi_promedio_calculo: number | null;
  enfermedad_periodontal: "LEVE" | "MODERADA" | "SEVERA" | null;
  tipo_oclusion: "ANGLE_I" | "ANGLE_II" | "ANGLE_III" | null;
  nivel_fluorosis: "NINGUNA" | "LEVE" | "MODERADA" | "SEVERA" | null;
  observaciones: string | null;
}

interface IndicatorsFormProps {
  onIndicatorCreated?: () => void;
  mode?: "create" | "edit";
  initialData?: BackendIndicadoresSaludBucal;
  indicatorId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  notify: (notification: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => void;
  onSubmit?: (payload: IndicadoresSaludBucalCreatePayload) => Promise<void> | void;
}

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// ============================================================================
// COMPONENT
// ============================================================================

export default function IndicatorsForm({
  onIndicatorCreated,
  mode = "create",
  initialData,
  indicatorId,
  pacienteId,
  pacienteNombreCompleto,
  notify,
}: IndicatorsFormProps) {
  
  // Estado del formulario
  const [formData, setFormData] = useState<IndicatorsFormData>({
    paciente: initialData?.paciente ?? pacienteId ?? "",
    activo: initialData?.activo ?? true,
    pieza_16_placa: initialData?.pieza_16_placa ?? null,
    pieza_16_calculo: initialData?.pieza_16_calculo ?? null,
    pieza_11_placa: initialData?.pieza_11_placa ?? null,
    pieza_11_calculo: initialData?.pieza_11_calculo ?? null,
    pieza_26_placa: initialData?.pieza_26_placa ?? null,
    pieza_26_calculo: initialData?.pieza_26_calculo ?? null,
    pieza_36_placa: initialData?.pieza_36_placa ?? null,
    pieza_36_calculo: initialData?.pieza_36_calculo ?? null,
    pieza_31_placa: initialData?.pieza_31_placa ?? null,
    pieza_31_calculo: initialData?.pieza_31_calculo ?? null,
    pieza_46_placa: initialData?.pieza_46_placa ?? null,
    pieza_46_calculo: initialData?.pieza_46_calculo ?? null,
    ohi_promedio_placa: initialData?.ohi_promedio_placa ?? null,
    ohi_promedio_calculo: initialData?.ohi_promedio_calculo ?? null,
    enfermedad_periodontal: initialData?.enfermedad_periodontal ?? null,
    tipo_oclusion: initialData?.tipo_oclusion ?? null,
    nivel_fluorosis: initialData?.nivel_fluorosis ?? null,
    observaciones: initialData?.observaciones ?? null,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);

  // Hooks
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  const createIndicador = useCreateIndicadoresSaludBucal(pacienteId);
  const updateIndicador = useUpdateIndicadoresSaludBucal(pacienteId);

  const { pacientes } = usePacientes({
    page: 1,
    page_size: 100,
    search: searchPaciente,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<InputElement>
  ): void => {
    const { name, value } = e.target;

    // Manejar campos numéricos (placa y cálculo)
    if (
      name.includes("placa") ||
      name.includes("calculo") ||
      name.includes("ohi_promedio")
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
      return;
    }

    // Manejar campos de texto y select
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
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
    const errors: string[] = [];

    // Validar que haya paciente seleccionado
    if (!formData.paciente && !pacienteId) {
      errors.push("Debe seleccionar un paciente antes de registrar los indicadores");
    }

    // Validar rangos numéricos para placa (0-3)
    const placaFields = [
      "pieza_16_placa",
      "pieza_11_placa",
      "pieza_26_placa",
      "pieza_36_placa",
      "pieza_31_placa",
      "pieza_46_placa",
    ] as const;

    placaFields.forEach((field) => {
      const value = formData[field];
      if (value !== null && (value < 0 || value > 3)) {
        errors.push(`El valor de placa para ${field.replace("pieza_", "pieza ")} debe estar entre 0 y 3`);
      }
    });

    // Validar rangos numéricos para cálculo (0-3)
    const calculoFields = [
      "pieza_16_calculo",
      "pieza_11_calculo",
      "pieza_26_calculo",
      "pieza_36_calculo",
      "pieza_31_calculo",
      "pieza_46_calculo",
    ] as const;

    calculoFields.forEach((field) => {
      const value = formData[field];
      if (value !== null && (value < 0 || value > 3)) {
        errors.push(`El valor de cálculo para ${field.replace("pieza_", "pieza ")} debe estar entre 0 y 3`);
      }
    });

    // Validar que al menos un indicador tenga datos
    const hasAtLeastOneValue = [
      ...placaFields,
      ...calculoFields,
      "enfermedad_periodontal",
      "tipo_oclusion",
      "nivel_fluorosis",
      "observaciones",
    ].some((field) => {
      const value = formData[field as keyof IndicatorsFormData];
      return value !== null && value !== "";
    });

    if (!hasAtLeastOneValue) {
      errors.push("Debe registrar al menos un indicador de salud bucal");
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId ?? "",
      activo: true,
      pieza_16_placa: null,
      pieza_16_calculo: null,
      pieza_11_placa: null,
      pieza_11_calculo: null,
      pieza_26_placa: null,
      pieza_26_calculo: null,
      pieza_36_placa: null,
      pieza_36_calculo: null,
      pieza_31_placa: null,
      pieza_31_calculo: null,
      pieza_46_placa: null,
      pieza_46_calculo: null,
      ohi_promedio_placa: null,
      ohi_promedio_calculo: null,
      enfermedad_periodontal: null,
      tipo_oclusion: null,
      nivel_fluorosis: null,
      observaciones: null,
    });
    setSelectedPaciente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert("Errores de validación:\n" + validationErrors.join("\n"));
      return;
    }

    setSubmitLoading(true);

    try {
      const payload: IndicadoresSaludBucalCreatePayload = {
        paciente: formData.paciente || pacienteId || "",
        activo: formData.activo,
        pieza_16_placa: formData.pieza_16_placa,
        pieza_16_calculo: formData.pieza_16_calculo,
        pieza_11_placa: formData.pieza_11_placa,
        pieza_11_calculo: formData.pieza_11_calculo,
        pieza_26_placa: formData.pieza_26_placa,
        pieza_26_calculo: formData.pieza_26_calculo,
        pieza_36_placa: formData.pieza_36_placa,
        pieza_36_calculo: formData.pieza_36_calculo,
        pieza_31_placa: formData.pieza_31_placa,
        pieza_31_calculo: formData.pieza_31_calculo,
        pieza_46_placa: formData.pieza_46_placa,
        pieza_46_calculo: formData.pieza_46_calculo,
        ohi_promedio_placa: formData.ohi_promedio_placa,
        ohi_promedio_calculo: formData.ohi_promedio_calculo,
        enfermedad_periodontal: formData.enfermedad_periodontal,
        tipo_oclusion: formData.tipo_oclusion,
        nivel_fluorosis: formData.nivel_fluorosis,
        observaciones: formData.observaciones,
      };

      if (mode === "create") {
        await createIndicador.mutateAsync(payload);
        notify({
          type: "success",
          title: "Indicadores creados",
          message: "Los indicadores de salud bucal se registraron correctamente.",
        });
      } else {
        if (!indicatorId) throw new Error("Falta el ID del indicador para editar");
        await updateIndicador.mutateAsync({ id: indicatorId, payload });
        notify({
          type: "warning",
          title: "Indicadores actualizados",
          message: "Los indicadores de salud bucal se actualizaron correctamente.",
        });
      }

      resetForm();
      openSuccessModal();
      onIndicatorCreated?.();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar los indicadores";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    closeSuccessModal();
    resetForm();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
    <div className="max-w-3xl mx-auto space-y-6">
<form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================
            SELECTOR DE PACIENTE (Solo si no hay paciente fijado)
        ======================================================================== */}
        {!pacienteId && mode === "create" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Seleccionar Paciente *
            </label>

            {selectedPaciente ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {selectedPaciente.nombres.charAt(0)}
                    {selectedPaciente.apellidos.charAt(0)}
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
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />

                {showPacienteDropdown && searchPaciente && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {pacientes && pacientes.length > 0 ? (
                      pacientes.map((paciente: IPaciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => handleSelectPaciente(paciente)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                            {paciente.nombres.charAt(0)}
                            {paciente.apellidos.charAt(0)}
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
                Debe seleccionar un paciente para continuar
              </p>
            )}
          </div>
        )}

        {/* ========================================================================
            INFORMACIÓN DEL PACIENTE FIJADO
        ======================================================================== */}
        {pacienteId && pacienteNombreCompleto && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
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

        {/* ========================================================================
            CAMPOS DEL FORMULARIO
        ======================================================================== */}
        <IndicatorsFormFields
          formData={formData}
          onInputChange={handleInputChange}
          onReset={resetForm}
          submitLoading={submitLoading}
          mode={mode}
        />

        {/* ========================================================================
            BOTONES DE ACCIÓN
        ======================================================================== */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={submitLoading}
          >
            Limpiar formulario
          </Button>

          <Button type="submit" variant="primary" disabled={submitLoading}>
            {submitLoading
              ? mode === "create"
                ? "Registrando..."
                : "Guardando..."
              : mode === "create"
              ? "Registrar indicadores"
              : "Guardar cambios"}
          </Button>
        </div>

        {/* ========================================================================
            NOTA INFORMATIVA
        ======================================================================== */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Información importante
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Los valores de placa y cálculo deben estar entre 0 y 3</li>
            <li>Los promedios OHI se calculan automáticamente en el backend</li>
            <li>Todos los campos clínicos son opcionales para flexibilidad</li>
            {!pacienteId && (
              <li className="text-red-600 dark:text-red-400 font-medium">
                Seleccione un paciente antes de registrar los indicadores
              </li>
            )}
          </ul>
        </div>
      </form>



    </div>
      

      {/* ========================================================================
          MODAL DE ÉXITO
      ======================================================================== */}
      <IndicatorsSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        message={
          mode === "create"
            ? "Indicadores registrados correctamente"
            : "Indicadores actualizados correctamente"
        }
      />
    </>
  );
}
