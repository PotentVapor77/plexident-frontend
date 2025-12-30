// src/components/personalBackground/forms/PersonalBackgroundFormFields.tsx
// CÓDIGO COMPLETO CORREGIDO - SIN ANY

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import type { IPersonalBackgroundCreate } from "../../../../types/personalBackground/IPersonalBackground";

//  Tipo específico para pacientes SIN ANY
interface Patient {
  id: string;
  fullName?: string;
  name?: string;
  document?: string;
}

interface PersonalBackgroundFormFieldsProps {
  formData: IPersonalBackgroundCreate;
  onChange: (field: keyof IPersonalBackgroundCreate, value: string) => void;
  errors: Record<string, string>;
  mode: "create" | "edit";
}

export default function PersonalBackgroundFormFields({
  formData,
  onChange,
  errors,
  mode,
}: PersonalBackgroundFormFieldsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Query para pacientes con búsqueda - TIPADO COMPLETO
  const { data: patients = [] as Patient[], isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm)}&limit=50`);
      if (!response.ok) throw new Error("Error cargando pacientes");
      return response.json() as Promise<Patient[]>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: searchTerm.length > 0 || mode === "create",
  });

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onChange("paciente", "");
  };

  return (
    <div className="space-y-8">
      {/* Sección: Identificación del Paciente - CON BUSQUEDA + SELECT */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación del Paciente
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Input de búsqueda encima del select */}
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
                placeholder="Buscar por nombre, ID o documento..."
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

          {/* Select de pacientes - TIPADO COMPLETO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID del Paciente <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paciente}
              onChange={(e) => onChange("paciente", e.target.value)}
              disabled={mode === "edit" || patientsLoading}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.paciente
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } ${
                mode === "edit" || patientsLoading
                  ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  : "bg-white dark:bg-gray-900"
              } text-gray-900 dark:text-gray-100`}
            >
              <option value="">Seleccionar paciente...</option>
              {patientsLoading ? (
                <option value="" disabled>Cargando pacientes...</option>
              ) : patients.length === 0 ? (
                <option value="" disabled>No se encontraron pacientes</option>
              ) : (
                patients.map((patient: Patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.id} - {patient.fullName || patient.name} 
                    {patient.document ? ` (${patient.document})` : ""}
                  </option>
                ))
              )}
            </select>
            {errors.paciente && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.paciente}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sección: Alergias */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alergias
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alergia a Antibiótico
            </label>
            <select
              value={formData.alergia_antibiotico}
              onChange={(e) => onChange("alergia_antibiotico", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NINGUNA">Ninguna</option>
              <option value="PENICILINA">Penicilina</option>
              <option value="SULFA">Sulfa</option>
              <option value="ANESTESIALOCAL">Anestesia local</option>
              <option value="ANESTESIAGENERAL">Anestesia general</option>
              <option value="LATEX">Látex</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alergia a Anestesia
            </label>
            <select
              value={formData.alergia_anestesia}
              onChange={(e) => onChange("alergia_anestesia", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="NINGUNA">Ninguna</option>
              <option value="PENICILINA">Penicilina</option>
              <option value="SULFA">Sulfa</option>
              <option value="ANESTESIALOCAL">Anestesia local</option>
              <option value="ANESTESIAGENERAL">Anestesia general</option>
              <option value="LATEX">Látex</option>
              <option value="OTRO">Otro</option>
            </select>
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
              <option value="SI">Sí</option>
              <option value="NO">No</option>
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
              <option value="POSITIVO">Positivo</option>
              <option value="NEGATIVO">Negativo</option>
              <option value="DESCONOCIDO">Desconocido</option>
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
              <option value="ACTIVA">Activa</option>
              <option value="TRATADA">Tratada anteriormente</option>
              <option value="NUNCA">Nunca ha tenido</option>
              <option value="DESCONOCIDO">Desconocido</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asma
            </label>
            <select
              value={formData.asma}
              onChange={(e) => onChange("asma", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="LEVE">Leve intermitente</option>
              <option value="MODERADA">Moderada persistente</option>
              <option value="SEVERA">Severa persistente</option>
              <option value="NO">No tiene</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diabetes
            </label>
            <select
              value={formData.diabetes}
              onChange={(e) => onChange("diabetes", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="TIPO1">Tipo 1</option>
              <option value="TIPO2">Tipo 2</option>
              <option value="GESTACIONAL">Gestacional</option>
              <option value="PREDIABETICO">Prediabético</option>
              <option value="NO">No tiene</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hipertensión Arterial
            </label>
            <select
              value={formData.hipertension_arterial}
              onChange={(e) => onChange("hipertension_arterial", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="CONTROLADA">Controlada con medicación</option>
              <option value="NOCONTROLADA">No controlada</option>
              <option value="SINTRATAMIENTO">Sin tratamiento</option>
              <option value="NO">No tiene</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedad Cardíaca
            </label>
            <select
              value={formData.enfermedad_cardiaca}
              onChange={(e) => onChange("enfermedad_cardiaca", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="CONGENITA">Congénita</option>
              <option value="ADQUIRIDA">Adquirida</option>
              <option value="ARRITMIA">Arritmia</option>
              <option value="INSUFICIENCIA">Insuficiencia cardíaca</option>
              <option value="OTRA">Otra</option>
              <option value="NO">No tiene</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
