// src/components/clinicalRecord/form/sections/IndicadoresSaludBucalSection.tsx
// ACTUALIZADO: Soporte completo para visualización de piezas suplentes

import React from "react";
import { Activity, Shield, AlertCircle, RefreshCw, ArrowRight, Info } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getIndicadoresResumen } from "../../../../core/utils/clinicalRecordUtils";

interface IndicadoresSaludBucalSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean;
}

const IndicadoresSaludBucalSection: React.FC<IndicadoresSaludBucalSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false,
}) => {
  const indicadores = formData.indicadores_salud_bucal_data;
  const resumen = indicadores ? getIndicadoresResumen(indicadores) : null;

  // Determinar color del estado general
  const getEstadoColor = () => {
    if (!resumen) return "bg-slate-100 text-slate-700";
    
    if (resumen.higieneNivel === "Pésimo" || resumen.gingivitisNivel === "Severa") {
      return "bg-rose-100 text-rose-700";
    }
    if (resumen.higieneNivel === "Regular" || resumen.gingivitisNivel === "Moderada") {
      return "bg-amber-100 text-amber-700";
    }
    if (resumen.higieneNivel === "Excelente" || resumen.higieneNivel === "Bueno") {
      return "bg-emerald-100 text-emerald-700";
    }
    return "bg-blue-100 text-blue-700";
  };

  // Contar piezas alternativas
  const piezasAlternativas = indicadores?.valores_por_pieza?.filter(
    p => p.es_alternativa
  ).length || 0;

  // Verificar si tiene metadata
  const tieneMetadata = indicadores?.informacion_piezas?.tiene_metadata ?? true;

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden">
          <div className="w-full h-full bg-blue-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <SectionHeader
          icon={<Activity className="text-blue-500" />}
          title="H. Indicadores de Salud Bucal"
          subtitle={
            lastUpdated 
              ? `Evaluado el: ${lastUpdated}` 
              : "No existen indicadores previos"
          }
        />
        
        {/* Botón de Refresh */}
        <button
          type="button"
          onClick={refreshSection}
          disabled={isRefreshing}
          className={`p-2 rounded-lg transition-all ${
            isRefreshing 
              ? "bg-slate-100 cursor-not-allowed" 
              : "hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-95 border border-transparent hover:border-blue-100"
          }`}
          title="Actualizar indicadores"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mt-4">
        {/* Estado de carga */}
        {isRefreshing && !indicadores ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : !indicadores ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              No se encontraron indicadores de salud bucal registrados para este paciente.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Use el botón de actualizar para cargar los últimos registros.
            </p>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {/* Advertencia de metadata faltante */}
            {/* {!tieneMetadata && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900 mb-1">
                      Registro Antiguo
                    </h4>
                    <p className="text-sm text-amber-700">
                      {indicadores.advertencia || 
                       "Este registro no contiene información de piezas suplentes. Fue creado antes de implementar el sistema de piezas alternativas."}
                    </p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Información de piezas alternativas */}
            {piezasAlternativas > 0 && tieneMetadata && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Piezas Alternativas Utilizadas
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Se usaron {piezasAlternativas} pieza(s) alternativa(s) porque las piezas principales 
                      no estaban disponibles en el momento de la evaluación.
                    </p>
                    
                    {/* Listado de piezas alternativas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {indicadores.valores_por_pieza
                        .filter(p => p.es_alternativa)
                        .map(pieza => (
                          <div 
                            key={pieza.pieza_original}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
                          >
                            <span className="font-medium text-blue-900">{pieza.pieza_original}</span>
                            <ArrowRight className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-700">{pieza.pieza_usada}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estado general */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className={`p-2 rounded-lg ${getEstadoColor().split(' ')[0]}`}>
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800">Estado General de Salud Bucal</h4>
                {resumen && (
                  <p className="text-sm text-slate-600 mt-1">
                    {resumen.higieneNivel === "Excelente" && resumen.gingivitisNivel === "Leve" 
                      ? "Salud bucal óptima. Mantener hábitos actuales."
                      : resumen.higieneNivel === "Regular" 
                      ? "Requiere mejora en higiene oral. Considerar educación en técnicas de cepillado."
                      : "Necesita atención inmediata. Evaluar tratamiento profesional."
                    }
                  </p>
                )}
              </div>
              {resumen && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200">
                  <span className="text-slate-700">{resumen.higieneNivel}</span>
                </div>
              )}
            </div>

            {/* Indicadores principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Higiene Oral */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-slate-700">Higiene Oral</h5>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    resumen?.higieneNivel === "Excelente" ? "bg-emerald-100 text-emerald-700" :
                    resumen?.higieneNivel === "Bueno" ? "bg-blue-100 text-blue-700" :
                    resumen?.higieneNivel === "Regular" ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  }`}>
                    {resumen?.higieneNivel || "N/A"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Índice OHI</span>
                    <span className="text-sm font-medium text-slate-800">
                      {indicadores.ohi_promedio_placa?.toFixed(2)} + {indicadores.ohi_promedio_calculo?.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (indicadores.ohi_promedio_placa / 3) * 50 + (indicadores.ohi_promedio_calculo / 3) * 50)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Salud Gingival */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-slate-700">Salud Gingival</h5>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    resumen?.gingivitisNivel === "Leve" ? "bg-amber-100 text-amber-700" :
                    resumen?.gingivitisNivel === "Moderada" ? "bg-orange-100 text-orange-700" :
                    resumen?.gingivitisNivel === "Severa" ? "bg-rose-100 text-rose-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {resumen?.gingivitisNivel || "N/A"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Índice Gingival</span>
                    <span className="text-sm font-medium text-slate-800">
                      {indicadores.gi_promedio_gingivitis?.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        indicadores.gi_promedio_gingivitis < 1 ? "bg-emerald-500" :
                        indicadores.gi_promedio_gingivitis < 2 ? "bg-amber-500" :
                        "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, (indicadores.gi_promedio_gingivitis / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Evaluación por Pieza */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-slate-700">Piezas Evaluadas</h5>
                  <div className="text-xs text-slate-500">
                    {indicadores.valores_por_pieza?.filter(p => p.completo).length || 0}/{indicadores.valores_por_pieza?.length || 0}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Completas</span>
                    <span className="text-sm font-medium text-slate-800">
                      {((indicadores.valores_por_pieza?.filter(p => p.completo).length || 0) / 
                        (indicadores.valores_por_pieza?.length || 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        ((indicadores.valores_por_pieza?.filter(p => p.completo).length || 0) / 
                         (indicadores.valores_por_pieza?.length || 1)) > 0.7 ? "bg-emerald-500" :
                        ((indicadores.valores_por_pieza?.filter(p => p.completo).length || 0) / 
                         (indicadores.valores_por_pieza?.length || 1)) > 0.4 ? "bg-amber-500" :
                        "bg-rose-500"
                      } rounded-full`}
                      style={{ 
                        width: `${((indicadores.valores_por_pieza?.filter(p => p.completo).length || 0) / 
                                 (indicadores.valores_por_pieza?.length || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                {/* Mostrar si hay piezas alternativas */}
                {piezasAlternativas > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-300">
                    <p className="text-xs text-amber-600">
                      {piezasAlternativas} alternativa(s)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alertas y observaciones */}
            {indicadores.observaciones && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Observaciones</p>
                    <p className="text-sm text-amber-700 mt-1">{indicadores.observaciones}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnósticos adicionales */}
            {(indicadores.enfermedad_periodontal_display || 
              indicadores.tipo_oclusion_display || 
              indicadores.nivel_fluorosis_display) && (
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Diagnósticos Adicionales</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {indicadores.enfermedad_periodontal_display && (
                    <div className="px-3 py-2 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500">Periodontal</p>
                      <p className="text-sm font-medium text-slate-800">
                        {indicadores.enfermedad_periodontal_display}
                      </p>
                    </div>
                  )}
                  {indicadores.tipo_oclusion_display && (
                    <div className="px-3 py-2 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500">Oclusión</p>
                      <p className="text-sm font-medium text-slate-800">
                        {indicadores.tipo_oclusion_display}
                      </p>
                    </div>
                  )}
                  {indicadores.nivel_fluorosis_display && (
                    <div className="px-3 py-2 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500">Fluorosis</p>
                      <p className="text-sm font-medium text-slate-800">
                        {indicadores.nivel_fluorosis_display}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-xs text-slate-600">
            <span className="font-medium">Nota:</span> Los indicadores de salud bucal evalúan placa, cálculo y salud gingival para determinar el estado general de higiene oral.
            {piezasAlternativas > 0 && " Las piezas alternativas fueron usadas para compensar piezas principales no disponibles."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndicadoresSaludBucalSection;