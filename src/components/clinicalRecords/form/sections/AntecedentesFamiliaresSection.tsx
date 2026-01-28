// src/components/clinicalRecord/form/sections/AntecedentesFamiliaresSection.tsx
import React from "react";
import { Users } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getAntecedentesFamiliaresDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesFamiliaresSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
}

const AntecedentesFamiliaresSection: React.FC<AntecedentesFamiliaresSectionProps> = ({
  formData,
  lastUpdated,
}) => {
  const familiares = getAntecedentesFamiliaresDisplay(formData.antecedentes_familiares_data);

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <SectionHeader
        icon={<Users className="text-green-500" />}
        title="F. Antecedentes Familiares"
        subtitle={
          lastUpdated ? `Cargado del: ${lastUpdated}` : "No existen registros previos"
        }
      />

      <div className="mt-4">
        {!formData.antecedentes_familiares_data ? (
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
          <div className="space-y-4">
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