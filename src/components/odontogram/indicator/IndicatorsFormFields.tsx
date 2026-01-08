// src/components/odontogram/indicator/IndicatorsFormFields.tsx

import React from "react";
import type { IndicatorsFormData } from "./IndicatorsForm";

// ============================================================================
// TYPES
// ============================================================================

interface IndicatorsFormFieldsProps {
  formData: IndicatorsFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onReset: () => void;
  submitLoading: boolean;
  mode: "create" | "edit";
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function IndicatorsFormFields({
  formData,
  onInputChange,
  onReset,
  submitLoading,
  mode,
}: IndicatorsFormFieldsProps) {
  
  const teeth = [
    { tooth: 16, placaKey: "pieza_16_placa", calcKey: "pieza_16_calculo" },
    { tooth: 11, placaKey: "pieza_11_placa", calcKey: "pieza_11_calculo" },
    { tooth: 26, placaKey: "pieza_26_placa", calcKey: "pieza_26_calculo" },
    { tooth: 36, placaKey: "pieza_36_placa", calcKey: "pieza_36_calculo" },
    { tooth: 31, placaKey: "pieza_31_placa", calcKey: "pieza_31_calculo" },
    { tooth: 46, placaKey: "pieza_46_placa", calcKey: "pieza_46_calculo" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* ====================================================================
          SECCIÓN: HIGIENE ORAL SIMPLIFICADA (OHI-S)
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

        {/* Tabla de piezas dentales */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teeth.map(({ tooth, placaKey, calcKey }) => (
                <tr
                  key={tooth}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Número de pieza dental */}
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold">
                        {tooth}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tooth === 16 && "1er Molar Superior Derecho"}
                        {tooth === 11 && "Incisivo Central Superior Derecho"}
                        {tooth === 26 && "1er Molar Superior Izquierdo"}
                        {tooth === 36 && "1er Molar Inferior Izquierdo"}
                        {tooth === 31 && "Incisivo Central Inferior Izquierdo"}
                        {tooth === 46 && "1er Molar Inferior Derecho"}
                      </span>
                    </div>
                  </td>

                  {/* Input Placa */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      name={placaKey}
                      min={0}
                      max={3}
                      step={1}
                      value={
  (formData[placaKey as keyof IndicatorsFormData] as number | null) ?? ""
}
                      onChange={onInputChange}
                      placeholder="0-3"
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                      value={
  (formData[calcKey  as keyof IndicatorsFormData] as number | null) ?? ""
}
                      onChange={onInputChange}
                      placeholder="0-3"
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </td>
                </tr>
              ))}
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
          SECCIÓN: PROMEDIOS OHI (Calculados automáticamente por backend)
      ==================================================================== */}
      <div className="space-y-4">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Promedios OHI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Estos valores se calculan automáticamente 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Promedio Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Promedio OHI - Placa
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
              Promedio OHI - Cálculo
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
            placeholder="Agregue cualquier observación relevante sobre el estado de salud bucal del paciente..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors resize-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Máximo 500 caracteres
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
