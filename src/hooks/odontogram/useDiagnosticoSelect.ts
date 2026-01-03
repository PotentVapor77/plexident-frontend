// src/hooks/odontogram/useDiagnosticoSelect.ts

import { useState, useCallback, useMemo, type Dispatch, type SetStateAction, useEffect } from "react";
import type { AreaAfectada, AtributoClinicoDefinicion, DiagnosticoCategory, DiagnosticoItem } from "../../core/types/odontograma.types";

export type PrincipalArea = 'corona' | 'raiz' | 'general' | null;

interface UseDiagnosticoSelectProps {
    currentArea: PrincipalArea;
    categorias: DiagnosticoCategory[];
    onApply: (...args: any) => void;
    onCancel: () => void;
    onPreviewChange: Dispatch<SetStateAction<string | null>>;
    onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, any>>>;
}

// ============================================================================
//  CONFIGURACIÓN: DIAGNÓSTICOS PRIORITARIOS
// ============================================================================
/**
 * Diagnósticos que SIEMPRE se muestran en la lista, independientemente
 * del área seleccionada. Útil para diagnósticos críticos del Formulario 033.
 */
const DIAGNOSTICOS_PRIORITARIOS = [
    'caries',                    // X_rojo - Caries
    'obturacion',                // o_azul - Obturado
    'sellante_necesario',        // U_rojo - Sellante necesario
    'sellante_realizado',        // U_azul - Sellante realizado
    'extraccion_indicada',       // X_rojo - Extracción indicada
    'endodoncia_indicada',       // r - Endodoncia por realizar
    'endodoncia_realizada',      // |_azul - Endodoncia realizada
];

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useDiagnosticoSelect = ({
    currentArea,
    categorias,
    onApply,
    onCancel,
    onPreviewChange,
    onPreviewOptionsChange,
}: UseDiagnosticoSelectProps) => {

    // ============================================================================
    // ESTADO
    // ============================================================================

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<DiagnosticoCategory | null>(null);
    const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<DiagnosticoItem | null>(null);
    const [atributosClinicosSeleccionados, setAtributosClinicosSeleccionados] = useState<Record<string, any>>({});
    const [descripcion, setDescripcion] = useState("");
    const [formValid, setFormValid] = useState(false);

    // ============================================================================
    //    FILTRADO HÍBRIDO: Diagnósticos visibles según área
    // ============================================================================

    const filteredCategories = useMemo(() => {
        //console.log('[Filtrado] Iniciando filtrado. currentArea:', currentArea);

        return categorias
            .map(category => {
                const filteredDiagnoses = category.diagnosticos.filter(diag => {
                    // PRIORIDAD 1: Diagnósticos prioritarios siempre visibles
                    if (DIAGNOSTICOS_PRIORITARIOS.includes(diag.id)) {
                        //console.log(` [Prioritario] ${diag.nombre} (${diag.id}) - SIEMPRE VISIBLE`);
                        return true;
                    }

                    const isGeneralDiagnosis = diag.areasafectadas.includes('general');

                    // PRIORIDAD 2: Si no hay área seleccionada, mostrar solo generales
                    if (!currentArea) {
                        const shouldShow = isGeneralDiagnosis;
                        return shouldShow;
                    }

                    // PRIORIDAD 3: Si hay área seleccionada, filtrar por esa área o generales
                    const matchesArea = diag.areasafectadas.includes(currentArea as AreaAfectada);
                    const shouldShow = isGeneralDiagnosis || matchesArea;
                    return shouldShow;
                });

                if (filteredDiagnoses.length === 0) {
                    //console.log(`  [Categoría] ${category.nombre} - SIN DIAGNÓSTICOS`);
                    return null;
                }

                //console.log(` [Categoría] ${category.nombre} - ${filteredDiagnoses.length} diagnósticos`);
                return { ...category, diagnosticos: filteredDiagnoses };
            })
            .filter((cat): cat is DiagnosticoCategory => cat !== null);
    }, [currentArea, categorias]);

    // ============================================================================
    // DIAGNÓSTICOS DEL SELECT ACTUAL
    // ============================================================================

    const currentDiagnosesForSelect = useMemo(() => {
        return filteredCategories
            .find(c => c.id === categoriaSeleccionada?.id)?.diagnosticos || [];
    }, [categoriaSeleccionada, filteredCategories]);

    // ============================================================================
    // EFECTOS: Resetear al cambiar área
    // ============================================================================

    useEffect(() => {
        console.log('[Reset] Área cambió a:', currentArea);
        setCategoriaSeleccionada(null);
        setDiagnosticoSeleccionado(null);
        setAtributosClinicosSeleccionados({});
        setDescripcion("");
    }, [currentArea]);

    // ============================================================================
    // VALIDACIÓN: Verificar si el formulario es válido
    // ============================================================================

    const isFormValid = useCallback((): boolean => {
        if (!diagnosticoSeleccionado) return false;

        // 1Validar que si el diagnóstico NO es general, se haya seleccionado un área
        const requiresSpecificArea = !diagnosticoSeleccionado.areasafectadas.includes('general');
        if (requiresSpecificArea && !currentArea) {
            console.log('[Validación] Requiere área específica pero currentArea es null');
            return false;
        }

        // Validar atributos clínicos requeridos
        if (diagnosticoSeleccionado.atributos_clinicos && Object.keys(diagnosticoSeleccionado.atributos_clinicos).length > 0) {
            for (const [key, atributo] of Object.entries(diagnosticoSeleccionado.atributos_clinicos)) {
                const attr = atributo as AtributoClinicoDefinicion;

                // Solo validar si es requerido
                if (attr.requerido) {
                    const value = atributosClinicosSeleccionados[key];

                    // Para checkboxes (arrays)
                    if (attr.tipo_input === 'checkbox') {
                        if (!Array.isArray(value) || value.length === 0) {
                            console.log(`[Validación] Atributo ${key} (checkbox) requerido pero vacío`);
                            return false;
                        }
                    }
                    // Para otros tipos (string)
                    else {
                        if (!value || value === "") {
                            console.log(`[Validación] Atributo ${key} (${attr.tipo_input}) requerido pero vacío`);
                            return false;
                        }
                    }
                }
            }
        }

        console.log('[Validación] Formulario válido');
        return true;
    }, [diagnosticoSeleccionado, atributosClinicosSeleccionados, currentArea]);

    // ============================================================================
    // EFECTO: Actualizar preview y validación
    // ============================================================================

    useEffect(() => {
        onPreviewChange(diagnosticoSeleccionado?.id || null);

        const isGeneralDiagnosis = diagnosticoSeleccionado?.areasafectadas.includes('general');

        let areasToApply: AreaAfectada[] = [];

        if (isGeneralDiagnosis) {
            areasToApply = ['general'];
        } else if (currentArea) {
            areasToApply = [currentArea as AreaAfectada];
        } else {
            console.log('[Apply] No se puede aplicar - Sin área y diagnóstico no es general');
            return;
        }

        setFormValid(isFormValid());
    }, [diagnosticoSeleccionado, atributosClinicosSeleccionados, onPreviewChange, onPreviewOptionsChange, isFormValid]);

    // ============================================================================
    // HANDLERS: Gestión de estado
    // ============================================================================

    const resetState = useCallback(() => {
        console.log('[Reset] Reiniciando estado completo');
        setCategoriaSeleccionada(null);
        setDiagnosticoSeleccionado(null);
        setAtributosClinicosSeleccionados({});
        setDescripcion("");
        onPreviewChange(null);
        onPreviewOptionsChange({});
    }, [onPreviewChange, onPreviewOptionsChange]);

    const handleCategoriaSelect = (id: string) => {
        const cat = categorias.find(c => c.id === id);
        if (!cat) return;

        console.log('[Categoría] Seleccionada:', cat.nombre);
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

        console.log('[Diagnóstico] Seleccionado:', diag.nombre);
        console.log('  Atributos clínicos:', diag.atributos_clinicos);

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

    const handleAtributoChange = (key: string, value: string | string[]) => {
        setAtributosClinicosSeleccionados(prev => ({ ...prev, [key]: value }));
    };


    // Si hay un error usa      formValid
    const handleApply = useCallback(() => {
        if (!diagnosticoSeleccionado) {
            console.log('[Apply] No se puede aplicar - No hay diagnóstico seleccionado');
            return;
        }

        if (!isFormValid()) {
            console.log('[Apply] No se puede aplicar - Formulario inválido');
            return;
        }

        const isGeneralDiagnosis = diagnosticoSeleccionado.areasafectadas.includes('general');
        let areasToApply: AreaAfectada[];

        if (isGeneralDiagnosis) {
            areasToApply = ['general'];
        } else if (currentArea) {
            areasToApply = [currentArea as AreaAfectada];
        } else {
            console.log('[Apply] No se puede aplicar - Sin área y diagnóstico no es general');
            return;
        }

        console.log('[Apply] Aplicando diagnóstico:', {
            id: diagnosticoSeleccionado.id,
            color: diagnosticoSeleccionado.simboloColor,
            atributos: atributosClinicosSeleccionados,
            descripcion,
            areas: areasToApply,
        });

        onApply(
            diagnosticoSeleccionado.id,
            diagnosticoSeleccionado.simboloColor,
            atributosClinicosSeleccionados,
            descripcion,
            areasToApply
        );

        resetState();
    }, [
        diagnosticoSeleccionado,     
        currentArea,                  
        atributosClinicosSeleccionados, 
        descripcion,                 
        isFormValid,                 
        onApply,                   
        resetState,                 
    ]);

    const handleCancel = () => {
        console.log('[Cancel] Usuario canceló');
        resetState();
        onCancel();
    };

    // ============================================================================
    // MENSAJES DE VALIDACIÓN
    // ============================================================================

    const requiresSpecificAreaMessage = diagnosticoSeleccionado &&
        !diagnosticoSeleccionado.areasafectadas.includes('general') &&
        !currentArea;

    // ============================================================================
    // RETURN: API del Hook
    // ============================================================================

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
