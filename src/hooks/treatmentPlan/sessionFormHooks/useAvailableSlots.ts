// src/hooks/treatmentPlan/sessionFormHooks/useAvailableSlots.ts

import { useState, useCallback } from "react";
import { useAppointment } from "../../appointments/useAppointment";
import type { IHorarioDisponible } from "../../../types/appointments/IAppointment";

export function useAvailableSlots() {
    const { fetchHorariosDisponibles } = useAppointment();
    const [slots, setSlots] = useState<{ horainicio: string; horafin: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSlots = useCallback(
        async (odontologoId: string, fecha: string, duracion: number) => {
            try {
                setLoading(true);
                setError(null);

                const result = await fetchHorariosDisponibles(
                    odontologoId,
                    fecha,
                    duracion
                );

                const mapped =
                    Array.isArray(result)
                        ? result.map((h: IHorarioDisponible) => ({
                            horainicio: h.hora_inicio,
                            horafin: h.hora_fin,
                        }))
                        : [];

                setSlots(mapped);
            } catch (e: any) {
                setError(e?.message || "Error al cargar horarios disponibles");
                setSlots([]);
            } finally {
                setLoading(false);
            }
        },
        [fetchHorariosDisponibles]
    );

    return { slots, loading, error, loadSlots };
}
