// src/components/clinicalRecord/form/sections/AntecedentesPersonalesSection.tsx
import React from "react";
import { User } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";
import { getAntecedentesPersonalesDisplay } from "../../../../core/utils/clinicalRecordUtils";

interface AntecedentesPersonalesSectionProps {
  formData: ClinicalRecordFormData;
  lastUpdated?: string | null;
}

const AntecedentesPersonalesSection: React.FC<AntecedentesPersonalesSectionProps> = ({
  formData,
  lastUpdated,
}) => {
  const antecedentes = getAntecedentesPersonalesDisplay(formData.antecedentes_personales_data);

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <SectionHeader
        icon={<User className="text-blue-500" />}
        title="E. Antecedentes Personales"
        subtitle={
          lastUpdated ? `Cargado del: ${lastUpdated}` : "No existen registros previos"
        }
      />

      <div className="mt-4">
        {!formData.antecedentes_personales_data ? (
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
          <div className="space-y-4">
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