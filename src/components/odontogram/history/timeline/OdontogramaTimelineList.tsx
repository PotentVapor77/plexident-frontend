// src/components/odontogram/history/timeline/OdontogramaTimelineList.tsx

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";

interface TimelineListProps {
    snapshots: OdontogramaSnapshot[];
    onSelectSnapshot: (id: string) => void;
    selectedSnapshotId: string | null;
}

export const OdontogramaTimelineList = ({
    snapshots,
    onSelectSnapshot,
    selectedSnapshotId,
}: TimelineListProps) => {
    const sortedSnapshots = [...snapshots].sort(
        (a, b) => b.fecha.getTime() - a.fecha.getTime(),
    );

    if (snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="relative mb-5">
                    <div className="absolute inset-0 bg-brand-100 dark:bg-brand-950 rounded-full blur-xl opacity-40" />
                    <svg
                        className="relative w-20 h-20 text-brand-200 dark:text-brand-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
                    Sin registros históricos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    Los odontogramas guardados se mostrarán en esta línea de tiempo
                </p>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-2">
            {sortedSnapshots.map((snapshot, index) => {
                const isSelected = snapshot.id === selectedSnapshotId;
                const isLast = index === sortedSnapshots.length - 1;

                return (
                    <div key={snapshot.id} className="relative">
                        {/* Card principal */}
                        <button
                            type="button"
                            onClick={() => onSelectSnapshot(snapshot.id)}
                            className={`
                                relative w-full text-left group
                                rounded-xl p-4 border transition-all duration-200
                                ${isSelected
                                    ? "bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 shadow-theme-md"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-theme-sm"
                                }
                                focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                            `}
                        >
                            {/* Indicador lateral de selección */}
                            {isSelected && (
                                <div className="absolute -left-0.5 top-3 bottom-3 w-1 bg-brand-500 rounded-r-full" />
                            )}

                            {/* Header: Fecha y hora */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div
                                            className={`
                                                flex items-center justify-center w-8 h-8 rounded-lg shrink-0
                                                ${isSelected
                                                    ? "bg-brand-100 dark:bg-brand-900/50"
                                                    : "bg-gray-100 dark:bg-gray-700/50"
                                                }
                                            `}
                                        >
                                            <svg
                                                className={`w-4.5 h-4.5 ${isSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-brand-700 dark:text-brand-300" : "text-gray-800 dark:text-gray-200"}`}
                                            >
                                                {format(snapshot.fecha, "d 'de' MMMM, yyyy", { locale: es })}
                                            </p>
                                            <p
                                                className={`text-xs font-medium ${isSelected ? "text-brand-600/80 dark:text-brand-400/80" : "text-gray-500 dark:text-gray-400"}`}
                                            >
                                                {format(snapshot.fecha, "HH:mm")} hrs
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge de estado actual */}
                                {isSelected && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-100 dark:bg-brand-900/60 rounded-lg border border-brand-200 dark:border-brand-800 shrink-0">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                                        </span>
                                        <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                                            Actual
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Descripción */}
                            <p
                                className={`
                                    text-sm leading-relaxed mb-3.5 line-clamp-2
                                    ${isSelected
                                        ? "text-gray-800 dark:text-gray-100 font-medium"
                                        : "text-gray-600 dark:text-gray-300"
                                    }
                                `}
                            >
                                {snapshot.descripcion}
                            </p>

                            {/* Footer: Información del profesional */}
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div
                                    className={`
                                        flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0
                                        ${isSelected
                                            ? "bg-brand-200 dark:bg-brand-800/60 text-brand-700 dark:text-brand-300 ring-2 ring-brand-300/50 dark:ring-brand-700/50"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        }
                                    `}
                                >
                                    {snapshot.profesionalNombre
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-semibold truncate ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-200"}`}
                                    >
                                        {snapshot.profesionalNombre}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Odontólogo tratante
                                    </p>
                                </div>

                                {/* Icono de chevron */}
                                <svg
                                    className={`
                                        w-5 h-5 shrink-0 transition-all duration-200
                                        ${isSelected
                                            ? "text-brand-500 dark:text-brand-400 rotate-0"
                                            : "text-gray-400 dark:text-gray-500 -rotate-90 group-hover:rotate-0 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                        }
                                    `}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {/* Separador entre items */}
                        {!isLast && (
                            <div className="flex justify-center py-2">
                                <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800 dark:to-transparent" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
