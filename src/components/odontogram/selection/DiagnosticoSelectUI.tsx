// src/components/odontogram/selection/DiagnosticoSelectUI.tsx

import { useEffect } from "react";
import type { PrincipalArea } from "..";
import type { AtributoClinicoDefinicion, OpcionAtributoClinico } from "../../../core/types/odontograma.types";
import type { useDiagnosticoSelect } from "../../../hooks/odontogram/useDiagnosticoSelect";

// Tipos para las props del componente UI
type DiagnosticoSelectUIProps = ReturnType<typeof useDiagnosticoSelect> & {
  currentArea: PrincipalArea;
  onFormValidChange?: (isValid: boolean) => void;
};
// Componente auxiliar para los encabezados de sección con número
const SectionHeader = ({ title }: { step: string; title: string }) => (
  <div className="flex items-center gap-2 mb-3">

    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

export const DiagnosticoSelectUI = ({
  // Estados y Handlers del Hook
  categoriaSeleccionada,
  diagnosticoSeleccionado,
  atributosClinicosSeleccionados,
  descripcion,
  formValid,
  handleCategoriaSelect,
  handleDiagnosticoChange,
  handleAtributoChange,
  setDescripcion,
  // Acciones
  handleApply,
  handleCancel,
  // Datos para renderizar
  filteredCategories,
  currentDiagnosesForSelect,
  requiresSpecificAreaMessage,
  // Props adicionales
  currentArea,
  onFormValidChange,

}: DiagnosticoSelectUIProps) => {

  const inputBaseClass = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed";
  const labelBaseClass = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300";
  useEffect(() => {
    if (onFormValidChange) {
      onFormValidChange(formValid);
    }
  }, [formValid, onFormValidChange]);
  return (
    <div className="mt-2 p-4 space-y-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-sm">

      {/* 1. Selecciona Categoría */}
      <section>
        <SectionHeader step="1" title="Categoría" />
        <div className="relative">
          <select
            value={categoriaSeleccionada?.id || ""}
            onChange={e => handleCategoriaSelect(e.target.value)}
            className={inputBaseClass}
          >
            <option value="">-- Elige una categoría --</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        {!currentArea && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
            <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Selecciona una superficie (corona o raíz) en el modelo 3D para ver diagnósticos específicos.</span>
          </p>
        )}
      </section>

      {/* 2. Diagnóstico */}
      {categoriaSeleccionada && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-200">
          <SectionHeader step="2" title="Diagnóstico" />
          <select
            value={diagnosticoSeleccionado?.id || ""}
            onChange={e => handleDiagnosticoChange(e.target.value)}
            className={inputBaseClass}
          >
            <option value="">-- Selecciona un diagnóstico --</option>
            {currentDiagnosesForSelect.map(diag => (
              <option key={diag.id} value={diag.id}>{diag.nombre}</option>
            ))}
          </select>

          {currentDiagnosesForSelect.length === 0 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-2">
              ⚠️ La categoría <strong>{categoriaSeleccionada.nombre}</strong> requiere seleccionar una superficie específica.
            </p>
          )}

          {requiresSpecificAreaMessage && (
            <div className="mt-3 p-3 bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800 rounded-lg text-sm text-error-600 dark:text-error-400 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Acción requerida:</strong> Haz clic en la superficie afectada (corona o raíz) para aplicar "{diagnosticoSeleccionado?.nombre}".
              </span>
            </div>
          )}

          {diagnosticoSeleccionado && diagnosticoSeleccionado.areasafectadas.includes('general') && (
            <p className="mt-2 text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Diagnóstico general: afecta a todo el diente.
            </p>
          )}
        </section>
      )}

      {/* 3. Atributos Clínicos Dinámicos */}
      {diagnosticoSeleccionado?.atributos_clinicos && Object.keys(diagnosticoSeleccionado.atributos_clinicos).length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-300">
          <SectionHeader step="3" title="Detalles Clínicos" />
          <div className="grid gap-4">
            {Object.entries(diagnosticoSeleccionado.atributos_clinicos).map(([key, atributo]: [string, AtributoClinicoDefinicion]) => (
              <div key={key}>
                <label className={labelBaseClass}>
                  {atributo.nombre}
                  {atributo.requerido && <span className="text-red-500 ml-1">*</span>}
                </label>

                {atributo.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{atributo.descripcion}</p>
                )}

                {/* SELECT */}
                {atributo.tipo_input === 'select' && (
                  <select
                    value={atributosClinicosSeleccionados[key] || ""}
                    onChange={e => handleAtributoChange(key, e.target.value)}
                    className={inputBaseClass}
                  >
                    <option value="">-- Seleccionar --</option>
                    {atributo.opciones.map((opt: OpcionAtributoClinico) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                        {opt.prioridad ? ` (Prioridad ${opt.prioridad})` : ''}
                      </option>
                    ))}
                  </select>
                )}

                {/* RADIO BUTTONS */}
                {atributo.tipo_input === 'radio' && (
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    {atributo.opciones.map((opt: OpcionAtributoClinico) => (
                      <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name={key}
                          value={opt.key}
                          checked={atributosClinicosSeleccionados[key] === opt.key}
                          onChange={e => handleAtributoChange(key, e.target.value)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                          {opt.label}
                          {opt.prioridad && (
                            <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">(P{opt.prioridad})</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* CHECKBOXES */}
                {atributo.tipo_input === 'checkbox' && (
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    {atributo.opciones.map((opt: OpcionAtributoClinico) => {
                      const currentValues = Array.isArray(atributosClinicosSeleccionados[key])
                        ? atributosClinicosSeleccionados[key]
                        : [];
                      const isChecked = currentValues.includes(opt.key);

                      return (
                        <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              const updated = e.target.checked
                                ? [...currentValues, opt.key]
                                : currentValues.filter((v: string) => v !== opt.key);
                              handleAtributoChange(key, updated);
                            }}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {opt.label}
                            {opt.prioridad && (
                              <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">(P{opt.prioridad})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* TEXT INPUT */}
                {atributo.tipo_input === 'text' && (
                  <input
                    type="text"
                    value={atributosClinicosSeleccionados[key] || ''}
                    onChange={e => handleAtributoChange(key, e.target.value)}
                    className={inputBaseClass}
                    placeholder={atributo.descripcion || 'Ingrese un valor...'}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Descripción / Notas */}
      {diagnosticoSeleccionado && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
          <SectionHeader step="4." title="Notas Adicionales" />
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={inputBaseClass + ' resize-none'}
            placeholder="Escribe observaciones, ej: ICDAS 3 en zona mesial..."
          />
        </section>
      )}

      <div className="mt-4 flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleApply}
          disabled={!formValid}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-white shadow-theme-sm transition-all ${formValid
            ? "bg-brand-600 hover:bg-brand-700 active:bg-brand-800"
            : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            }`}
        >
          Aplicar
        </button>
      </div>
    </div>


  );
};
