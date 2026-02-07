// src/components/clinicalRecord/modals/sectionsView/ConstantesVitalesSectionView.tsx
import React from "react";
import { Thermometer, Heart, Wind, Gauge } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface ConstantesVitalesSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const ConstantesVitalesSectionView: React.FC<
    ConstantesVitalesSectionViewProps
> = ({ record }) => {
    // Extraer datos de constantes vitales
    const constantesVitales = record.constantes_vitales_data;
    
    // Determinar estados para cada constante vital
    const getTemperaturaEstado = (temp?: string) => {
        if (!temp) return "default";
        const value = parseFloat(temp);
        if (value < 36) return "hipotermia";
        if (value > 37.5) return "fiebre";
        return "normal";
    };

    const getPulsoEstado = (pulso?: number) => {
        if (!pulso) return "default";
        if (pulso < 60) return "bradicardia";
        if (pulso > 100) return "taquicardia";
        return "normal";
    };

    const getPresionEstado = (presion?: string) => {
        if (!presion) return "default";
        const [sistolica, diastolica] = presion.split("/").map(Number);
        if (sistolica > 140 || diastolica > 90) return "hipertension";
        if (sistolica < 90 || diastolica < 60) return "hipotension";
        return "normal";
    };

    const getEstadoColor = (estado: string) => {
        const colors: Record<string, string> = {
            normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
            fiebre: "bg-amber-100 text-amber-800 border-amber-200",
            hipotermia: "bg-blue-100 text-blue-800 border-blue-200",
            taquicardia: "bg-rose-100 text-rose-800 border-rose-200",
            bradicardia: "bg-blue-100 text-blue-800 border-blue-200",
            hipertension: "bg-rose-100 text-rose-800 border-rose-200",
            hipotension: "bg-blue-100 text-blue-800 border-blue-200",
            default: "bg-slate-100 text-slate-800 border-slate-200",
        };
        return colors[estado] || colors.default;
    };

    const getEstadoIcon = (estado: string) => {
        if (estado === "normal") return "✓";
        if (estado === "fiebre" || estado === "hipertension" || estado === "taquicardia") return "⚠";
        if (estado === "hipotermia" || estado === "hipotension" || estado === "bradicardia") return "↓";
        return "-";
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            F. Constantes Vitales
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Signos vitales registrados del paciente
                        </p>
                    </div>
                    
                    {/* Indicador de fecha de registro si existe */}
                    {constantesVitales?.fecha_creacion && (
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-700">
                                Registrado: {new Date(constantesVitales.fecha_creacion).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal - Fila única */}
            <div className="space-y-4">
                {constantesVitales ? (
                    <div className="border border-gray-200 rounded-lg bg-gray-50">
                        {/* Encabezado de la tabla */}
                        <div className="grid grid-cols-5 border-b border-gray-200 bg-white rounded-t-lg">
                            <div className="p-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <Thermometer className="h-5 w-5 text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        TEMPERATURA
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <Heart className="h-5 w-5 text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        PULSO
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <Wind className="h-5 w-5 text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        FRECUENCIA RESPIRATORIA
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <Gauge className="h-5 w-5 text-gray-600" />
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        PRESIÓN ARTERIAL
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 text-center">
                                <p className="text-xs font-semibold text-gray-800 uppercase">
                                    ESTADO
                                </p>
                            </div>
                        </div>

                        {/* Valores de constantes vitales */}
                        <div className="grid grid-cols-5">
                            {/* Temperatura */}
                            <div className={`p-4 text-center border-r border-gray-200 ${getEstadoColor(getTemperaturaEstado(constantesVitales.temperatura))}`}>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {constantesVitales.temperatura || "-"}
                                        </span>
                                        <span className="text-sm text-gray-600">°C</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs font-medium">
                                            {getEstadoIcon(getTemperaturaEstado(constantesVitales.temperatura))}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {getTemperaturaEstado(constantesVitales.temperatura) === "normal" 
                                                ? "Normal" 
                                                : getTemperaturaEstado(constantesVitales.temperatura) === "fiebre"
                                                ? "Fiebre"
                                                : "Hipotermia"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pulso */}
                            <div className={`p-4 text-center border-r border-gray-200 ${getEstadoColor(getPulsoEstado(constantesVitales.pulso))}`}>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {constantesVitales.pulso || "-"}
                                        </span>
                                        <span className="text-sm text-gray-600">/min.</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs font-medium">
                                            {getEstadoIcon(getPulsoEstado(constantesVitales.pulso))}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {getPulsoEstado(constantesVitales.pulso) === "normal" 
                                                ? "Normal" 
                                                : getPulsoEstado(constantesVitales.pulso) === "taquicardia"
                                                ? "Taquicardia"
                                                : "Bradicardia"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Frecuencia Respiratoria */}
                            <div className="p-4 text-center border-r border-gray-200 bg-white">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {constantesVitales.frecuencia_respiratoria || "-"}
                                        </span>
                                        <span className="text-sm text-gray-600">/min.</span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-xs text-gray-600">
                                            {constantesVitales.frecuencia_respiratoria 
                                                ? `${constantesVitales.frecuencia_respiratoria} rpm` 
                                                : "No registrado"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Presión Arterial */}
                            <div className={`p-4 text-center border-r border-gray-200 ${getEstadoColor(getPresionEstado(constantesVitales.presion_arterial))}`}>
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900 font-mono">
                                            {constantesVitales.presion_arterial || "-"}
                                        </span>
                                        <span className="text-sm text-gray-600">mmHg</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs font-medium">
                                            {getEstadoIcon(getPresionEstado(constantesVitales.presion_arterial))}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {getPresionEstado(constantesVitales.presion_arterial) === "normal" 
                                                ? "Normal" 
                                                : getPresionEstado(constantesVitales.presion_arterial) === "hipertension"
                                                ? "Hipertensión"
                                                : "Hipotensión"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Estado General */}
                            <div className="p-4 text-center bg-gray-50">
                                <div className="h-full flex flex-col items-center justify-center">
                                    {constantesVitales.temperatura && 
                                     constantesVitales.pulso && 
                                     constantesVitales.frecuencia_respiratoria && 
                                     constantesVitales.presion_arterial ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
                                                <span className="text-sm font-bold text-emerald-700">✓</span>
                                            </div>
                                            <span className="text-xs font-medium text-emerald-700">
                                                Completas
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 border border-amber-200">
                                                <span className="text-sm font-bold text-amber-700">!</span>
                                            </div>
                                            <span className="text-xs font-medium text-amber-700">
                                                Incompletas
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                ) : (
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <Thermometer className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                No se han registrado constantes vitales
                            </h4>
                            <p className="text-xs text-gray-500">
                                Esta sección no contiene datos de signos vitales del paciente
                            </p>
                        </div>
                    </div>
                )}

                {/* Leyenda de estados */}
                {constantesVitales && (
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-xs">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-600">Normal</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">Alerta</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            <span className="text-gray-600">Riesgo</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Bajo</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Información adicional si existe */}
            {/* {constantesVitales && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs">
                            <p className="text-gray-500">Registrado por:</p>
                            <p className="font-medium text-gray-700">
                                {constantesVitales.creado_por || "No especificado"}
                            </p>
                        </div>
                        <div className="text-xs">
                            <p className="text-gray-500">Última actualización:</p>
                            <p className="font-medium text-gray-700">
                                {constantesVitales.fecha_modificacion 
                                    ? new Date(constantesVitales.fecha_modificacion).toLocaleString()
                                    : "No modificado"}
                            </p>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección F {constantesVitales ? 'completada' : 'pendiente'}
                        </p>
                    </div>
                    {/* {constantesVitales && (
                        <span className="text-xs text-gray-400">
                            ID: {constantesVitales.id}
                        </span>
                    )} */}
                </div>
            </div>
        </section>
    );
};