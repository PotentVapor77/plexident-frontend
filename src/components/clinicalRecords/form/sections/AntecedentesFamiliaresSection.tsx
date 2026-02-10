// src/components/clinicalRecord/form/sections/AntecedentesFamiliaresSection.tsx
import React from "react";
import { RefreshCw, Users } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getAntecedentesFamiliaresDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesFamiliaresSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean;
}

const AntecedentesFamiliaresSection: React.FC<AntecedentesFamiliaresSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false,
}) => {
  const antecedentes = getAntecedentesFamiliaresDisplay(formData.antecedentes_familiares_data);

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-100 overflow-hidden">
          <div className="w-full h-full bg-purple-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <SectionHeader
          icon={<Users className="text-purple-500" />}
          title="F. Antecedentes Familiares"
          subtitle={
            lastUpdated ? `Cargado del: ${lastUpdated}` : "No existen registros previos"
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
              : "hover:bg-purple-50 text-slate-400 hover:text-purple-600 active:scale-95 border border-transparent hover:border-purple-100"
          }`}
          title="Actualizar antecedentes familiares"
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} 
          />
        </button>
      </div>

      <div className="mt-4">
        {isRefreshing && !formData.antecedentes_familiares_data ? (
          <div className="animate-pulse flex space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : !formData.antecedentes_familiares_data ? (
          <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">
              No se encontraron antecedentes familiares registrados para este paciente.
            </p>
          </div>
        ) : !antecedentes?.tieneContenido ? (
          <div className="col-span-full p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-800 font-medium">
              No se registran antecedentes familiares patológicos.
            </span>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {/* Enfermedades Cardiovasculares */}
            {antecedentes.cardiovasculares.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Enfermedades Cardiovasculares
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {antecedentes.cardiovasculares.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50/50 border border-red-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enfermedades Metabólicas */}
            {antecedentes.metabolicas.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Enfermedades Metabólicas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.metabolicas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cáncer */}
            {antecedentes.cancer.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-pink-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                  Cáncer
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.cancer.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-pink-50/50 border border-pink-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enfermedades Infecciosas */}
            {antecedentes.infecciosas.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Enfermedades Infecciosas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.infecciosas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enfermedades Mentales */}
            {antecedentes.mentales.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Enfermedades Mentales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.mentales.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Malformaciones */}
            {antecedentes.malformaciones.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-violet-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Malformaciones
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.malformaciones.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-violet-50/50 border border-violet-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Otros */}
            {antecedentes.otros.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  Otros Antecedentes
                </h4>
                <div className="space-y-2">
                  {antecedentes.otros.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700 italic">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AntecedentesFamiliaresSection;