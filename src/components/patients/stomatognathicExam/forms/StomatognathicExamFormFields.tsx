// src/components/stomatognathicExam/forms/StomatognathicExamFormFields.tsx

import { useState, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPacientes } from '../../../../services/patient/patientService';
import type {
  IStomatognathicExamCreate,
} from '../../../../types/stomatognathicExam/IStomatognathicExam';
import type { IPaciente } from '../../../../types/patient/IPatient';

interface StomatognathicExamFormFieldsProps {
  formData: Partial<IStomatognathicExamCreate>;
  onChange: (field: keyof IStomatognathicExamCreate, value: string | boolean | null) => void;
  errors: Record<string, string>;
  mode: 'create' | 'edit';
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

interface RegionConfig {
  label: string;
  baseField: string;
  isATM?: boolean;
}

const REGIONS: RegionConfig[] = [
  // ✅ ATM como primera región (sin estilo especial)
  { label: 'ATM (Articulación Temporomandibular)', baseField: 'atm', isATM: true },
  // ✅ Todas las demás regiones
  { label: 'Mejillas', baseField: 'mejillas' },
  { label: 'Maxilar Inferior', baseField: 'maxilar_inferior' },
  { label: 'Maxilar Superior', baseField: 'maxilar_superior' },
  { label: 'Paladar', baseField: 'paladar' },
  { label: 'Piso de Boca', baseField: 'piso_boca' },
  { label: 'Carrillos', baseField: 'carrillos' },
  { label: 'Glándulas Salivales', baseField: 'glandulas_salivales' },
  { label: 'Ganglios de Cabeza y Cuello', baseField: 'ganglios' },
  { label: 'Lengua', baseField: 'lengua' },
  { label: 'Labios', baseField: 'labios' },
];

function RegionSection({
  label,
  baseField,
  formData,
  onChange,
  isATM = false,
}: {
  label: string;
  baseField: string;
  formData: Partial<IStomatognathicExamCreate>;
  onChange: (field: keyof IStomatognathicExamCreate, value: string | boolean | null) => void;
  isATM?: boolean;
}) {
  const cpField = `${baseField}_cp` as keyof IStomatognathicExamCreate;
  const spField = `${baseField}_sp` as keyof IStomatognathicExamCreate;
  
  const descField = isATM 
    ? 'atm_observacion' as keyof IStomatognathicExamCreate
    : `${baseField}_descripcion` as keyof IStomatognathicExamCreate;
  
  const abscesoField = `${baseField}_absceso` as keyof IStomatognathicExamCreate;
  const fibromaField = `${baseField}_fibroma` as keyof IStomatognathicExamCreate;
  const herpesField = `${baseField}_herpes` as keyof IStomatognathicExamCreate;
  const ulceraField = `${baseField}_ulcera` as keyof IStomatognathicExamCreate;
  const otraField = `${baseField}_otra_patologia` as keyof IStomatognathicExamCreate;
  
  const isCPChecked = Boolean(formData[cpField]);
  const isSPChecked = Boolean(formData[spField]);

  const handleCPChange = (checked: boolean) => {
    onChange(cpField, checked);
    if (checked) {
      onChange(spField, false);
    }
  };

  const handleSPChange = (checked: boolean) => {
    onChange(spField, checked);
    if (checked) {
      onChange(cpField, false);
      onChange(abscesoField, false);
      onChange(fibromaField, false);
      onChange(herpesField, false);
      onChange(ulceraField, false);
      onChange(otraField, false);
      onChange(descField, '');
    }
  };

  // ✅ ESTILOS UNIFICADOS: Ya no hay estilo especial para ATM
  const borderClass = "border border-gray-200 dark:border-gray-700";
  const titleClass = "text-sm font-semibold text-gray-900 dark:text-white";

  return (
    <div className={`rounded-lg p-4 ${borderClass}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={titleClass}>{label}</h4>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCPChecked}
              onChange={(e) => handleCPChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              CP (Con Patología)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSPChecked}
              onChange={(e) => handleSPChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              SP (Sin Patología)
            </span>
          </label>
        </div>
      </div>

      {isCPChecked && (
        <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg dark:bg-orange-900/20 dark:border-orange-700 animate-in slide-in-from-top">
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3">
              Patologías específicas:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[abscesoField])}
                  onChange={(e) => onChange(abscesoField, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Absceso</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[fibromaField])}
                  onChange={(e) => onChange(fibromaField, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Fibroma</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[herpesField])}
                  onChange={(e) => onChange(herpesField, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Herpes</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[ulceraField])}
                  onChange={(e) => onChange(ulceraField, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Úlcera</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[otraField])}
                  onChange={(e) => onChange(otraField, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Otra patología</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isATM ? 'Observación:' : 'Descripción:'}
            </label>
            <textarea
              value={(formData[descField] as string) || ''}
              onChange={(e) => onChange(descField, e.target.value)}
              placeholder={isATM ? "Describa la observación de ATM..." : "Describa la patología..."}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function StomatognathicExamFormFields({
  formData,
  onChange,
  errors,
  mode,
  activo = true,
  onActivoChange,
}: StomatognathicExamFormFieldsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      try {
        const response = await getPacientes({ 
          search: searchTerm || undefined, 
          page_size: 50, 
          activo: true 
        });
        return response.data;
      } catch (error) {
        console.error('Error cargando pacientes', error);
        return { count: 0, results: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  const patients = useMemo(() => patientsResponse?.results || [], [patientsResponse]);

  useEffect(() => {
    if (formData.paciente && patients.length > 0) {
      const found = patients.find((p: IPaciente) => p.id === formData.paciente);
      setSelectedPatient(found || null);
    } else {
      setSelectedPatient(null);
    }
  }, [formData.paciente, patients]);

  const handlePatientSelect = (patientId: string) => {
    onChange('paciente', patientId);
    const patient = patients.find((p: IPaciente) => p.id === patientId) || null;
    setSelectedPatient(patient);
    setIsDropdownOpen(false);
  };

  const getPatientFullName = (patient: IPaciente) => {
    return `${patient.nombres} ${patient.apellidos}`.trim();
  };

  const sinPatologia = formData.examen_sin_patologia ?? false;
  const tienePatologias = !sinPatologia;
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
          {mode === 'create' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar paciente
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, cédula o documento..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
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
              {mode === 'create' ? 'Seleccionar paciente' : 'Paciente'}
              {mode === 'create' && <span className="text-red-500">*</span>}
            </label>
            {mode === 'create' ? (
              <div className="relative" data-dropdown-container>
                <button
                  type="button"
                  onClick={() => !patientsLoading && setIsDropdownOpen((prev) => !prev)}
                  disabled={patientsLoading}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-blue-500 dark:text-gray-100 ${
                    errors.paciente
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    patientsLoading
                      ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                      : 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>
                    {formData.paciente && selectedPatient
                      ? `${getPatientFullName(selectedPatient)} - CI: ${selectedPatient.cedula_pasaporte}`
                      : patientsLoading
                      ? 'Cargando pacientes...'
                      : 'Seleccionar paciente...'}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transform transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && !patientsLoading && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-900">
                    {patients.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron pacientes
                      </div>
                    ) : (
                      patients.map((patient: IPaciente) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient.id)}
                          className={`flex w-full items-center justify-between border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 dark:border-gray-800 ${
                            formData.paciente === patient.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-gray-900 hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-bold text-white shadow-md">
                              {patient.nombres?.charAt(0) || 'P'}
                              {patient.apellidos?.charAt(0) || ''}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{getPatientFullName(patient)}</p>
                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                CI: {patient.cedula_pasaporte} • {patient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {patient.edad}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {selectedPatient ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 font-medium text-white shadow-md">
                      {selectedPatient.nombres?.charAt(0) || 'P'}
                      {selectedPatient.apellidos?.charAt(0) || ''}
                    </div>
                    <div>
                      <p className="font-medium">{getPatientFullName(selectedPatient)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        CI: {selectedPatient.cedula_pasaporte} • {selectedPatient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} • Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="italic text-gray-500 dark:text-gray-400">
                    {patientsLoading ? 'Cargando datos del paciente...' : 'No se encontraron datos del paciente'}
                  </p>
                )}
              </div>
            )}
            {errors.paciente && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paciente}</p>
            )}
          </div>
        </div>
      </div>

      {/* Checkbox principal sin patología */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <input
            id="examen_sin_patologia"
            type="checkbox"
            checked={sinPatologia}
            onChange={(e) => onChange('examen_sin_patologia', e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="examen_sin_patologia" className="text-base font-medium text-gray-900 dark:text-white cursor-pointer">
            Examen sin patología
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 ml-9">
          Si se marca esta opción, todas las regiones se considerarán sin patología.
        </p>
      </div>

      {/* Alerta de patologías detectadas */}
      {tienePatologias && (
        <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-6 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                Se han detectado patologías en el examen
              </h3>
              <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                Asegúrese de describir todas las patologías encontradas en cada región.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ TODAS LAS REGIONES INCLUYENDO ATM EN UNA MISMA SECCIÓN */}
      {tienePatologias && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Regiones Estomatognáticas
            </h3>
          </div>
          <div className="space-y-4">
            {REGIONS.map((region) => (
              <RegionSection
                key={region.label}
                label={region.label}
                baseField={region.baseField}
                formData={formData}
                onChange={onChange}
                isATM={region.isATM}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado */}
      {mostrarSeccionEstado && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado</h3>
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
              <label htmlFor="activo" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Activo
              </label>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                activo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {activo ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los reportes.
          </p>
        </div>
      )}
    </div>
  );
}