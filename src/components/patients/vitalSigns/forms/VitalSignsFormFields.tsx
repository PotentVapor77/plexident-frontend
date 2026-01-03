// src/components/vitalSigns/forms/VitalSignsFormFields.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { getPacientes } from "../../../../services/patient/patientService";
import type { IVitalSignsCreate } from "../../../../types/vitalSigns/IVitalSigns"; // [file:1]
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
}

export function VitalSignsFormFields({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: VitalSignsFormFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", searchTerm],
    queryFn: async () => {
      try {
        const response = await getPacientes({
          search: searchTerm || undefined,
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
    enabled: true,
  });

  const patients: IPaciente[] = useMemo(
    () => patientsResponse?.results || [],
    [patientsResponse]
  );

  useEffect(() => {
    if (formData.paciente && patients.length > 0) {
      const found = patients.find(p => p.id === formData.paciente);
      setSelectedPatient(found || null);
    } else {
      setSelectedPatient(null);
    }
  }, [formData.paciente, patients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest("[data-dropdown-container]")) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handlePatientSelect = (patientId: string) => {
    onChange("paciente", patientId);
    const patient = patients.find(p => p.id === patientId) || null;
    setSelectedPatient(patient);
    setIsDropdownOpen(false);
  };

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
          {mode === "create" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar paciente
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handlePatientSearch}
                  placeholder="Buscar por nombre, cédula o documento..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "create" ? "Seleccionar paciente" : "Paciente"}
              {mode === "create" && <span className="text-red-500"> *</span>}
            </label>

            {mode === "create" ? (
              <>
                <div
                  className="relative"
                  data-dropdown-container
                >
                  <button
                    type="button"
                    onClick={() => !patientsLoading && setIsDropdownOpen(prev => !prev)}
                    disabled={patientsLoading}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-blue-500 dark:text-gray-100 ${
                      errors.paciente
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    } ${
                      patientsLoading
                        ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                        : "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>
                      {formData.paciente && selectedPatient
                        ? `${getPatientFullName(selectedPatient)} - CI: ${
                            selectedPatient.cedula_pasaporte
                          }`
                        : patientsLoading
                        ? "Cargando pacientes..."
                        : "Seleccionar paciente..."}
                    </span>
                    <svg
                      className={`h-5 w-5 transform transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && !patientsLoading && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-900">
                      {patients.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No se encontraron pacientes
                        </div>
                      ) : (
                        patients.map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient.id)}
                            className={`flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 dark:border-gray-800 ${
                              formData.paciente === patient.id
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "text-gray-900 hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-blue-900/20"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white shadow-md">
                                {(patient.nombres?.charAt(0) || "P").toUpperCase()}
                                {(patient.apellidos?.charAt(0) || "").toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                  {getPatientFullName(patient)}
                                </p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                  CI {patient.cedula_pasaporte} •{" "}
                                  {patient.sexo === "M" ? "👨" : "👩"} {patient.edad}{" "}
                                  {patient.condicion_edad}
                                </p>
                              </div>
                            </div>
                            {formData.paciente === patient.id && (
                              <svg
                                className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4A1 1 0 014.707 9.293L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.paciente && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.paciente}
                  </p>
                )}
              </>
            ) : (
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
            )}
          </div>
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
              onChange={e =>
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
              onChange={e => onChange("pulso", parseNumber(e.target.value))}
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
              onChange={e =>
                onChange("frecuencia_respiratoria", parseNumber(e.target.value))
              }
              placeholder="Ej: 18"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            {errors.frecuenciarespiratoria && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.frecuenciarespiratoria}

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
              onChange={e => onChange("presion_arterial", e.target.value)}
              placeholder="Ej: 120/80"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

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
                onChange={e => onActivoChange?.(e.target.checked)}
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
