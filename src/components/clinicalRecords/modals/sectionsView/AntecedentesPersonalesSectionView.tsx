// src/components/clinicalRecord/modals/sectionsView/AntecedentesPersonalesSectionView.tsx
import React from "react";
import { User, AlertCircle, Pill, Heart } from "lucide-react";
import type { 
    ClinicalRecordDetailResponse, 
    AntecedentesPersonalesData 
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
    
    // Estadísticas
    const totalItems = alergias.length + patologias.length + otros.length;
    
    const getBackgroundColor = (type: 'alergias' | 'patologias' | 'otros') => {
        switch(type) {
            case 'alergias': return 'bg-blue-50 border-blue-100';
            case 'patologias': return 'bg-amber-50 border-amber-100';
            case 'otros': return 'bg-purple-50 border-purple-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };
    
    const getIcon = (type: 'alergias' | 'patologias' | 'otros') => {
        switch(type) {
            case 'alergias': return <AlertCircle className="h-4 w-4 text-blue-600" />;
            case 'patologias': return <Heart className="h-4 w-4 text-amber-600" />;
            case 'otros': return <Pill className="h-4 w-4 text-purple-600" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    // Función para obtener la fuente de los datos
    const getFuenteInfo = (data: AntecedentesPersonalesData | undefined) => {
        if (!data) return 'Información no disponible';
        
        // Usar fecha de creación del paciente
        const fecha = data.fecha_creacion 
            ? new Date(data.fecha_creacion).toLocaleDateString('es-ES')
            : 'Fecha desconocida';
        
        return `Registrado el: ${fecha}`;
    };

    // Función para formatear patologías específicas
    const formatPatologia = (patologia: string) => {
        // Si es una patología con formato "Enfermedad: Estado"
        if (patologia.includes(': ')) {
            const [nombre, estado] = patologia.split(': ');
            if (estado === 'CONTROLADA' || estado === 'SI' || estado === 'NO') {
                return `${nombre} (${estado.toLowerCase()})`;
            }
        }
        return patologia;
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                D. Antecedentes Patológicos Personales
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Historial médico personal, alergias y condiciones previas
                            </p>
                        </div>
                    </div>
                    
                    {/* Badge de estado */}
                    <div className="flex items-center gap-2">
                        {antecedentesData ? (
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${tieneContenido ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {tieneContenido ? `${totalItems} REGISTROS` : 'SIN PATOLOGÍAS'}
                            </div>
                        ) : (
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                NO REGISTRADO
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
                {/* Estado de datos */}
                {!antecedentesData ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <User className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-gray-500 italic mb-1">
                            No se encontraron antecedentes personales registrados
                        </p>
                        <p className="text-xs text-gray-400">
                            Esta información no ha sido registrada en el sistema
                        </p>
                    </div>
                ) : !tieneContenido ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                                    Sin antecedentes patológicos
                                </h4>
                                <p className="text-sm text-emerald-700">
                                    El paciente no reporta alergias, patologías ni otros antecedentes personales relevantes.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Alergias */}
                        {alergias.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {getIcon('alergias')}
                                    <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                                        Alergias ({alergias.length})
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {alergias.map((alergia, idx) => (
                                        <div
                                            key={`alergia-${idx}`}
                                            className={`p-3 rounded-lg border ${getBackgroundColor('alergias')}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">{alergia}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Patologías */}
                        {patologias.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {getIcon('patologias')}
                                    <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                                        Patologías y Enfermedades ({patologias.length})
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {patologias.map((patologia, idx) => (
                                        <div
                                            key={`patologia-${idx}`}
                                            className={`p-3 rounded-lg border ${getBackgroundColor('patologias')}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-gray-900">{formatPatologia(patologia)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Otros antecedentes */}
                        {otros.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {getIcon('otros')}
                                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider">
                                        Otros Antecedentes ({otros.length})
                                    </h4>
                                </div>
                                <div className="space-y-3">
                                    {otros.map((otro, idx) => (
                                        <div
                                            key={`otro-${idx}`}
                                            className={`p-4 rounded-lg border ${getBackgroundColor('otros')}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-gray-900 italic">{otro}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Resumen estadístico - solo si hay contenido */}
                {antecedentesData && tieneContenido && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {alergias.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-gray-600">
                                            <span className="font-semibold">{alergias.length}</span> alergias
                                        </span>
                                    </div>
                                )}
                                {patologias.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                        <span className="text-xs text-gray-600">
                                            <span className="font-semibold">{patologias.length}</span> patologías
                                        </span>
                                    </div>
                                )}
                                {otros.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                        <span className="text-xs text-gray-600">
                                            <span className="font-semibold">{otros.length}</span> otros
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                Total: {totalItems} registros
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-500">
                            {antecedentesData 
                                ? (tieneContenido 
                                    ? "Sección D con antecedentes registrados" 
                                    : "Sección D - Sin patologías reportadas")
                                : "Sección D - No registrada"}
                        </p>
                    </div>
                    <div className="text-xs text-gray-400">
                        {getFuenteInfo(antecedentesData)}
                    </div>
                </div>
            </div>
        </section>
    );
};