// src/components/clinicalRecord/modals/sectionsView/AntecedentesPersonalesSectionView.tsx
import React from "react";
import type { 
    ClinicalRecordDetailResponse, 
} from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { getAntecedentesPersonalesDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesPersonalesSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const AntecedentesPersonalesSectionView: React.FC<
    AntecedentesPersonalesSectionViewProps
> = ({ record }) => {
    // Extraer datos de antecedentes personales
    const antecedentesData = record.antecedentes_personales_data;
    
    // Obtener formato de visualización usando la función proporcionada
    const antecedentes = getAntecedentesPersonalesDisplay(antecedentesData);
    
    // Manejo seguro de null
    const tieneContenido = antecedentes?.tieneContenido ?? false;
    const alergias = antecedentes?.alergias ?? [];
    const patologias = antecedentes?.patologias ?? [];
    const otros = antecedentes?.otros ?? [];
    
    // Para PDF: Mostrar máximo 2 elementos por fila, sin colores fuertes
    const chunkArray = (array: string[], size: number) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    // Dividir en grupos de 2 para mejor layout en PDF
    const alergiasChunks = chunkArray(alergias, 2);
    const patologiasChunks = chunkArray(patologias, 2);
    const otrosChunks = chunkArray(otros, 2);

    // Función para formatear patologías específicas
    const formatPatologia = (patologia: string) => {
        if (patologia.includes(': ')) {
            const [nombre, estado] = patologia.split(': ');
            if (estado === 'CONTROLADA' || estado === 'SI' || estado === 'NO') {
                return `${nombre} (${estado.toLowerCase()})`;
            }
        }
        return patologia;
    };

    return (
        <section className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Encabezado simplificado */}
            <div className="pb-2">
                <h3 className="text-base font-semibold text-gray-900">
                    D. Antecedentes Patológicos Personales
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                    Historial médico personal, alergias y condiciones previas
                </p>
            </div>

            {/* Contenido principal - Minimalista para PDF */}
            <div className="space-y-5">
                {/* Estado de datos */}
                {!antecedentesData ? (
                    <div className="text-center py-6 border border-gray-200 rounded">
                        <p className="text-sm text-gray-500">
                            No se encontraron antecedentes personales registrados
                        </p>
                    </div>
                ) : !tieneContenido ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <p className="text-sm text-gray-700">
                                Sin antecedentes patológicos reportados
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Alergias - Diseño compacto */}
                        {alergias.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Alergias ({alergias.length})
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    {alergiasChunks.map((chunk, chunkIndex) => (
                                        <div key={`alergias-chunk-${chunkIndex}`} className="flex gap-3">
                                            {chunk.map((alergia, idx) => (
                                                <div
                                                    key={`alergia-${chunkIndex}-${idx}`}
                                                    className="flex-1 p-2.5 border border-gray-200 rounded bg-white"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-2 text-gray-500 text-xs">
                                                            {chunkIndex * 2 + idx + 1}.
                                                        </div>
                                                        <p className="text-sm text-gray-900">{alergia}</p>
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
                        )}

                        {/* Patologías - Diseño compacto */}
                        {patologias.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-4 bg-brand-400 rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Patologías ({patologias.length})
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    {patologiasChunks.map((chunk, chunkIndex) => (
                                        <div key={`patologias-chunk-${chunkIndex}`} className="flex gap-3">
                                            {chunk.map((patologia, idx) => (
                                                <div
                                                    key={`patologia-${chunkIndex}-${idx}`}
                                                    className="flex-1 p-2.5 border border-gray-200 rounded bg-white"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-2 text-gray-500 text-xs">
                                                            {chunkIndex * 2 + idx + 1}.
                                                        </div>
                                                        <p className="text-sm text-gray-900">{formatPatologia(patologia)}</p>
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

                        {/* Otros antecedentes - Diseño compacto */}
                        {otros.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-4-1.5 h-4 bg-gray-600 rounded-full"></div>
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

                        {/* Resumen minimalista */}
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center gap-4">
                                    {alergias.length > 0 && (
                                        <span>Alergias: {alergias.length}</span>
                                    )}
                                    {patologias.length > 0 && (
                                        <span>Patologías: {patologias.length}</span>
                                    )}
                                    {otros.length > 0 && (
                                        <span>Otros: {otros.length}</span>
                                    )}
                                </div>
                                <span className="font-medium">
                                    Total: {alergias.length + patologias.length + otros.length}
                                </span>
                            </div>
                        </div>
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
                                    ? "Sección D" 
                                    : "Sin patologías")
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