// src/components/clinicalRecord/form/sections/ExamenEstomatognaticoSection.tsx
import React from "react";
import { HeartPulse } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getExamenHallazgos } from "../../../../core/utils/clinicalRecordUtils";

interface ExamenEstomatognaticoSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
}

const ExamenEstomatognaticoSection: React.FC<ExamenEstomatognaticoSectionProps> = ({
  formData,
  lastUpdated,
}) => {
  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <SectionHeader
        icon={<HeartPulse className="text-rose-500" />}
        title="G. Examen del Sistema Estomatognático"
        subtitle={
          lastUpdated ? `Cargado del: ${lastUpdated}` : "No existen registros previos"
        }
      />

      <div className="mt-4">
        {!formData.examen_estomatognatico_data ? (
          <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">
              No se encontraron exámenes previos registrados para este paciente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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