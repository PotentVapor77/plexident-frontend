// src/hooks/treatmentPlan/sessionFormHooks/useProcedimientos.ts
import { useCallback } from "react";
import type { Procedimiento } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import { generateTempId } from "../../../mappers/treatmentPlanMapper";




export function useProcedimientos(
    procedimientos: Procedimiento[],
    setProcedimientos: (procedimientos: Procedimiento[]) => void,
    autoTexto: string | null = null 
) {
    const handleAdd = useCallback(() => {
        const newProcedimiento: Procedimiento = {
            id: generateTempId(),
            descripcion: "",
            diente: undefined,
            superficie: undefined,
            codigo: undefined,
            costo_estimado: undefined,
            duracion_estimada: undefined,
            completado: false,
            notas: undefined,
        };
        setProcedimientos([...procedimientos, newProcedimiento]);
    }, [procedimientos, setProcedimientos]);

    const handleRemove = useCallback(
        (index: number) => {
            setProcedimientos(procedimientos.filter((_, i) => i !== index));
        },
        [procedimientos, setProcedimientos]
    );

    const handleChange = useCallback(
        (
            index: number,
            field: keyof Procedimiento,
            value: string | number | boolean
        ) => {
            const updatedProcs = procedimientos.map((proc, i) =>
                i === index ? { ...proc, [field]: value } : proc
            );
            setProcedimientos(updatedProcs);

            // Validación de diente
            if (field === "diente" && typeof value === "string") {
                const dienteRegex = /^[1-8][1-8]$/;
                if (value && !dienteRegex.test(value)) {
                    // Validación silenciosa o agregar estado de error
                }
            }
        },
        [procedimientos, setProcedimientos]
    );

    return { handleAdd, handleRemove, handleChange };
}
