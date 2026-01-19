// src/components/clinicalRecord/form/ClinicalRecordFormFields.tsx

import React from "react";
import { User, Stethoscope,AlertTriangle, FileText } from "lucide-react";

import type { ClinicalRecordFormData } from "../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../types/patient/IPatient";
import type { IUser } from "../../../types/user/IUser";
import SectionHeader from "./ClinicalRecordSectionHeader";

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
}

/**
 * ============================================================================
 * COMPONENT: ClinicalRecordFormFields
 * ============================================================================
 * Componente que renderiza todos los campos del formulario 033
 * ============================================================================
 */
const ClinicalRecordFormFields: React.FC<ClinicalRecordFormFieldsProps> = ({
  formData,
  updateField,
  selectedPaciente,
  selectedOdontologo,
  mode,
  validationErrors,
  initialDates,
}) => {
  return (
    <div className="space-y-8">
      {/* ====================================================================
          SECCIÓN 1: INFORMACIÓN DEL PACIENTE
      ==================================================================== */}
      <SectionHeader
        icon={<User className="h-5 w-5" />}
        title="Información del Paciente"
        subtitle="Datos generales del paciente para el historial clínico"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
        {/* Paciente (solo en modo create) */}
        {mode === "create" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente <span className="text-red-500">*</span>
            </label>
            {selectedPaciente ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedPaciente.nombres + " " + selectedPaciente.apellidos}
                  </p>
                  <p className="text-xs text-gray-500">
                    CI: {selectedPaciente.cedula_pasaporte} • Edad: {selectedPaciente.edad} años
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No se ha seleccionado ningún paciente
              </p>
            )}
            {validationErrors.paciente && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.paciente}</p>
            )}
          </div>
        )}

        {/* Odontólogo Responsable */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Odontólogo Responsable <span className="text-red-500">*</span>
          </label>
          {selectedOdontologo ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <Stethoscope className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedOdontologo.nombres} {selectedOdontologo.apellidos}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedOdontologo.username}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No se ha asignado odontólogo responsable
            </p>
          )}
          {validationErrors.odontologo_responsable && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.odontologo_responsable}
            </p>
          )}
        </div>

        {/* Estado de embarazo (solo mujeres) */}
        {selectedPaciente?.sexo === "F" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Está embarazada?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="embarazada"
                  value="SI"
                  checked={formData.embarazada === "SI"}
                  onChange={(e) => updateField("embarazada", e.target.value as "SI" | "NO")}
                  className="mr-2"
                />
                Sí
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="embarazada"
                  value="NO"
                  checked={formData.embarazada === "NO"}
                  onChange={(e) => updateField("embarazada", e.target.value as "SI" | "NO")}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          SECCIÓN 2: MOTIVO DE CONSULTA
      ==================================================================== */}
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title="Motivo de Consulta"
        subtitle="Razón principal de la visita odontológica"
        lastUpdated={initialDates.motivo_consulta}
      />

      <div className="pl-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motivo de Consulta <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.motivo_consulta}
          onChange={(e) => updateField("motivo_consulta", e.target.value)}
          placeholder="Describa el motivo de la consulta (mínimo 10 caracteres)"
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            validationErrors.motivo_consulta
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {formData.motivo_consulta.length} / 500 caracteres
          </span>
          {validationErrors.motivo_consulta && (
            <span className="text-xs text-red-600">
              {validationErrors.motivo_consulta}
            </span>
          )}
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN 3: ENFERMEDAD ACTUAL
      ==================================================================== */}
      <SectionHeader
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Enfermedad Actual"
        subtitle="Descripción detallada de la condición actual del paciente"
        lastUpdated={initialDates.enfermedad_actual}
      />

      <div className="pl-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enfermedad Actual
        </label>
        <textarea
          value={formData.enfermedad_actual}
          onChange={(e) => updateField("enfermedad_actual", e.target.value)}
          placeholder="Describa la enfermedad o condición actual del paciente"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500">
          {formData.enfermedad_actual.length} / 1000 caracteres
        </span>
      </div>

      {/* ====================================================================
          SECCIÓN 4: ANTECEDENTES PERSONALES
      ==================================================================== */}
      <SectionHeader
        icon={<User className="h-5 w-5" />}
        title="Antecedentes Personales"
        subtitle="Historial médico personal del paciente"
        lastUpdated={initialDates.antecedentes_personales}
        isPreloaded={!!formData.antecedentes_personales_data}
      />

      {formData.antecedentes_personales_data && (
        <div className="pl-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Alergia a antibióticos:</span>
              <p className="text-gray-600">
                {formData.antecedentes_personales_data.alergia_antibiotico || "No registra"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Alergia a anestesia:</span>
              <p className="text-gray-600">
                {formData.antecedentes_personales_data.alergia_anestesia || "No registra"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Diabetes:</span>
              <p className="text-gray-600">
                {formData.antecedentes_personales_data.diabetes || "No registra"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hipertensión:</span>
              <p className="text-gray-600">
                {formData.antecedentes_personales_data.hipertension_arterial || "No registra"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            📋 Datos pre-cargados del último registro. Puede editarlos en la sección de pacientes.
          </p>
        </div>
      )}

      {/* ====================================================================
          SECCIÓN 5: ANTECEDENTES FAMILIARES
      ==================================================================== */}
      <SectionHeader
        icon={<User className="h-5 w-5" />}
        title="Antecedentes Familiares"
        subtitle="Historial médico familiar relevante"
        lastUpdated={initialDates.antecedentes_familiares}
        isPreloaded={!!formData.antecedentes_familiares_data}
      />

      {formData.antecedentes_familiares_data && (
        <div className="pl-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Cardiopatía:</span>
              <p className="text-gray-600">
                {formData.antecedentes_familiares_data.cardiopatia_familiar || "No registra"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cáncer:</span>
              <p className="text-gray-600">
                {formData.antecedentes_familiares_data.cancer_familiar || "No registra"}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Otros antecedentes:</span>
              <p className="text-gray-600">
                {formData.antecedentes_familiares_data.otros_antecedentes_familiares ||
                  "Ninguno registrado"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            📋 Datos pre-cargados del último registro.
          </p>
        </div>
      )}

      {/* ====================================================================
          SECCIÓN 6: CONSTANTES VITALES
      ==================================================================== */}
      <SectionHeader
        icon={<Stethoscope className="h-5 w-5" />}
        title="Constantes Vitales"
        subtitle="Signos vitales del paciente al momento de la consulta"
        lastUpdated={initialDates.constantes_vitales}
        isPreloaded={!!formData.constantes_vitales_data}
      />

      {formData.constantes_vitales_data && (
        <div className="pl-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Temperatura</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.constantes_vitales_data.temperatura}°C
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Pulso</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.constantes_vitales_data.pulso} bpm
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">F. Respiratoria</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.constantes_vitales_data.frecuencia_respiratoria} rpm
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Presión Arterial</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.constantes_vitales_data.presion_arterial}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            📋 Datos pre-cargados del último registro.
          </p>
        </div>
      )}

      {/* ====================================================================
          SECCIÓN 7: OBSERVACIONES ADICIONALES
      ==================================================================== */}
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
    </div>
  );
};

export default ClinicalRecordFormFields;
