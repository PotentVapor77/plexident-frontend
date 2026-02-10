// src/hooks/clinicalRecord/useClinicalRecordForm.ts

import { useState, useEffect, useRef, useCallback } from "react";
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
    numero_archivo: "", 
    institucion_sistema: "SISTEMA NACIONAL DE SALUD", 
    numero_hoja: 1, 
    usar_ultimos_datos: true,
    antecedentes_personales_data: null,
    antecedentes_familiares_data: null,
    constantes_vitales_data: null,
    examen_estomatognatico_data: null,
    indicadores_salud_bucal_data: null,
    diagnosticos_cie_id: null,
    diagnosticos_cie_data: null,
    plan_tratamiento_sesiones: [],
    plan_tratamiento_odontograma_id: null,
    plan_tratamiento_id: null,
    examenes_complementarios_data: null,
    examenes_complementarios_id: null
    
  };

  // Usar useCallback para evitar recrear la función en cada render
  const mergeData = useCallback((
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
  }, []);

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

  // Refs para controlar ciclos
  const isInitializingRef = useRef(false);
  const previousFormDataRef = useRef<ClinicalRecordFormData>(formData);

  // Función para comparar objetos profundamente
  const deepCompare = useCallback((obj1: any, obj2: any): boolean => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }, []);

  // Actualizar cuando cambia initialData (ej: carga asíncrona)
  // FIXED: Evitar ciclos infinitos con comparaciones profundas
  useEffect(() => {
    if (initialData && !isInitializingRef.current) {
      const { _dates, ...dataValues } = initialData;
      
      // Crear nuevo estado formado con los datos entrantes
      const newFormData = mergeData(formData, dataValues as Partial<ClinicalRecordFormData>);
      
      // Comparar profundamente antes de actualizar
      const hasChanges = !deepCompare(previousFormDataRef.current, newFormData);
      
      if (hasChanges) {
        isInitializingRef.current = true;
        
        setFormData(newFormData);
        previousFormDataRef.current = newFormData;
        
        if (_dates) {
          setInitialDates(_dates);
        }
        
        // Resetear flag después de un ciclo
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 0);
      }
    }
  }, [initialData, mergeData, formData, deepCompare]);

  // Marcar como sucio solo cuando hay cambios reales
  useEffect(() => {
    const currentData = JSON.stringify(formData);
    const prevData = JSON.stringify(previousFormDataRef.current);
    
    if (currentData !== prevData) {
      setIsDirty(true);
      previousFormDataRef.current = formData;
    }
  }, [formData]);

  const updateField = useCallback(<K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => {
    setFormData((prev) => {
      // Evitar actualizaciones innecesarias
      if (prev[field] === value) return prev;
      
      return {
        ...prev,
        [field]: value,
      };
    });
    
    // Limpiar error de validación del campo actualizado
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const resetForm = useCallback(() => {
    setFormData(defaultValues);
    setSelectedPaciente(null);
    setSelectedOdontologo(null);
    setIsDirty(false);
    setInitialDates({});
    setValidationErrors({});
    previousFormDataRef.current = defaultValues;
    isInitializingRef.current = false;
  }, [defaultValues]);

  const validate = useCallback((): boolean => {
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
  }, [formData]);

  // Validación simple para UI (síncrona)
  const isValid = useCallback((): boolean => {
    return (
      Boolean(formData.paciente) &&
      Boolean(formData.odontologo_responsable) &&
      (formData.motivo_consulta?.length ?? 0) >= 10
    );
  }, [formData]);

  // FIXED: updateSectionData optimizado para prevenir ciclos
  const updateSectionData = useCallback(<
    T extends
      | "antecedentes_personales_data"
      | "antecedentes_familiares_data"
      | "constantes_vitales_data"
      | "examen_estomatognatico_data"
      | "indicadores_salud_bucal_data"
      | "indices_caries_data"
      | "diagnosticos_cie_data"
      | "examenes_complementarios_data"
      
      
  >(
    section: T,
    data: ClinicalRecordFormData[T]
  ) => {
    setFormData((prev) => {
      // Verificar si el nuevo valor es realmente diferente
      const currentValue = prev[section];
      const isSame = deepCompare(currentValue, data);
      
      if (isSame) {
        console.log(`[useClinicalRecordForm] No changes detected for ${section}, skipping update`);
        return prev;
      }
      
      console.log(`[useClinicalRecordForm] Updating ${section} with new data`);
      return {
        ...prev,
        [section]: data,
      };
    });
  }, [deepCompare]);

  

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
    isValid,
    validate,
    validationErrors,
    initialDates,
    setInitialDates,
    
  };
}