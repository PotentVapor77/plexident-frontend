// src/hooks/clinicalRecord/useClinicalRecordForm.ts

import { useState, useEffect } from "react";
import type { ClinicalRecordFormData } from "../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../types/patient/IPatient";
import type { IUser } from "../../types/user/IUser";
import { clinicalRecordCreateSchema } from "../../core/schemas/clinicalRecord.schema";
import { ZodError } from "zod";

export function useClinicalRecordForm(
  initialData?: Partial<ClinicalRecordFormData> & {
    _dates?: { [key: string]: string | null };
    _metadata?: { [key: string]: any };
  }
) {
  const defaultValues: ClinicalRecordFormData = {
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
    antecedentes_personales_data: null,
    antecedentes_familiares_data: null,
    constantes_vitales_data: null,
    examen_estomatognatico_data: null,
  };

  const mergeData = (
    base: ClinicalRecordFormData,
    incoming?: Partial<ClinicalRecordFormData>
  ): ClinicalRecordFormData => {
    if (!incoming) return base;
    return {
      ...base,
      ...incoming,
      motivo_consulta: incoming.motivo_consulta ?? base.motivo_consulta ?? "",
      enfermedad_actual: incoming.enfermedad_actual ?? base.enfermedad_actual ?? "",
      observaciones: incoming.observaciones ?? base.observaciones ?? "",
    };
  };

  const [formData, setFormData] = useState<ClinicalRecordFormData>(() =>
    mergeData(defaultValues, initialData)
  );

  const [initialDates, setInitialDates] = useState<{
    [key: string]: string | null;
  }>({});

  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(
    null
  );

  const [selectedOdontologo, setSelectedOdontologo] = useState<IUser | null>(
    null
  );

  const [isDirty, setIsDirty] = useState(false);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Actualizar cuando cambia initialData (ej: carga asíncrona)
  useEffect(() => {
    if (initialData) {
      const { _dates, ...dataValues } = initialData;
      setFormData((prev) =>
        mergeData(prev, dataValues as Partial<ClinicalRecordFormData>)
      );
      if (_dates) {
        setInitialDates(_dates);
      }
    }
  }, [initialData]);

  // Marcar como sucio
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
    
    // Limpiar error de validación del campo actualizado
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    setSelectedPaciente(null);
    setSelectedOdontologo(null);
    setIsDirty(false);
    setInitialDates({});
    setValidationErrors({});
  };

  const validate = (): boolean => {
    try {
      clinicalRecordCreateSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Validación simple para UI (síncrona)
  const isValid = (): boolean => {
    return (
      Boolean(formData.paciente) &&
      Boolean(formData.odontologo_responsable) &&
      (formData.motivo_consulta?.length ?? 0) >= 10
    );
  };

  const updateSectionData = <
    T extends
      | "antecedentes_personales_data"
      | "antecedentes_familiares_data"
      | "constantes_vitales_data"
      | "examen_estomatognatico_data"
  >(
    section: T,
    data: ClinicalRecordFormData[T]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  return {
    formData,
    setFormData,
    updateField,
    updateSectionData,
    resetForm,
    selectedPaciente,
    setSelectedPaciente,
    selectedOdontologo,
    setSelectedOdontologo,
    isDirty,
    isValid: isValid(),
    validate,
    validationErrors,
    initialDates,
    setInitialDates,
  };
}
