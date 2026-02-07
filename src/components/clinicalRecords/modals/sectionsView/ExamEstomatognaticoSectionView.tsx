// src/components/clinicalRecord/modals/sectionsView/ExamenEstomatognaticoSectionView.tsx
import React from "react";
import { HeartPulse, AlertCircle, CheckCircle } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface ExamenEstomatognaticoSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const ExamenEstomatognaticoSectionView: React.FC<
    ExamenEstomatognaticoSectionViewProps
> = ({ record }) => {
    // Extraer datos del examen estomatognático
    const examenData = record.examen_estomatognatico_data;
    
    // Función para formatear nombre de región
    const formatRegionName = (region: string) => {
        const regionMap: Record<string, string> = {
            'atm': 'ATM',
            'mejillas': 'Mejillas',
            'maxilar_inferior': 'Maxilar Inferior',
            'maxilar_superior': 'Maxilar Superior',
            'paladar': 'Paladar',
            'piso_boca': 'Piso de Boca',
            'carrillos': 'Carrillos',
            'glandulas_salivales': 'Glándulas Salivales',
            'ganglios': 'Ganglios',
            'lengua': 'Lengua',
            'labios': 'Labios'
        };
        return regionMap[region.toLowerCase()] || region;
    };

    // Función para obtener datos de región de manera segura
    const getRegionData = (regionKey: string) => {
        if (!examenData) return null;
        
        // Extraer propiedades específicas de la región de manera segura
        const regionData: {
            cp?: boolean;
            sp?: boolean;
            absceso?: boolean;
            fibroma?: boolean;
            herpes?: boolean;
            ulcera?: boolean;
            otra_patologia?: boolean;
            observacion?: string;
        } = {};
        
        // Usar type assertion solo cuando sabemos que la propiedad existe
        switch (regionKey) {
            case 'atm':
                regionData.cp = examenData.atm_cp;
                regionData.sp = examenData.atm_sp;
                regionData.absceso = examenData.atm_absceso;
                regionData.fibroma = examenData.atm_fibroma;
                regionData.herpes = examenData.atm_herpes;
                regionData.ulcera = examenData.atm_ulcera;
                regionData.otra_patologia = examenData.atm_otra_patologia;
                regionData.observacion = examenData.atm_observacion;
                break;
            case 'mejillas':
                regionData.cp = examenData.mejillas_cp;
                regionData.sp = examenData.mejillas_sp;
                regionData.absceso = examenData.mejillas_absceso;
                regionData.fibroma = examenData.mejillas_fibroma;
                regionData.herpes = examenData.mejillas_herpes;
                regionData.ulcera = examenData.mejillas_ulcera;
                regionData.otra_patologia = examenData.mejillas_otra_patologia;
                regionData.observacion = examenData.mejillas_descripcion;
                break;
            case 'maxilar_inferior':
                regionData.cp = examenData.maxilar_inferior_cp;
                regionData.sp = examenData.maxilar_inferior_sp;
                regionData.absceso = examenData.maxilar_inferior_absceso;
                regionData.fibroma = examenData.maxilar_inferior_fibroma;
                regionData.herpes = examenData.maxilar_inferior_herpes;
                regionData.ulcera = examenData.maxilar_inferior_ulcera;
                regionData.otra_patologia = examenData.maxilar_inferior_otra_patologia;
                regionData.observacion = examenData.maxilar_inferior_descripcion;
                break;
            case 'maxilar_superior':
                regionData.cp = examenData.maxilar_superior_cp;
                regionData.sp = examenData.maxilar_superior_sp;
                regionData.absceso = examenData.maxilar_superior_absceso;
                regionData.fibroma = examenData.maxilar_superior_fibroma;
                regionData.herpes = examenData.maxilar_superior_herpes;
                regionData.ulcera = examenData.maxilar_superior_ulcera;
                regionData.otra_patologia = examenData.maxilar_superior_otra_patologia;
                regionData.observacion = examenData.maxilar_superior_descripcion;
                break;
            case 'paladar':
                regionData.cp = examenData.paladar_cp;
                regionData.sp = examenData.paladar_sp;
                regionData.absceso = examenData.paladar_absceso;
                regionData.fibroma = examenData.paladar_fibroma;
                regionData.herpes = examenData.paladar_herpes;
                regionData.ulcera = examenData.paladar_ulcera;
                regionData.otra_patologia = examenData.paladar_otra_patologia;
                regionData.observacion = examenData.paladar_descripcion;
                break;
            case 'piso_boca':
                regionData.cp = examenData.piso_boca_cp;
                regionData.sp = examenData.piso_boca_sp;
                regionData.absceso = examenData.piso_boca_absceso;
                regionData.fibroma = examenData.piso_boca_fibroma;
                regionData.herpes = examenData.piso_boca_herpes;
                regionData.ulcera = examenData.piso_boca_ulcera;
                regionData.otra_patologia = examenData.piso_boca_otra_patologia;
                regionData.observacion = examenData.piso_boca_descripcion;
                break;
            case 'carrillos':
                regionData.cp = examenData.carrillos_cp;
                regionData.sp = examenData.carrillos_sp;
                regionData.absceso = examenData.carrillos_absceso;
                regionData.fibroma = examenData.carrillos_fibroma;
                regionData.herpes = examenData.carrillos_herpes;
                regionData.ulcera = examenData.carrillos_ulcera;
                regionData.otra_patologia = examenData.carrillos_otra_patologia;
                regionData.observacion = examenData.carrillos_descripcion;
                break;
            case 'glandulas_salivales':
                regionData.cp = examenData.glandulas_salivales_cp;
                regionData.sp = examenData.glandulas_salivales_sp;
                regionData.absceso = examenData.glandulas_salivales_absceso;
                regionData.fibroma = examenData.glandulas_salivales_fibroma;
                regionData.herpes = examenData.glandulas_salivales_herpes;
                regionData.ulcera = examenData.glandulas_salivales_ulcera;
                regionData.otra_patologia = examenData.glandulas_salivales_otra_patologia;
                regionData.observacion = examenData.glandulas_salivales_descripcion;
                break;
            case 'ganglios':
                regionData.cp = examenData.ganglios_cp;
                regionData.sp = examenData.ganglios_sp;
                regionData.absceso = examenData.ganglios_absceso;
                regionData.fibroma = examenData.ganglios_fibroma;
                regionData.herpes = examenData.ganglios_herpes;
                regionData.ulcera = examenData.ganglios_ulcera;
                regionData.otra_patologia = examenData.ganglios_otra_patologia;
                regionData.observacion = examenData.ganglios_descripcion;
                break;
            case 'lengua':
                regionData.cp = examenData.lengua_cp;
                regionData.sp = examenData.lengua_sp;
                regionData.absceso = examenData.lengua_absceso;
                regionData.fibroma = examenData.lengua_fibroma;
                regionData.herpes = examenData.lengua_herpes;
                regionData.ulcera = examenData.lengua_ulcera;
                regionData.otra_patologia = examenData.lengua_otra_patologia;
                regionData.observacion = examenData.lengua_descripcion;
                break;
            case 'labios':
                regionData.cp = examenData.labios_cp;
                regionData.sp = examenData.labios_sp;
                regionData.absceso = examenData.labios_absceso;
                regionData.fibroma = examenData.labios_fibroma;
                regionData.herpes = examenData.labios_herpes;
                regionData.ulcera = examenData.labios_ulcera;
                regionData.otra_patologia = examenData.labios_otra_patologia;
                regionData.observacion = examenData.labios_descripcion;
                break;
            default:
                return null;
        }
        
        return regionData;
    };

    // Función para determinar estado de patología
    const getPatologiaEstado = (regionData: any) => {
    if (!regionData) return "normal";
    
    if (regionData.sp === true) return "normal";
    
    const patologias = [
        regionData.cp, 
        regionData.absceso,
        regionData.fibroma,
        regionData.herpes,
        regionData.ulcera,
        regionData.otra_patologia
    ];
    
    // Si hay al menos una patología, retornar "patologia"
    return patologias.some(p => p === true) ? "patologia" : "normal";
};


    // Función para obtener descripción de patología por región
    const getPatologiaDescripcion = (region: string, regionData: any) => {
    if (!regionData) return "Sin datos";
    
    if (regionData.sp === true) return "Sin patología";
    
    const patologias: string[] = [];
    
    // Solo agregar las patologías que son verdaderas
    if (regionData.cp) patologias.push("Cambios patológicos");
    if (regionData.absceso) patologias.push("Absceso");
    if (regionData.fibroma) patologias.push("Fibroma");
    if (regionData.herpes) patologias.push("Herpes");
    if (regionData.ulcera) patologias.push("Úlcera");
    if (regionData.otra_patologia) {
        const observacion = regionData.observacion || "Otra patología";
        patologias.push(observacion);
    }
    
    // Si no hay patologías, mostrar "Sin patología"
    return patologias.length > 0 ? patologias.join(", ") : "Sin patología";
};

    // Regiones a mostrar en el grid
    const regiones = [
        { key: 'atm', label: 'ATM' },
        { key: 'mejillas', label: 'Mejillas' },
        { key: 'maxilar_inferior', label: 'Maxilar Inferior' },
        { key: 'maxilar_superior', label: 'Maxilar Superior' },
        { key: 'paladar', label: 'Paladar' },
        { key: 'piso_boca', label: 'Piso de Boca' },
        { key: 'carrillos', label: 'Carrillos' },
        { key: 'glandulas_salivales', label: 'Glándulas Salivales' },
        { key: 'ganglios', label: 'Ganglios' },
        { key: 'lengua', label: 'Lengua' },
        { key: 'labios', label: 'Labios' }
    ];

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
                            <HeartPulse className="h-5 w-5 text-rose-600" />
                        </div> */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                G. Examen del Sistema Estomatognático
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Evaluación clínica de las estructuras orofaciales
                            </p>
                        </div>
                    </div>
                    
                    {/* Indicador general */}
                    <div className="flex items-center gap-2">
                        {examenData?.examen_sin_patologia ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">
                                    Sin patologías
                                </span>
                            </div>
                        ) : examenData?.tiene_patologias ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-700">
                                    Con patologías
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                                <span className="text-sm font-medium text-gray-700">
                                    No examinado
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
                {examenData ? (
                    <>
                        {/* Resumen general */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-800 uppercase mb-2">
                                    Estado General
                                </p>
                                <div className="flex items-center gap-2">
                                    {examenData.examen_sin_patologia ? (
                                        <>
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm font-medium text-emerald-700">
                                                Sin patologías detectadas
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                            <span className="text-sm font-medium text-amber-700">
                                                Patologías detectadas
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-800 uppercase mb-2">
                                    Regiones Anormales
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {examenData.total_regiones_anormales || 0}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        de 11 regiones
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-800 uppercase mb-2">
                                    Tipo de Examen
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        {examenData.examen_sin_patologia ? "Normal" : "Patológico"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Grid de regiones */}
                        <div className="border border-gray-200 rounded-lg">
                            {/* Encabezado de la tabla */}
                            <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50">
                                <div className="col-span-3 p-3">
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        Región Anatómica
                                    </p>
                                </div>
                                <div className="col-span-9 p-3">
                                    <p className="text-xs font-semibold text-gray-800 uppercase">
                                        Hallazgos / Observaciones
                                    </p>
                                </div>
                            </div>

                            {/* Filas de regiones */}
                            <div className="divide-y divide-gray-200">
                                {regiones.map((region) => {
                                    const regionData = getRegionData(region.key);
                                    const estado = getPatologiaEstado(regionData);
                                    const descripcion = getPatologiaDescripcion(region.key, regionData);
                                    
                                    return (
                                        <div key={region.key} className="grid grid-cols-12 hover:bg-gray-50/50">
                                            <div className="col-span-3 p-3 border-r border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        estado === "normal" ? "bg-emerald-500" : "bg-amber-500"
                                                    }`}></div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {region.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-span-9 p-3">
                                                <div className="flex items-start">
                                                    <div className={`flex-1 ${
                                                        estado === "normal" 
                                                            ? "text-emerald-700" 
                                                            : "text-amber-700"
                                                    }`}>
                                                        <p className="text-sm">
                                                            {descripcion}
                                                        </p>
                                                        {regionData?.observacion && estado === "patologia" && (
                                                            <p className="text-xs text-gray-600 mt-1 italic">
                                                                {regionData.observacion}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {estado === "normal" ? (
                                                        <div className="ml-2 px-2 py-1 rounded bg-emerald-100">
                                                            <span className="text-xs font-medium text-emerald-700">
                                                                Normal
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="ml-2 px-2 py-1 rounded bg-amber-100">
                                                            <span className="text-xs font-medium text-amber-700">
                                                                Patología
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Observaciones generales si existen */}
                        {examenData.regiones_con_patologia?.length > 0 && (
                            <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800 mb-2">
                                            Resumen de Patologías Detectadas
                                        </p>
                                        <ul className="space-y-1">
                                            {examenData.regiones_con_patologia.map((region, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                                                    <span className="text-sm text-amber-700">
                                                        <span className="font-medium">{region.region}:</span> {region.descripcion}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información específica de ATM si existe
                        {examenData.atm_patologias && (
                            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-800 mb-2">
                                    Detalles ATM (Articulación Temporomandibular)
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {examenData.atm_patologias.absceso && (
                                        <div className="px-3 py-1.5 rounded bg-blue-100">
                                            <span className="text-xs font-medium text-blue-700">Absceso</span>
                                        </div>
                                    )}
                                    {examenData.atm_patologias.fibroma && (
                                        <div className="px-3 py-1.5 rounded bg-blue-100">
                                            <span className="text-xs font-medium text-blue-700">Fibroma</span>
                                        </div>
                                    )}
                                    {examenData.atm_patologias.herpes && (
                                        <div className="px-3 py-1.5 rounded bg-blue-100">
                                            <span className="text-xs font-medium text-blue-700">Herpes</span>
                                        </div>
                                    )}
                                    {examenData.atm_patologias.ulcera && (
                                        <div className="px-3 py-1.5 rounded bg-blue-100">
                                            <span className="text-xs font-medium text-blue-700">Úlcera</span>
                                        </div>
                                    )}
                                    {examenData.atm_patologias.otra && (
                                        <div className="px-3 py-1.5 rounded bg-blue-100">
                                            <span className="text-xs font-medium text-blue-700">Otra</span>
                                        </div>
                                    )}
                                </div>
                                {examenData.atm_patologias.observacion && (
                                    <p className="text-xs text-blue-700 mt-2 italic">
                                        {examenData.atm_patologias.observacion}
                                    </p>
                                )}
                            </div>
                        )} */}
                    </>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <HeartPulse className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                No se ha realizado el examen estomatognático
                            </h4>
                            <p className="text-xs text-gray-500">
                                Esta sección no contiene datos del examen del sistema estomatognático
                            </p>
                        </div>
                    </div>
                )}

                {/* Leyenda */}
                {examenData && (
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-600">Sin patología / Normal</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">Con patología detectada</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Información de auditoría
            {examenData && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-xs">
                            <p className="text-gray-500">Examinado por:</p>
                            <p className="font-medium text-gray-700">
                                {examenData.creado_por || "No especificado"}
                            </p>
                        </div>
                        <div className="text-xs">
                            <p className="text-gray-500">Fecha de examen:</p>
                            <p className="font-medium text-gray-700">
                                {examenData.fecha_creacion 
                                    ? new Date(examenData.fecha_creacion).toLocaleDateString()
                                    : "No especificada"}
                            </p>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección G {examenData ? 'completada' : 'pendiente'}
                        </p>
                    </div>
                    {examenData && (
                        <span className="text-xs text-gray-400">
                            ID: {examenData.id}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};