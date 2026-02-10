// src/components/odontogram/indicator/IndicatorsFormFields.tsx

import React, { useMemo } from "react";
import type { IndicatorsFormData } from "./IndicatorsForm";
import { usePiezasIndice } from "../../../hooks/odontogram/usePiezasIndice";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import type { InformacionPiezasResponse } from "../../../types/odontogram/typeBackendOdontograma";

// ============================================================================
// TYPES
// ============================================================================

interface IndicatorsFormFieldsProps {
  formData: IndicatorsFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  pacienteId: string | null;
  informacionPiezas?: InformacionPiezasResponse | null;
  loadingPiezas?: boolean;
  errorPiezas?: string | null;
}
const obtenerLabelPieza = (piezaOriginal: string): string => {
  const labels: Record<string, string> = {
    '16': '1er Molar Superior Derecho',
    '11': 'Incisivo Central Superior Derecho',
    '26': '1er Molar Superior Izquierdo',
    '36': '1er Molar Inferior Izquierdo',
    '31': 'Incisivo Central Inferior Izquierdo',
    '46': '1er Molar Inferior Derecho',
    // Dentición temporal
    '55': '2do Molar Temporal Superior Derecho',
    '51': 'Incisivo Central Temporal Superior Derecho',
    '65': '2do Molar Temporal Superior Izquierdo',
    '75': '2do Molar Temporal Inferior Izquierdo',
    '71': 'Incisivo Central Temporal Inferior Izquierdo',
    '85': '2do Molar Temporal Inferior Derecho',
  };
  return labels[piezaOriginal] || `Pieza ${piezaOriginal}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function IndicatorsFormFields({
  formData,
  onInputChange,
  pacienteId,
}: IndicatorsFormFieldsProps) {
  const { informacionPiezas, isLoading: loadingPiezas } = usePiezasIndice(pacienteId);

  const piezasData = useMemo(() => {
    if (!informacionPiezas) return {};

    return informacionPiezas.piezas ||
      informacionPiezas.piezas_mapeo ||
      {};
  }, [informacionPiezas]);

  // ============================================================================
  // HELPER FUNCTIONS - CORREGIDAS
  // ============================================================================

  // Obtener información de una pieza específica
  const obtenerInfoPieza = (piezaOriginal: string) => {
    return piezasData[piezaOriginal] || null;
  };

  // Obtener estadísticas de forma segura
  const estadisticas = informacionPiezas?.estadisticas || {
    total_piezas: 6,
    piezas_originales: 0,
    piezas_alternativas: 0,
    piezas_no_disponibles: 0,
    porcentaje_disponible: 0,
  };

  // Obtener dentición de forma segura
  const denticion = informacionPiezas?.denticion || 'permanente';
  // ============================================================================
  // CONFIGURACIÓN DE PIEZAS - CORREGIDA
  // ============================================================================

  const piezasIndice = ['16', '11', '26', '36', '31', '46'];

  const teeth = piezasIndice.map((piezaOriginal) => {
    const info = obtenerInfoPieza(piezaOriginal);

    return {
      piezaOriginal,
      piezaUsada: info?.codigo_usado || piezaOriginal,
      esAlternativa: info?.es_alternativa || false,
      disponible: info?.disponible ?? true,

      placaKey: `pieza_${piezaOriginal}_placa`,
      calcKey: `pieza_${piezaOriginal}_calculo`,
      gingivitisKey: `pieza_${piezaOriginal}_gingivitis`,
      info,
    };
  });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loadingPiezas) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Cargando información de piezas dentales...
        </p>
      </div>
    );
  }

  // ============================================================================
  // RENDER - CORREGIDO
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* ====================================================================
          ALERTA DE INFORMACIÓN DE DENTICIÓN - CORREGIDO
      ==================================================================== */}
      {informacionPiezas && (
        <div className={`p-4 rounded-lg border ${denticion === 'temporal'
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          }`}>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Dentición: {denticion === 'temporal' ? 'Temporal (Decidua)' : 'Permanente'}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {estadisticas.piezas_originales} piezas principales disponibles
                {estadisticas.piezas_alternativas > 0 && (
                  <>, {estadisticas.piezas_alternativas} alternativa(s) en uso</>
                )}
                {estadisticas.piezas_no_disponibles > 0 && (
                  <>, {estadisticas.piezas_no_disponibles} no disponible(s)</>
                )}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${estadisticas.porcentaje_disponible >= 80
                        ? 'bg-green-500'
                        : estadisticas.porcentaje_disponible >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    style={{ width: `${estadisticas.porcentaje_disponible}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium min-w-[3rem] text-right">
                  {estadisticas.porcentaje_disponible.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SECCIÓN: HIGIENE ORAL SIMPLIFICADA (OHI-S) - CORREGIDO
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Índice de Higiene Oral Simplificado (OHI-S)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Registro de placa bacteriana y cálculo dental en piezas índice (valores 0-3)
          </p>
        </div>

        {/* Tabla de piezas dentales - CORREGIDO */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Pieza Dental
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Placa (0–3)
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Cálculo (0–3)
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Gingivitis (0–1)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teeth.map(({ piezaOriginal, piezaUsada, esAlternativa, disponible, placaKey, calcKey, gingivitisKey, info }) => {
                const isDisabled = !info?.disponible;
                const mostrarAdvertencia = !disponible;
                return (
                  <tr
                    key={piezaOriginal}
                    className={`border-b border-gray-200 dark:border-gray-700 ${!disponible ? 'opacity-50 bg-gray-50 dark:bg-gray-800/50' : ''
                      }`}
                  >
                    {/* Columna: Pieza Dental */}
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>{obtenerLabelPieza(piezaOriginal)}</span>
                        {esAlternativa && disponible && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            Usando {piezaUsada}
                          </span>
                        )}
                        {mostrarAdvertencia && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            No disponible
                          </span>
                        )}
                      </div>
                      {esAlternativa && disponible && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Pieza {piezaOriginal} no disponible, usando {piezaUsada} como alternativa
                        </p>
                      )}
                    </td>

                    {/* Input Placa */}
                    <td className="px-4 py-3">
        <input
          type="number"
          name={placaKey}
          min={0}
          max={3}
          step={1}
          value={formData[placaKey] as number ?? ""}
          onChange={onInputChange}
          disabled={!disponible}
          placeholder={disponible ? "0-3" : "N/D"}
          className={`w-full px-3 py-2 border rounded-lg text-center
            ${!disponible 
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
            text-gray-900 dark:text-gray-100 
            placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-colors`}
        />
      </td>

                    {/* Input Cálculo */}
                    <td className="px-4 py-3">
        <input
          type="number"
          name={calcKey}
          min={0}
          max={3}
          step={1}
          value={formData[calcKey] as number ?? ""}
          onChange={onInputChange}
          disabled={!disponible}
          placeholder={disponible ? "0-3" : "N/D"}
          className={`w-full px-3 py-2 border rounded-lg text-center
            ${!disponible 
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
            text-gray-900 dark:text-gray-100 
            placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-colors`}
        />
      </td>

                    {/* Input Gingivitis */}
                    <td className="px-4 py-3">
        <input
          type="number"
          name={gingivitisKey}
          min={0}
          max={3}
          step={1}
          value={formData[gingivitisKey] as number ?? ""}
          onChange={onInputChange}
          disabled={!disponible}
          placeholder={disponible ? "0-1" : "N/D"}
          className={`w-full px-3 py-2 border rounded-lg text-center
            ${!disponible 
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
            text-gray-900 dark:text-gray-100 
            placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
            transition-colors`}
        />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Nota explicativa de la escala */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Escala de valores:</strong> 0 = Ausente | 1 = Menos de 1/3 de superficie |
            2 = Entre 1/3 y 2/3 de superficie | 3 = Más de 2/3 de superficie
          </p>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: ÍNDICE GINGIVAL (GI)
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Índice Gingival (GI) - Promedio
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Este valor se calcula automáticamente en el backend
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Promedio GI - Gingivitis
          </label>
          <input
            type="number"
            name="gi_promedio_gingivitis"
            min={0}
            max={1}
            step={0.01}
            value={formData.gi_promedio_gingivitis ?? ""}
            readOnly
            placeholder="Se calcula automáticamente"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: PROMEDIOS OHI (Calculados automáticamente por backend)
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-indigo-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Promedios OHI-S
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Estos valores se calculan automáticamente en el backend
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Promedio Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Promedio OHI-S - Placa
            </label>
            <input
              type="number"
              name="ohi_promedio_placa"
              min={0}
              max={3}
              step={0.01}
              value={formData.ohi_promedio_placa ?? ""}
              readOnly
              placeholder="Se calcula automáticamente"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Promedio Cálculo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Promedio OHI-S - Cálculo
            </label>
            <input
              type="number"
              name="ohi_promedio_calculo"
              min={0}
              max={3}
              step={0.01}
              value={formData.ohi_promedio_calculo ?? ""}
              readOnly
              placeholder="Se calcula automáticamente"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: ENFERMEDAD PERIODONTAL
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Enfermedad Periodontal
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Clasificación de la severidad de enfermedad periodontal
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nivel de Severidad
          </label>
          <select
            name="enfermedad_periodontal"
            value={formData.enfermedad_periodontal ?? ""}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <option value="">Seleccionar nivel</option>
            <option value="LEVE">Leve</option>
            <option value="MODERADA">Moderada</option>
            <option value="SEVERA">Severa</option>
          </select>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: TIPO DE OCLUSIÓN
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-yellow-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tipo de Oclusión
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Clasificación de Angle de la relación molar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clasificación de Angle
          </label>
          <select
            name="tipo_oclusion"
            value={formData.tipo_oclusion ?? ""}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
          >
            <option value="">Seleccionar tipo</option>
            <option value="ANGLE_I">Clase I (Neutroclusión)</option>
            <option value="ANGLE_II">Clase II (Distoclusión)</option>
            <option value="ANGLE_III">Clase III (Mesioclusión)</option>
          </select>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: NIVEL DE FLUOROSIS
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nivel de Fluorosis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Clasificación de fluorosis dental según índice de Dean
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Grado de Fluorosis
          </label>
          <select
            name="nivel_fluorosis"
            value={formData.nivel_fluorosis ?? ""}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          >
            <option value="">Seleccionar nivel</option>
            <option value="NINGUNA">Ninguna (Normal)</option>
            <option value="LEVE">Leve (Cuestionable/Muy leve)</option>
            <option value="MODERADA">Moderada</option>
            <option value="SEVERA">Severa</option>
          </select>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: OBSERVACIONES
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-gray-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Observaciones Adicionales
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Notas complementarias sobre el estado de salud bucal del paciente
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observaciones Clínicas
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones ?? ""}
            onChange={onInputChange}
            rows={4}
            maxLength={500}
            placeholder="Agregue cualquier observación relevante sobre el estado de salud bucal del paciente..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors resize-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {formData.observaciones?.length || 0} / 500 caracteres
          </p>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN: ESTADO DEL REGISTRO
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Estado del Registro
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Indicadores inactivos no aparecerán en reportes históricos
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={(e) => {
              const event = {
                target: {
                  name: "activo",
                  value: e.target.checked.toString(),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onInputChange(event);
            }}
            className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Registro activo
          </label>
        </div>
      </div>
    </div>
  );
}