// DiagnosisCardList.tsx
import { useMemo, useState } from "react";
import type { DiagnosticoSnapshot } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import DiagnosisCard from "../card/DiagnosisCard";

type Filtro =
    | "todos"
    | "preventivo"
    | "ausencia"
    | "patologia-activa"
    | "tratamiento-realizado"
    | "ultimos";

interface DiagnosisCardListProps {
    diagnosticos: DiagnosticoSnapshot[];
    onRemove?: (id: string) => void;
}

const MAP_FILTRO_A_CATEGORIA: Record<Exclude<Filtro, "todos" | "ultimos">, string> =
{
    preventivo: "Preventivo",
    ausencia: "Ausencia",
    "patologia-activa": "Patologia Activa",
    "tratamiento-realizado": "Tratamiento Realizado",
};

export default function DiagnosisCardList({
    diagnosticos,
    onRemove,
}: DiagnosisCardListProps) {
    const [filtro, setFiltro] = useState<Filtro>("todos");

    const diagnosticosFiltrados = useMemo(() => {
        let base = [...diagnosticos];

        if (filtro === "ultimos") {
            // asumiendo prioridad más alta = más actual, o usa fecha si la tienes
            base.sort((a, b) => b.prioridad - a.prioridad);
            return base.slice(0, 10);
        }

        if (filtro === "todos") return base;

        const categoria = MAP_FILTRO_A_CATEGORIA[filtro];
        return base.filter((d) => d.categoria === categoria);
    }, [diagnosticos, filtro]);

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 text-xs">
                {[
                    { value: "todos", label: "Todos" },
                    { value: "preventivo", label: "Preventivo" },
                    { value: "ausencia", label: "Ausencias" },
                    { value: "patologia-activa", label: "Patología activa" },
                    { value: "tratamiento-realizado", label: "Tratamiento realizado" },
                    { value: "ultimos", label: "Últimos diagnósticos" },
                ].map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setFiltro(f.value as Filtro)}
                        className={`rounded-full border px-3 py-1 ${filtro === f.value
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-gray-200 bg-white text-gray-700"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de cards */}
            {diagnosticosFiltrados.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No hay diagnósticos para el filtro seleccionado.
                </p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {diagnosticosFiltrados.map((dx) => (
                        <DiagnosisCard
                            key={dx.id}
                            diagnostico={dx}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
