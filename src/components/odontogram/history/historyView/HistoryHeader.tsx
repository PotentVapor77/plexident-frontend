// src/components/odontogram/history/historyView/HistoryHeader.tsx
// Cabecera con contador, modo comparativo y badge de paciente

interface Patient {
    id: string;
    nombres: string;
    apellidos: string;
}

interface HistoryHeaderProps {
    totalSnapshots: number;
    comparisonMode: boolean;
    onToggleComparisonMode: () => void;
    patient?: Patient | null;
}

export const HistoryHeader = ({
    totalSnapshots,
    comparisonMode,
    onToggleComparisonMode,
    patient,
}: HistoryHeaderProps) => {
    const label = totalSnapshots === 1 ? "registro" : "registros";

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gradient-to-br from-brand-50 to-white dark:from-gray-800 dark:to-gray-dark">
            <div className="flex items-center justify-between mb-4">
                {/* Sección izquierda: Título y contador */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                        <svg
                            className="w-5 h-5 text-brand-600 dark:text-brand-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            Historial Clínico
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {totalSnapshots} {label}
                        </p>
                    </div>
                </div>

                {/* Sección derecha: Badge de contexto (Paciente o General) */}
                <div>
                    {patient ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-brand-500/10 to-brand-600/10 dark:from-brand-500/20 dark:to-brand-600/20 border border-brand-300 dark:border-brand-700 rounded-lg shadow-sm">
                            <svg
                                className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                                    Paciente
                                </span>
                                <span className="text-xs font-semibold text-brand-900 dark:text-brand-100">
                                    {patient.nombres} {patient.apellidos}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
                            <svg
                                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Historial General
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Botón de modo comparación */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleComparisonMode}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        comparisonMode
                            ? "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg shadow-error-500/30"
                            : "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30"
                    }`}
                >
                    {comparisonMode ? (
                        <>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Cancelar comparación
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                                />
                            </svg>
                            Modo comparación
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
