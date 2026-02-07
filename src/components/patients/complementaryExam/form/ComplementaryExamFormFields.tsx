// src/components/complementaryExam/form/ComplementaryExamFormFields.tsx

import { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getPacientes } from '../../../../services/patient/patientService';
import type { IPaciente } from '../../../../types/patient/IPatient';
import {
  INFORME_EXAMENES_OPTIONS,
  PEDIDO_EXAMENES_OPTIONS,
  type IComplementaryExamCreate,
} from '../../../../types/complementaryExam/IComplementaryExam';

interface ComplementaryExamFormFieldsProps {
  form: UseFormReturn<IComplementaryExamCreate>;
  mode?: 'create' | 'edit';
  activo?: boolean;
  onActivoChange?: (checked: boolean) => void;
}

export function ComplementaryExamFormFields({
  form,
  mode = 'create',
  activo = true,
  onActivoChange,
}: ComplementaryExamFormFieldsProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const pedidoExamenes = watch('pedido_examenes');
  const informeExamenes = watch('informe_examenes');
  const pacienteId = watch('paciente');

  const [selectedPatient, setSelectedPatient] = useState<IPaciente | null>(null);

  // Cargar pacientes en ambos modos (create y edit)
  const { data: patientsResponse, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients-complementary'],
    queryFn: async () => {
      try {
        const response = await getPacientes({
          page_size: 50,
          activo: true,
        });
        return response.data;
      } catch (error) {
        console.error('Error cargando pacientes:', error);
        return { count: 0, results: [] as IPaciente[] };
      }
    },
    staleTime: 5 * 60 * 1000,
    // Habilitado en ambos modos
  });

  const patients: IPaciente[] = patientsResponse?.results || [];

  // Buscar el paciente seleccionado
  useEffect(() => {
    if (pacienteId && patients.length > 0) {
      const found = patients.find((p) => p.id === pacienteId);
      setSelectedPatient(found || null);
    }
  }, [pacienteId, patients, mode]);

  const getPatientFullName = (patient: IPaciente): string =>
    `${patient.nombres} ${patient.apellidos}`.trim();

  const mostrarSeccionEstado = Boolean(onActivoChange);

  return (
    <div className="space-y-8">
      {/* SECCIÓN: IDENTIFICACIÓN DEL PACIENTE - MOSTRAR EN AMBOS MODOS */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Identificación del paciente
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del paciente seleccionado - MOSTRAR EN AMBOS MODOS */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === 'edit' ? 'Paciente' : 'Información del paciente'}
            </label>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              {selectedPatient ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                      {(selectedPatient.nombres?.charAt(0) || 'P').toUpperCase()}
                      {(selectedPatient.apellidos?.charAt(0) || '').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {getPatientFullName(selectedPatient)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        CI: {selectedPatient.cedula_pasaporte}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedPatient.sexo === 'M' ? '👨 Masculino' : '👩 Femenino'} •
                        Edad: {selectedPatient.edad} {selectedPatient.condicion_edad}
                      </p>
                    </div>
                  </div>

                  {/* Badge de paciente */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {mode === 'edit' 
                        ? 'Paciente asociado al examen'
                        : 'Paciente seleccionado'}
                    </span>
                  </div>

                  {/* Nota informativa */}
                  <div className="mt-4 flex gap-3 rounded-lg bg-gradient-to-r from-blue-100/80 to-blue-50 p-3 dark:from-blue-900/30 dark:to-blue-900/20">
                    <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                        <span className="font-semibold">Nota:</span>{' '}
                        {mode === 'edit' 
                          ? 'El paciente asociado a este examen no puede ser modificado. Este registro está vinculado permanentemente a este paciente.'
                          : 'Una vez creado el examen, el paciente asociado no podrá ser modificado. Asegúrese de seleccionar al paciente correcto.'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {patientsLoading
                      ? 'Cargando datos del paciente...'
                      : mode === 'edit'
                      ? 'No se encontraron datos del paciente'
                      : 'Seleccione un paciente para ver su información'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: PEDIDO DE EXÁMENES */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Solicitud de Exámenes Complementarios
          </h3>
        </div>

        <div className="space-y-4">
          {/* Pedido de Exámenes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ¿Se solicitan exámenes complementarios?{' '}
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register('pedido_examenes')}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            >
              {PEDIDO_EXAMENES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.pedido_examenes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                {errors.pedido_examenes.message}
              </p>
            )}
          </div>

          {/* Detalle de Pedido (solo si es SI) */}
          {pedidoExamenes === 'SI' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Detalle de exámenes solicitados <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('pedido_examenes_detalle')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                placeholder="Especificar qué exámenes se solicitan y por qué (ej: radiografía panorámica, hemograma completo, glucosa en ayunas, etc.)"
              />
              {errors.pedido_examenes_detalle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                  {errors.pedido_examenes_detalle.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Describe los exámenes solicitados y la razón médica
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: INFORME DE EXÁMENES */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-2 rounded-full bg-gradient-to-b from-rose-500 to-rose-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informe de Exámenes Realizados
          </h3>
        </div>

        <div className="space-y-4">
          {/* Tipo de Informe */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de examen realizado <span className="text-red-500">*</span>
            </label>
            <select
              {...register('informe_examenes')}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            >
              {INFORME_EXAMENES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.informe_examenes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                {errors.informe_examenes.message}
              </p>
            )}
          </div>

          {/* Detalle del Informe (solo si NO es NINGUNO) */}
          {informeExamenes !== 'NINGUNO' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resultados de exámenes <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('informe_examenes_detalle')}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                placeholder="Detallar resultados de los exámenes realizados (valores, hallazgos, interpretación médica, etc.)"
              />
              {errors.informe_examenes_detalle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                  {errors.informe_examenes_detalle.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Describe los resultados encontrados en el examen
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: ESTADO (solo si se pasa onActivoChange) */}
      {mostrarSeccionEstado && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado</h3>
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
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                    : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                }`}
              >
                {activo ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Los registros inactivos no aparecerán en las búsquedas ni en los reportes.
          </p>
        </div>
      )}

      {/* Nota informativa final */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Información importante:</strong> Si solicita exámenes complementarios,
              debe especificar cuáles y por qué. Si ya cuenta con resultados, seleccione el
              tipo de examen y detalle los hallazgos encontrados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}