// src/components/clinicalRecord/form/sections/EnfermedadActualSection.tsx
import React from "react";
import { AlertTriangle, Stethoscope, Calendar, Activity, FileText } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";

interface EnfermedadActualSectionProps {
    formData: ClinicalRecordFormData;
    updateField: <K extends keyof ClinicalRecordFormData>(
        field: K,
        value: ClinicalRecordFormData[K]
    ) => void;
    lastUpdated?: string | null;
}

const EnfermedadActualSection: React.FC<EnfermedadActualSectionProps> = ({
    formData,
    updateField,
    lastUpdated,
}) => {
    const charCount = formData.enfermedad_actual?.length || 0;
    const maxChars = 1000;
    const isNearLimit = charCount > maxChars - 100;

    // Obtener color del contador
    const getCounterColor = () => {
        if (charCount > maxChars) return "text-rose-600";
        if (isNearLimit) return "text-amber-600";
        return "text-slate-600";
    };

    // Determinar si el texto es suficiente
    const isDetailedEnough = charCount > 50;

    return (
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            {/* Header de la sección */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            D. Enfermedad Actual
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Descripción detallada de la condición médica actual del paciente
                        </p>
                        {lastUpdated && (
                            <p className="text-xs text-slate-400 mt-1">
                                Última actualización: {lastUpdated}
                            </p>
                        )}
                    </div>
                </div>

                {/* Indicador de detalle */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isDetailedEnough ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {isDetailedEnough ? (
                        <>
                            <FileText className="h-3 w-3" />
                            <span>Detallada</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-3 w-3" />
                            <span>Básica</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Área de texto principal */}
                <div className="relative rounded-lg border border-slate-200 bg-slate-50/30">
                    <textarea
                        value={formData.enfermedad_actual || ""}
                        onChange={(e) => updateField("enfermedad_actual", e.target.value)}
                        placeholder="Describa en detalle la enfermedad o condición actual del paciente. Incluya síntomas, duración, factores desencadenantes, tratamientos previos y evolución..."
                        rows={5}
                        className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400"
                    />
                    
                    {/* Contador de caracteres */}
                    <div className="absolute bottom-3 right-3">
                        <div className={`text-xs font-medium ${getCounterColor()}`}>
                            {charCount} / {maxChars}
                        </div>
                    </div>
                </div>

                {/* Guías para una buena descripción */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-medium text-slate-700">
                            Aspectos importantes a incluir:
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-700">Síntomas principales</p>
                                <p className="text-xs text-slate-600">
                                    Dolor, inflamación, sangrado, sensibilidad, etc.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-700">Duración y evolución</p>
                                <p className="text-xs text-slate-600">
                                    Cuándo comenzó, cómo ha evolucionado.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-700">Factores asociados</p>
                                <p className="text-xs text-slate-600">
                                    Qué lo mejora/empeora, relación con alimentos, etc.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5"></div>
                            <div>
                                <p className="text-xs font-medium text-slate-700">Tratamientos previos</p>
                                <p className="text-xs text-slate-600">
                                    Medicamentos, procedimientos, cirugías anteriores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback de progreso */}
                <div className="space-y-2">
                    {charCount === 0 && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-600">
                                Comience a describir la enfermedad actual del paciente.
                            </p>
                        </div>
                    )}
                    
                    {charCount > 0 && charCount < 50 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium text-amber-800">
                                    Descripción básica
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Considere agregar más detalles para una mejor evaluación clínica.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {isDetailedEnough && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <div>
                                <p className="text-sm font-medium text-emerald-800">
                                    Descripción detallada
                                </p>
                                <p className="text-sm text-emerald-700 mt-1">
                                    La información proporcionada es adecuada para el análisis clínico.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

               
            </div>
        </section>
    );
};

export default EnfermedadActualSection;