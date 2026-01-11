// DiagnosisCard.tsx
import { X } from "lucide-react";
import type { DiagnosticoSnapshot } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";

interface DiagnosisCardProps {
    diagnostico: DiagnosticoSnapshot;
    onRemove?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Preventivo: "bg-emerald-50 border-emerald-200 text-emerald-800",
    Ausencia: "bg-slate-50 border-slate-200 text-slate-800",
    "Patologia Activa": "bg-red-50 border-red-200 text-red-800",
    "Tratamiento Realizado": "bg-blue-50 border-blue-200 text-blue-800",
    default: "bg-gray-50 border-gray-200 text-gray-800",
};

export default function DiagnosisCard({ diagnostico, onRemove }: DiagnosisCardProps) {
    const colorClasses =
        CATEGORY_COLORS[diagnostico.categoria] ?? CATEGORY_COLORS.default;

    return (
        <div
            className={`flex items-start gap-3 rounded-lg border p-3 shadow-sm ${colorClasses}`}
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-xs font-semibold">
                {diagnostico.diente}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                        {diagnostico.diagnostico_nombre}
                    </p>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(diagnostico.id)}
                            className="rounded-full p-1 text-xs hover:bg-black/5"
                            title="Quitar diagnóstico"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="mt-0.5 text-xs text-gray-600">
                    {diagnostico.siglas} · {diagnostico.superficie}
                </p>
                {diagnostico.descripcion && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {diagnostico.descripcion}
                    </p>
                )}
            </div>
        </div>
    );
}
