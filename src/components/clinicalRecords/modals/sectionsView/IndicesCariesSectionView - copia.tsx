// src/components/clinicalRecord/modals/sectionsView/IndicesCariesSectionView.tsx
import React from "react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface IndicesCariesSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const IndicesCariesSectionView: React.FC<IndicesCariesSectionViewProps> = ({ record }) => {
    // Extraer datos de índices de caries
    const indicesData = record.indices_caries_data;
    
    // Calcular edades para determinar qué índices mostrar
    const edadPaciente = record.paciente_info?.edad || 0;
    const mostrarCPO = edadPaciente >= 12;
    const mostrarCEO = edadPaciente < 12;

    // Formatear fecha si existe
    const formatFecha = (fechaString?: string) => {
        if (!fechaString) return "No especificado";
        try {
            return new Date(fechaString).toLocaleDateString('es-ES');
        } catch {
            return fechaString;
        }
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <h3 className="text-base font-semibold text-gray-900">
                    J. ÍNDICES CPO-ceo
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Índices de caries dental (CPO para permanentes, ceo para temporales)
                </p>
            </div>

            {/* Tabla de Índices CPO */}
            {mostrarCPO && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        Índice CPO - Dientes Permanentes
                    </h4>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        D
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        C
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        P
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        O
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        TOTAL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        CPO
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.cpo_c ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.cpo_p ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.cpo_o ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-lg font-bold text-gray-900 bg-gray-50">
                                        {indicesData?.cpo_total ?? "0"}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan={5} className="border border-gray-300 px-4 py-2 text-xs text-gray-500 italic">
                                        CPO = Cariados + Perdidos + Obturados (dientes permanentes)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Información adicional CPO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-blue-800 uppercase">
                                    PROMEDIO CPO
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-blue-900">
                                        {indicesData?.cpo_total ? (indicesData.cpo_total / 32).toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-xs text-blue-500">por diente</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 bg-rose-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-rose-800 uppercase">
                                    % CARIADOS
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-rose-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-rose-900">
                                        {indicesData?.cpo_total ? ((indicesData.cpo_c ?? 0) / 32 * 100).toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-xs text-rose-500">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 bg-emerald-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-emerald-800 uppercase">
                                    % SANOS
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-emerald-900">
                                        {indicesData?.cpo_total ? (100 - ((indicesData.cpo_total ?? 0) / 32 * 100)).toFixed(1) : "100.0"}
                                    </span>
                                    <span className="text-xs text-emerald-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de Índices ceo */}
            {mostrarCEO && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        Índice ceo - Dientes Temporales
                    </h4>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        d
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        c
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        e
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        o
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold text-gray-800 uppercase w-1/5">
                                        TOTAL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        ceo
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.ceo_c ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.ceo_e ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-sm font-mono text-gray-900 bg-white">
                                        {indicesData?.ceo_o ?? "0"}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center text-lg font-bold text-gray-900 bg-gray-50">
                                        {indicesData?.ceo_total ?? "0"}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan={5} className="border border-gray-300 px-4 py-2 text-xs text-gray-500 italic">
                                        ceo = cariados + extraídos + obturados (dientes temporales)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Información adicional ceo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-3 bg-violet-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-violet-800 uppercase">
                                    PROMEDIO ceo
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-violet-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-violet-900">
                                        {indicesData?.ceo_total ? (indicesData.ceo_total / 20).toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-xs text-violet-500">por diente</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 bg-amber-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-amber-800 uppercase">
                                    % CARIADOS
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-amber-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-amber-900">
                                        {indicesData?.ceo_total ? ((indicesData.ceo_c ?? 0) / 20 * 100).toFixed(1) : "0.0"}
                                    </span>
                                    <span className="text-xs text-amber-500">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 bg-cyan-50">
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-cyan-800 uppercase">
                                    % SANOS
                                </p>
                            </div>
                            <div className="min-h-10 flex items-center justify-center px-2 py-2 bg-white rounded border border-cyan-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-cyan-900">
                                        {indicesData?.ceo_total ? (100 - ((indicesData.ceo_total ?? 0) / 20 * 100)).toFixed(1) : "100.0"}
                                    </span>
                                    <span className="text-xs text-cyan-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de clasificación */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                    Clasificación del Riesgo de Caries
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
                        <p className="text-xs font-semibold text-emerald-800 uppercase">BAJA</p>
                        <p className="text-lg font-bold text-emerald-700 mt-1">0-3</p>
                        <p className="text-xs text-gray-600 mt-1">Sin intervención inmediata</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-800 uppercase">MODERADA</p>
                        <p className="text-lg font-bold text-amber-700 mt-1">4-6</p>
                        <p className="text-xs text-gray-600 mt-1">Vigilancia periódica</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 uppercase">ALTA</p>
                        <p className="text-lg font-bold text-orange-700 mt-1">7-10</p>
                        <p className="text-xs text-gray-600 mt-1">Intervención necesaria</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-rose-200">
                        <p className="text-xs font-semibold text-rose-800 uppercase">MUY ALTA</p>
                        <p className="text-lg font-bold text-rose-700 mt-1">11+</p>
                        <p className="text-xs text-gray-600 mt-1">Urgencia odontológica</p>
                    </div>
                </div>
            </div>

            {/* Metadatos */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="mb-2">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                FECHA DE EVALUACIÓN
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-gray-50 rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {formatFecha(indicesData?.fecha)}
                            </p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="mb-2">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                EDAD DEL PACIENTE
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-gray-50 rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {edadPaciente} años
                            </p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="mb-2">
                            <p className="text-xs font-semibold text-gray-800 uppercase">
                                ÍNDICE APLICADO
                            </p>
                        </div>
                        <div className="min-h-10 flex items-center px-2 py-2 bg-gray-50 rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {mostrarCPO ? "CPO (Permanentes)" : "ceo (Temporales)"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección J completada
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">
                            {indicesData ? "Índices registrados" : "Sin índices registrados"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};