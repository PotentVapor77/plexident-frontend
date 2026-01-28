// src/components/clinicalRecord/form/sections/AntecedentesPersonalesSection.tsx
import React from "react";
import { RefreshCw, User } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getAntecedentesPersonalesDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesPersonalesSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean

}

const AntecedentesPersonalesSection: React.FC<AntecedentesPersonalesSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false
  
}) => {
  const antecedentes = getAntecedentesPersonalesDisplay(formData.antecedentes_personales_data);

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
          icon={<User className="text-blue-500" />}
          title="E. Antecedentes Personales"
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
              : "hover:bg-blue-50 text-slate-400 hover:text-blue-600 active:scale-95 border border-transparent hover:border-blue-100"
          }`}
          title="Actualizar antecedentes personales"
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} 
          />
        </button>
      </div>

      <div className="mt-4">
        {isRefreshing && !formData.antecedentes_personales_data ? (
          <div className="animate-pulse flex space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : !formData.antecedentes_personales_data ? (
          <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">
              No se encontraron antecedentes personales registrados para este paciente.
            </p>
          </div>
        ) : !antecedentes?.tieneContenido ? (
          <div className="col-span-full p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-800 font-medium">
              No se registran antecedentes personales patológicos.
            </span>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {/* Alergias */}
            {antecedentes.alergias.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-2">
                  Alergias
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {antecedentes.alergias.map((alergia, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{alergia}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patologías */}
            {antecedentes.patologias.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">
                  Patologías y Enfermedades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {antecedentes.patologias.map((patologia, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{patologia}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Otros */}
            {antecedentes.otros.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-2">
                  Otros Antecedentes
                </h4>
                <div className="space-y-2">
                  {antecedentes.otros.map((otro, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg"
                    >
                      <p className="text-sm text-slate-700 italic">{otro}</p>
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

export default AntecedentesPersonalesSection;