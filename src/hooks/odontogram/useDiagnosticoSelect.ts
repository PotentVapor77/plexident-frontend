// src/hooks/odontogram/useDiagnosticoSelect.ts

import { useState, useCallback, useMemo, type Dispatch, type SetStateAction, useEffect } from "react";
import type { AreaAfectada, AtributoClinicoDefinicion, DiagnosticoCategory, DiagnosticoItem } from "../../core/types/typeOdontograma";


export type PrincipalArea = 'corona' | 'raiz' | 'general' | null;

interface UseDiagnosticoSelectProps {
  currentArea: PrincipalArea;
  categorias: DiagnosticoCategory[];
  onApply: (...args: any) => void;
  onCancel: () => void;
  onPreviewChange: Dispatch<SetStateAction<string | null>>;
  onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, any>>>;
}

export const useDiagnosticoSelect = ({
  currentArea,
  categorias,
  onApply,
  onCancel,
  onPreviewChange,
  onPreviewOptionsChange,
}: UseDiagnosticoSelectProps) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<DiagnosticoCategory | null>(null);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<DiagnosticoItem | null>(null);
  const [atributosClinicosSeleccionados, setAtributosClinicosSeleccionados] = useState<Record<string, any>>({});
  const [descripcion, setDescripcion] = useState("");
  const [formValid, setFormValid] = useState(false);

  // Filtrar categorías y diagnósticos basados en el área actual
  const filteredCategories = useMemo(() => {
    return categorias
      .map(category => {
        const filteredDiagnoses = category.diagnosticos.filter(diag => {
          const isGeneralDiagnosis = diag.areas_afectadas.includes('general');
          if (!currentArea) return isGeneralDiagnosis;
          return isGeneralDiagnosis || diag.areas_afectadas.includes(currentArea as AreaAfectada);
        });
        if (filteredDiagnoses.length === 0) return null;
        return { ...category, diagnosticos: filteredDiagnoses };
      })
      .filter((cat): cat is DiagnosticoCategory => cat !== null);
  }, [currentArea, categorias]);

  // Diagnósticos disponibles en el segundo select
  const currentDiagnosesForSelect = useMemo(() => {
    return filteredCategories
      .find(c => c.id === categoriaSeleccionada?.id)?.diagnosticos || [];
  }, [categoriaSeleccionada, filteredCategories]);

  // Resetear la selección si el área cambia
  useEffect(() => {
    setCategoriaSeleccionada(null);
    setDiagnosticoSeleccionado(null);
    setAtributosClinicosSeleccionados({});
    setDescripcion("");
  }, [currentArea]);

  const resetState = useCallback(() => {
    setCategoriaSeleccionada(null);
    setDiagnosticoSeleccionado(null);
    setAtributosClinicosSeleccionados({});
    setDescripcion("");
    onPreviewChange(null);
    onPreviewOptionsChange({});
  }, [onPreviewChange, onPreviewOptionsChange]);

  const isFormValid = useCallback((): boolean => {
    if (!diagnosticoSeleccionado) return false;

    // 1. Validar que si el diagnóstico NO es general, se haya seleccionado un área
    const requiresSpecificArea = !diagnosticoSeleccionado.areas_afectadas.includes('general');
    if (requiresSpecificArea && !currentArea) {
      return false;
    }

    // 2. Validar atributos clínicos requeridos
    if (diagnosticoSeleccionado.atributos_clinicos && Object.keys(diagnosticoSeleccionado.atributos_clinicos).length > 0) {
      for (const [key, atributo] of Object.entries(diagnosticoSeleccionado.atributos_clinicos)) {
        const attr = atributo as AtributoClinicoDefinicion;
        
        // Solo validar si es requerido
        if (attr.requerido) {
          const value = atributosClinicosSeleccionados[key];
          
          // Para checkboxes (arrays)
          if (attr.tipo_input === 'checkbox') {
            if (!Array.isArray(value) || value.length === 0) {
              return false;
            }
          } 
          // Para otros tipos (string)
          else {
            if (!value || value === "") {
              return false;
            }
          }
        }
      }
    }

    return true;
  }, [diagnosticoSeleccionado, atributosClinicosSeleccionados, currentArea]);

  // Efecto para manejar el preview y la validación del formulario
  useEffect(() => {
    onPreviewChange(diagnosticoSeleccionado?.id || null);
    const isGeneralDiagnosis = diagnosticoSeleccionado?.areas_afectadas.includes('general');
    
    if (isGeneralDiagnosis) {
      onPreviewOptionsChange({ ...atributosClinicosSeleccionados, afectaTodo: 'true' });
    } else {
      onPreviewOptionsChange(atributosClinicosSeleccionados);
    }

    setFormValid(isFormValid());
  }, [diagnosticoSeleccionado, atributosClinicosSeleccionados, onPreviewChange, onPreviewOptionsChange, isFormValid]);

  const handleCategoriaSelect = (id: string) => {
    const cat = categorias.find(c => c.id === id);
    if (!cat) return;
    setCategoriaSeleccionada(cat);
    setDiagnosticoSeleccionado(null);
    setAtributosClinicosSeleccionados({});
  };

  const handleDiagnosticoChange = (id: string) => {
    if (!categoriaSeleccionada) return;
    
    const diag = categoriaSeleccionada.diagnosticos.find(d => d.id === id);
    if (!diag) {
      setDiagnosticoSeleccionado(null);
      setAtributosClinicosSeleccionados({});
      return;
    }


    setDiagnosticoSeleccionado(diag);
    setDescripcion("");

    // Establecer valores por defecto para los atributos clínicos
    if (diag.atributos_clinicos && Object.keys(diag.atributos_clinicos).length > 0) {
      const defaults: Record<string, any> = {};
      
      Object.entries(diag.atributos_clinicos).forEach(([key, atributo]) => {
        const attr = atributo as AtributoClinicoDefinicion;
        
        // Para select/radio: pre-seleccionar primera opción si no es requerido
        if ((attr.tipo_input === 'select' || attr.tipo_input === 'radio') && !attr.requerido) {
          if (attr.opciones.length > 0) {
            defaults[key] = attr.opciones[0].key;
          }
        }
        
        // Para checkbox: array vacío
        if (attr.tipo_input === 'checkbox') {
          defaults[key] = [];
        }
        
        // Para text: string vacío
        if (attr.tipo_input === 'text') {
          defaults[key] = '';
        }
      });
      
      setAtributosClinicosSeleccionados(defaults);
    } else {
      setAtributosClinicosSeleccionados({});
    }
  };

  // ✅ RENOMBRADO: handleOptionChange → handleAtributoChange
  // ✅ SOPORTE: string | string[] (para checkboxes)
  const handleAtributoChange = (key: string, value: string | string[]) => {
    setAtributosClinicosSeleccionados(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    if (!diagnosticoSeleccionado || !formValid) return;

    const isGeneralDiagnosis = diagnosticoSeleccionado.areas_afectadas.includes('general');
    let areasToApply: AreaAfectada[];

    if (isGeneralDiagnosis) {
      areasToApply = ['general'];
    } else if (currentArea) {
      areasToApply = [currentArea as AreaAfectada];
    } else {
      return;
    }

    onApply(
      diagnosticoSeleccionado.id,
      diagnosticoSeleccionado.simboloColor,
      atributosClinicosSeleccionados,
      descripcion,
      areasToApply
    );
    resetState();
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const requiresSpecificAreaMessage = diagnosticoSeleccionado &&
    !diagnosticoSeleccionado.areas_afectadas.includes('general') &&
    !currentArea;

  return {
    // Estados
    categoriaSeleccionada,
    diagnosticoSeleccionado,
    atributosClinicosSeleccionados,
    descripcion,
    formValid,
    // Handlers
    handleCategoriaSelect,
    handleDiagnosticoChange,
    handleAtributoChange,
    setDescripcion,
    handleApply,
    handleCancel,
    // Propiedades calculadas
    filteredCategories,
    currentDiagnosesForSelect,
    requiresSpecificAreaMessage,
  };
};
