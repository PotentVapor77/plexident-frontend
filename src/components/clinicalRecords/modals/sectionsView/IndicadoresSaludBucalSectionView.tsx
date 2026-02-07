import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import type { ClinicalRecordDetailResponse } from "../../../../types/clinicalRecords/typeBackendClinicalRecord";

interface IndicadoresSaludBucalSectionViewProps {
  record: ClinicalRecordDetailResponse;
}

export const IndicadoresSaludBucalSectionView: React.FC<IndicadoresSaludBucalSectionViewProps> = ({ 
  record 
}) => {
  const indicadores = record.indicadores_salud_bucal_data;

  // Piezas según estándar de formulario clínico
  const piezasMostrar = [
    { principal: "16", suplente: "17", temporal: "55" },
    { principal: "11", suplente: "21", temporal: "51" },
    { principal: "26", suplente: "27", temporal: "65" },
    { principal: "36", suplente: "37", temporal: "75" },
    { principal: "31", suplente: "41", temporal: "71" },
    { principal: "46", suplente: "47", temporal: "85" }
  ];

  const getPiezaUsadaData = (fila: typeof piezasMostrar[0]) => {
    const mapeo = indicadores?.informacion_piezas?.piezas_mapeo;
    const infoMapeo = mapeo?.[fila.principal];
    const datos = indicadores?.valores_por_pieza?.find(p => 
      p.pieza_original === fila.principal || p.pieza_usada === infoMapeo?.codigo_usado
    );

    return {
      codigoUsado: infoMapeo?.codigo_usado,
      disponible: infoMapeo?.disponible ?? false,
      datos: datos
    };
  };

  if (!indicadores) {
    return (
      <section className="p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-300 pb-3">I. Indicadores de Salud Bucal</h3>
        <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 italic">No hay indicadores de salud bucal registrados en esta atención.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 p-4 bg-white rounded-lg border border-gray-200 shadow-theme-sm">
      {/* Encabezado de sección - Estilo unificado */}
      <div className="border-b border-gray-300 pb-3">
        <h3 className="text-base font-semibold text-gray-900">
            I. INDICADORES DE SALUD BUCAL (Formulario 033)
        </h3>
        <p className="text-xs text-gray-500 mt-1">
            Higiene Oral Simplificada (OHI-S) y Estado Gingival (GI)
        </p>
      </div>

      {/* Tabla de Piezas Dentales */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-brand-600 rounded-full"></div>
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Evaluación por Piezas Seleccionadas
            </h4>
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full text-center text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-800 font-bold uppercase tracking-tighter">
                <th colSpan={3} className="px-3 py-3 border-r border-gray-200 bg-gray-100/50">Piezas Dentales</th>
                <th className="px-2 py-3 border-r border-gray-200">Placa (0-3)</th>
                <th className="px-2 py-3 border-r border-gray-200">Cálculo (0-3)</th>
                <th className="px-2 py-3">Gingivitis (0-3)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {piezasMostrar.map((fila, idx) => {
                const { codigoUsado, datos, disponible } = getPiezaUsadaData(fila);
                
                const getCellClass = (item: string) => `p-2.5 border-r border-gray-200 font-medium transition-colors ${
                  codigoUsado === item ? "bg-amber-50 text-amber-700 font-bold" : "text-gray-400"
                }`;

                return (
                  <tr key={idx} className={`${!disponible ? "bg-gray-50/30" : "bg-white"} hover:bg-gray-50/50`}>
                    <td className={getCellClass(fila.principal)}>{fila.principal}</td>
                    <td className={getCellClass(fila.suplente)}>{fila.suplente}</td>
                    <td className={getCellClass(fila.temporal)}>{fila.temporal}</td>
                    <td className="p-2.5 border-r border-gray-200 text-sm font-bold text-gray-900">
                      {datos?.placa?.valor ?? "-"}
                    </td>
                    <td className="p-2.5 border-r border-gray-200 text-sm font-bold text-gray-900">
                      {datos?.calculo?.valor ?? "-"}
                    </td>
                    <td className="p-2.5 text-sm font-bold text-gray-900">
                      {datos?.gingivitis?.valor ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-brand-50 border-t-2 border-brand-100 font-bold">
              <tr>
                <td colSpan={3} className="p-3 border-r border-gray-200 text-brand-800 uppercase text-[10px] tracking-wider">Promedios Totales</td>
                <td className="p-3 border-r border-gray-200 text-brand-700 text-base">
                  {indicadores.ohi_promedio_placa?.toFixed(2) || "0.00"}
                </td>
                <td className="p-3 border-r border-gray-200 text-brand-700 text-base">
                  {indicadores.ohi_promedio_calculo?.toFixed(2) || "0.00"}
                </td>
                <td className="p-3 text-brand-700 text-base">
                  {indicadores.gi_promedio_gingivitis?.toFixed(2) || "0.00"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Diagnósticos Adicionales - Estilo Tarjetas de Datos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            { label: "ENFERMEDAD PERIODONTAL", val: indicadores.enfermedad_periodontal_display },
            { label: "TIPOS DE OCLUSIÓN", val: indicadores.tipo_oclusion_display },
            { label: "NIVEL DE FLUOROSIS", val: indicadores.nivel_fluorosis_display }
          ].map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-brand-400 rounded-full"></div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                        {item.label}
                    </p>
                </div>
                <div className="min-h-8 flex items-center px-2 py-1.5 bg-white rounded border border-gray-100">
                    <p className="text-sm text-gray-900 font-semibold">
                        {item.val || "No registrado"}
                    </p>
                </div>
            </div>
          ))}
        </div>

        {/* Observaciones - Estilo Unificado */}
        {indicadores.observaciones && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white border-l-4 border-l-brand-500">
            <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-brand-600" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Observaciones Técnicas</p>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              {indicadores.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Pie de sección con alertas y leyenda */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        {indicadores.informacion_piezas?.advertencia && (
          <div className="flex items-center gap-3 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 text-xs">
            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
            <span className="font-medium">{indicadores.informacion_piezas.advertencia}</span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300"></div>
                    <span>Pieza Evaluada</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200"></div>
                    <span>Referencia</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <p className="text-[10px] text-gray-500 font-medium">Sección I completada</p>
            </div>
        </div>
      </div>
    </section>
  );
};