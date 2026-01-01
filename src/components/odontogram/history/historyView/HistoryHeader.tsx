// src/components/odontogram/history/historyView/HistoryEmptyState.tsx
// Cabecera con contado, modo comparativo y filtrosinterface 
interface HistoryHeaderProps {
    totalSnapshots: number;
    comparisonMode: boolean;
    onToggleComparisonMode: () => void;
}

export const HistoryHeader = ({
    totalSnapshots,
    comparisonMode,
    onToggleComparisonMode,
}: HistoryHeaderProps) => {
    const label = totalSnapshots === 1 ? "registro" : "registros";

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gradient-to-br from-brand-50 to-white dark:from-gray-800 dark:to-gray-dark">
            <div className="flex items-center gap-3 mb-4">
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

            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleComparisonMode}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${comparisonMode
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

                {/* Placeholder para filtros futuros */}
                {/* <button className="px-3 py-2 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          Filtros
        </button> */}
            </div>
        </div>
    );
};