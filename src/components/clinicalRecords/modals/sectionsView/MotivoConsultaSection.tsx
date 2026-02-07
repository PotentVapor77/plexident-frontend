// src/components/clinicalRecord/modals/sectionsView/MotivoConsultaSectionView.tsx
import React from "react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface MotivoConsultaSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const MotivoConsultaSectionView: React.FC<
    MotivoConsultaSectionViewProps
> = ({ record }) => {
    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                B. Motivo de Consulta
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Descripción del motivo principal de la visita odontológica
                            </p>
                        </div>
                    </div>
                    
                    {/* Estado de embarazo en la misma línea */}
                    {record.embarazada && (
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-gray-700 uppercase">
                                    Embarazada
                                </p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full ${record.embarazada === "SI" ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex items-center gap-2">
                                    {record.embarazada === "SI" ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-sm font-medium text-pink-700">Si</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                            <span className="text-sm text-gray-700">No </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                DESCRIPCIÓN DEL MOTIVO DE CONSULTA
                            </p>
                        </div>
                    </div>
                    
                    <div className="min-h-32 flex items-start px-3 py-3 bg-white rounded border border-gray-100">
                        {record.motivo_consulta ? (
                            <div className="w-full">
                                <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">
                                    {record.motivo_consulta}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full text-center py-8">
                                <p className="text-sm text-gray-400 italic">
                                    No se ha registrado motivo de consulta
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección B completada
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};