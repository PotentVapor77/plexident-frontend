// src/components/clinicalRecord/form/sections/ConstantesVitalesSection.tsx
import React from "react";
import { Activity, Thermometer, Heart, Wind, Gauge } from "lucide-react";
import type { ClinicalRecordFormData } from "../../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../../types/patient/IPatient";

interface ConstantesVitalesSectionProps {
  formData: ClinicalRecordFormData;
  updateSectionData: <T extends "constantes_vitales_data">(
    section: T,
    data: ClinicalRecordFormData[T]
  ) => void;
  selectedPaciente: IPaciente | null;
  lastUpdated?: string | null;
}

const ConstantesVitalesSection: React.FC<ConstantesVitalesSectionProps> = ({
  formData,
  updateSectionData,
  selectedPaciente,
  lastUpdated,
}) => {
  const handleConstanteVitalChange = (
    field: "temperatura" | "pulso" | "frecuencia_respiratoria" | "presion_arterial",
    value: string
  ) => {
    if (!formData.constantes_vitales_data) {
      // Si no hay datos previos, crear estructura básica
      updateSectionData("constantes_vitales_data", {
        id: "",
        paciente_nombre: selectedPaciente?.nombres + " " + selectedPaciente?.apellidos || "",
        paciente_cedula: selectedPaciente?.cedula_pasaporte || "",
        fecha_creacion: new Date().toISOString(),
        fecha_modificacion: new Date().toISOString(),
        activo: true,
        temperatura: "",
        pulso: 0,
        frecuencia_respiratoria: 0,
        presion_arterial: "",
        creado_por: "",
        actualizado_por: "",
        paciente: selectedPaciente?.id || "",
      } as any);
    }

    // Actualizar el campo específico
    const currentData = formData.constantes_vitales_data || ({} as any);
    updateSectionData("constantes_vitales_data", {
      ...currentData,
      [field]:
        field === "temperatura"
          ? value
          : field === "pulso" || field === "frecuencia_respiratoria"
          ? parseInt(value) || 0
          : value,
    });
  };

  // Determinar estado de cada constante vital
  const getTemperaturaEstado = (temp?: string) => {
    if (!temp) return "default";
    const value = parseFloat(temp);
    if (value < 36) return "hipotermia";
    if (value > 37.5) return "fiebre";
    return "normal";
  };

  const getPulsoEstado = (pulso?: number) => {
    if (!pulso) return "default";
    if (pulso < 60) return "bradicardia";
    if (pulso > 100) return "taquicardia";
    return "normal";
  };

  const getPresionEstado = (presion?: string) => {
    if (!presion) return "default";
    const [sistolica, diastolica] = presion.split("/").map(Number);
    if (sistolica > 140 || diastolica > 90) return "hipertension";
    if (sistolica < 90 || diastolica < 60) return "hipotension";
    return "normal";
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
      fiebre: "bg-amber-100 text-amber-800 border-amber-200",
      hipotermia: "bg-blue-100 text-blue-800 border-blue-200",
      taquicardia: "bg-rose-100 text-rose-800 border-rose-200",
      bradicardia: "bg-blue-100 text-blue-800 border-blue-200",
      hipertension: "bg-rose-100 text-rose-800 border-rose-200",
      hipotension: "bg-blue-100 text-blue-800 border-blue-200",
      default: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[estado] || colors.default;
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      normal: "Normal",
      fiebre: "Fiebre",
      hipotermia: "Hipotermia",
      taquicardia: "Taquicardia",
      bradicardia: "Bradicardia",
      hipertension: "Hipertensión",
      hipotension: "Hipotensión",
      default: "Sin datos",
    };
    return labels[estado] || estado;
  };

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      {/* Header de la sección */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
            <Activity className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              F. Constantes Vitales
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Signos vitales actuales del paciente
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">
                Cargado del: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {formData.constantes_vitales_data && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Datos disponibles
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Grid de constantes vitales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperatura */}
          <div className={`p-4 rounded-lg border ${getEstadoColor(getTemperaturaEstado(formData.constantes_vitales_data?.temperatura))}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-md">
                  <Thermometer className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Temperatura</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(getTemperaturaEstado(formData.constantes_vitales_data?.temperatura))}`}>
                {getEstadoLabel(getTemperaturaEstado(formData.constantes_vitales_data?.temperatura))}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <input
                type="number"
                step="0.1"
                min="35"
                max="42"
                value={formData.constantes_vitales_data?.temperatura || ""}
                onChange={(e) => handleConstanteVitalChange("temperatura", e.target.value)}
                placeholder="36.5"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg font-medium"
              />
              <span className="text-sm text-slate-500 mb-1">°C</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Rango normal: 36-37.5°C
            </p>
          </div>

          {/* Pulso */}
          <div className={`p-4 rounded-lg border ${getEstadoColor(getPulsoEstado(formData.constantes_vitales_data?.pulso))}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-md">
                  <Heart className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Pulso</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(getPulsoEstado(formData.constantes_vitales_data?.pulso))}`}>
                {getEstadoLabel(getPulsoEstado(formData.constantes_vitales_data?.pulso))}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <input
                type="number"
                min="40"
                max="200"
                value={formData.constantes_vitales_data?.pulso || ""}
                onChange={(e) => handleConstanteVitalChange("pulso", e.target.value)}
                placeholder="72"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg font-medium"
              />
              <span className="text-sm text-slate-500 mb-1">/min</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Rango normal: 60-100 lpm
            </p>
          </div>

          {/* Frecuencia Respiratoria */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white rounded-md">
                <Wind className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Frecuencia Respiratoria</span>
            </div>
            <div className="flex items-end gap-2">
              <input
                type="number"
                min="10"
                max="50"
                value={formData.constantes_vitales_data?.frecuencia_respiratoria || ""}
                onChange={(e) =>
                  handleConstanteVitalChange("frecuencia_respiratoria", e.target.value)
                }
                placeholder="16"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg font-medium"
              />
              <span className="text-sm text-slate-500 mb-1">/min</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Rango normal: 12-20 rpm
            </p>
          </div>

          {/* Presión Arterial */}
          <div className={`p-4 rounded-lg border ${getEstadoColor(getPresionEstado(formData.constantes_vitales_data?.presion_arterial))}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-md">
                  <Gauge className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Presión Arterial</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(getPresionEstado(formData.constantes_vitales_data?.presion_arterial))}`}>
                {getEstadoLabel(getPresionEstado(formData.constantes_vitales_data?.presion_arterial))}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full"> 
  <input
    type="text"
    value={formData.constantes_vitales_data?.presion_arterial || ""}
    onChange={(e) => handleConstanteVitalChange("presion_arterial", e.target.value)}
    placeholder="120/80"
    className="min-w-0 flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-lg font-medium font-mono"
  />
  <span className="text-sm text-slate-500 whitespace-nowrap">mmHg</span>
</div>
            <p className="mt-2 text-xs text-slate-500">
              Rango normal: 90-140/60-90
            </p>
          </div>
        </div>

        {/* Leyenda de estados */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600">Normal</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-slate-600">Elevado</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
            <span className="text-slate-600">Alto/Riesgo</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Bajo</span>
          </div>
        </div>

        {/* Mensaje si hay datos pre-cargados */}
        {formData.constantes_vitales_data && lastUpdated && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <Activity className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Datos pre-cargados disponibles
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Estos valores fueron cargados del último registro ({lastUpdated}). 
                  Puede modificarlos según la evaluación actual del paciente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado general si todos los datos están completos */}
        {formData.constantes_vitales_data?.temperatura && 
         formData.constantes_vitales_data?.pulso && 
         formData.constantes_vitales_data?.frecuencia_respiratoria && 
         formData.constantes_vitales_data?.presion_arterial && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <p className="text-sm font-medium text-emerald-800">
                Todas las constantes vitales han sido registradas
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConstantesVitalesSection;