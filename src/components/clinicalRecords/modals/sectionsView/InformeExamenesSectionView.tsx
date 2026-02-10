// src/components/clinicalRecord/modals/sectionsView/InformeExamenesSectionView.tsx
import React from "react";
import { FileText, CheckCircle2, XCircle, FileBarChart, Calendar } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface InformeExamenesSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const InformeExamenesSectionView: React.FC<InformeExamenesSectionViewProps> = ({ record }) => {
    // Extraer datos de exámenes complementarios
    const examenesData = record.examenes_complementarios_data;
    
    // Verificar si hay datos de informe
    const tieneInforme = examenesData?.informe_examenes && examenesData.informe_examenes.trim() !== "";
    const fechaInforme = examenesData?.fecha_modificacion;
    const estadoInforme = examenesData?.estado_examenes || "SIN_INFORME";

    // Determinar si hay resultados disponibles
    const tieneResultados = examenesData?.tiene_informe_examenes_completado || false;

    // Obtener estilos según el estado
    const getEstadoStyles = (tieneResultados: boolean, estado: string) => {
        if (tieneResultados) {
            return {
                bg: "bg-emerald-100",
                text: "text-emerald-800",
                border: "border-emerald-200",
                icon: <CheckCircle2 className="h-4 w-4" />,
                label: "Con Resultados"
            };
        }
        
        switch (estado) {
            case "COMPLETADO":
                return {
                    bg: "bg-emerald-100",
                    text: "text-emerald-800",
                    border: "border-emerald-200",
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    label: "Completado"
                };
            case "PENDIENTE":
                return {
                    bg: "bg-amber-100",
                    text: "text-amber-800",
                    border: "border-amber-200",
                    icon: <FileBarChart className="h-4 w-4" />,
                    label: "En Proceso"
                };
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    border: "border-gray-200",
                    icon: <XCircle className="h-4 w-4" />,
                    label: "Sin Informe"
                };
        }
    };

    const estadoStyles = getEstadoStyles(tieneResultados, estadoInforme);

    // Formatear fecha para mostrar
    const formatFecha = (fechaStr: string) => {
        return new Date(fechaStr).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Separar tipos de informes
    const getTiposInformes = () => {
        if (!examenesData?.informe_examenes) return [];
        return examenesData.informe_examenes.split(',').map(i => i.trim());
    };

    const tiposInformes = getTiposInformes();

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* ====================================================================
                HEADER
            ==================================================================== */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileBarChart className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-base font-semibold text-gray-900">
                                M. Informe de Exámenes
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Resultados y hallazgos de exámenes complementarios realizados
                        </p>
                    </div>
                    
                    {/* Badge de estado */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${estadoStyles.border} ${estadoStyles.bg} ${estadoStyles.text}`}>
                        {estadoStyles.icon}
                        <span className="text-xs font-medium">
                            {estadoStyles.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* ====================================================================
                CONTENT
            ==================================================================== */}
            <div className="space-y-4">
                {!tieneInforme ? (
                    // Estado sin informe
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <XCircle className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Sin informes de resultados
                            </h4>
                            <p className="text-xs text-gray-500">
                                No existen informes de exámenes disponibles para este paciente
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Panel de resumen del informe */}
                        <div className="border border-gray-200 rounded-lg bg-gray-50">
                            {/* Encabezado del panel */}
                            <div className="grid grid-cols-2 border-b border-gray-200 bg-white rounded-t-lg">
                                {/* <div className="p-3 text-center border-r border-gray-200">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Fecha Informe
                                        </p>
                                    </div>
                                </div> */}
                                <div className="p-3 text-center border-r border-gray-200">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <FileBarChart className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Estado
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Informes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Valores del panel */}
                            <div className="grid grid-cols-2">
                                {/* Fecha */}
                                {/* <div className="p-4 text-center border-r border-gray-200 bg-white">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-gray-900">
                                                {fechaInforme ? formatFecha(fechaInforme).split(',')[0] : "-"}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-xs text-gray-600">
                                                {fechaInforme ? formatFecha(fechaInforme).split(',')[1].trim() : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Estado */}
                                <div className={`p-4 text-center border-r border-gray-200 ${estadoStyles.bg}`}>
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-2">
                                            {estadoStyles.icon}
                                            <span className={`text-lg font-bold ${estadoStyles.text}`}>
                                                {tieneResultados ? "✓" : "⚠"}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <span className={`text-xs font-medium ${estadoStyles.text}`}>
                                                {tieneResultados ? "Disponible" : "Pendiente"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tipo */}
                                <div className="p-4 text-center bg-white">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-gray-900">
                                                {tiposInformes.length}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {tiposInformes.length === 1 ? "tipo" : "tipos"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tipos de informes disponibles */}
                        {tiposInformes.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Informes Disponibles ({tiposInformes.length})
                                    </h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {tiposInformes.map((tipo, index) => (
                                        <div 
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-3 bg-emerald-50"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mr-2">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {tipo}
                                                        </p>
                                                        <span className="text-xs text-emerald-700 font-medium">
                                                            ✓ Disponible
                                                        </span>
                                                    </div>
                                                    {/* Mostrar detalle solo si existe y es el primer elemento */}
                                                    {index === 0 && examenesData?.informe_examenes_detalle && (
                                                        <div className="mt-2 pt-2 border-t border-emerald-200">
                                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                                                Hallazgos:
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {examenesData.informe_examenes_detalle}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resumen de hallazgos */}
                        {examenesData?.resumen_examenes_complementarios && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <h5 className="text-sm font-medium text-blue-800">
                                            Resumen de Hallazgos
                                        </h5>
                                    </div>
                                    <div className="pl-6">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {examenesData.resumen_examenes_complementarios}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Indicador de completitud */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {tieneResultados ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                        <FileBarChart className="h-5 w-5 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {tieneResultados 
                                                ? "Resultados completos disponibles" 
                                                : "Resultados pendientes"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {tieneResultados 
                                                ? "Todos los exámenes solicitados cuentan con informe"
                                                : "Esperando resultados de laboratorio"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ====================================================================
                FOOTER
            ==================================================================== */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección M {tieneInforme ? 'con informe' : 'sin informe'}
                        </p>
                    </div>
                    {fechaInforme && (
                        <span className="text-xs text-gray-400">
                            Actualizado: {formatFecha(fechaInforme)}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};