// src/components/clinicalRecord/form/sections/IndicesCariesSection.tsx
import React, { useState, useEffect } from "react";
import { Activity, Shield, AlertCircle, TrendingUp } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../../types/patient/IPatient";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { useLatestIndicesCaries } from "../../../../hooks/clinicalRecord/useIndicesCaries";
import { indicesCariesService } from "../../../../services/clinicalRecord/indicesCariesService";
import type { LatestIndicesCariesResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import RefreshButton from "../../../ui/button/RefreshButton";

interface IndicesCariesSectionProps {
  formData: ClinicalRecordFormData;
  selectedPaciente: IPaciente | null;
  lastUpdated?: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean;
  historialId?: string;
}

const IndicesCariesSection: React.FC<IndicesCariesSectionProps> = ({
  formData,
  selectedPaciente,
  lastUpdated,
  mode,
  isRefreshing = false,
  refreshSection,
}) => {
  const { notify } = useNotification();
  const [indicesData, setIndicesData] = useState<LatestIndicesCariesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    data: queryData, 
    refetch: refetchQuery,
    isRefetching 
  } = useLatestIndicesCaries(selectedPaciente?.id || null);

 // Sincronizar con formData.indices_caries_data (fuente de verdad del formulario)
useEffect(() => {
  if (!formData.indices_caries_data) return;

  const d = formData.indices_caries_data;
  setIndicesData({
    id: d.id || '',
    paciente: d.paciente || selectedPaciente?.id || '',
    version_id: d.version_id || null,
    cpo_c: d.cpo_c || 0,
    cpo_p: d.cpo_p || 0,
    cpo_o: d.cpo_o || 0,
    cpo_total: d.cpo_total || 0,
    ceo_c: d.ceo_c || 0,
    ceo_e: d.ceo_e || 0,
    ceo_o: d.ceo_o || 0,
    ceo_total: d.ceo_total || 0,
    fecha: d.fecha || null,
    disponible: true,
    origen: mode === "edit" ? "historial_especifico" : "ultimos_datos_paciente",
  });
}, [formData.indices_caries_data, selectedPaciente?.id, mode]);



  
  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedPaciente?.id) return;

      try {
        if (mode === "create") {
          console.log("Modo CREATE - Buscando últimos índices del paciente");
          await refetchQuery();
        } else {
          // En edit, ClinicalRecordForm ya cargó indices_caries_data en formData
          console.log("Modo EDIT - indices_caries_data desde formData:", formData.indices_caries_data);
        }
      } catch (e) {
        console.error("Error cargando datos iniciales de índices:", e);
        setError("Error al cargar índices de caries");
      }
    };

    loadInitialData();
  }, [mode, selectedPaciente?.id, refetchQuery, formData.indices_caries_data]);

  // Efecto para actualizar datos cuando cambia queryData (modo create)
  useEffect(() => {
    if (mode === "create" && queryData) {
      console.log('Modo CREATE - Actualizando con queryData:', queryData);
      if (queryData.disponible || queryData.id) {
        setIndicesData({
          ...queryData,
          disponible: true,
          origen: "ultimos_datos_paciente"
        });
      } else {
        setIndicesData(null);
      }
    }
  }, [queryData, mode]);

  // Manejar refresh manual
  const handleRefresh = async () => {
    if (!selectedPaciente?.id) {
      notify({
        type: "warning",
        title: "Paciente no seleccionado",
        message: "Seleccione un paciente para actualizar los índices",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        console.log("Refresh en modo CREATE");
        await refetchQuery();
        notify({
          type: "success",
          title: "Índices actualizados",
          message: "Los índices de caries se han actualizado correctamente",
        });
      } else if (mode === "edit") {
        console.log("Refresh en modo EDIT (usando refreshSection)");
        await refreshSection(); // esto actualiza formData.indices_caries_data
        notify({
          type: "success",
          title: "Índices actualizados",
          message: "Los índices de caries se han actualizado correctamente",
        });
        // El useEffect de sincronización tomará el nuevo formData y actualizará indicesData
      }
    } catch (err: any) {
      console.error("Error en refresh:", err);
      const errorMessage = err.message || "Error al cargar índices de caries";
      setError(errorMessage);
      notify({
        type: "error",
        title: "Error",
        message: "No se pudieron actualizar los índices de caries",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular edades para determinar qué índices mostrar
  const edadPaciente = selectedPaciente?.edad || 0;
  const mostrarCPO = edadPaciente >= 12;
  const mostrarCEO = edadPaciente < 12;

  // Determinar color según el estado
  const getEstadoColor = () => {
    if (!indicesData) return "bg-slate-100 text-slate-700";
    
    const totalCaries = (indicesData.cpo_c ?? 0) + (indicesData.ceo_c ?? 0);
    
    if (totalCaries > 5) return "bg-rose-100 text-rose-700";
    if (totalCaries > 2) return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (!indicesData) return null;

    const totalDientesEvaluados = 32;
    const totalDientesTemporales = 20;

    const cpoTotal = indicesData.cpo_total ?? 0;
    const cpoC = indicesData.cpo_c ?? 0;
    const cpoP = indicesData.cpo_p ?? 0;
    const cpoO = indicesData.cpo_o ?? 0;
    const ceoTotal = indicesData.ceo_total ?? 0;
    const ceoC = indicesData.ceo_c ?? 0;
    const ceoE = indicesData.ceo_e ?? 0;
    const ceoO = indicesData.ceo_o ?? 0;

    return {
      porcentajeCariesCPO: cpoTotal > 0 ? (cpoC / totalDientesEvaluados) * 100 : 0,
      porcentajeObturadosCPO: cpoTotal > 0 ? (cpoO / totalDientesEvaluados) * 100 : 0,
      porcentajePerdidosCPO: cpoTotal > 0 ? (cpoP / totalDientesEvaluados) * 100 : 0,
      porcentajeCariesCEO: ceoTotal > 0 ? (ceoC / totalDientesTemporales) * 100 : 0,
      porcentajeExtraidosCEO: ceoTotal > 0 ? (ceoE / totalDientesTemporales) * 100 : 0,
      porcentajeObturadosCEO: ceoTotal > 0 ? (ceoO / totalDientesTemporales) * 100 : 0,
    };
  };

  const estadisticas = calcularEstadisticas();

  // CORRECCIÓN: Evitar división por cero en la línea 273
  const calcularPromedioCPO = () => {
    if (!indicesData || (indicesData.cpo_total ?? 0) === 0) return "0.0";
    const total = indicesData.cpo_total ?? 0;
    return (total / 32).toFixed(1);
  };

  // CORRECCIÓN: Evitar división por cero para CEO
  const calcularPromedioCEO = () => {
    if (!indicesData || (indicesData.ceo_total ?? 0) === 0) return "0.0";
    const total = indicesData.ceo_total ?? 0;
    return (total / 20).toFixed(1);
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {(loading || isRefreshing) && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden">
          <div className="w-full h-full bg-blue-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <SectionHeader
          icon={<Activity className="text-violet-500" />}
          title="I. Índices de Caries (CPO/ceo)"
          subtitle={
            lastUpdated 
              ? `Evaluado el: ${lastUpdated}` 
              : indicesData?.fecha
                ? `Evaluado el: ${new Date(indicesData.fecha).toLocaleDateString('es-ES')}`
                : "No existen índices de caries registrados"
          }
        />
        
        <div className="flex gap-2">
          {/* Botón para calcular desde odontograma */}
          {selectedPaciente && mode === "create" && (
            <RefreshButton
              onClick={async () => {
                try {
                  setLoading(true);
                  const resultado = await indicesCariesService.calculateFromOdontograma(selectedPaciente.id);
                  setIndicesData(resultado);
                  notify({
                    type: "success",
                    title: "Cálculo completado",
                    message: "Índices calculados automáticamente desde odontograma",
                  });
                } catch (error) {
                  notify({
                    type: "error",
                    title: "Error de cálculo",
                    message: "No se pudieron calcular los índices desde el odontograma",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              color="violet"
              size="sm"
              label="Calcular"
              loading={loading}
              disabled={!selectedPaciente}
              showIcon={false}
            />
          )}
          
          <RefreshButton
            onClick={handleRefresh}
            color="blue"
            size="sm"
            label="Actualizar"
            loading={loading || isRefetching}
            disabled={!selectedPaciente}
          />
        </div>
      </div>

      <div className="mt-4">
        {/* Estado de carga */}
        {(loading || isRefreshing) && !indicesData ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : !indicesData ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              {mode === "edit" 
                ? "Este historial no tiene índices de caries específicos registrados."
                : "No se encontraron índices de caries registrados para este paciente."
              }
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {mode === "create" 
                ? 'Use el botón "Calcular" para generar índices desde el odontograma o "Actualizar" para cargar registros existentes.'
                : 'Los índices de caries son específicos para cada historial clínico.'
              }
            </p>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${(loading || isRefreshing) ? 'opacity-50' : 'opacity-100'}`}>
            {/* Estado general */}
            <div className="flex items-center gap-3 p-4 bg-violet-50/50 border border-violet-100 rounded-lg">
              <div className={`p-2 rounded-lg ${getEstadoColor().split(' ')[0]}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800">Resumen de Salud Dental</h4>
                {indicesData && (
                  <p className="text-sm text-slate-600 mt-1">
                    {((indicesData.cpo_c ?? 0) + (indicesData.ceo_c ?? 0)) === 0 
                      ? "Sin caries activas. Mantener hábitos preventivos."
                      : ((indicesData.cpo_c ?? 0) + (indicesData.ceo_c ?? 0)) <= 2
                      ? "Caries baja. Evaluar técnicas de higiene oral."
                      : "Caries moderada/alta. Requiere atención odontológica."
                    }
                  </p>
                )}
              </div>
              {indicesData && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200">
                  <span className="text-slate-700">
                    Índice CPO: {(indicesData.cpo_total ?? 0).toFixed(1)} | ceo: {(indicesData.ceo_total ?? 0).toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Índices CPO (Para adultos) */}
            {mostrarCPO && (
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-slate-700">Índice CPO - Dientes Permanentes (Adultos)</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Cariados (C) */}
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-rose-700">Cariados (C)</h5>
                      <div className="text-2xl font-bold text-rose-700">
                        {indicesData.cpo_c ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-500">Porcentaje</span>
                        <span className="text-sm font-medium text-rose-700">
                          {(estadisticas?.porcentajeCariesCPO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-rose-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajeCariesCPO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-rose-600 mt-2">
                      Dientes con caries activa
                    </p>
                  </div>

                  {/* Perdidos (P) */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-amber-700">Perdidos (P)</h5>
                      <div className="text-2xl font-bold text-amber-700">
                        {indicesData.cpo_p ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-500">Porcentaje</span>
                        <span className="text-sm font-medium text-amber-700">
                          {(estadisticas?.porcentajePerdidosCPO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajePerdidosCPO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      Dientes extraídos por caries
                    </p>
                  </div>

                  {/* Obturados (O) */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-blue-700">Obturados (O)</h5>
                      <div className="text-2xl font-bold text-blue-700">
                        {indicesData.cpo_o ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-500">Porcentaje</span>
                        <span className="text-sm font-medium text-blue-700">
                          {(estadisticas?.porcentajeObturadosCPO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajeObturadosCPO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Dientes con restauraciones
                    </p>
                  </div>

                  {/* Total CPO */}
                  <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-violet-700">Total CPO</h5>
                      <div className="text-2xl font-bold text-violet-700">
                        {indicesData.cpo_total ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-violet-500">Promedio</span>
                        <span className="text-sm font-medium text-violet-700">
                          {/* ✅ CORREGIDO: Usar función segura */}
                          {calcularPromedioCPO()}
                        </span>
                      </div>
                      <div className="h-2 bg-violet-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (indicesData.cpo_total ?? 0) <= 3 ? "bg-emerald-500" :
                            (indicesData.cpo_total ?? 0) <= 6 ? "bg-amber-500" :
                            "bg-rose-500"
                          }`}
                          style={{ 
                            width: `${Math.min(
                              100, 
                              ((indicesData.cpo_total ?? 0) > 0 ? ((indicesData.cpo_total ?? 0) / 32) * 100 : 0)
                            )}%` 
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-violet-600 mt-2">
                      Suma C+P+O por individuo
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Índices ceo (Para niños) */}
            {mostrarCEO && (
              <div className="space-y-4">
                <h5 className="text-sm font-medium text-slate-700">Índice ceo - Dientes Temporales (Niños)</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Cariados (c) */}
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-rose-700">Cariados (c)</h5>
                      <div className="text-2xl font-bold text-rose-700">
                        {indicesData.ceo_c ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-rose-500">Porcentaje</span>
                        <span className="text-sm font-medium text-rose-700">
                          {(estadisticas?.porcentajeCariesCEO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-rose-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajeCariesCEO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-rose-600 mt-2">
                      Dientes temporales con caries
                    </p>
                  </div>

                  {/* Extraídos (e) */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-amber-700">Extraídos (e)</h5>
                      <div className="text-2xl font-bold text-amber-700">
                        {indicesData.ceo_e ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-500">Porcentaje</span>
                        <span className="text-sm font-medium text-amber-700">
                          {(estadisticas?.porcentajeExtraidosCEO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajeExtraidosCEO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                      Dientes temporales extraídos
                    </p>
                  </div>

                  {/* Obturados (o) */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-blue-700">Obturados (o)</h5>
                      <div className="text-2xl font-bold text-blue-700">
                        {indicesData.ceo_o ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-500">Porcentaje</span>
                        <span className="text-sm font-medium text-blue-700">
                          {(estadisticas?.porcentajeObturadosCEO ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, estadisticas?.porcentajeObturadosCEO || 0)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Dientes temporales obturados
                    </p>
                  </div>

                  {/* Total ceo */}
                  <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-violet-700">Total ceo</h5>
                      <div className="text-2xl font-bold text-violet-700">
                        {indicesData.ceo_total ?? 0}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-violet-500">Promedio</span>
                        <span className="text-sm font-medium text-violet-700">
                          {/* ✅ CORREGIDO: Usar función segura */}
                          {calcularPromedioCEO()}
                        </span>
                      </div>
                      <div className="h-2 bg-violet-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (indicesData.ceo_total ?? 0) <= 3 ? "bg-emerald-500" :
                            (indicesData.ceo_total ?? 0) <= 6 ? "bg-amber-500" :
                            "bg-rose-500"
                          }`}
                          style={{ 
                            width: `${Math.min(
                              100, 
                              ((indicesData.ceo_total ?? 0) > 0 ? ((indicesData.ceo_total ?? 0) / 20) * 100 : 0)
                            )}%` 
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-violet-600 mt-2">
                      Suma c+e+o por individuo
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interpretación clínica */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h5 className="text-sm font-medium text-slate-700 mb-3">Interpretación Clínica</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Baja</div>
                  <div className="text-lg font-bold text-emerald-600">0-3</div>
                  <div className="text-xs text-slate-600 mt-1">Riesgo bajo</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Moderada</div>
                  <div className="text-lg font-bold text-amber-600">4-6</div>
                  <div className="text-xs text-slate-600 mt-1">Vigilancia</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Alta</div>
                  <div className="text-lg font-bold text-rose-600">7+</div>
                  <div className="text-xs text-slate-600 mt-1">Intervención</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">Error al cargar</p>
              <p className="text-sm text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-500"></div>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Nota:</span> CPO (dientes permanentes) = Cariados + Perdidos + Obturados. ceo (dientes temporales) = cariados + extraídos + obturados.
          </p>
        </div>
        {mode === "edit" && indicesData && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <p className="text-xs text-slate-600">
              <span className="font-medium">Origen:</span> Índices específicos de este historial clínico
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default IndicesCariesSection;