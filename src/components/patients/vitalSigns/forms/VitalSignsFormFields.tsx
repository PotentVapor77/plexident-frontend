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

  // Solo cargar pacientes en modo edit
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
      {/* Identificación del paciente */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación del paciente
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* ✅ MODO CREATE CON PACIENTE ACTIVO - DISEÑO MEJORADO */}
          {mode === "create" && pacienteActivo && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente
              </label>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl shadow-md">
                    {(pacienteActivo.nombres?.charAt(0) || "P").toUpperCase()}
                    {(pacienteActivo.apellidos?.charAt(0) || "").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base text-gray-900 dark:text-white">
                      {pacienteActivo.nombres} {pacienteActivo.apellidos}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CI {pacienteActivo.cedula_pasaporte}
                    </p>
                  </div>
                </div>

                {/* Badge de paciente fijado */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
                <div className="mt-4 flex gap-2 rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
                  <span className="text-base flex-shrink-0">📌</span>
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

          {/* ✅ MODO CREATE SIN PACIENTE ACTIVO - SOLO MENSAJE */}
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

          {/* ✅ MODO EDIT */}
          {mode === "edit" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {selectedPatient ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium shadow-md">
                      {(selectedPatient.nombres?.charAt(0) || "P").toUpperCase()}
                      {(selectedPatient.apellidos?.charAt(0) || "").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {getPatientFullName(selectedPatient)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        CI {selectedPatient.cedula_pasaporte} •{" "}
                        {selectedPatient.sexo === "M"
                          ? "👨 Masculino"
                          : "👩 Femenino"}{" "}
                        • Edad: {selectedPatient.edad}{" "}
                        {selectedPatient.condicion_edad}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="italic text-gray-500 dark:text-gray-400">
                    {patientsLoading
                      ? "Cargando datos del paciente..."
                      : "No se encontraron datos del paciente"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signos vitales */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-red-500 to-red-600" />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
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
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                id="activo"
                type="checkbox"
                checked={activo}
                onChange={(e) => onActivoChange?.(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="activo"
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Activo
              </label>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                activo
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {activo ? "ACTIVO" : "INACTIVO"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los
            reportes.
          </p>
        </div>
      )}
    </div>
  );
}
