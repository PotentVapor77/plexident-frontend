// src/utils/cleanProcedimientos.ts

import type { Procedimiento } from "../../types/treatmentPlan/typeBackendTreatmentPlan";


export function cleanProcedimientosForEdit(
    procedimientos: Procedimiento[] = []
): Procedimiento[] {
    return procedimientos.map(proc => ({
        ...proc,
        autogenerado: false, 
        id: proc.id?.startsWith('temp_') ? undefined : proc.id
    }));
}