// src/components/odontogram/indicator/IndicatorsForm.tsx

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useModal } from "../../../hooks/useModal";
import {
  useCreateIndicadoresSaludBucal,
  useUpdateIndicadoresSaludBucal
} from "../../../hooks/odontogram/useIndicadoresSaludBucal";
import { usePiezasIndice, useVerificarDisponibilidadPiezas } from "../../../hooks/odontogram/usePiezasIndice";
import type { IndicadoresSaludBucalCreatePayload } from "../../../core/types/odontograma.types";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import type { IPaciente } from "../../../types/patient/IPatient";
import IndicatorsFormFields from "./IndicatorsFormFields";
import { IndicatorsSuccessModal } from "./IndicatorsSuccessModal";
import { usePacientes } from "../../../hooks/patient/usePatients";
import { Search, X, User, AlertCircle, Info } from "lucide-react";
import Button from "../../ui/button/Button";

// ============================================================================
// TYPES
// ============================================================================

export interface IndicatorsFormData {
  paciente: string;
  activo: boolean;
  // Campos dinámicos para piezas (se agregarán dinámicamente según disponibilidad)
  [key: string]: string | number | boolean | null;
  // Campos estáticos
  ohi_promedio_placa: number | null;
  ohi_promedio_calculo: number | null;
  gi_promedio_gingivitis: number | null;
  enfermedad_periodontal: "LEVE" | "MODERADA" | "SEVERA" | null;
  tipo_oclusion: "ANGLE_I" | "ANGLE_II" | "ANGLE_III" | null;
  nivel_fluorosis: "NINGUNA" | "LEVE" | "MODERADA" | "SEVERA" | null;
  nivel_gingivitis: "SANO" | "LEVE" | "MODERADO" | "SEVERO" | null;
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

  // ============================================================================
  // HOOKS
  // ============================================================================

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
    search: "",
  });

  // Cargar información de piezas alternativas
  const { informacionPiezas, isLoading: loadingPiezas, error: errorPiezas } =
    usePiezasIndice(pacienteId);

  // Verificar disponibilidad de piezas
  const { data: verificacion, isLoading: verificandoPiezas } =
    useVerificarDisponibilidadPiezas(pacienteId);

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<IndicatorsFormData>({
    paciente: initialData?.paciente ?? pacienteId ?? "",
    activo: initialData?.activo ?? true,
    ohi_promedio_placa: initialData?.ohi_promedio_placa ?? null,
    ohi_promedio_calculo: initialData?.ohi_promedio_calculo ?? null,
    gi_promedio_gingivitis: initialData?.gi_promedio_gingivitis ?? null,
    enfermedad_periodontal: initialData?.enfermedad_periodontal ?? null,
    tipo_oclusion: initialData?.tipo_oclusion ?? null,
    nivel_fluorosis: initialData?.nivel_fluorosis ?? null,
    nivel_gingivitis: null,
    observaciones: initialData?.observaciones ?? null,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Inicializar campos de piezas cuando se carga la información
  useEffect(() => {
  if (informacionPiezas && mode === "create") {
    const newFormData: Record<string, string | number | boolean | null> = {};
    
    const piezasData = informacionPiezas.piezas_mapeo || informacionPiezas.piezas || {};
    
    Object.keys(piezasData).forEach((piezaOriginal) => {
      newFormData[`pieza_${piezaOriginal}_placa`] = null;
      newFormData[`pieza_${piezaOriginal}_calculo`] = null;
      newFormData[`pieza_${piezaOriginal}_gingivitis`] = null;
    });

    setFormData(prev => ({ ...prev, ...newFormData } as IndicatorsFormData));
  }
}, [informacionPiezas, mode]);
const handlePiezaChange = (
  pieza: string,  
  tipo: "placa" | "calculo" | "gingivitis",
  valor: number | null
) => {
  setFormData(prev => ({
    ...prev,
    [`pieza_${pieza}_${tipo}`]: valor
  }));
};
  // Cargar datos iniciales en modo edición
  useEffect(() => {
  if (initialData && mode === "edit" && informacionPiezas) {
    console.log('[IndicatorsForm] Cargando datos en modo edit', {
      initialData,
      informacionPiezas
    });
    
    const newFormData: Record<string, string | number | boolean | null> = {};
    const piezasData = informacionPiezas.piezas_mapeo || informacionPiezas.piezas || {};

    Object.entries(piezasData).forEach(([piezaOriginal, info]) => {
      
      const placaKey = `pieza_${piezaOriginal}_placa`;
      const calculoKey = `pieza_${piezaOriginal}_calculo`;
      const gingivitisKey = `pieza_${piezaOriginal}_gingivitis`;

      newFormData[placaKey] = (initialData as any)[placaKey] ?? null;
      newFormData[calculoKey] = (initialData as any)[calculoKey] ?? null;
      newFormData[gingivitisKey] = (initialData as any)[gingivitisKey] ?? null;

      console.log(`[IndicatorsForm] Cargando pieza ${piezaOriginal}:`, {
        placaKey,
        placa: newFormData[placaKey],
        calculo: newFormData[calculoKey],
        gingivitis: newFormData[gingivitisKey]
      });
    });

    setFormData(prev => {
      const updated = { ...prev, ...newFormData } as IndicatorsFormData;
      console.log('[IndicatorsForm] FormData actualizado:', updated);
      return updated;
    });
  }
}, [initialData, mode, informacionPiezas]);

  // Mostrar advertencia si no hay suficientes piezas
  useEffect(() => {
    if (verificacion && !verificacion.puede_crear_indicadores && pacienteId) {
      notify({
        type: 'warning',
        title: 'Piezas insuficientes',
        message: verificacion.mensaje,
      });
    }
  }, [verificacion, notify, pacienteId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<InputElement>
  ): void => {
    const { name, value } = e.target;

    // Manejar campos numéricos
    if (
      name.includes("placa") ||
      name.includes("calculo") ||
      name.includes("gingivitis") ||
      name.includes("ohi_promedio") ||
      name.includes("gi_promedio")
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

    // Validar que haya piezas disponibles
    if (verificacion && !verificacion.puede_crear_indicadores) {
      errors.push(verificacion.mensaje);
    }

    // Validar rangos numéricos dinámicamente según piezas disponibles
    if (informacionPiezas?.piezas) {
      Object.entries(informacionPiezas.piezas).forEach(([piezaOriginal, info]) => {
        if (!info.disponible) return;

        const piezaUsada = info.codigo_usado || piezaOriginal;

        // Validar placa (0-3)
        const placaValue = formData[`pieza_${piezaUsada}_placa`] as number | null;
        if (placaValue !== null && (placaValue < 0 || placaValue > 3)) {
          errors.push(`El valor de placa para pieza ${piezaUsada} debe estar entre 0 y 3`);
        }

        // Validar cálculo (0-3)
        const calculoValue = formData[`pieza_${piezaUsada}_calculo`] as number | null;
        if (calculoValue !== null && (calculoValue < 0 || calculoValue > 3)) {
          errors.push(`El valor de cálculo para pieza ${piezaUsada} debe estar entre 0 y 3`);
        }

        // Validar gingivitis (0-1)
        const gingivitisValue = formData[`pieza_${piezaUsada}_gingivitis`] as number | null;
        if (gingivitisValue !== null && (gingivitisValue < 0 || gingivitisValue > 1)) {
          errors.push(`El valor de gingivitis para pieza ${piezaUsada} debe ser 0 o 1`);
        }
      });
    }

    // Validar que al menos un indicador tenga datos
    const hasAtLeastOneValue = Object.keys(formData).some((key) => {
      if (key === 'paciente' || key === 'activo') return false;
      const value = formData[key];
      return value !== null && value !== "";
    });

    if (!hasAtLeastOneValue) {
      errors.push("Debe registrar al menos un indicador de salud bucal");
    }

    return errors;
  };

  const resetForm = () => {
    const baseFormData: IndicatorsFormData = {
      paciente: pacienteId ?? "",
      activo: true,
      ohi_promedio_placa: null,
      ohi_promedio_calculo: null,
      gi_promedio_gingivitis: null,
      enfermedad_periodontal: null,
      tipo_oclusion: null,
      nivel_fluorosis: null,
      nivel_gingivitis: null,
      observaciones: null,
    };

    // Reiniciar campos de piezas dinámicamente
    if (informacionPiezas?.piezas) {
      Object.entries(informacionPiezas.piezas).forEach(([_, info]) => {
        const piezaUsada = info.codigo_usado;
        if (piezaUsada) {
          baseFormData[`pieza_${piezaUsada}_placa`] = null;
          baseFormData[`pieza_${piezaUsada}_calculo`] = null;
          baseFormData[`pieza_${piezaUsada}_gingivitis`] = null;
        }
      });
    }

    setFormData(baseFormData);
    setSelectedPaciente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      notify({
        type: 'error',
        title: 'Errores de validación',
        message: validationErrors.join('\n'),
      });
      return;
    }

    setSubmitLoading(true);

    try {
      // Construir payload dinámicamente incluyendo todos los campos de piezas
      const payload: any = {
        paciente: formData.paciente || pacienteId || "",
        activo: formData.activo,
        ohi_promedio_placa: formData.ohi_promedio_placa,
        ohi_promedio_calculo: formData.ohi_promedio_calculo,
        gi_promedio_gingivitis: formData.gi_promedio_gingivitis,
        enfermedad_periodontal: formData.enfermedad_periodontal,
        tipo_oclusion: formData.tipo_oclusion,
        nivel_fluorosis: formData.nivel_fluorosis,
        nivel_gingivitis: formData.nivel_gingivitis,
        observaciones: formData.observaciones,
        pieza_16_placa: formData.pieza_16_placa,
        pieza_16_calculo: formData.pieza_16_calculo,
        pieza_16_gingivitis: formData.pieza_16_gingivitis,
        pieza_11_placa: formData.pieza_11_placa,
        pieza_11_calculo: formData.pieza_11_calculo,
        pieza_11_gingivitis: formData.pieza_11_gingivitis,
        pieza_26_placa: formData.pieza_26_placa,
        pieza_26_calculo: formData.pieza_26_calculo,
        pieza_26_gingivitis: formData.pieza_26_gingivitis,
        pieza_36_placa: formData.pieza_36_placa,
        pieza_36_calculo: formData.pieza_36_calculo,
        pieza_36_gingivitis: formData.pieza_36_gingivitis,
        pieza_31_placa: formData.pieza_31_placa,
        pieza_31_calculo: formData.pieza_31_calculo,
        pieza_31_gingivitis: formData.pieza_31_gingivitis,
        pieza_46_placa: formData.pieza_46_placa,
        pieza_46_calculo: formData.pieza_46_calculo,        
        pieza_46_gingivitis: formData.pieza_46_gingivitis,

      };

      // Agregar campos de piezas dinámicamente
      if (informacionPiezas?.piezas) {
        Object.entries(informacionPiezas.piezas).forEach(([_, info]) => {
          const piezaUsada = info.codigo_usado;
          if (piezaUsada) {
            payload[`pieza_${piezaUsada}_placa`] = formData[`pieza_${piezaUsada}_placa`];
            payload[`pieza_${piezaUsada}_calculo`] = formData[`pieza_${piezaUsada}_calculo`];
            payload[`pieza_${piezaUsada}_gingivitis`] = formData[`pieza_${piezaUsada}_gingivitis`];
          }
        });
      }

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
          type: "success",
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

      notify({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
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

  // Mostrar loading mientras se cargan las piezas
  if (loadingPiezas || verificandoPiezas) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Cargando información de piezas dentales...
        </p>
      </div>
    );
  }

  // Mostrar error si falla la carga
  if (errorPiezas) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                Error al cargar información
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {errorPiezas}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ========================================================================
              ADVERTENCIA DE DISPONIBILIDAD
          ======================================================================== */}
          {verificacion && !verificacion.puede_crear_indicadores && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Advertencia: Piezas dentales insuficientes
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    {verificacion.mensaje}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                    Solo {verificacion.piezas_disponibles} pieza(s) disponible(s). Se requieren al menos 3 piezas para calcular índices válidos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================
              INFORMACIÓN DE DENTICIÓN
          ======================================================================== */}
          {informacionPiezas && (
            <div className={`p-4 rounded-lg border ${informacionPiezas.denticion === 'temporal'
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              }`}>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Dentición: {informacionPiezas.denticion === 'temporal' ? 'Temporal (Decidua)' : 'Permanente'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {informacionPiezas.estadisticas.piezas_originales} piezas principales disponibles, {' '}
                    {informacionPiezas.estadisticas.piezas_alternativas} alternativas usadas, {' '}
                    {informacionPiezas.estadisticas.piezas_no_disponibles} no disponibles
                  </p>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Porcentaje de disponibilidad: {informacionPiezas.estadisticas.porcentaje_disponible.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

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
  pacienteId={pacienteId}
  informacionPiezas={informacionPiezas} 
  loadingPiezas={loadingPiezas}          
  errorPiezas={errorPiezas}              
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

            <Button
              type="submit"
              variant="primary"
              disabled={submitLoading || (verificacion && !verificacion.puede_crear_indicadores)}
            >
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
              💡 Información importante
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Los valores de placa y cálculo deben estar entre 0 y 3</li>
              <li>Los valores de gingivitis deben ser 0 (sano) o 1 (inflamado)</li>
              <li>Los promedios se calculan automáticamente en el backend</li>
              <li>El sistema usa piezas alternativas cuando las principales no están disponibles</li>
              {informacionPiezas && informacionPiezas.estadisticas.piezas_alternativas > 0 && (
                <li className="text-amber-700 dark:text-amber-400 font-medium">
                  Se están usando {informacionPiezas.estadisticas.piezas_alternativas} pieza(s) alternativa(s)
                </li>
              )}
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
