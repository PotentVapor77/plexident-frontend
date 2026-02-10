// src/components/clinicalRecord/modals/sectionsView/DatosProfesionalSectionView.tsx
import React from "react";
import { Calendar, Clock, User, Stamp, Signature } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { formatDateAAAAMMDD, formatDateToReadable, formatTime, formatTimeHHMM } from "../../../../mappers/clinicalRecordMapper";

interface DatosProfesionalSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

export const DatosProfesionalSectionView: React.FC<DatosProfesionalSectionViewProps> = ({ record }) => {
    // Extraer datos del odontólogo responsable
    const odontologo = record.odontologo_info;
    const fechaCreacion = record.fecha_creacion;
    const fechaApertura = formatDateAAAAMMDD(fechaCreacion);
    const horaApertura = formatTimeHHMM(fechaCreacion);
    // Formatear fecha y hora
    const fechaFormateada = fechaCreacion ? formatDateToReadable(fechaCreacion) : "No especificada";
    const horaFormateada = fechaCreacion ? formatTime(fechaCreacion) : "No especificada";

    // Separar nombres y apellidos
    const nombresCompletos = odontologo?.nombres || "";
    const apellidosCompletos = odontologo?.apellidos || "";
    
    const [primerNombre, ...otrosNombres] = nombresCompletos.split(" ");
    const [primerApellido, segundoApellido] = apellidosCompletos.split(" ");

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <h3 className="text-base font-semibold text-gray-900">
                    O. Datos del Profesional Responsable
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Información del profesional que aperturó el historial clínico
                </p>
            </div>

            {/* Datos de fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de Apertura */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div> */}
                        <div>
                            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                FECHA DE APERTURA
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                (aaaa-mm-dd)
                            </p>
                        </div>
                    </div>
                    <div className="min-h-12 flex items-center px-4 py-3 bg-white rounded border border-gray-100">
                        <p className="text-sm text-gray-900 font-mono font-medium">
                            {fechaApertura}
                        </p>
                    </div>
                </div>

                {/* Hora de Apertura */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 border border-purple-100">
                            <Clock className="h-4 w-4 text-purple-600" />
                        </div> */}
                        <div>
                            <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                HORA
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                (hh:mm)
                            </p>
                        </div>
                    </div>
                    <div className="min-h-12 flex items-center px-4 py-3 bg-white rounded border border-gray-100">
                        <p className="text-sm text-gray-900 font-mono font-medium">
                            {horaFormateada}
                        </p>
                    </div>
                </div>
            </div>

            {/* Datos del Profesional */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-4">
                    {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 border border-green-100">
                        <User className="h-4 w-4 text-green-600" />
                    </div> */}
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                        DATOS DEL PROFESIONAL RESPONSABLE
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primer Nombre */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                            PRIMER NOMBRE
                        </label>
                        <div className="min-h-10 flex items-center px-3 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {primerNombre || "No especificado"}
                            </p>
                        </div>
                    </div>

                    {/* Primer Apellido */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                            PRIMER APELLIDO
                        </label>
                        <div className="min-h-10 flex items-center px-3 py-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-900 font-medium">
                                {primerApellido || "No especificado"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Espacio para sello y firma físicas */}
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                {/* Encabezado del área de sello/firma */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300 px-6 py-3">
                    <div className="flex items-center gap-3">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                            <Stamp className="h-4 w-4 text-amber-600" />
                        </div> */}
                        {/* <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                                ÁREA PARA SELLO Y FIRMA
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Espacio reservado para validación física del documento
                            </p>
                        </div> */}
                    </div>
                </div>

                {/* Contenido del área de sello/firma */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Área para sello */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Stamp className="h-4 w-4 text-gray-600" />
                                <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                    SELLO
                                </h5>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 bg-gray-50 flex flex-col items-center justify-center">
                                {/* <div className="text-center">
                                    <Stamp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        Sello de la institución
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Área reservada para el sello húmedo o seco
                                    </p>
                                </div> */}
                            </div>
                            <div className="text-center">
                            </div>
                        </div>

                        {/* Área para firma */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Signature className="h-4 w-4 text-gray-600" />
                                <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                    FIRMA
                                </h5>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 bg-gray-50 flex flex-col items-center justify-center">
                                {/* <div className="text-center">
                                    <Signature className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        Firma del profesional responsable
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Área reservada para firma autógrafa
                                    </p>
                                </div> */}
                            </div>
                            <div className="text-center">
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    {/* <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-xs font-bold text-blue-600">i</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700">
                                        Validación Física Requerida:
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Este documento requiere validación física mediante sello y firma para tener validez oficial.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-amber-100">
                                    <span className="text-xs font-bold text-amber-600">!</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700">
                                        Documento Impreso:
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Al imprimir este formulario, utilizar este espacio para los elementos físicos de validación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Pie de sección */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-500">
                            Sección O completada
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">
                            Profesional registrado en el sistema
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};