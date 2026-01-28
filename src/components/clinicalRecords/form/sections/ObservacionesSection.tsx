// src/components/clinicalRecord/form/sections/ObservacionesSection.tsx
import React from "react";
import { FileText } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import SectionHeader from "../ClinicalRecordSectionHeader";

interface ObservacionesSectionProps {
  formData: ClinicalRecordFormData;
  updateField: <K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => void;
}

const ObservacionesSection: React.FC<ObservacionesSectionProps> = ({
  formData,
  updateField,
}) => {
  return (
    <>
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title="Observaciones Adicionales"
        subtitle="Notas complementarias sobre el historial clínico"
      />

      <div className="pl-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => updateField("observaciones", e.target.value)}
          placeholder="Agregue cualquier observación adicional relevante"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500">
          {formData.observaciones.length} / 2000 caracteres
        </span>
      </div>
    </>
  );
};

export default ObservacionesSection;