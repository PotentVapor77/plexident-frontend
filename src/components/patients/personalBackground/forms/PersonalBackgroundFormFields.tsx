// src/components/personalBackground/forms/PersonalBackgroundFormFields.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { getPacientes } from "../../../../services/patient/patientService";
import type { IPersonalBackgroundCreate } from "../../../../types/personalBackground/IPersonalBackground";
import type { IPaciente } from "../../../../types/patient/IPatient";

interface PersonalBackgroundFormFieldsProps {
  formData: IPersonalBackgroundCreate;
  onChange: (field: keyof IPersonalBackgroundCreate, value: string) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function PersonalBackgroundFormFields({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: PersonalBackgroundFormFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);

  // Estados para campos "OTRO"
  const [alergiaAntibioticoOtro, setAlergiaAntibioticoOtro] = useState("");
  const [alergiaAnestesiaOtro, setAlergiaAnestesiaOtro] = useState("");

  // Query para cargar pacientes
  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", searchTerm],
    queryFn: async () => {
      try {
        const response = await getPacientes({
          search: searchTerm || undefined,
          page_size: 20,
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

  // Usar useMemo para estabilizar la referencia de patients
  const patients = useMemo(() => {
    return patientsResponse?.results || [];
  }, [patientsResponse]);

  // Buscar el paciente seleccionado cuando cambia formData.paciente
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

  // Manejar cambio de alergia a antibiótico
  const handleAlergiaAntibioticoChange = (value: string) => {
    if (value === "OTRO") {
      onChange("alergia_antibiotico", "OTRO");
    } else {
      onChange("alergia_antibiotico", value);
      onChange("alergia_antibiotico_otro", ""); // ✅ Limpiar campo otro
    }
  };

  // Manejar cambio de alergia a anestesia
  const handleAlergiaAnestesiaChange = (value: string) => {
    if (value === "OTRO") {
      onChange("alergia_anestesia", "OTRO");
    } else {
      onChange("alergia_anestesia", value);
      onChange("alergia_anestesia_otro", ""); // ✅ Limpiar campo otro
    }
  };

  // Manejar cambio en input "OTRO" de antibiótico
  const handleAntibioticoOtroChange = (value: string) => {
    setAlergiaAntibioticoOtro(value);
    onChange("alergia_antibiotico_otro", value); // ✅ Actualizar campo correcto
  };

  // Manejar cambio en input "OTRO" de anestesia
  const handleAnestesiaOtroChange = (value: string) => {
    setAlergiaAnestesiaOtro(value);
    onChange("alergia_anestesia_otro", value); // ✅ Actualizar campo correcto
  };

  // ✅ NUEVO: Handler para diabetes_otro
  const handleDiabetesChange = (value: string) => {
    onChange("diabetes", value);
    if (value !== "OTRO") {
      onChange("diabetes_otro", ""); // Limpiar si no es OTRO
    }
  };

  const handleDiabetesOtroChange = (value: string) => {
    onChange("diabetes_otro", value);
  };

  // ✅ NUEVO: Handler para enfermedad_cardiaca_otro
  const handleEnfermedadCardiacaChange = (value: string) => {
    onChange("enfermedad_cardiaca", value);
    if (value !== "OTRA") {
      onChange("enfermedad_cardiaca_otro", ""); // Limpiar si no es OTRA
    }
  };

  const handleEnfermedadCardiacaOtroChange = (value: string) => {
    onChange("enfermedad_cardiaca_otro", value);
  };

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
  };

  // Función para obtener nombre completo del paciente
  const getPatientFullName = (patient: IPaciente): string => {
    return `${patient.nombres} ${patient.apellidos}`.trim();
  };

  // Determinar si mostrar input para "OTRO" en antibiótico
  const mostrarInputAntibioticoOtro = formData.alergia_antibiotico === "OTRO";

  // Determinar si mostrar input para "OTRO" en anestesia
  const mostrarInputAnestesiaOtro = formData.alergia_anestesia === "OTRO";

  // ✅ Determinar si mostrar input para diabetes OTRO
  const mostrarInputDiabetesOtro = formData.diabetes === "OTRO";

  // ✅ Determinar si mostrar input para enfermedad cardíaca OTRA
  const mostrarInputEnfermedadCardiacaOtro = formData.enfermedad_cardiaca === "OTRA";

  return (
    <div className="space-y-8">
      {/* Sección: Identificación del Paciente */}
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
                  placeholder="Buscar por nombre, cédula o documento..."
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

          {/* Select de pacientes o display del paciente actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === "create" ? "Seleccionar Paciente" : "Paciente"}
              {mode === "create" && <span className="text-red-500"> *</span>}
            </label>

            {mode === "create" ? (
              <>
                <select
                  value={formData.paciente}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  disabled={patientsLoading}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.paciente
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } ${
                    patientsLoading
                      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      : "bg-white dark:bg-gray-900"
                  } text-gray-900 dark:text-gray-100`}
                >
                  <option value="">
                    {patientsLoading
                      ? "Cargando pacientes..."
                      : "Seleccionar paciente..."}
                  </option>
                  {!patientsLoading && patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {getPatientFullName(patient)} - CI: {patient.cedula_pasaporte}
                    </option>
                  ))}
                </select>
                {errors.paciente && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.paciente}
                  </p>
                )}

                {/* Mostrar información del paciente seleccionado */}
                {selectedPatient && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {selectedPatient.nombres?.charAt(0)?.toUpperCase() || 'P'}
                        {selectedPatient.apellidos?.charAt(0)?.toUpperCase() || ''}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getPatientFullName(selectedPatient)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          CI: {selectedPatient.cedula_pasaporte} • {selectedPatient.sexo === 'M' ? ' Masculino' : ' Femenino'} • Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Modo edición: mostrar información del paciente (solo lectura)
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {selectedPatient ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {selectedPatient.nombres?.charAt(0)?.toUpperCase() || 'P'}
                      {selectedPatient.apellidos?.charAt(0)?.toUpperCase() || ''}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getPatientFullName(selectedPatient)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        CI: {selectedPatient.cedula_pasaporte} • {selectedPatient.sexo === 'M' ? ' Masculino' : ' Femenino'} • Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
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

      {/* CONTINÚA EN LA SIGUIENTE PARTE... */}
            {/* Sección: Alergias */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alergias</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alergia a Antibiótico */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alergia a Antibiótico
            </label>
            <select
              value={formData.alergia_antibiotico}
              onChange={(e) => handleAlergiaAntibioticoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="PENICILINA">Penicilina</option>
              <option value="SULFA">Sulfa</option>
              <option value="OTRO">Otro (especificar)</option>
            </select>

            {/* Input para especificar "OTRO" */}
            {mostrarInputAntibioticoOtro && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especificar alergia a antibiótico
                </label>
                <input
                  type="text"
                  value={alergiaAntibioticoOtro}
                  onChange={(e) => handleAntibioticoOtroChange(e.target.value)}
                  placeholder="Ej: Amoxicilina, Cefalexina, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Alergia a Anestesia */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alergia a Anestesia
            </label>
            <select
              value={formData.alergia_anestesia}
              onChange={(e) => handleAlergiaAnestesiaChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="LOCAL">Anestesia local</option>
              <option value="GENERAL">Anestesia general</option>
              <option value="AMBAS">Ambas</option>
              <option value="OTRO">Otro (especificar)</option>
            </select>

            {/* Input para especificar "OTRO" */}
            {mostrarInputAnestesiaOtro && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especificar alergia a anestesia
                </label>
                <input
                  type="text"
                  value={alergiaAnestesiaOtro}
                  onChange={(e) => handleAnestesiaOtroChange(e.target.value)}
                  placeholder="Ej: Lidocaína, Bupivacaína, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Condiciones Hemorrágicas e Infecciosas */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Condiciones Hemorrágicas e Infecciosas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hemorragias
            </label>
            <select
              value={formData.hemorragias}
              onChange={(e) => onChange("hemorragias", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="SI">Sí</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              VIH/SIDA
            </label>
            <select
              value={formData.vih_sida}
              onChange={(e) => onChange("vih_sida", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NEGATIVO">Negativo</option>
              <option value="POSITIVO">Positivo</option>
              <option value="DESCONOCIDO">No se ha realizado prueba</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tuberculosis
            </label>
            <select
              value={formData.tuberculosis}
              onChange={(e) => onChange("tuberculosis", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NUNCA">Nunca</option>
              <option value="TRATADA">Tratada anteriormente</option>
              <option value="ACTIVA">Activa</option>
              <option value="DESCONOCIDO">No está seguro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sección: Enfermedades Crónicas */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Enfermedades Crónicas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asma
            </label>
            <select
              value={formData.asma}
              onChange={(e) => onChange("asma", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="LEVE">Leve</option>
              <option value="MODERADA">Moderada</option>
              <option value="SEVERA">Severa</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diabetes
            </label>
            <select
              value={formData.diabetes}
              onChange={(e) => handleDiabetesChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="PREDIABETICO">Prediabético</option>
              <option value="TIPO_1">Tipo 1</option>
              <option value="TIPO_2">Tipo 2</option>
              <option value="GESTACIONAL">Gestacional</option>
              <option value="OTRO">Otro (especificar)</option>
            </select>

            {/* ✅ Input para diabetes_otro */}
            {mostrarInputDiabetesOtro && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especificar tipo de diabetes
                </label>
                <input
                  type="text"
                  value={formData.diabetes_otro || ""}
                  onChange={(e) => handleDiabetesOtroChange(e.target.value)}
                  placeholder="Ej: LADA, MODY, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hipertensión Arterial
            </label>
            <select
              value={formData.hipertension_arterial}
              onChange={(e) => onChange("hipertension_arterial", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="CONTROLADA">Controlada</option>
              <option value="NO_CONTROLADA">No controlada</option>
              <option value="SIN_TRATAMIENTO">Sin tratamiento</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Cardíaca
            </label>
            <select
              value={formData.enfermedad_cardiaca}
              onChange={(e) => handleEnfermedadCardiacaChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NO">No</option>
              <option value="ARRITMIA">Arritmia</option>
              <option value="INSUFICIENCIA">Insuficiencia cardíaca</option>
              <option value="CONGENITA">Congénita</option>
              <option value="OTRA">Otra (especificar)</option>
            </select>

            {/* ✅ Input para enfermedad_cardiaca_otro */}
            {mostrarInputEnfermedadCardiacaOtro && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especificar enfermedad cardíaca
                </label>
                <input
                  type="text"
                  value={formData.enfermedad_cardiaca_otro || ""}
                  onChange={(e) => handleEnfermedadCardiacaOtroChange(e.target.value)}
                  placeholder="Ej: Valvulopatía, Miocardiopatía, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Estado (mostrar en ambos modos si está disponible onActivoChange) */}
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
