// src/components/clinicalRecord/form/sections/MotivoConsultaSection.tsx
import React from "react";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";

interface MotivoConsultaSectionProps {
  formData: ClinicalRecordFormData;
  updateField: <K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => void;
  validationErrors: Record<string, string>;
  lastUpdated?: string | null;
}

const MotivoConsultaSection: React.FC<MotivoConsultaSectionProps> = ({
  formData,
  updateField,
  validationErrors,
  lastUpdated,
}) => {
  const charCount = formData.motivo_consulta.length;
  const minChars = 10;
  const maxChars = 500;
  const isValidLength = charCount >= minChars && charCount <= maxChars;
  const isNearLimit = charCount > maxChars - 50;

  // Obtener color del contador
  const getCounterColor = () => {
    if (charCount < minChars) return "text-amber-600";
    if (charCount > maxChars) return "text-rose-600";
    if (isNearLimit) return "text-amber-600";
    return "text-slate-600";
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header de la sección */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              C. Motivo de Consulta
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Razón principal de la visita odontológica del paciente
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* Indicador de validación */}
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isValidLength && !validationErrors.motivo_consulta ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {isValidLength && !validationErrors.motivo_consulta ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Válido</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" />
              <span>Revisar</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Área de texto principal */}
        <div className={`relative rounded-lg border ${validationErrors.motivo_consulta ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
          <textarea
            value={formData.motivo_consulta}
            onChange={(e) => updateField("motivo_consulta", e.target.value)}
            placeholder="Describa detalladamente el motivo de la consulta. Incluya síntomas, duración, localización del dolor o preocupación principal del paciente..."
            rows={4}
            className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400"
          />
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-3 right-3">
            <div className={`text-xs font-medium ${getCounterColor()}`}>
              {charCount} / {maxChars}
            </div>
          </div>
        </div>

        {/* Información y validación */}
        <div className="space-y-3">
          {/* Indicadores de requisitos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${charCount >= minChars ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <span className="text-xs text-slate-600">
                Mínimo {minChars} caracteres
                {charCount < minChars && (
                  <span className="ml-1 text-amber-600 font-medium">
                    ({minChars - charCount} restantes)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${charCount <= maxChars ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <span className="text-xs text-slate-600">
                Máximo {maxChars} caracteres
                {charCount > maxChars && (
                  <span className="ml-1 text-rose-600 font-medium">
                    (+{charCount - maxChars})
                  </span>
                )}
              </span>
            </div>
          </div>


          {/* Mensaje de error */}
          {validationErrors.motivo_consulta && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-rose-800">
                  Error en el motivo de consulta
                </p>
                <p className="text-sm text-rose-700 mt-1">
                  {validationErrors.motivo_consulta}
                </p>
              </div>
            </div>
          )}

          {/* Estado actual */}
          {isValidLength && !validationErrors.motivo_consulta && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Motivo de consulta válido
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  La descripción cumple con los requisitos mínimos para continuar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MotivoConsultaSection;