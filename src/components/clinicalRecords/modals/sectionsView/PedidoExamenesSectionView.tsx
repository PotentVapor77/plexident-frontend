// src/components/clinicalRecord/modals/sectionsView/PedidoExamenesSectionView.tsx
import React from "react";
import { FileText, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface PedidoExamenesSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const PedidoExamenesSectionView: React.FC<PedidoExamenesSectionViewProps> = ({ record }) => {
    // Extraer datos de exámenes complementarios
    const examenesData = record.examenes_complementarios_data;
    
    // Verificar si hay datos de pedido
    const tienePedido = examenesData?.pedido_examenes && examenesData.pedido_examenes.trim() !== "";
    const fechaPedido = examenesData?.fecha_creacion;
    const estadoPedido = examenesData?.estado_examenes || "SIN_PEDIDO";

    // Obtener estilos según el estado
    const getEstadoStyles = (estado: string) => {
        switch (estado) {
            case "COMPLETADO":
                return {
                    bg: "bg-emerald-100",
                    text: "text-emerald-800",
                    border: "border-emerald-200",
                    icon: <CheckCircle2 className="h-4 w-4" />
                };
            case "PENDIENTE":
                return {
                    bg: "bg-amber-100",
                    text: "text-amber-800",
                    border: "border-amber-200",
                    icon: <AlertCircle className="h-4 w-4" />
                };
            case "SIN_PEDIDO":
            default:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    border: "border-gray-200",
                    icon: <FileText className="h-4 w-4" />
                };
        }
    };

    const estadoStyles = getEstadoStyles(estadoPedido);

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

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* ====================================================================
                HEADER
            ==================================================================== */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            {/* <FileText className="h-5 w-5 text-blue-600" /> */}
                            <h3 className="text-base font-semibold text-gray-900">
                                L. Pedido de Exámenes Complementarios
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Solicitudes de estudios complementarios para el paciente
                        </p>
                    </div>
                    
                    {/* Badge de estado */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${estadoStyles.border} ${estadoStyles.bg} ${estadoStyles.text}`}>
                        {estadoStyles.icon}
                        <span className="text-xs font-medium capitalize">
                            {estadoPedido.toLowerCase().replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* ====================================================================
                CONTENT
            ==================================================================== */}
            <div className="space-y-4">
                {!tienePedido ? (
                    // Estado sin pedido
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                No se han solicitado exámenes complementarios
                            </h4>
                            <p className="text-xs text-gray-500">
                                No existen pedidos de exámenes registrados para este paciente
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Panel de información del pedido */}
                        <div className="border border-gray-200 rounded-lg bg-gray-50">
                            {/* Encabezado del panel */}
                            <div className="grid grid-cols-2 border-b border-gray-200 bg-white rounded-t-lg">
                                <div className="p-3 text-center border-r border-gray-200">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Fecha Pedido
                                        </p>
                                    </div>
                                </div>

                                {/* <div className="p-3 text-center border-r border-gray-200">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <User className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Estado
                                        </p>
                                    </div>
                                </div> */}

                                <div className="p-3 text-center">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <p className="text-xs font-semibold text-gray-800 uppercase">
                                            Tipo
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Valores del panel */}
                            <div className="grid grid-cols-2">
                                {/* Fecha */}
                                <div className="p-4 text-center border-r border-gray-200 bg-white">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-gray-900">
                                                {fechaPedido ? formatFecha(fechaPedido).split(',')[0] : "-"}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-xs text-gray-600">
                                                {fechaPedido ? formatFecha(fechaPedido).split(',')[1].trim() : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado */}
                                {/* <div className={`p-4 text-center border-r border-gray-200 ${estadoStyles.bg}`}>
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-2">
                                            {estadoStyles.icon}
                                            <span className={`text-lg font-bold ${estadoStyles.text}`}>
                                                {estadoPedido === "COMPLETADO" ? "✓" : 
                                                 estadoPedido === "PENDIENTE" ? "⚠" : "-"}
                                            </span>
                                        </div>

                                        <div className="mt-1">

                                            <span className={`text-xs font-medium ${estadoStyles.text}`}>
                                                {estadoPedido === "COMPLETADO" ? "Completado" : 
                                                 estadoPedido === "PENDIENTE" ? "Pendiente" : "Sin pedido"}
                                            </span>
                                        </div>
                                        
                                    </div>
                                </div> */}

                                {/* Tipo */}
                                <div className="p-4 text-center bg-white">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-gray-900">
                                                {examenesData?.pedido_examenes ? 
                                                    examenesData.pedido_examenes.split(',').length : 0}
                                            </span>
                                            <span className="text-sm text-gray-600">exámenes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lista de exámenes solicitados */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                <h4 className="text-sm font-semibold text-gray-800">
                                    Exámenes Solicitados
                                </h4>
                            </div>
                            
                            {examenesData?.pedido_examenes ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {examenesData.pedido_examenes.split(',').map((examen, index) => (
                                        <div 
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-3 bg-blue-50"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {examen.trim()}
                                                    </p>
                                                    {index === 0 && examenesData?.pedido_examenes_detalle && (
                                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                                            <p className="text-xs text-gray-700">
                                                                Detalle: {examenesData.pedido_examenes_detalle}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 border border-gray-200 rounded bg-gray-50">
                                    <p className="text-sm text-gray-500 text-center">
                                        Sin especificación de exámenes
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Indicadores adicionales */}
                        {examenesData?.tiene_pedido_examenes_pendiente !== undefined && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-amber-50">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">
                                            {examenesData.tiene_pedido_examenes_pendiente
                                                ? "⚠ Pedido pendiente de procesar"
                                                : "✓ Sin pedidos pendientes"}
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            {examenesData.tiene_pedido_examenes_pendiente
                                                ? "Existen solicitudes pendientes de atención"
                                                : "Todos los pedidos han sido procesados"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ====================================================================
                FOOTER
            ==================================================================== */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección L {tienePedido ? 'con pedido' : 'sin pedido'}
                        </p>
                    </div>
                    {fechaPedido && (
                        <span className="text-xs text-gray-400">
                            Solicitado: {formatFecha(fechaPedido)}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};