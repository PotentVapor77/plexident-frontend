// src/components/odontogram/history/timeline/OdontogramaTimelineList.tsx

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { OdontogramaSnapshot } from "../../../../core/types/odontogramaHistory.types";
import { Calendar, Clock, User, FileText, ChevronDown, ChevronRight } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Sin registros históricos
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Los odontogramas guardados se mostrarán en esta línea de tiempo
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-1">
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
                                rounded-lg border transition-all duration-200
                                ${isSelected
                                    ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700 shadow-sm"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }
                                focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                            `}
                        >
                            <div className="p-4">
                                {/* Header: Fecha y hora */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                            isSelected
                                                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className={`text-sm font-medium leading-tight ${
                                                isSelected 
                                                    ? "text-brand-700 dark:text-brand-300" 
                                                    : "text-gray-900 dark:text-white"
                                            }`}>
                                                {format(snapshot.fecha, "d 'de' MMMM, yyyy", { locale: es })}
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Clock className={`h-3 w-3 ${
                                                    isSelected 
                                                        ? "text-brand-600 dark:text-brand-400" 
                                                        : "text-gray-500 dark:text-gray-400"
                                                }`} />
                                                <span className={`text-xs ${
                                                    isSelected 
                                                        ? "text-brand-600/80 dark:text-brand-400/80" 
                                                        : "text-gray-500 dark:text-gray-400"
                                                }`}>
                                                    {format(snapshot.fecha, "HH:mm")} hrs
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge de estado actual */}
                                    {isSelected && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-100 dark:bg-brand-900/60 rounded-full border border-brand-200 dark:border-brand-800 shrink-0">
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
                                <p className={`
                                    text-sm mb-3 line-clamp-2
                                    ${isSelected
                                        ? "text-gray-800 dark:text-gray-100"
                                        : "text-gray-600 dark:text-gray-300"
                                    }
                                `}>
                                    {snapshot.descripcion}
                                </p>

                                {/* Footer: Información del profesional y paciente */}
                                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    {/* Avatar del profesional */}
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                        isSelected
                                            ? "bg-brand-200 text-brand-700 dark:bg-brand-800 dark:text-brand-300"
                                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    }`}>
                                        {snapshot.profesionalNombre
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Nombre del profesional */}
                                        <p className={`text-sm font-medium truncate ${
                                            isSelected
                                                ? "text-gray-900 dark:text-white"
                                                : "text-gray-700 dark:text-gray-200"
                                        }`}>
                                            {snapshot.profesionalNombre}
                                        </p>
                                        
                                        {/* Información adicional */}
                                        <div className="flex items-center gap-3 mt-0.5">
                                            {snapshot.pacienteNombre && (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {snapshot.pacienteNombre}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                Odontólogo
                                            </span>
                                        </div>
                                    </div>

                                    {/* Icono de chevron */}
                                    <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                                        isSelected
                                            ? "text-brand-500 dark:text-brand-400 rotate-0"
                                            : "text-gray-400 dark:text-gray-500 -rotate-90 group-hover:rotate-0 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    }`} />
                                </div>
                            </div>
                        </button>

                        {/* Separador entre items */}
                        {!isLast && (
                            <div className="flex justify-center py-1">
                                <div className="w-px h-4 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700 dark:to-transparent" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};