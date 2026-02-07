// src/components/clinicalRecord/modals/sectionsView/EnfermedadActualSectionView.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface EnfermedadActualSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const EnfermedadActualSectionView: React.FC<
    EnfermedadActualSectionViewProps
> = ({ record }) => {
    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center gap-3">
                    {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div> */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            C. Enfermedad Actual
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Descripción detallada de la condición médica actual del paciente
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-amber-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                DESCRIPCIÓN DE LA ENFERMEDAD ACTUAL
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Síntomas, duración, factores desencadenantes, tratamientos previos y evolución
                        </p>
                    </div>
                    
                    <div className="min-h-40 flex items-start px-3 py-3 bg-white rounded border border-gray-100">
                        {record.enfermedad_actual ? (
                            <div className="w-full">
                                <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">
                                    {record.enfermedad_actual}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full text-center py-10">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <AlertTriangle className="h-6 w-6 text-gray-300" />
                                    <p className="text-sm text-gray-400 italic">
                                        No se ha registrado enfermedad actual
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicador de contenido */}
                {/* {record.enfermedad_actual && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="mb-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase">
                                RESUMEN DEL CONTENIDO
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-gray-600">
                                    {record.enfermedad_actual.split(/\s+/).length} palabras
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-600">
                                    {record.enfermedad_actual.length} caracteres
                                </span>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección C completada
                        </p>
                    </div>
                    {/* <div className="text-xs text-gray-400">
                        Formulario 033 • Sección clínica esencial
                    </div> */}
                </div>
            </div>
        </section>
    );
};