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
isRefreshing?: boolean
}

const AntecedentesFamiliaresSection: React.FC<AntecedentesFamiliaresSectionProps> = ({
  formData,
  lastUpdated,
  refreshSection,
  isRefreshing = false,
}) => {
  const familiares = getAntecedentesFamiliaresDisplay(formData.antecedentes_familiares_data);

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Barra de progreso sutil superior cuando está cargando */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-100 overflow-hidden">
          <div className="w-full h-full bg-green-500 animate-progress-buffer origin-left"></div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <SectionHeader
          icon={<Users className="text-green-500" />}
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
              : "hover:bg-green-50 text-slate-400 hover:text-green-600 active:scale-95 border border-transparent hover:border-green-100"
          }`}
          title="Actualizar antecedentes familiares"
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} 
          />
        </button>
      </div>

      <div className="mt-4">
        {/* Mostramos un esqueleto o un mensaje de carga si está refrescando y no hay datos */}
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
        ) : !familiares?.tieneContenido ? (
          <div className="col-span-full p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-800 font-medium">
              No se registran antecedentes familiares patológicos.
            </span>
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Patología Familiar
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      Parentesco / Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {familiares.patologias.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.patologia}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.parentesco}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AntecedentesFamiliaresSection;