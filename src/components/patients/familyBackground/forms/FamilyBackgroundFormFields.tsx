// src/components/familyBackground/forms/FamilyBackgroundFormFields.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { getPacientes } from "../../../../services/patient/patientService";
import type { 
  IFamilyBackgroundCreate,
} from "../../../../types/familyBackground/IFamilyBackground";
import type { IPaciente } from "../../../../types/patient/IPatient";

interface FamilyBackgroundFormFieldsProps {
  formData: IFamilyBackgroundCreate;
  onChange: (field: keyof IFamilyBackgroundCreate, value: string | boolean) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function FamilyBackgroundFormFields({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: FamilyBackgroundFormFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Query para cargar pacientes
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
        return { count: 0, results: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  const patients = useMemo(() => {
    return patientsResponse?.results || [];
  }, [patientsResponse]);

  useEffect(() => {
    if (formData.paciente && patients.length > 0) {
      const foundPatient = patients.find(p => p.id === formData.paciente);
      if (foundPatient) {
        setSelectedPatient(foundPatient);
      } else {
        setSelectedPatient(null);
      }
    } else {
      setSelectedPatient(null);
    }
  }, [formData.paciente, patients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('[data-dropdown-container]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);
    setIsDropdownOpen(false);
  };

  const getPatientFullName = (patient: IPaciente): string => {
    return `${patient.nombres} ${patient.apellidos}`.trim();
  };

  return (
    <div className="space-y-8">
      {/* ✅ Sección 1: Identificación del Paciente - AZUL */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación del Paciente
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Input de búsqueda */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar paciente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handlePatientSearch}
                  placeholder="Buscar por nombre, apellido o cédula..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Select de pacientes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === "create" ? "Seleccionar Paciente" : "Paciente"}
              {mode === "create" && <span className="text-red-500"> *</span>}
            </label>

            {mode === "create" ? (
              <>
                <div className="relative" data-dropdown-container>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
                      errors.paciente
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    } ${
                      patientsLoading
                        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } text-gray-900 dark:text-gray-100`}
                    disabled={patientsLoading}
                  >
                    <span className={!formData.paciente ? "text-gray-500 dark:text-gray-400" : ""}>
                      {formData.paciente && selectedPatient
                        ? `${getPatientFullName(selectedPatient)} - CI: ${selectedPatient.cedula_pasaporte}`
                        : patientsLoading
                        ? "Cargando pacientes..."
                        : "Seleccionar paciente..."}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && !patientsLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {patients.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron pacientes
                          </p>
                        </div>
                      ) : (
                        patients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient.id)}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                              formData.paciente === patient.id
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-xs font-bold text-white">
                                  {patient.nombres?.charAt(0)?.toUpperCase() || 'P'}
                                  {patient.apellidos?.charAt(0)?.toUpperCase() || ''}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                  formData.paciente === patient.id ? 'text-blue-700 dark:text-blue-300' : ''
                                }`}>
                                  {getPatientFullName(patient)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  CI: {patient.cedula_pasaporte} • {patient.sexo === 'M' ? '👨' : '👩'} {patient.edad} {patient.condicion_edad}
                                </p>
                              </div>
                              {formData.paciente === patient.id && (
                                <svg
                                  className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
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

                {selectedPatient && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-md">
                        {selectedPatient.nombres?.charAt(0)?.toUpperCase() || 'P'}
                        {selectedPatient.apellidos?.charAt(0)?.toUpperCase() || ''}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getPatientFullName(selectedPatient)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          CI: {selectedPatient.cedula_pasaporte} • {selectedPatient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {selectedPatient ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-md">
                      {selectedPatient.nombres?.charAt(0)?.toUpperCase() || 'P'}
                      {selectedPatient.apellidos?.charAt(0)?.toUpperCase() || ''}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getPatientFullName(selectedPatient)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        CI: {selectedPatient.cedula_pasaporte} • {selectedPatient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    {patientsLoading ? "Cargando datos del paciente..." : "No se encontraron datos del paciente"}
                  </div>
                )}
              </div>
            )}
            <input type="hidden" value={formData.paciente} />
          </div>
        </div>
      </div>

      {/* ✅ Sección 2: Antecedentes Familiares con Miembro Afectado - ROJO */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Antecedentes Familiares con Miembro Afectado
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardiopatía Familiar
            </label>
            <select
              value={formData.cardiopatia_familiar}
              onChange={(e) => onChange("cardiopatia_familiar", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hipertensión Arterial Familiar
            </label>
            <select
              value={formData.hipertension_arterial_familiar}
              onChange={(e) => onChange("hipertension_arterial_familiar", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Vascular Familiar
            </label>
            <select
              value={formData.enfermedad_vascular_familiar}
              onChange={(e) => onChange("enfermedad_vascular_familiar", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cáncer Familiar
            </label>
            <select
              value={formData.cancer_familiar}
              onChange={(e) => onChange("cancer_familiar", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Mental Familiar
            </label>
            <select
              value={formData.enfermedad_mental_familiar}
              onChange={(e) => onChange("enfermedad_mental_familiar", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No hay antecedentes</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HERMANOS">Hermanos</option>
              <option value="ABUELOS">Abuelos</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Sección 3: Otros Antecedentes Familiares - NARANJA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Otros Antecedentes Familiares (Especificar)
          </h3>
        </div>

        <div>
        <textarea
          value={formData.otros_antecedentes_familiares}
          onChange={(e) => onChange("otros_antecedentes_familiares", e.target.value)}
          rows={3}
          placeholder="Describa cualquier otro antecedente familiar relevante..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors resize-none"
        />
      </div>
      </div>

 
     

      {/* ✅ Sección: Estado - GRIS */}
      {onActivoChange && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={(e) => onActivoChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Activo
              </label>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              activo
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {activo ? "ACTIVO" : "INACTIVO"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Los antecedentes inactivos no aparecerán en las búsquedas ni en los reportes.
          </p>
        </div>
      )}
    </div>
  );
}
