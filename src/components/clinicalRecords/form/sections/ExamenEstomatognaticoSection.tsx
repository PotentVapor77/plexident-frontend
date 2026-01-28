// src/components/clinicalRecord/form/sections/ExamenEstomatognaticoSection.tsx
import React from "react";
import { HeartPulse } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getExamenHallazgos } from "../../../../core/utils/clinicalRecordUtils";

interface ExamenEstomatognaticoSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
  mode: "create" | "edit";
  refreshSection: () => Promise<void>;
  isRefreshing?: boolean
}

const ExamenEstomatognaticoSection: React.FC<ExamenEstomatognaticoSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false
}) => {
  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-100 overflow-hidden">
          <div className="w-full h-full bg-rose-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <SectionHeader
          icon={<HeartPulse className="text-rose-500" />}
          title="G. Examen del Sistema Estomatognático"
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
              : "hover:bg-rose-50 text-slate-400 hover:text-rose-600 active:scale-95 border border-transparent hover:border-rose-100"
          }`}
          title="Actualizar examen"
        >
          <svg 
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        {/* Mostramos un esqueleto o un mensaje de carga si está refrescando y no hay datos */}
        {isRefreshing && !formData.examen_estomatognatico_data ? (
          <div className="animate-pulse flex space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : !formData.examen_estomatognatico_data ? (
          <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">
              No se encontraron exámenes previos registrados para este paciente.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {getExamenHallazgos(formData.examen_estomatognatico_data).map((hallazgo, idx) => (
              <div
                key={idx}
                className="flex flex-col p-3 bg-rose-50/50 border border-rose-100 rounded-lg"
              >
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  {hallazgo.region}
                </span>
                <span className="text-sm text-slate-700 mt-1 italic">{hallazgo.detalle}</span>
              </div>
            ))}
            
            {formData.examen_estomatognatico_data.examen_sin_patologia && (
              <div className="col-span-full p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-800 font-medium">
                  El examen clínico no presenta patologías detectadas.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExamenEstomatognaticoSection;