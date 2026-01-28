// src/hooks/treatmentPlan/sessionFormHooks/useProcedimientos.ts
import { useCallback } from "react";
import type { Procedimiento } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import { generateTempId } from "../../../mappers/treatmentPlanMapper";




export function useProcedimientos(
    procedimientos: Procedimiento[],
    setProcedimientos: (procedimientos: Procedimiento[]) => void,

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
            autogenerado: false
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
            const updatedProcs = procedimientos.map((proc, i) => {
                if (i === index) {
                    const updated = { ...proc, [field]: value };
                    // Si se edita un procedimiento autogenerado manualmente, marcarlo como manual
                    if (field !== "autogenerado" && proc.autogenerado) {
                        updated.autogenerado = false;
                    }
                    return updated;
                }
                return proc;
            });
            setProcedimientos(updatedProcs);
        },
        [procedimientos, setProcedimientos]
    );

    return { handleAdd, handleRemove, handleChange };
}
