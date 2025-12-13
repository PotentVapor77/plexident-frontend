// stc/src/components/odontogram/hooks/useDiagnosticoSelect.ts
import { useState, useCallback, useMemo, type Dispatch, type SetStateAction, useEffect } from "react";
import type { AreaAfectada, DiagnosticoCategory, DiagnosticoItem, OdontoColorKey } from "../../core/types/typeOdontograma";
import { DIAGNOSTICO_CATEGORIES } from "../../core/config/odontograma";

export type PrincipalArea = 'corona' | 'raiz' | 'general' | null;

interface UseDiagnosticoSelectProps {
    currentArea: PrincipalArea;
    onApply: (
        diagnosticoId: string,
        colorKey: OdontoColorKey,
        atributosClinicosSeleccionados: Record<string, string>,
        descripcion: string,
        areasAfectadas: AreaAfectada[]
    ) => void;
    onCancel: () => void;
    onPreviewChange: Dispatch<SetStateAction<string | null>>;
    onPreviewOptionsChange: Dispatch<SetStateAction<Record<string, string>>>;
}

export const useDiagnosticoSelect = ({
    currentArea,
    onApply,
    onCancel,
    onPreviewChange,
    onPreviewOptionsChange,
}: UseDiagnosticoSelectProps) => {
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<DiagnosticoCategory | null>(null);
    const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<DiagnosticoItem | null>(null);
    const [atributosClinicosSeleccionados, setAtributosClinicosSeleccionados] = useState<Record<string, string>>({});
    const [descripcion, setDescripcion] = useState<string>("");
    const [formValid, setFormValid] = useState<boolean>(false);

    // Filtrar categorías y diagnósticos basados en el área actual ('corona', 'raiz', o 'null')
    const filteredCategories = useMemo(() => {
        return DIAGNOSTICO_CATEGORIES
            .map(category => {
                const filteredDiagnoses = category.diagnosticos.filter(diag => {
                    const isGeneralDiagnosis = diag.areas_afectadas.includes('general');

                    if (!currentArea) {
                        return isGeneralDiagnosis;
                    }

                    // Permite diagnósticos generales o aquellos que afectan el área actual.
                    return isGeneralDiagnosis || diag.areas_afectadas.includes(currentArea as AreaAfectada);
                });

                if (filteredDiagnoses.length === 0) return null;
                return { ...category, diagnosticos: filteredDiagnoses };
            })
            .filter((cat): cat is DiagnosticoCategory => cat !== null);
    }, [currentArea]);

    // Diagnósticos disponibles en el segundo select, basado en la categoría seleccionada y los filtros.
    const currentDiagnosesForSelect = useMemo(() => {
        return filteredCategories
            .find(c => c.id === categoriaSeleccionada?.id)?.diagnosticos || [];
    }, [categoriaSeleccionada, filteredCategories]);

    // Resetear la selección si el área cambia (ej. de oclusal a raíz)
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

        // 1. Validar que si el diagnóstico NO es general, se haya seleccionado un área.
        const requiresSpecificArea = !diagnosticoSeleccionado.areas_afectadas.includes('general');
        if (requiresSpecificArea && !currentArea) {
            return false;
        }

        // 2. Validar atributos clínicos (todas las opciones requeridas deben tener un valor)
        if (diagnosticoSeleccionado.atributos_clinicos) {
            for (const key of Object.keys(diagnosticoSeleccionado.atributos_clinicos)) {
                // Se asume que si el atributo existe, es obligatorio en el flujo actual.
                if (!atributosClinicosSeleccionados[key] || atributosClinicosSeleccionados[key] === "") {
                    return false;
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
            // Para diagnósticos generales, se añade una bandera para el renderizador SVG
            onPreviewOptionsChange({ ...atributosClinicosSeleccionados, afectaTodo: 'true' });
        } else {
            onPreviewOptionsChange(atributosClinicosSeleccionados);
        }

        setFormValid(isFormValid());
    }, [diagnosticoSeleccionado, atributosClinicosSeleccionados, onPreviewChange, onPreviewOptionsChange, currentArea, isFormValid]);

    const handleCategoriaSelect = (id: string) => {
        // Usamos DIAGNOSTICO_CATEGORIES para buscar la categoría original (la completa)
        const cat = DIAGNOSTICO_CATEGORIES.find(c => c.id === id);
        if (!cat) return;

        setCategoriaSeleccionada(cat);
        setDiagnosticoSeleccionado(null); // Resetear diagnóstico
        setAtributosClinicosSeleccionados({}); // Resetear atributos
    };

    const handleDiagnosticoChange = (id: string) => {
        if (!categoriaSeleccionada) return;

        // Buscamos el diagnóstico en la CATEGORÍA COMPLETA para obtener todos los metadatos.
        const diag = categoriaSeleccionada.diagnosticos.find(d => d.id === id);
        if (!diag) {
            setDiagnosticoSeleccionado(null);
            setAtributosClinicosSeleccionados({});
            return;
        }

        setDiagnosticoSeleccionado(diag);
        setDescripcion(""); // Resetear descripción al cambiar de diagnóstico

        // Establecer valores por defecto para los atributos clínicos si existen
        if (diag.atributos_clinicos) {
            const defaults: Record<string, string> = {};
            Object.entries(diag.atributos_clinicos).forEach(([key, opts]) => {
                // Aseguramos que se pre-seleccione la primera opción por defecto
                if (Array.isArray(opts) && opts.length > 0) defaults[key] = opts[0].key;
            });
            setAtributosClinicosSeleccionados(defaults);
        } else {
            setAtributosClinicosSeleccionados({});
        }
    };

    const handleOptionChange = (key: string, value: string) => {
        setAtributosClinicosSeleccionados(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        if (!diagnosticoSeleccionado || !formValid) return;

        // Determinamos el área o si es general:
        const isGeneralDiagnosis = diagnosticoSeleccionado.areas_afectadas.includes('general');
        let areasToApply: AreaAfectada[];

        if (isGeneralDiagnosis) {
            areasToApply = ['general'];
        } else if (currentArea) {
            // Caso: Diagnóstico ESPECÍFICO (ej. solo corona) y se clicó un área.
            areasToApply = [currentArea as AreaAfectada];
        } else {
            // Este caso no debería pasar si formValid es true, pero es un buen guard.
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

    // Mensaje de validación para el componente UI
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
        handleOptionChange,
        setDescripcion,
        handleApply,
        handleCancel,
        // Propiedades calculadas
        filteredCategories,
        currentDiagnosesForSelect,
        requiresSpecificAreaMessage,
    };
};