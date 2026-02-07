// src/components/clinicalRecord/form/ClinicalRecordFormFields.tsx
import React from "react";
import type { ClinicalRecordFormData } from "../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../types/patient/IPatient";
import type { IUser } from "../../../types/user/IUser";

// Importar todas las secciones
import PatientInfoSection from "./sections/PatientInfoSection";
import MotivoConsultaSection from "./sections/MotivoConsultaSection";
import EnfermedadActualSection from "./sections/EnfermedadActualSection";
import ConstantesVitalesSection from "./sections/ConstantesVitalesSection";
import AntecedentesPersonalesSection from "./sections/AntecedentesPersonalesSection";
import AntecedentesFamiliaresSection from "./sections/AntecedentesFamiliaresSection";
import ExamenEstomatognaticoSection from "./sections/ExamenEstomatognaticoSection";
import ObservacionesSection from "./sections/ObservacionesSection";
import InfoSection from "./sections/InfoSection";
import Odontograma2DSection from "./sections/Odontograma2DSection";
import IndicadoresSaludBucalSection from "./sections/IndicadoresSaludBucalSection";
import { DiagnosticosCieSection, IndicesCariesSection, PlanTratamientoSection } from "./sections";
/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordFormFieldsProps {
  formData: ClinicalRecordFormData;
  updateField: <K extends keyof ClinicalRecordFormData>(
    field: K,
    value: ClinicalRecordFormData[K]
  ) => void;
  updateSectionData: <
    T extends
    | "antecedentes_personales_data"
    | "antecedentes_familiares_data"
    | "constantes_vitales_data"
    | "examen_estomatognatico_data"
    | "indicadores_salud_bucal_data"
    | "indices_caries_data"
    | "diagnosticos_cie_data"
  >(
    section: T,
    data: ClinicalRecordFormData[T]
  ) => void;
  selectedPaciente: IPaciente | null;
  setSelectedPaciente: (paciente: IPaciente | null) => void;
  selectedOdontologo: IUser | null;
  setSelectedOdontologo: (odontologo: IUser | null) => void;
  mode: "create" | "edit";
  validationErrors: Record<string, string>;
  initialDates: { [key: string]: string | null };
  refreshSections: (section: string) => Promise<void>;
  historialId?: string;
}

/**
 * ============================================================================
 * COMPONENT: ClinicalRecordFormFields
 * ============================================================================
 */
const ClinicalRecordFormFields: React.FC<ClinicalRecordFormFieldsProps> = ({
  formData,
  updateField,
  updateSectionData,
  selectedPaciente,
  selectedOdontologo,
  mode,
  validationErrors,
  initialDates,
  refreshSections,
  historialId,
}) => {
  console.log("[HC][FormFields] formData.plan_tratamiento_sesiones:", formData.plan_tratamiento_sesiones);
  console.log("[HC][FormFields] formData.plan_tratamiento_odontograma_id:", formData.plan_tratamiento_odontograma_id);
  return (
    <div className="space-y-8">

      {/* ====================================================================
          A. Información del Paciente
      ==================================================================== */}
      <InfoSection
        formData={formData}
        mode={mode}
      />
      <PatientInfoSection
        formData={formData}
        updateField={updateField}
        selectedPaciente={selectedPaciente}
        selectedOdontologo={selectedOdontologo}
        mode={mode}
        validationErrors={validationErrors}
      />

      {/* ====================================================================
          B. Motivo de Consulta
      ==================================================================== */}
      <MotivoConsultaSection
        formData={formData}
        updateField={updateField}
        validationErrors={validationErrors}
        lastUpdated={initialDates.motivo_consulta}
      />

      {/* ====================================================================
          C. Enfermedad Actual
      ==================================================================== */}
      <EnfermedadActualSection
        formData={formData}
        updateField={updateField}
        lastUpdated={initialDates.enfermedad_actual}

      />

      {/* ====================================================================
          D. Constantes Vitales
      ==================================================================== */}
      <ConstantesVitalesSection
        formData={formData}
        updateSectionData={updateSectionData}
        selectedPaciente={selectedPaciente}
        lastUpdated={initialDates.constantes_vitales}
        refreshSection={() => refreshSections("constantes_vitales")}
      />

      {/* ====================================================================
          E. Antecedentes Personales (Solo Lectura)
      ==================================================================== */}
      <AntecedentesPersonalesSection
        formData={formData}
        lastUpdated={initialDates.antecedentes_personales}
        refreshSection={() => refreshSections("antecedentes_personales")}
        mode={mode}
      />

      {/* ====================================================================
          F. Antecedentes Familiares (Solo Lectura)
      ==================================================================== */}
      <AntecedentesFamiliaresSection
        formData={formData}
        lastUpdated={initialDates.antecedentes_familiares}
        refreshSection={() => refreshSections("antecedentes_familiares")}
        mode={mode}
      />

      {/* ====================================================================
          G. Examen del Sistema Estomatognático (Solo Lectura)
      ==================================================================== */}
      <ExamenEstomatognaticoSection
        formData={formData}
        lastUpdated={initialDates.examen_estomatognatico}
        refreshSection={() => refreshSections("examen_estomatognatico")}
        mode={mode}
      />

      {/* ====================================================================
          H. Odontograma 2D (Solo Lectura)
      ==================================================================== */}
      <Odontograma2DSection
        formData={formData}
        selectedPaciente={selectedPaciente}
        lastUpdated={initialDates.odontograma_2d}
        validationErrors={validationErrors}
        refreshSection={() => refreshSections("odontograma_2d")}
        mode={mode}
        historialId={historialId}
        refreshIndicesCaries={() => refreshSections("indices_caries")}
      />

      <IndicadoresSaludBucalSection
        formData={formData}
        lastUpdated={initialDates.indicadores_salud_bucal}
        refreshSection={() => refreshSections("indicadores_salud_bucal")}
        mode={mode}
      />

      <IndicesCariesSection
        formData={formData}
        selectedPaciente={selectedPaciente}
        lastUpdated={initialDates.indices_caries}
        mode={mode}
        refreshSection={() => refreshSections("indices_caries")}
        historialId={historialId}
      />
      <DiagnosticosCieSection
        modo={mode === "create" ? "crear" : "editar"}
        pacienteId={selectedPaciente?.id ?? null}
        historialId={historialId ?? null}
        onChangeDiagnosticosSeleccionados={(diagnosticos) =>
          updateSectionData("diagnosticos_cie_data", {
            diagnosticos: diagnosticos.map((d) => ({
              diagnostico_dental_id: d.diagnostico_dental_id,
              tipo_cie: d.tipo_cie || "PRE",
            })),
            tipo_carga: mode === "create" ? "nuevos" : "todos",
          } as any)
        }
        refreshSection={() => refreshSections("diagnosticos_cie")}
      />

      <PlanTratamientoSection
  sesiones={formData.plan_tratamiento_sesiones}
  odontogramaId={formData.plan_tratamiento_odontograma_id}
  planTitulo={formData.plan_tratamiento_titulo}
  planDescripcion={formData.plan_tratamiento_descripcion}
  onPlanSeleccionado={(planData) => {
    updateField("plan_tratamiento_id", planData.planId);
    updateField("plan_tratamiento_sesiones", planData.sesiones);
    updateField("plan_tratamiento_odontograma_id", planData.odontogramaId);
    if (planData.titulo) {
      updateField("plan_tratamiento_titulo", planData.titulo);
    }
    if (planData.descripcion) {
      updateField("plan_tratamiento_descripcion", planData.descripcion);
    }
  }}
  mode={mode}
  estadoHistorial={formData.estado as "BORRADOR" | "ABIERTO" | "CERRADO"}
  pacienteId={selectedPaciente?.id ?? null}
  historialId={historialId ?? null}
  onRefresh={() => {
    // Refrescar datos generales del historial
    if (historialId) {
      refreshSections('plan_tratamiento');
    }
  }}
/>

      {/* ====================================================================
          Observaciones Adicionales
      ==================================================================== */}
      <ObservacionesSection
        formData={formData}
        updateField={updateField}
      />
    </div>
  );
};

export default ClinicalRecordFormFields;