// src/hooks/treatmentPlan/sessionFormHooks/usePrescripciones.ts
import { useCallback } from "react";
import { generateTempId } from "../../../mappers/treatmentPlanMapper";
import type { Prescripcion } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

export function usePrescripciones(
    prescripciones: Prescripcion[],
    setPrescripciones: (prescripciones: Prescripcion[]) => void
) {
    const handleAdd = useCallback(() => {
        const newPrescripcion: Prescripcion = {
            id: generateTempId(),
            medicamento: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            via_administracion: undefined,
            indicaciones: undefined,
        };
        setPrescripciones([...prescripciones, newPrescripcion]);
    }, [prescripciones, setPrescripciones]);

    const handleRemove = useCallback(
        (index: number) => {
            setPrescripciones(prescripciones.filter((_, i) => i !== index));
        },
        [prescripciones, setPrescripciones]
    );

    const handleChange = useCallback(
        (index: number, field: keyof Prescripcion, value: string) => {
            setPrescripciones(
                prescripciones.map((presc, i) =>
                    i === index ? { ...presc, [field]: value } : presc
                )
            );
        },
        [prescripciones, setPrescripciones]
    );

    return { handleAdd, handleRemove, handleChange };
}

