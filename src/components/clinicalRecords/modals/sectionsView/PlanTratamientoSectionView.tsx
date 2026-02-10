// src/components/clinicalRecord/modals/sectionsView/PlanTratamientoSectionView.tsx
import React from "react";
import type { 
  ClinicalRecordDetailResponse,
  SesionTratamientoData,
  PlanTratamientoData,
  EstadoSesion 
} from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { formatDateOnly } from "../../../../mappers/clinicalRecordMapper";
import { 
  ClipboardList, 
  Stethoscope, 
  Pill, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface PlanTratamientoSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

// BORRAR ESTE ARCHIVO



export const PlanTratamientoSectionView: React.FC<PlanTratamientoSectionViewProps> = ({ 
    record 
}) => {
    // Extraer datos del plan de tratamiento
    const planData = record.plan_tratamiento_data;
    const sesiones = planData?.sesiones || [];
    
    // Determinar si hay datos
    const tienePlan = !!planData;
    const tieneSesiones = sesiones.length > 0;
    
    // Función para obtener el ícono de estado
    const getEstadoIcon = (estado: EstadoSesion | string) => {
        const estadoUpper = estado?.toUpperCase();
        switch(estadoUpper) {
            case 'COMPLETADA':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'EN_PROGRESO':
                return <div className="h-4 w-4 rounded-full bg-amber-400"></div>;
            case 'CANCELADA':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'PLANIFICADA':
                return <div className="h-4 w-4 rounded-full bg-blue-400"></div>;
            default:
                return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
        }
    };
    
    // Función para obtener el texto del estado
    const getEstadoTexto = (estado: EstadoSesion | string) => {
        const estadoUpper = estado?.toUpperCase();
        switch(estadoUpper) {
            case 'COMPLETADA':
                return 'COMPLETADA';
            case 'EN_PROGRESO':
                return 'EN PROGRESO';
            case 'CANCELADA':
                return 'CANCELADA';
            case 'PLANIFICADA':
                return 'PLANIFICADA';
            default:
                return estado || 'PENDIENTE';
        }
    };

    // Función para parsear JSON de datos de sesión
    const parseSessionData = (dataString: string | any) => {
        if (!dataString) return [];
        if (Array.isArray(dataString)) return dataString;
        
        try {
            // Si es string, intentar parsear como JSON
            if (typeof dataString === 'string') {
                return JSON.parse(dataString);
            }
            return [];
        } catch {
            return [];
        }
    };
    
    // Función para formatear diagnósticos
    const formatDiagnosticos = (diagnosticosData: any) => {
        const diagnosticos = parseSessionData(diagnosticosData);
        
        if (!Array.isArray(diagnosticos) || diagnosticos.length === 0) {
            return <span className="text-gray-500 italic">Sin diagnósticos registrados</span>;
        }
        
        // Agrupar por diagnóstico y diente
        const grupos: Record<string, {diagnostico: string, diente: string, superficies: string[]}> = {};
        
        diagnosticos.forEach((diag: any) => {
            const key = `${diag.diagnostico || diag.diagnostico_nombre || diag.nombre || 'Sin diagnóstico'}-${diag.diente || diag.diente_fdi || ''}`;
            if (!grupos[key]) {
                grupos[key] = {
                    diagnostico: diag.diagnostico || diag.diagnostico_nombre || diag.nombre || 'Sin diagnóstico',
                    diente: diag.diente || diag.diente_fdi || '',
                    superficies: []
                };
            }
            if (diag.superficie || diag.superficie_nombre) {
                const superficie = diag.superficie || diag.superficie_nombre;
                if (!grupos[key].superficies.includes(superficie)) {
                    grupos[key].superficies.push(superficie);
                }
            }
        });
        
        return (
            <div className="space-y-2">
                {Object.values(grupos).map((grupo, idx) => (
                    <div key={idx} className="text-sm">
                        <div className="font-medium text-gray-800">
                            {grupo.diagnostico}
                            {grupo.diente && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    Diente: {grupo.diente}
                                </span>
                            )}
                        </div>
                        {grupo.superficies.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Superficies:</span> {grupo.superficies.join(', ')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };
    
    // Función para formatear procedimientos
    const formatProcedimientos = (procedimientosData: any) => {
        const procedimientos = parseSessionData(procedimientosData);
        
        if (!Array.isArray(procedimientos) || procedimientos.length === 0) {
            return <span className="text-gray-500 italic">Sin procedimientos registrados</span>;
        }
        
        return (
            <div className="space-y-2">
                {procedimientos.map((proc, idx) => (
                    <div key={idx} className="text-sm">
                        <div className="font-medium text-gray-800">
                            {proc.nombre || proc.descripcion || 'Procedimiento sin nombre'}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {proc.codigo && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                    Código: {proc.codigo}
                                </span>
                            )}
                            {proc.diente && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    Diente: {proc.diente}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    // Función para formatear prescripciones
    const formatPrescripciones = (prescripcionesData: any) => {
        const prescripciones = parseSessionData(prescripcionesData);
        
        if (!Array.isArray(prescripciones) || prescripciones.length === 0) {
            return <span className="text-gray-500 italic">Sin prescripciones registradas</span>;
        }
        
        return (
            <div className="space-y-2">
                {prescripciones.map((pres, idx) => (
                    <div key={idx} className="text-sm">
                        <div className="font-medium text-gray-800">
                            {pres.medicamento || pres.descripcion || 'Medicamento no especificado'}
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs text-gray-600">
                            {pres.dosis && (
                                <div>
                                    <span className="font-medium">Dosis:</span> {pres.dosis}
                                </div>
                            )}
                            {pres.frecuencia && (
                                <div>
                                    <span className="font-medium">Frecuencia:</span> {pres.frecuencia}
                                </div>
                            )}
                            {pres.duracion && (
                                <div>
                                    <span className="font-medium">Duración:</span> {pres.duracion}
                                </div>
                            )}
                            {pres.via && (
                                <div>
                                    <span className="font-medium">Vía:</span> {pres.via}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Encabezado de la sección */}
            <div className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            P. Plan de Tratamiento
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Detalle de sesiones, diagnósticos, procedimientos y prescripciones
                        </p>
                    </div>
                </div>
                
                {/* Información general del plan */}
                {tienePlan && (
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-700">
                                {planData.fecha_creacion ? 
                                    `Creado: ${formatDateOnly(planData.fecha_creacion)}` : 
                                    'Fecha no especificada'}
                            </span>
                        </div>
                        {planData.titulo && (
                            <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded">
                                {planData.titulo}
                            </div>
                        )}
                        {planData.descripcion && (
                            <div className="px-3 py-1 bg-gray-50 text-gray-700 rounded">
                                {planData.descripcion}
                            </div>
                        )}
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded">
                            {sesiones.length} sesiones
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido principal */}
            <div className="space-y-5">
                {!tienePlan ? (
                    <div className="text-center py-6 border border-gray-200 rounded">
                        <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-500">
                                No hay plan de tratamiento asociado a este historial
                            </p>
                        </div>
                    </div>
                ) : !tieneSesiones ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <p className="text-sm text-gray-700">
                                Plan registrado pero sin sesiones definidas
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Tabla de sesiones - Diseño horizontal */}
                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                {/* Encabezados de la tabla */}
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    <div className="font-bold text-sm text-gray-900 uppercase tracking-wider px-2 py-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-1">
                                            <span>No. SESIÓN</span>
                                            <span className="text-xs font-normal">Y FECHA</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm text-gray-900 uppercase tracking-wider px-2 py-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-1">
                                            <Stethoscope className="h-3 w-3" />
                                            <span>DIAGNÓSTICOS Y COMPLICACIONES</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm text-gray-900 uppercase tracking-wider px-2 py-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            <span>PROCEDIMIENTOS</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm text-gray-900 uppercase tracking-wider px-2 py-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-1">
                                            <Pill className="h-3 w-3" />
                                            <span>PRESCRIPCIONES</span>
                                        </div>
                                    </div>
                                    {/* <div className="font-bold text-sm text-gray-900 uppercase tracking-wider px-2 py-2 bg-gray-50 rounded border">
                                        <div className="flex flex-col items-center">
                                            <span>FIRMA</span>
                                            <span className="text-xs font-normal">Y SELLO</span>
                                        </div>
                                    </div> */}
                                </div>
                                
                                {/* Filas de sesiones */}
                                {sesiones.map((sesion, index) => (
                                    <div 
                                        key={sesion.id || index} 
                                        className="grid grid-cols-4 gap-2 mb-3 border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        {/* Columna 1: Número de sesión y fecha */}
                                        <div className="p-3 bg-white border-r border-gray-200">
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <div className="text-lg font-bold text-purple-700 mb-1">
                                                    Sesión {sesion.numero_sesion}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    {sesion.fecha_programada ? (
                                                        <span>{formatDateOnly(sesion.fecha_programada)}</span>
                                                    ) : (
                                                        <span className="text-gray-400">No programada</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-2">
                                                    {getEstadoIcon(sesion.estado)}
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {getEstadoTexto(sesion.estado)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Columna 2: Diagnósticos y complicaciones */}
                                        <div className="p-3 bg-white border-r border-gray-200">
                                            {formatDiagnosticos(
                                                sesion.diagnosticos_complicaciones || 
                                                sesion.diagnosticos_y_complicaciones
                                            )}
                                        </div>
                                        
                                        {/* Columna 3: Procedimientos */}
                                        <div className="p-3 bg-white border-r border-gray-200">
                                            {formatProcedimientos(sesion.procedimientos)}
                                        </div>
                                        
                                        {/* Columna 4: Prescripciones */}
                                        <div className="p-3 bg-white border-r border-gray-200">
                                            {formatPrescripciones(sesion.prescripciones)}
                                        </div>
                                        
                                        {/* Columna 5: Firma y sello */}
                                        <div className="p-3 bg-white flex flex-col items-center justify-center">
                                            {/* <div className="text-center space-y-2">
                                                <div className="h-16 w-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">FIRMA</span>
                                                </div>
                                                <div className="h-12 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">SELLO</span>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Resumen del plan */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Total sesiones:</span>
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                            {sesiones.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Completadas:</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            {sesiones.filter(s => s.estado === 'COMPLETADA').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">En progreso:</span>
                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                            {sesiones.filter(s => s.estado === 'EN_PROGRESO').length}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-gray-500">
                                    ID: {planData.id?.substring(0, 8)}...
                                </div>
                            </div>
                        </div>
                        
                        {/* Notas de sesión (si existen) */}
                        {sesiones.some(s => s.notas || s.observaciones) && (
                            <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800">Notas y Observaciones de Sesiones</h4>
                                {sesiones
                                    .filter(s => s.notas || s.observaciones)
                                    .map((sesion, idx) => (
                                        <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-blue-800">
                                                    Sesión {sesion.numero_sesion}
                                                </span>
                                            </div>
                                            {sesion.notas && (
                                                <p className="text-sm text-blue-700 mb-1">
                                                    <span className="font-medium">Notas:</span> {sesion.notas}
                                                </p>
                                            )}
                                            {sesion.observaciones && (
                                                <p className="text-sm text-blue-700">
                                                    <span className="font-medium">Observaciones:</span> {sesion.observaciones}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Pie de sección */}
            <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                        <span className="text-gray-600">
                            {tienePlan ? 
                                `Plan P - ${tieneSesiones ? `${sesiones.length} sesiones` : 'Sin sesiones'}` : 
                                'Sin plan de tratamiento'}
                        </span>
                    </div>
                    {planData?.fecha_creacion && (
                        <span className="text-gray-500">
                            Creado: {formatDateOnly(planData.fecha_creacion)}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};