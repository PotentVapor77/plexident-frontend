// src/components/odontogram/history/historyView/HistoryEmptyState.tsx
// Mensajes "No hay historial" segun el contexto
interface HistoryEmptyStateProps {
    variant: "sinPaciente" | "sinHistorialPaciente" | "sinHistorialOdontologo";
    pacienteNombre?: string | null;
}

export const HistoryEmptyState = ({
    variant,
    pacienteNombre,
}: HistoryEmptyStateProps) => {
    let title = "";
    let description = "";

    if (variant === "sinPaciente") {
        title = "No hay historial disponible";
        description = "Selecciona un paciente para ver sus cambios de odontograma.";
    } else if (variant === "sinHistorialPaciente") {
        title = "Este paciente aún no tiene historial";
        description = pacienteNombre
            ? `Todavía no se han registrado cambios de odontograma para ${pacienteNombre}.`
            : "Todavía no se han registrado cambios de odontograma para este paciente.";
    } else {
        title = "No hay historial registrado";
        description = "Tus cambios de odontograma aparecerán aquí cuando guardes un diagnóstico.";
    }

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
                {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                {description}
            </p>
        </div>
    );
};