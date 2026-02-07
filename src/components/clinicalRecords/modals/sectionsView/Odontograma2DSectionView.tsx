// src/components/clinicalRecord/modals/sectionsView/Odontograma2DSectionView.tsx
import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { 
    adaptForm033ToSurfaceColors, 
    shouldShowOverlayIcon 
} from "../../../../core/utils/form033Adapter";
import { ToothCrownReadOnly } from "../../form/sections/odonto2d/ToothCrownReadOnly";
import clinicalRecordService from "../../../../services/clinicalRecord/clinicalRecordService";

interface Odontograma2DSectionViewProps {
    record: ClinicalRecordDetailResponse;
}

interface DienteData {
    key: string;
    simbolo: string;
    color: string;
    descripcion: string;
    categoria: string;
    tipo: string;
    prioridad: number;
    codigo_fdi: string;
    superficies_afectadas: string[];
    diagnostico_id?: string;
    fecha_diagnostico?: string;
}

interface MovilidadData {
    grado: number;
    key: string;
    nombre: string;
    prioridad: number;
    diagnostico_id: string;
    fecha_diagnostico: string;
}

interface RecesionData {
    nivel: number;
    key: string;
    nombre: string;
    prioridad: number;
    diagnostico_id: string;
    fecha_diagnostico: string;
}

interface Form033Data {
    timestamp: string;
    form033: {
        paciente: {
            cedula: string;
            nombres: string;
            apellidos: string;
            nombre_completo: string;
            sexo: string;
            edad: number;
            fecha_nacimiento: string | null;
            fecha_examen: string;
        };
        odontograma_permanente: {
            dientes: Array<Array<DienteData | null>>;
            movilidad: Array<Array<MovilidadData | null>>;
            recesion: Array<Array<RecesionData | null>>;
        };
        odontograma_temporal: {
            dientes: Array<Array<DienteData | null>>;
            movilidad: Array<Array<MovilidadData | null>>;
            recesion: Array<Array<RecesionData | null>>;
        };
        timestamp: string;
    };
}

// Interfaz para la respuesta del servicio getForm033
interface Form033ServiceResponse {
    fecha_captura: string;
    datos_form033: {
        paciente: {
            cedula: string;
            nombres: string;
            apellidos: string;
            nombre_completo: string;
            sexo: string;
            edad: number;
            fecha_nacimiento: string | null;
            fecha_examen: string;
        };
        odontograma_permanente: {
            dientes: Array<Array<DienteData | null>>;
            movilidad: Array<Array<MovilidadData | null>>;
            recesion: Array<Array<RecesionData | null>>;
        };
        odontograma_temporal: {
            dientes: Array<Array<DienteData | null>>;
            movilidad: Array<Array<MovilidadData | null>>;
            recesion: Array<Array<RecesionData | null>>;
        };
        timestamp: string;
    };
}

export const Odontograma2DSectionView: React.FC<Odontograma2DSectionViewProps> = ({ record }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [odontogramaData, setOdontogramaData] = useState<Form033Data | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"permanente" | "temporal">("permanente");

    // Cargar datos del odontograma cuando el componente se monta
    useEffect(() => {
        const loadOdontogramaData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Obtener los datos del odontograma desde el servicio
                const snapshot = await clinicalRecordService.getForm033(record.id);
                
                if (snapshot && snapshot.datos_form033) {
                    // Adaptar la respuesta del servicio al formato esperado
                    const adaptedData: Form033Data = {
                        timestamp: snapshot.fecha_captura || new Date().toISOString(),
                        form033: snapshot.datos_form033
                    };
                    
                    setOdontogramaData(adaptedData);
                } else {
                    setOdontogramaData(null);
                }
            } catch (err: any) {
                console.error("Error cargando odontograma:", err);
                setError(err.response?.data?.message || "No se pudo cargar el odontograma");
                setOdontogramaData(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (record.id) {
            loadOdontogramaData();
        }
    }, [record.id]);

    // Configuración de cuadrantes para el formato 2 filas
    const QUADRANT_CONFIG_TWO_ROWS = {
        permanente: [
            {
                key: 'superior',
                label: "",
                quadrants: [
                    { key: 'sup_der', startRow: 0, label: "Maxilar Superior Derecho", startFDI: 18, increment: -1, dataReverse: false },
                    { key: 'sup_izq', startRow: 1, label: "Maxilar Superior Izquierdo", startFDI: 21, increment: 1, dataReverse: false }
                ]
            },
            {
                key: 'inferior',
                label: "",
                quadrants: [
                    { key: 'inf_der', startRow: 3, label: "Maxilar Inferior Derecho", startFDI: 48, increment: -1, dataReverse: true },
                    { key: 'inf_izq', startRow: 2, label: "Maxilar Inferior Izquierdo", startFDI: 31, increment: 1, dataReverse: false }
                ]
            },
        ],
        temporal: [
            {
                key: 'superior_temp',
                label: "",
                quadrants: [
                    { key: 'sup_der_temp', startRow: 0, label: "Maxilar Superior Derecho", startFDI: 55, increment: -1, dataReverse: false },
                    { key: 'sup_izq_temp', startRow: 1, label: "Maxilar Superior Izquierdo", startFDI: 61, increment: 1, dataReverse: false }
                ]
            },
            {
                key: 'inferior_temp',
                label: "",
                quadrants: [
                    { key: 'inf_der_temp', startRow: 3, label: "Maxilar Inferior Derecho", startFDI: 85, increment: -1, dataReverse: false },
                    { key: 'inf_izq_temp', startRow: 2, label: "Maxilar Inferior Izquierdo", startFDI: 71, increment: 1, dataReverse: true }
                ]
            },
        ],
    };

    // Función para renderizar celda de diente
    const renderDienteCell = (
        diente: DienteData | null,
        movilidad: MovilidadData | null,
        recesion: RecesionData | null,
        index: number,
        isUpperQuadrant: boolean,
        fdiNumber: string
    ) => {
        const fdi = diente?.codigo_fdi || "00";
        const surfaces = diente ? adaptForm033ToSurfaceColors(diente) : [];
        const showOverlay = diente ? shouldShowOverlayIcon(diente) : false;
        
        const overlayIcon = showOverlay && diente ? (
            <div
                className="text-3xl font-bold drop-shadow-md"
                style={{ color: diente.color }}
                title={diente.descripcion}
            >
                {diente.simbolo}
            </div>
        ) : null;

        const mobilityBlock = (
            <div className="h-4 flex items-center justify-center w-16">
                {movilidad ? (
                    <div
                        className="w-10 h-4 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center"
                        title={`${movilidad.nombre} (Grado ${movilidad.grado})`}
                    >
                        M{movilidad.grado}
                    </div>
                ) : (
                    <div className="w-10 h-4 border border-dashed border-gray-200 rounded bg-gray-50"></div>
                )}
            </div>
        );

        const recessionBlock = (
            <div className="h-4 flex items-center justify-center w-16">
                {recesion ? (
                    <div
                        className="w-10 h-4 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center"
                        title={`${recesion.nombre} (Nivel ${recesion.nivel}mm)`}
                    >
                        R{recesion.nivel}
                    </div>
                ) : (
                    <div className="w-10 h-4 border border-dashed border-gray-200 rounded bg-gray-50"></div>
                )}
            </div>
        );

        const crownBlock = (
            <div className="flex items-center justify-center">
                <ToothCrownReadOnly
                    toothFDI={fdi}
                    surfaces={surfaces}
                    size="sm"
                    showBadge={false}
                    overlayIcon={overlayIcon}
                />
            </div>
        );

        const fdiBadge = (
            <div className="h-5 flex items-center justify-center w-16">
                <div className="px-1 py-0.1 rounded text-[8px] font-bold text-gray-900 border border-gray-400/50 backdrop-blur-sm">
                    {fdiNumber}
                </div>
            </div>
        );

        return (
            <div className="flex flex-col items-center gap-px w-11">
                {isUpperQuadrant ? (
                    <>
                        {recessionBlock}
                        {mobilityBlock}
                        {fdiBadge}
                        {crownBlock}
                    </>
                ) : (
                    <>
                        {crownBlock}
                        {fdiBadge}
                        {mobilityBlock}
                        {recessionBlock}
                    </>
                )}
            </div>
        );
    };

    // Función para renderizar leyenda
    const renderLegend = () => {
        const simbolos = [
            { simbolo: "O", color: "#FF0000", desc: "Caries en superficies", tipo: "superficie" },
            { simbolo: "O", color: "#0000FF", desc: "Obturado en superficies", tipo: "superficie" },
            { simbolo: "A", color: "#000000", desc: "Ausente" },
            { simbolo: "X", color: "#FF0000", desc: "Extracción Indicada" },
            { simbolo: "X", color: "#0000FF", desc: "Pérdida por caries" },
            { simbolo: "ⓧ", color: "#0000FF", desc: "Pérdida (otra causa)" },
            { simbolo: "Ü", color: "#FF0000", desc: "Sellante Necesario" },
            { simbolo: "Ü", color: "#0000FF", desc: "Sellante Realizado" },
            { simbolo: "r", color: "#FF0000", desc: "Endodoncia Por Realizar" },
            { simbolo: "|", color: "#0000FF", desc: "Endodoncia Realizada" },
            { simbolo: "|", color: "#FF0000", desc: "Extraccion otra causa" },
            { simbolo: "¨-¨", color: "#FF0000", desc: "Prótesis Fija Indicada" },
            { simbolo: "¨-¨", color: "#0000FF", desc: "Prótesis Fija Realizada" },
            { simbolo: "(-)", color: "#FF0000", desc: "Prótesis Removible Indicada" },
            { simbolo: "(-)", color: "#0000FF", desc: "Prótesis Removible Realizada" },
            { simbolo: "ª", color: "#FF0000", desc: "Corona Indicada" },
            { simbolo: "ª", color: "#0000FF", desc: "Corona Realizada" },
            { simbolo: "═", color: "#FF0000", desc: "Prótesis Total Indicada" },
            { simbolo: "═", color: "#0000FF", desc: "Prótesis Total Realizada" },
            { simbolo: "✓", color: "#00AA00", desc: "Diente Sano" },
        ];

        return (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Leyenda de Símbolos - Form033 MSP</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {simbolos.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 border rounded flex items-center justify-center text-[10px] font-bold"
                                style={{
                                    borderColor: item.color,
                                    color: item.tipo === 'svg' ? '#6B7280' : item.color,
                                    backgroundColor: `${item.color}${item.tipo === 'svg' ? 'FF' : '15'}`
                                }}
                            >
                                {item.tipo === 'svg' ? '' : item.simbolo}
                            </div>
                            <span className="text-xs text-gray-600">{item.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
            {/* Encabezado de sección */}
            <div className="border-b border-gray-300 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div> */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                H. Odontograma
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Representación gráfica dental según estándar MSP Ecuador
                            </p>
                            {odontogramaData?.timestamp && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Capturado: {new Date(odontogramaData.timestamp).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Indicador de estado */}
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                <span className="text-sm font-medium text-blue-700">
                                    Cargando...
                                </span>
                            </div>
                        ) : odontogramaData ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">
                                    Disponible
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                                <AlertCircle className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    No disponible
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Cargando datos del odontograma...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-rose-800">Error al cargar odontograma</p>
                            <p className="text-sm text-rose-700 mt-1">{error}</p>
                        </div>
                    </div>
                ) : odontogramaData ? (
                    <div className="space-y-6">
                        {/* Pestañas para permanente/temporal */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("permanente")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "permanente"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    Dientes Permanentes (32 dientes)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("temporal")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "temporal"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    Dientes Temporales (20 dientes)
                                </button>
                            </nav>
                        </div>

                        {/* Odontograma Permanente */}
                        {activeTab === "permanente" && odontogramaData.form033.odontograma_permanente && (
                            <div className="space-y-6">
                                {QUADRANT_CONFIG_TWO_ROWS.permanente.map((arcada) => {
                                    const isUpper = arcada.key === 'superior';

                                    return (
                                        <div
                                            key={arcada.key}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <h4 className="text-sm font-semibold text-gray-700 mb-4">
                                                {arcada.label}
                                            </h4>
                                            <div className="flex gap-2 justify-center items-start">
                                                {arcada.quadrants.map((quadrant, quadrantIndex) => {
                                                    const calculateFDI = (index: number) => {
                                                        if (quadrant.increment === 1) {
                                                            return quadrant.startFDI + index;
                                                        } else {
                                                            return quadrant.startFDI - index;
                                                        }
                                                    };

                                                    const dientesArray = odontogramaData.form033.odontograma_permanente.dientes[quadrant.startRow];
                                                    const movilidadArray = odontogramaData.form033.odontograma_permanente.movilidad[quadrant.startRow];
                                                    const recesionArray = odontogramaData.form033.odontograma_permanente.recesion[quadrant.startRow];

                                                    const processedDientes = quadrant.dataReverse ? [...dientesArray].reverse() : dientesArray;
                                                    const processedMovilidad = quadrant.dataReverse ? [...movilidadArray].reverse() : movilidadArray;
                                                    const processedRecesion = quadrant.dataReverse ? [...recesionArray].reverse() : recesionArray;

                                                    return (
                                                        <React.Fragment key={quadrant.key}>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs text-gray-500 font-mono mb-2">
                                                                    {quadrant.label}
                                                                </span>
                                                                <div className="flex gap-3 justify-start items-start">
                                                                    {processedDientes.map((diente, index) => (
                                                                        <div key={index} className="flex-shrink-0">
                                                                            {renderDienteCell(
                                                                                diente,
                                                                                processedMovilidad[index],
                                                                                processedRecesion[index],
                                                                                index,
                                                                                isUpper,
                                                                                calculateFDI(index).toString()
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {quadrantIndex < arcada.quadrants.length - 1 && (
                                                                <div className="flex items-center">
                                                                    <div className="w-px h-30 bg-gray-300"></div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Odontograma Temporal */}
                        {activeTab === "temporal" && odontogramaData.form033.odontograma_temporal && (
                            <div className="space-y-6">
                                {QUADRANT_CONFIG_TWO_ROWS.temporal.map((arcada) => {
                                    const isUpper = arcada.key === 'superior_temp';

                                    return (
                                        <div
                                            key={arcada.key}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <h4 className="text-sm font-semibold text-gray-700 mb-4">
                                                {arcada.label}
                                            </h4>
                                            <div className="flex gap-2 justify-center items-start">
                                                {arcada.quadrants.map((quadrant, quadrantIndex) => {
                                                    const calculateFDI = (index: number) => {
                                                        if (quadrant.increment === 1) {
                                                            return quadrant.startFDI + index;
                                                        } else {
                                                            return quadrant.startFDI - index;
                                                        }
                                                    };

                                                    const dientesArray = odontogramaData.form033.odontograma_temporal.dientes[quadrant.startRow];
                                                    const movilidadArray = odontogramaData.form033.odontograma_temporal.movilidad[quadrant.startRow];
                                                    const recesionArray = odontogramaData.form033.odontograma_temporal.recesion[quadrant.startRow];

                                                    const processedDientes = quadrant.dataReverse ? [...dientesArray].reverse() : dientesArray;
                                                    const processedMovilidad = quadrant.dataReverse ? [...movilidadArray].reverse() : movilidadArray;
                                                    const processedRecesion = quadrant.dataReverse ? [...recesionArray].reverse() : recesionArray;

                                                    return (
                                                        <React.Fragment key={quadrant.key}>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs text-gray-500 font-mono mb-2">
                                                                    {quadrant.label}
                                                                </span>
                                                                <div className="flex gap-3 justify-start items-start">
                                                                    {processedDientes.map((diente, index) => (
                                                                        <div key={index} className="flex-shrink-0">
                                                                            {renderDienteCell(
                                                                                diente,
                                                                                processedMovilidad[index],
                                                                                processedRecesion[index],
                                                                                index,
                                                                                isUpper,
                                                                                calculateFDI(index).toString()
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {quadrantIndex < arcada.quadrants.length - 1 && (
                                                                <div className="flex items-center">
                                                                    <div className="w-px h-30 bg-gray-300"></div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Información del paciente */}
                        {/* <div className="border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-xs">
                                    <p className="text-gray-500">Paciente:</p>
                                    <p className="font-medium text-gray-700">
                                        {odontogramaData.form033.paciente.nombre_completo}
                                    </p>
                                </div>
                                <div className="text-xs">
                                    <p className="text-gray-500">Fecha de examen:</p>
                                    <p className="font-medium text-gray-700">
                                        {new Date(odontogramaData.form033.paciente.fecha_examen).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div> */}
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                                    <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                No se encontró odontograma registrado
                            </h4>
                            <p className="text-xs text-gray-500">
                                Este historial clínico no contiene una versión de odontograma capturada
                            </p>
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
                            Sección H {odontogramaData ? 'completada' : 'pendiente'}
                        </p>
                    </div>
                    {/* {odontogramaData && (
                        <span className="text-xs text-gray-400">
                            Form033 MSP
                        </span>
                    )} */}
                </div>
            </div>
        </section>
    );
};