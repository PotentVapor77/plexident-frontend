// src/components/clinicalRecord/form/sections/Odontograma2DSection.tsx

import React, { useState, useEffect } from "react";
import { Download, Eye, Printer, AlertCircle, Loader2, FileText, CheckCircle, RefreshCw } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../../types/patient/IPatient";
import Button from "../../../ui/button/Button";
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { ToothCrownReadOnly } from "./odonto2d/ToothCrownReadOnly";
import { adaptForm033ToSurfaceColors, shouldShowOverlayIcon } from "../../../../core/utils/form033Adapter";
import clinicalRecordService from "../../../../services/clinicalRecord/clinicalRecordService";
import axiosInstance from "../../../../services/api/axiosInstance";

/**
 * ============================================================================
 * PROPS & TYPES
 * ============================================================================
 */
interface Odontograma2DSectionProps {
  formData: ClinicalRecordFormData;
  selectedPaciente: IPaciente | null;
  lastUpdated?: string | null;
  validationErrors: Record<string, string>;
  refreshSection: () => Promise<void>;
  mode?: "create" | "edit"; 
  historialId?: string; 
  isRefreshing?: boolean;
}

interface ApiResponseWrapper<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  errors: any;
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

type Form033Response = ApiResponseWrapper<Form033Data>;

/**
 * ============================================================================
 * MAPEO DE CUADRANTES OPTIMIZADO - FORMATO 2 FILAS
 * Fila Superior: 18-11 | 21-28
 * Fila Inferior: 48-41 | 31-38
 * ============================================================================
 */
const QUADRANT_CONFIG_TWO_ROWS = {
  permanente: [
    {
      key: 'superior',
      label: "",
      quadrants: [
        { key: 'sup_der', startRow: 0, label: "Maxilar Superior Derecho", startFDI: 18, increment: -1, dataReverse: false }, // 18-11
        { key: 'sup_izq', startRow: 1, label: "Maxilar Superior Izquierdo", startFDI: 21, increment: 1, dataReverse: false }  // 21-28
      ]
    },
    {
      key: 'inferior',
      label: "",
      quadrants: [
        { key: 'inf_der', startRow: 3, label: "Maxilar Inferior Derecho", startFDI: 48, increment: -1, dataReverse: true }, // 48-41
        { key: 'inf_izq', startRow: 2, label: "Maxilar Inferior Izquierdo", startFDI: 31, increment: 1, dataReverse: false }  // 31-38 
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

const Odontograma2DSection: React.FC<Odontograma2DSectionProps> = ({
  selectedPaciente,
  lastUpdated,
  validationErrors,
  mode = "create",
  historialId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [odontogramaData, setOdontogramaData] = useState<Form033Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"permanente" | "temporal">("permanente");
  const [dataSource, setDataSource] = useState<"snapshot" | "current">("current");

  // ========================================================================
  // CARGAR DATOS SEGÚN EL MODO
  // ========================================================================
  useEffect(() => {
    if (mode === "edit" && historialId) {
      loadSnapshotData(historialId);
    } else if (selectedPaciente?.id) {
      loadCurrentOdontogramaData(selectedPaciente.id);
    } else {
      setOdontogramaData(null);
    }
  }, [selectedPaciente, mode, historialId]);

  // ========================================================================
  // CARGAR SNAPSHOT DEL HISTORIAL (para modo edit)
  // ========================================================================
  const loadSnapshotData = async (historialIdParam: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(" Cargando snapshot del historial:", historialIdParam);

      const snapshot = await clinicalRecordService.getForm033(historialIdParam);

      if (snapshot && snapshot.datos_form033) {
        console.log(" Snapshot cargado exitosamente");

        const adaptedData: Form033Data = {
          timestamp: snapshot.fecha_captura,
          form033: snapshot.datos_form033,
        };

        setOdontogramaData(adaptedData);
        setDataSource("snapshot");
      } else {
        console.warn("No hay snapshot, cargando datos actuales");
        if (selectedPaciente?.id) {
          await loadCurrentOdontogramaData(selectedPaciente.id);
        }
      }
    } catch (err: any) {
      console.error("Error cargando snapshot:", err);

      if (err.response?.status === 404 && selectedPaciente?.id) {
        console.log(" Snapshot no encontrado, cargando datos actuales como fallback");
        await loadCurrentOdontogramaData(selectedPaciente.id);
      } else {
        setError("No se pudo cargar el odontograma guardado");
        setOdontogramaData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // CARGAR DATOS ACTUALES DEL PACIENTE
  // ========================================================================
  const loadCurrentOdontogramaData = async (pacienteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Cargando odontograma actual del paciente:", pacienteId);

      const response = await axiosInstance.get<Form033Response>(
      ENDPOINTS.odontograma.export.jsonExport(pacienteId)
      );

      if (response.data.success && response.data.data) {
        console.log("Odontograma actual cargado exitosamente");
        setOdontogramaData(response.data.data);
        setDataSource("current");
      } else {
        setError(response.data.message || "Error en la respuesta del servidor");
        setOdontogramaData(null);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "No se pudo cargar el odontograma del paciente"
      );
      setOdontogramaData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RECARGAR DATOS ACTUALES (botón manual)
  // ========================================================================
  const handleReloadCurrentData = () => {
    if (selectedPaciente?.id) {
      loadCurrentOdontogramaData(selectedPaciente.id);
    }
  };

  const handlePreviewHTML = () => {
  if (!selectedPaciente?.id) return;
  const url = `${API_BASE_URL}${ENDPOINTS.odontograma.export.htmlPreview(selectedPaciente.id)}`;
  window.open(url, "_blank");
};

  const handleDownloadPDF = async () => {
    if (!selectedPaciente?.id) return;
    try {
      setIsLoading(true);
      const url = ENDPOINTS.odontograma.export.pdfDownload(selectedPaciente.id);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      const contentDisposition = response.headers["content-disposition"];
      let filename = `Form033_${selectedPaciente.cedula_pasaporte}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo descargar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePDF = async () => {
    if (!selectedPaciente?.id) return;
    try {
      setIsLoading(true);
      const response = await axiosInstance.post<
        ApiResponseWrapper<{
          estado: string;
          mensaje: string;
          archivo: string;
          ruta: string;
          tamaño_kb: number;
          timestamp: string;
        }>
      >(ENDPOINTS.odontograma.export.pdfSave(selectedPaciente.id));

      if (response.data.success) {
        setError(null);
        alert(response.data.data.mensaje || "PDF guardado exitosamente en el servidor");
      } else {
        setError(response.data.message || "Error al guardar el PDF");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.response?.data?.mensaje || "No se pudo guardar el PDF"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasOdontogramaData = !!odontogramaData;
  const hasValidationError = !!validationErrors.odontograma;

   return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Odontograma 2D - Formulario 033
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Vista de odontograma según estándar MSP Ecuador
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">Última actualización: {lastUpdated}</p>
            )}

            {/* INDICADOR DE FUENTE DE DATOS */}
            {hasOdontogramaData && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-600">
                  {dataSource === "snapshot" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Snapshot guardado en el historial
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 text-blue-600" />
                      Datos actuales del paciente
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              hasOdontogramaData && !hasValidationError
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {hasOdontogramaData && !hasValidationError ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span>Disponible</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                <span>No disponible</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Botones de acción */}
        <div className="flex gap-2 flex-wrap">
          {/* Botón para recargar datos actuales (solo en modo edit con snapshot) */}
          {mode === "edit" && dataSource === "snapshot" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadCurrentData}
              disabled={!selectedPaciente || isLoading}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              Ver Odontograma Actual
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewHTML}
            disabled={!selectedPaciente || isLoading}
            startIcon={<Eye className="h-4 w-4" />}
          >
            Vista Previa HTML
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={!selectedPaciente || isLoading}
            startIcon={<Download className="h-4 w-4" />}
          >
            Descargar PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSavePDF}
            disabled={!selectedPaciente || isLoading}
            startIcon={<Printer className="h-4 w-4" />}
          >
            Guardar en Servidor
          </Button>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex items-center justify-center p-8 border border-slate-200 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Cargando datos del odontograma...</span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">Error al cargar odontograma</p>
              <p className="text-sm text-rose-700 mt-1">{error}</p>
              {selectedPaciente && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCurrentOdontogramaData(selectedPaciente.id)}
                  className="mt-2 text-rose-700 hover:text-rose-800"
                >
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        )}


        {/* ODONTOGRAMA DATA - FORMATO 2 FILAS */}
        {odontogramaData && !isLoading && (
          <div className="space-y-6">
            {/* TABS */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("permanente")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "permanente"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  Dientes Permanentes (32 dientes)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("temporal")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "temporal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                >
                  Dientes Temporales (20 dientes)
                </button>
              </nav>
            </div>

            {/* ODONTOGRAMA PERMANENTE - FORMATO 2 FILAS */}
            {activeTab === "permanente" && odontogramaData.form033.odontograma_permanente && (
              <div className="space-y-6">
                {QUADRANT_CONFIG_TWO_ROWS.permanente.map((arcada) => {
                  const isUpper = arcada.key === 'superior';

                  return (
                    <div
                      key={arcada.key}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <h4 className="text-sm font-semibold text-slate-700 mb-4">
                        {arcada.label}
                      </h4>
                      <div className="flex gap-2 justify-center items-start">
                        {arcada.quadrants.map((quadrant, quadrantIndex) => {
                          // Calcular FDI para cada diente del cuadrante
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
                                <span className="text-xs text-slate-500 font-mono mb-2">
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
                                  <div className="w-px h-30 bg-slate-300"></div>
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

            {/* ODONTOGRAMA TEMPORAL - FORMATO 2 FILAS */}
            {activeTab === "temporal" && odontogramaData.form033.odontograma_temporal && (
              <div className="space-y-6">
                {QUADRANT_CONFIG_TWO_ROWS.temporal.map((arcada) => {
                  const isUpper = arcada.key === 'superior_temp';

                  return (
                    <div
                      key={arcada.key}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <h4 className="text-sm font-semibold text-slate-700 mb-4">
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
                                <span className="text-xs text-slate-500 font-mono mb-2">
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
                                  <div className="w-px h-30 bg-slate-300"></div>
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
            {/* LEYENDA */}
            {renderLegend()}
          </div>
        )}

        {/* NO DATA STATE */}
        {!odontogramaData && !isLoading && !error && selectedPaciente && (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-slate-700 mb-2">
              No hay datos de odontograma
            </h4>
            <p className="text-slate-500 mb-4 text-sm">
              Este paciente no tiene registros de odontograma o no hay diagnósticos activos.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCurrentOdontogramaData(selectedPaciente.id)}
            >
              Reintentar carga
            </Button>
          </div>
        )}

        {/* NO PATIENT SELECTED */}
        {!selectedPaciente && (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-medium text-slate-700 mb-2">Seleccione un paciente</h4>
            <p className="text-slate-500 text-sm">
              Para visualizar el odontograma, primero seleccione un paciente del registro clínico.
            </p>
          </div>
        )}

        {/* VALIDATION ERROR */}
        {validationErrors.odontograma && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Validación requerida</p>
              <p className="text-sm text-amber-700 mt-1">{validationErrors.odontograma}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * ============================================================================
 * FUNCIONES AUXILIARES
 * ============================================================================
 */



/**
 * Renderiza una celda individual de diente con corona SVG y badges
 * SIEMPRE MUESTRA EL NÚMERO FDI
 */
const renderDienteCell = (
  diente: DienteData | null,
  movilidad: MovilidadData | null,
  recesion: RecesionData | null,
  index: number,
  isUpperQuadrant: boolean,
  fdiNumber: string

) => {
  // Obtener FDI del diente o generar uno vacío
  const fdi = diente?.codigo_fdi || "00";

  // Adaptar superficies solo para caries/obturado con superficies válidas
  const surfaces = diente ? adaptForm033ToSurfaceColors(diente) : [];

  // Determinar si mostrar icono sobrepuesto
  const showOverlay = diente ? shouldShowOverlayIcon(diente) : false;

  // Generar icono sobrepuesto si es necesario
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
        <div className="w-10 h-4 border border-dashed border-slate-200 rounded bg-slate-50"></div>
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
        <div className="w-10 h-4 border border-dashed border-slate-200 rounded bg-slate-50"></div>
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
      <div className="px-1 py-0.1 rounded text-[8px] font-boldtext-slate-900 border border-slate-400/50 backdrop-blur-sm">
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

/**
 * Renderiza leyenda actualizada con sistema Form033
 */
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
    <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <h4 className="text-sm font-medium text-slate-700 mb-3">Leyenda de Símbolos - Form033 MSP</h4>
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
            <span className="text-xs text-slate-600">{item.desc}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Odontograma2DSection;