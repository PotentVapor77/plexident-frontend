// src/components/clinicalRecord/modals/sectionsView/AntecedentesFamiliaresSectionView.tsx
import React from "react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { getAntecedentesFamiliaresDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesFamiliaresSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const AntecedentesFamiliaresSectionView: React.FC<AntecedentesFamiliaresSectionViewProps> = ({
    record
}) => {
    // Extraer datos de antecedentes familiares
    const antecedentesData = record.antecedentes_familiares_data;
    
    // Transformar datos para mostrar
    const antecedentes = getAntecedentesFamiliaresDisplay(antecedentesData);
    
    // Manejo seguro de null
    const tieneContenido = antecedentes?.tieneContenido ?? false;
    
    // Extraer categorías con valores por defecto
    const cardiovasculares = antecedentes?.cardiovasculares ?? [];
    const metabolicas = antecedentes?.metabolicas ?? [];
    const cancer = antecedentes?.cancer ?? [];
    const infecciosas = antecedentes?.infecciosas ?? [];
    const mentales = antecedentes?.mentales ?? [];
    const malformaciones = antecedentes?.malformaciones ?? [];
    const otros = antecedentes?.otros ?? [];
    
    // Calcular total de items
    const totalItems = cardiovasculares.length + metabolicas.length + cancer.length + 
                      infecciosas.length + mentales.length + malformaciones.length + otros.length;
    
    // Para PDF: Mostrar máximo 2 elementos por fila, sin colores fuertes
    const chunkArray = (array: string[], size: number) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    // Dividir en grupos de 2 para mejor layout en PDF
    const cardiovascularesChunks = chunkArray(cardiovasculares, 2);
    const metabolicasChunks = chunkArray(metabolicas, 2);
    const cancerChunks = chunkArray(cancer, 2);
    const infecciosasChunks = chunkArray(infecciosas, 2);
    const mentalesChunks = chunkArray(mentales, 2);
    const malformacionesChunks = chunkArray(malformaciones, 2);
    const otrosChunks = chunkArray(otros, 2);

    // Función para renderizar una categoría
    const renderCategoria = (
        items: string[], 
        chunks: string[][], 
        titulo: string, 
        colorClass: string,
        clave: string
    ) => {
        if (items.length === 0) return null;

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1 h-4 ${colorClass} rounded-full`}></div>
                    <h4 className="text-sm font-semibold text-gray-800">
                        {titulo} ({items.length})
                    </h4>
                </div>
                <div className="space-y-2">
                    {chunks.map((chunk, chunkIndex) => (
                        <div key={`${clave}-chunk-${chunkIndex}`} className="flex gap-3">
                            {chunk.map((item, idx) => (
                                <div
                                    key={`${clave}-${chunkIndex}-${idx}`}
                                    className="flex-1 p-2.5 border border-gray-200 rounded bg-white"
                                >
                                    <div className="flex items-start">
                                        <div className="mr-2 text-gray-500 text-xs">
                                            {chunkIndex * 2 + idx + 1}.
                                        </div>
                                        <p className="text-sm text-gray-900">{item}</p>
                                    </div>
                                </div>
                            ))}
                            {/* Si el chunk tiene solo 1 elemento, añadir espacio vacío */}
                            {chunk.length === 1 && (
                                <div className="flex-1"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Encabezado simplificado */}
            <div className="pb-2">
                <h3 className="text-base font-semibold text-gray-900">
                    E. Antecedentes Familiares
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                    Historial de enfermedades hereditarias y familiares según patología
                </p>
            </div>

            {/* Contenido principal - Minimalista para PDF */}
            <div className="space-y-5">
                {/* Estado de datos */}
                {!antecedentesData ? (
                    <div className="text-center py-6 border border-gray-200 rounded">
                        <p className="text-sm text-gray-500">
                            No se encontraron antecedentes familiares registrados
                        </p>
                    </div>
                ) : !tieneContenido ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <p className="text-sm text-gray-700">
                                Sin antecedentes familiares reportados
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Enfermedades Cardiovasculares */}
                        {renderCategoria(
                            cardiovasculares,
                            cardiovascularesChunks,
                            "Enfermedades Cardiovasculares",
                            "bg-red-500",
                            "cardiovasculares"
                        )}

                        {/* Enfermedades Metabólicas */}
                        {renderCategoria(
                            metabolicas,
                            metabolicasChunks,
                            "Enfermedades Metabólicas",
                            "bg-amber-500",
                            "metabolicas"
                        )}

                        {/* Cáncer */}
                        {renderCategoria(
                            cancer,
                            cancerChunks,
                            "Cáncer",
                            "bg-pink-500",
                            "cancer"
                        )}

                        {/* Enfermedades Infecciosas */}
                        {renderCategoria(
                            infecciosas,
                            infecciosasChunks,
                            "Enfermedades Infecciosas",
                            "bg-orange-500",
                            "infecciosas"
                        )}

                        {/* Enfermedades Mentales */}
                        {renderCategoria(
                            mentales,
                            mentalesChunks,
                            "Enfermedades Mentales",
                            "bg-indigo-500",
                            "mentales"
                        )}

                        {/* Malformaciones */}
                        {renderCategoria(
                            malformaciones,
                            malformacionesChunks,
                            "Malformaciones",
                            "bg-violet-500",
                            "malformaciones"
                        )}

                        {/* Otros Antecedentes - Estilo diferente (itálico) */}
                        {otros.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Otros Antecedentes ({otros.length})
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    {otrosChunks.map((chunk, chunkIndex) => (
                                        <div key={`otros-chunk-${chunkIndex}`} className="flex gap-3">
                                            {chunk.map((otro, idx) => (
                                                <div
                                                    key={`otro-${chunkIndex}-${idx}`}
                                                    className="flex-1 p-2.5 border border-gray-200 rounded bg-white"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-2 text-gray-500 text-xs">
                                                            {chunkIndex * 2 + idx + 1}.
                                                        </div>
                                                        <p className="text-sm text-gray-900 italic">{otro}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {chunk.length === 1 && (
                                                <div className="flex-1"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Observaciones - Estilo minimalista */}
                        {antecedentesData.observaciones && (
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1"></div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                            Observaciones Adicionales
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                            {antecedentesData.observaciones}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resumen minimalista */}
                        {totalItems > 0 && (
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center gap-3">
                                        {cardiovasculares.length > 0 && (
                                            <span>Cardiovasculares: {cardiovasculares.length}</span>
                                        )}
                                        {metabolicas.length > 0 && (
                                            <span>Metabólicas: {metabolicas.length}</span>
                                        )}
                                        {cancer.length > 0 && (
                                            <span>Cáncer: {cancer.length}</span>
                                        )}
                                        {infecciosas.length > 0 && (
                                            <span>Infecciosas: {infecciosas.length}</span>
                                        )}
                                    </div>
                                    <span className="font-medium">
                                        Total: {totalItems}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pie de sección minimalista */}
            <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="text-gray-600">
                            {antecedentesData 
                                ? (tieneContenido 
                                    ? "Sección E" 
                                    : "Sin patologías familiares")
                                : "No registrada"}
                        </span>
                    </div>
                    {antecedentesData?.fecha_creacion && (
                        <span className="text-gray-500">
                            {new Date(antecedentesData.fecha_creacion).toLocaleDateString('es-ES')}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};