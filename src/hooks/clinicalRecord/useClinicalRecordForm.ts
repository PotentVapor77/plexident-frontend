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
  const updateSectionDataRef = useRef<Set<string>>(new Set());

  // Función para comparar objetos profundamente de manera más eficiente
  const deepCompare = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    
    // Para arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((item, index) => deepCompare(item, obj2[index]));
    }
    
    // Para objetos
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      Object.prototype.hasOwnProperty.call(obj2, key) && 
      deepCompare(obj1[key], obj2[key])
    );
  }, []);

  // Actualizar cuando cambia initialData (ej: carga asíncrona)
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
          updateSectionDataRef.current.clear(); // Limpiar el registro de actualizaciones
        }, 100);
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
    updateSectionDataRef.current.clear();
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

  // Versión mejorada de updateSectionData
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
      
      // Para diagnosticos_cie_data, siempre considerar cambios si es una actualización del usuario
      if (section === 'diagnosticos_cie_data' && !isInitializingRef.current) {
        // Comparación simple para ver si realmente cambió
        const currentJson = JSON.stringify(currentValue);
        const newJson = JSON.stringify(data);
        
        if (currentJson === newJson) {
          console.log(`[useClinicalRecordForm] No changes detected for ${section}, skipping update`);
          return prev;
        }
        
        console.log(`[useClinicalRecordForm] Updating ${section} with new data`);
        return {
          ...prev,
          [section]: data,
        };
      }
      
      // Para otras secciones, usar comparación profunda
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