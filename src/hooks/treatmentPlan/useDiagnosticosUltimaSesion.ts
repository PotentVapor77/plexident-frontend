// src/hooks/treatmentPlan/useDiagnosticosUltimaSesion.ts
import { useQuery } from "@tanstack/react-query";
import type { DiagnosticoSnapshot } from "../../types/treatmentPlan/typeBackendTreatmentPlan";
import api from "../../services/api/axiosInstance";

interface DiagnosticosUltimaSesionResponse {
    diagnosticos: DiagnosticoSnapshot[];
    sesion_numero: number | null;
    total: number;
}

export function useDiagnosticosUltimaSesion(planId: string | null) {
    return useQuery({
        queryKey: ["diagnosticos-ultima-sesion", planId],
        queryFn: async () => {
            if (!planId) return { diagnosticos: [], sesion_numero: null, total: 0 };

            const { data } = await api.get<DiagnosticosUltimaSesionResponse>(
                `/odontogram/planes-tratamiento/${planId}/diagnosticos-ultima-sesion/`
            );
            return data;
        },
        enabled: !!planId,
    });
}
