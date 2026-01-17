// src/hooks/clinicalRecord/useClinicalRecordForm.ts

import { useState, useEffect } from "react";
import type { ClinicalRecordFormData } from "../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../types/patient/IPatient";
import type { IUser } from "../../types/user/IUser";

/**
 * ============================================================================
 * HOOK: useClinicalRecordForm
 * ============================================================================
 * Maneja el estado y lógica del formulario de historial clínico
 */
export function useClinicalRecordForm(
  initialData?: Partial<ClinicalRecordFormData>
) {
  const [formData, setFormData] = useState<ClinicalRecordFormData>({
    paciente: "",
    odontologo_responsable: "",
    motivo_consulta: "",
    embarazada: "",
    enfermedad_actual: "",
    estado: "BORRADOR",
    observaciones: "",
    unicodigo: "",
    establecimiento_salud: "",
    usar_ultimos_datos: true,
    ...initialData,
  });

  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);
  const [selectedOdontologo, setSelectedOdontologo] = useState<IUser | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Actualizar formData cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Marcar como "sucio" cuando hay cambios
  useEffect(() => {
    setIsDirty(true);
  }, [formData]);

  const updateField = <K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      paciente: "",
      odontologo_responsable: "",
      motivo_consulta: "",
      embarazada: "",
      enfermedad_actual: "",
      estado: "BORRADOR",
      observaciones: "",
      unicodigo: "",
      establecimiento_salud: "",
      usar_ultimos_datos: true,
    });
    setSelectedPaciente(null);
    setSelectedOdontologo(null);
    setIsDirty(false);
  };

  const isValid = () => {
    return (
      formData.paciente !== "" &&
      formData.odontologo_responsable !== "" &&
      formData.motivo_consulta.length >= 10
    );
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    selectedPaciente,
    setSelectedPaciente,
    selectedOdontologo,
    setSelectedOdontologo,
    isDirty,
    isValid: isValid(),
  };
}
