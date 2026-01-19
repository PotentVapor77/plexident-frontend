// src/components/vitalSigns/forms/VitalSignsFormFields.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPacientes } from "../../../../services/patient/patientService";
import type { IVitalSignsCreate } from "../../../../types/vitalSigns/IVitalSigns";
import type { IPaciente } from "../../../../types/patient/IPatient";

interface VitalSignsFormFieldsProps {
  formData: IVitalSignsCreate;
  onChange: (
    field: keyof IVitalSignsCreate,
    value: string | number | null
  ) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
  pacienteActivo?: IPaciente | null;
}

export function VitalSignsFormFields({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
  pacienteActivo,
}: VitalSignsFormFieldsProps) {
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);

  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients-vital"],
    queryFn: async () => {
      try {
        const response = await getPacientes({
          page_size: 50,
          activo: true,
        });
        return response.data;
      } catch (error) {
        console.error("Error cargando pacientes:", error);
        return { count: 0, results: [] as IPaciente[] };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: mode === "edit",
  });

  const patients: IPaciente[] = useMemo(
    () => patientsResponse?.results || [],
    [patientsResponse]
  );

  useEffect(() => {
    if (mode === "edit" && formData.paciente && patients.length > 0) {
      const found = patients.find((p) => p.id === formData.paciente);
      setSelectedPatient(found || null);
    }
  }, [formData.paciente, patients, mode]);

  useEffect(() => {
    if (mode === "create" && pacienteActivo?.id && !formData.fecha_consulta) {
      const today = new Date().toISOString().split('T')[0];
      onChange('fecha_consulta', today);
    }
  }, [mode, pacienteActivo, formData.fecha_consulta, onChange]);

  const getPatientFullName = (patient: IPaciente): string =>
    `${patient.nombres} ${patient.apellidos}`.trim();

  const parseNumber = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed.replace(",", "."));
    return Number.isNaN(num) ? null : num;
  };

  const mostrarSeccionEstado = Boolean(onActivoChange);

  return (
    <div className="space-y-8">
      {/* Identificación del paciente - AHORA IGUAL PARA CREATE Y EDIT */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación del paciente
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* MODO CREATE CON PACIENTE ACTIVO */}
          {mode === "create" && pacienteActivo && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente
              </label>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                    {(pacienteActivo.nombres?.charAt(0) || "P").toUpperCase()}
                    {(pacienteActivo.apellidos?.charAt(0) || "").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {pacienteActivo.nombres} {pacienteActivo.apellidos}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CI {pacienteActivo.cedula_pasaporte}
                    </p>
                  </div>
                </div>

                {/* Badge de paciente fijado */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 shadow-sm">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Paciente fijado activamente
                  </span>
                </div>

                {/* Nota informativa */}
                <div className="mt-4 flex gap-3 rounded-lg bg-gradient-to-r from-blue-100/80 to-blue-50 p-3 dark:from-blue-900/30 dark:to-blue-900/20">
                  <span className="text-base flex-shrink-0 mt-0.5">📌</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                      <span className="font-semibold">Nota:</span> Este registro
                      se asociará automáticamente al paciente fijado. Para
                      cambiar de paciente, regrese a la pestaña "Gestión de
                      Pacientes" y fije otro paciente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODO CREATE SIN PACIENTE ACTIVO */}
          {mode === "create" && !pacienteActivo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    No hay paciente fijado
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Para fijar un paciente, vaya a la pestaña "Gestión de
                    Pacientes" y haga clic en el botón 📌 junto al paciente
                    deseado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODO EDIT - AHORA CON EL MISMO DISEÑO QUE CREATE */}
          {mode === "edit" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente
              </label>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                {selectedPatient ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                        {(selectedPatient.nombres?.charAt(0) || "P").toUpperCase()}
                        {(selectedPatient.apellidos?.charAt(0) || "").toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
                          {getPatientFullName(selectedPatient)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          CI {selectedPatient.cedula_pasaporte}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {selectedPatient.sexo === "M"
                            ? "👨 Masculino"
                            : "👩 Femenino"}{" "}
                          • Edad: {selectedPatient.edad}{" "}
                          {selectedPatient.condicion_edad}
                        </p>
                      </div>
                    </div>

                    {/* Badge de paciente (en modo edit) */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 shadow-sm">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Paciente fijado activamente
                      </span>
                    </div>

                    {/* Nota informativa para modo edit */}
                    <div className="mt-4 flex gap-3 rounded-lg bg-gradient-to-r from-blue-100/80 to-blue-50 p-3 dark:from-blue-900/30 dark:to-blue-900/20">
                      <span className="text-base flex-shrink-0 mt-0.5">📌</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                          <span className="font-semibold">Nota:</span>  Este registro se asociará automáticamente al paciente fijado. Para cambiar de paciente, regrese a la pestaña "Gestión de Pacientes" y fije otro paciente.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {patientsLoading
                        ? "Cargando datos del paciente..."
                        : "No se encontraron datos del paciente"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Datos de Consulta */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Datos de Consulta
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Fecha de Consulta */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Consulta
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.fecha_consulta || ''}
                onChange={(e) => onChange('fecha_consulta', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {errors.fecha_consulta && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.fecha_consulta}
              </p>
            )}
          </div>

          {/* Motivo de Consulta */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo de Consulta
            </label>
            <textarea
              value={formData.motivo_consulta || ''}
              onChange={(e) => onChange('motivo_consulta', e.target.value)}
              placeholder="Describa el motivo principal de la visita..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            />
            {errors.motivo_consulta && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.motivo_consulta}
              </p>
            )}
          </div>

          {/* Enfermedad Actual */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enfermedad Actual
            </label>
            <textarea
              value={formData.enfermedad_actual || ''}
              onChange={(e) => onChange('enfermedad_actual', e.target.value)}
              placeholder="Describa síntomas, cronología, localización, intensidad..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            />
            {errors.enfermedad_actual && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.enfermedad_actual}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => onChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales del profesional..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            />
          </div>
        </div>
      </div>

    {/* Signos vitales */}
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-8 w-2 rounded-full bg-gradient-to-b from-rose-500 to-rose-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Signos vitales
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Temperatura */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Temperatura (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.temperatura ?? ""}
            onChange={(e) =>
              onChange("temperatura", parseNumber(e.target.value))
            }
            placeholder="Ej: 36.5"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Normal: 36.1°C - 37.2°C | Fiebre: ≥37.5°C
          </p>
          {errors.temperatura && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.temperatura}
            </p>
          )}
        </div>

        {/* Pulso */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pulso (lpm)
          </label>
          <input
            type="number"
            value={formData.pulso ?? ""}
            onChange={(e) => onChange("pulso", parseNumber(e.target.value))}
            placeholder="Ej: 72"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Adulto normal: 60-100 lpm | Bradicardia: &lt;60 | Taquicardia: &gt;100
          </p>
          {errors.pulso && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.pulso}
            </p>
          )}
        </div>

        {/* Frecuencia respiratoria */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Frecuencia respiratoria (rpm)
          </label>
          <input
            type="number"
            value={formData.frecuencia_respiratoria ?? ""}
            onChange={(e) =>
              onChange("frecuencia_respiratoria", parseNumber(e.target.value))
            }
            placeholder="Ej: 18"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Adulto normal: 12-20 rpm | Bradipnea: &lt;12 | Taquipnea: &gt;20
          </p>
          {errors.frecuencia_respiratoria && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.frecuencia_respiratoria}
            </p>
          )}
        </div>

        {/* Presión arterial */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Presión arterial (mmHg)
          </label>
          <input
            type="text"
            value={formData.presion_arterial ?? ""}
            onChange={(e) => onChange("presion_arterial", e.target.value)}
            placeholder="Ej: 120/80"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Normal: &lt;120/80 mmHg | HTA: ≥140/90 mmHg
          </p>
          {errors.presion_arterial && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.presion_arterial}
            </p>
          )}
        </div>
      </div>
    </div>

      {/* Estado */}
      {mostrarSeccionEstado && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                id="activo"
                type="checkbox"
                checked={activo}
                onChange={(e) => onActivoChange?.(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-900"
              />
              <label
                htmlFor="activo"
                className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Activo
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  activo
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200"
                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200"
                }`}
              >
                {activo ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los
            reportes.
          </p>
        </div>
      )}
    </div>
  );
}