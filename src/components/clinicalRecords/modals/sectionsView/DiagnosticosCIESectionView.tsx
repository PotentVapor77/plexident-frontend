// src/components/clinicalRecord/modals/sectionsView/DiagnosticosCIESectionView.tsx
import React from "react";
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar,
} from "lucide-react";
import type { ClinicalRecordDetailResponse, DiagnosticosCIEResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface DiagnosticosCIESectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const DiagnosticosCIESectionView: React.FC<DiagnosticosCIESectionViewProps> = ({ record }) => {
    // Extraer datos de diagnósticos CIE-10 - manejo seguro
    const diagnosticosData = record.diagnosticos_cie_data as DiagnosticosCIEResponse | undefined;
    
    // Verificar si hay datos
    const tieneDiagnosticos = diagnosticosData?.diagnosticos && diagnosticosData.diagnosticos.length > 0;
    
    // Estadísticas seguras - SIN activos
    const estadisticas = {
        total: diagnosticosData?.diagnosticos?.length || 0,
        presuntivos: diagnosticosData?.diagnosticos?.filter(d => d.tipo_cie === "PRE").length || 0,
        definitivos: diagnosticosData?.diagnosticos?.filter(d => d.tipo_cie === "DEF").length || 0,
    };
    
    // Función para obtener color según tipo CIE
    const getTipoCIEColor = (tipo: string) => {
        switch (tipo) {
            case "PRE":
                return {
                    bg: "bg-amber-50",
                    text: "text-amber-800",
                    border: "border-amber-200",
                    iconBg: "bg-amber-100",
                    icon: <Clock className="h-4 w-4 text-amber-600" />
                };
            case "DEF":
                return {
                    bg: "bg-indigo-50",
                    text: "text-indigo-800",
                    border: "border-indigo-200",
                    iconBg: "bg-indigo-100",
                    icon: <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-800",
                    border: "border-gray-200",
                    iconBg: "bg-gray-100",
                    icon: <AlertCircle className="h-4 w-4 text-gray-600" />
                };
        }
    };
    
    // Función para formatear fecha
    const formatFecha = (fechaStr: string | undefined) => {
        if (!fechaStr) return null;
        try {
            return new Date(fechaStr).toLocaleDateString("es-ES", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* ====================================================================
                HEADER - Estilo unificado
            ==================================================================== */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            J. Diagnósticos CIE-10
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Diagnósticos clasificados según el sistema CIE-10
                        </p>
                    </div>
                    
                    {/* Badge de resumen */}
                    {tieneDiagnosticos && (
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full border border-brand-200 bg-brand-50 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                                <span className="text-xs font-medium text-brand-700">
                                    {estadisticas.total} diagnóstico(s)
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ====================================================================
                PANEL DE ESTADÍSTICAS - Solo presuntivos y definitivos
            ==================================================================== */}
            {tieneDiagnosticos && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-brand-600 rounded-full"></div>
                        <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                            Resumen de Tipos de Diagnósticos
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Presuntivos */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-amber-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-100">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                                        Presuntivos (PRE)
                                    </p>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-bold text-amber-900">{estadisticas.presuntivos}</span>
                                        <span className="text-sm text-amber-700">
                                            ({estadisticas.total > 0 ? Math.round((estadisticas.presuntivos / estadisticas.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Definitivos */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                                        Definitivos (DEF)
                                    </p>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-bold text-indigo-900">{estadisticas.definitivos}</span>
                                        <span className="text-sm text-indigo-700">
                                            ({estadisticas.total > 0 ? Math.round((estadisticas.definitivos / estadisticas.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================================
                LISTADO DE DIAGNÓSTICOS - Sin scroll, todos visibles
            ==================================================================== */}
            <div className="space-y-4">
                {!tieneDiagnosticos ? (
                    // Estado sin diagnósticos - Estilo unificado
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                No se encontraron diagnósticos CIE-10
                            </h4>
                            <p className="text-xs text-gray-500">
                                Este historial clínico no tiene diagnósticos CIE-10 registrados
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Encabezado del listado */}
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-800">
                                Listado de Diagnósticos ({estadisticas.total})
                            </h4>
                        </div>
                        
                        {/* Grid de diagnósticos - 1 columna en móvil, 2 en tablet/desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {diagnosticosData.diagnosticos.map((diag, index) => {
                                const tipoStyles = getTipoCIEColor(diag.tipo_cie || "PRE");
                                const fechaFormateada = formatFecha(diag.fecha_diagnostico);
                                
                                return (
                                    <div 
                                        key={index}
                                        className={`border rounded-lg overflow-hidden ${tipoStyles.border} ${tipoStyles.bg} hover:shadow-sm transition-shadow`}
                                    >
                                        {/* Encabezado con CIE y tipo */}
                                        <div className="p-3 border-b border-gray-200 bg-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {/* Icono del tipo */}
                                                    <div className={`h-8 w-8 flex items-center justify-center rounded-full ${tipoStyles.iconBg}`}>
                                                        {tipoStyles.icon}
                                                    </div>
                                                    
                                                    {/* Código CIE */}
                                                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-800 font-mono text-sm font-bold border border-gray-200">
                                                        {diag.codigo_cie}
                                                    </code>
                                                    
                                                    {/* Tipo */}
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${tipoStyles.text}`}>
                                                        {diag.tipo_cie === "DEF" ? "Definitivo" : "Presuntivo"}
                                                    </span>
                                                </div>
                                                
                                                {/* Diente si existe */}
                                                {diag.diente_fdi && (
                                                    <div className={`h-8 w-8 flex items-center justify-center rounded-full ${tipoStyles.iconBg} border ${tipoStyles.border}`}>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {diag.diente_fdi}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Contenido principal */}
                                        <div className="p-4 space-y-3">
                                            {/* Nombre del diagnóstico */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {diag.diagnostico_nombre}
                                                </p>
                                                {diag.diagnostico_siglas && (
                                                    <p className="text-xs text-gray-600">
                                                        <span className="font-medium">Siglas:</span> {diag.diagnostico_siglas}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Información adicional en grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Superficie */}
                                                {diag.superficie_nombre && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-500 uppercase">Superficie</p>
                                                        <p className="text-sm font-medium text-gray-900">{diag.superficie_nombre}</p>
                                                    </div>
                                                )}
                                                
                                                {/* Fecha si existe */}
                                                {fechaFormateada && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-500 uppercase">Fecha</p>
                                                        <div className="flex items-center gap-1 text-sm text-gray-900">
                                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                            {fechaFormateada}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Descripción adicional si existe (usando 'descripcion' en lugar de 'diagnostico_descripcion') */}
                                            {diag.descripcion && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-xs text-gray-600 italic">
                                                        {diag.descripcion}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Pie con número de diagnóstico */}
                                        <div className="px-4 py-2 border-t border-gray-200 bg-white text-xs text-gray-500">
                                            <div className="flex items-center justify-between">
                                                <span>Diagnóstico #{index + 1}</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {fechaFormateada || "Sin fecha"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Total al final del listado */}
                        <div className="flex items-center justify-center pt-2">
                            <div className="border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Total:</span> {estadisticas.total} diagnóstico(s) - 
                                    <span className="text-amber-700 font-medium"> {estadisticas.presuntivos} presuntivo(s)</span> • 
                                    <span className="text-indigo-700 font-medium"> {estadisticas.definitivos} definitivo(s)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ====================================================================
                FOOTER - Estilo unificado
            ==================================================================== */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <p className="text-xs text-gray-500 font-medium">
                            Sección J {tieneDiagnosticos ? `con ${estadisticas.total} diagnóstico(s)` : 'sin diagnósticos'}
                        </p>
                    </div>
                    <span className="text-xs text-gray-400">
                        Sistema CIE-10 • Clasificación Internacional de Enfermedades
                    </span>
                </div>
            </div>
        </section>
    );
};