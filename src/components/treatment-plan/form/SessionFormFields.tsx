// src/components/odontogram/treatmentPlan/SessionFormFields.tsx

import { Calendar, FileText } from "lucide-react";

// ============================================================================
// PROPS
// ============================================================================

interface SessionFormFieldsProps {
    formData: {
        fecha_programada: string;
        estado: string;
        notas: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    mode: "create" | "edit";
    disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SessionFormFields({
    formData,
    onChange,
    mode,
    disabled = false,
}: SessionFormFieldsProps) {
    return (
        <div className="space-y-6">
            {/* ======================================================================
          FECHA PROGRAMADA Y ESTADO
      ====================================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Programada */}
                <div>
                    <label
                        htmlFor="fecha_programada"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Fecha programada
                    </label>
                    <input
                        type="date"
                        id="fecha_programada"
                        name="fecha_programada"
                        value={formData.fecha_programada}
                        onChange={onChange}
                        disabled={disabled}
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fecha en la que se planifica realizar la sesión
                    </p>
                </div>

                {/* Estado */}
                <div>
                    <label
                        htmlFor="estado"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Estado de la sesión
                    </label>
                    <select
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={onChange}
                        disabled={disabled}
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="planificada">Planificada</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Estado actual de la sesión de tratamiento
                    </p>
                </div>
            </div>

            {/* ======================================================================
          NOTAS DE LA SESIÓN
      ====================================================================== */}
            <div>
                <label
                    htmlFor="notas"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Notas de la sesión
                </label>
                <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={onChange}
                    disabled={disabled}
                    rows={4}
                    placeholder="Observaciones clínicas, hallazgos durante la sesión, reacciones del paciente, notas para próximas sesiones..."
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Información adicional sobre la sesión de tratamiento
                </p>
            </div>

            {/* ======================================================================
          INFORMACIÓN ADICIONAL
      ====================================================================== */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Información importante
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
                        <span>
                            La fecha programada es opcional y puede modificarse antes de completar la sesión
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
                        <span>
                            Las sesiones completadas no pueden editarse nuevamente
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
                        <span>
                            Las notas son visibles para todo el equipo médico y quedan registradas en el historial
                        </span>
                    </li>
                    {mode === "create" && (
                        <li className="flex items-start gap-2">
                            <span className="text-brand-600 dark:text-brand-400 mt-0.5">•</span>
                            <span>
                                Agregue los procedimientos y prescripciones necesarios para esta sesión
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
