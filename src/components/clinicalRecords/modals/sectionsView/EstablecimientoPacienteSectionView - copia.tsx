// src/components/clinicalRecord/modals/sectionsView/EstablecimientoPacienteSection.tsx
import React from "react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface EstablecimientoPacienteSectionProps {
    record: ClinicalRecordDetailResponse;
}

export const EstablecimientoPacienteSection: React.FC<
    EstablecimientoPacienteSectionProps
> = ({ record }) => {
    // Extraer datos del paciente desde paciente_info
    const paciente = record.paciente_info;
    
    // Función para determinar el color basado en el sexo
    const getSexoStyles = (sexo: string | null | undefined) => {
        if (!sexo) return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-200'
        };
        
        const sexoLower = sexo.toLowerCase();
        
        if (sexoLower.includes('masculino') || sexoLower === 'm') {
            return {
                bg: 'bg-blue-light-50',
                text: 'text-blue-light-700',
                border: 'border-blue-light-200'
            };
        }
        
        if (sexoLower.includes('femenino') || sexoLower === 'f') {
            return {
                bg: 'bg-pink-50',
                text: 'text-pink-700',
                border: 'border-pink-200'
            };
        }
        
        return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-200'
        };
    };
    
    // Obtener estilos basados en el sexo
    const sexoStyles = getSexoStyles(paciente.sexo);
    
    // Formatear el texto del sexo para mostrar
    const formatSexoText = (sexo: string | null | undefined) => {
        if (!sexo) return "-";
        
        const sexoLower = sexo.toLowerCase();
        
        if (sexoLower.includes('masculino') || sexoLower === 'm') {
            return "Masculino";
        }
        
        if (sexoLower.includes('femenino') || sexoLower === 'f') {
            return "Femenino";
        }
        
        // Si no coincide con los valores esperados, mostrar el valor original
        return sexo.charAt(0).toUpperCase() + sexo.slice(1).toLowerCase();
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <h3 className="text-base font-semibold text-gray-900">
                    A. Datos de establecimiento y paciente (Formulario 033)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Información institucional y datos del paciente según formato oficial
                </p>
            </div>

            {/* Datos de establecimiento */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Datos del Establecimiento
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Celda 1 - Institución */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                INSTITUCIÓN DEL SISTEMA
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {record.institucion_sistema || "SISTEMA NACIONAL DE SALUD"}
                            </p>
                        </div>
                    </div>

                    {/* Celda 2 - Unicódigo */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                UNICÓDIGO
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-mono font-medium">
                                {record.unicodigo || "No especificado"}
                            </p>
                        </div>
                    </div>

                    {/* Celda 3 - Establecimiento */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                ESTABLECIMIENTO DE SALUD
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {record.establecimiento_salud || "No especificado"}
                            </p>
                        </div>
                    </div>

                    {/* Celda 4 - Historia Clínica */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                NÚMERO DE HISTORIA CLÍNICA ÚNICA
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-mono font-medium">
                                {record.numero_historia_clinica_unica || "No asignado"}
                            </p>
                        </div>
                    </div>

                    {/* Celda 5 - Archivo */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                NÚMERO DE ARCHIVO
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-mono font-medium">
                                {record.numero_archivo || "ARCH-XXXXX"}
                            </p>
                        </div>
                    </div>

                    {/* Celda 6 - Hoja */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-brand-600 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                No. HOJA
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-lg text-gray-900 font-bold">
                                {record.numero_hoja || "1"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Línea divisoria */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-gray-500">
                        DATOS DEL PACIENTE
                    </span>
                </div>
            </div>

            {/* Datos de paciente */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Información del Paciente
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Nombres */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                NOMBRES
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900">
                                {paciente.nombres || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Apellidos */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                APELLIDOS
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900">
                                {paciente.apellidos || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Sexo */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                SEXO
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-gray-100">
                            <div className={`px-3 py-1.5 rounded-lg ${sexoStyles.bg} ${sexoStyles.text} ${sexoStyles.border}`}>
                                <p className="text-sm font-semibold">
                                    {formatSexoText(paciente.sexo)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edad y Condición */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Edad */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-800 uppercase">
                                    EDAD
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {paciente.edad ?? "-"}
                                    </span>
                                    <span className="text-xs text-gray-500">años</span>
                                </div>
                            </div>
                        </div>

                        {/* Condición Edad */}
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-gray-800 uppercase">
                                    CONDICIÓN
                                </p>
                                {/* <p className="text-xs text-gray-500 mt-1">(H, D, M, A)</p> */}
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-gray-100">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 border border-brand-200">
                                    <span className="text-sm font-bold text-brand-700">A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección A completada
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};