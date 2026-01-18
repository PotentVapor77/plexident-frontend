// src/components/clinicalRecord/modals/ClinicalRecordViewModal.tsx

import React from "react";
import {
  X,
  User,
  Calendar,
  FileText,
  Activity,
  HeartPulse,
  Stethoscope,
  Info,
  Clock,
  UserCheck,
} from "lucide-react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Spinner from "../../ui/spinner/Spinner";
import { useQuery } from "@tanstack/react-query";
import { formatDateToReadable, formatDateOnly } from "../../../mappers/clinicalRecordMapper";
import type { ClinicalRecordListResponse } from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import clinicalRecordService from "../../../services/clinicalRecord/clinicalRecordService";

interface ClinicalRecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: ClinicalRecordListResponse | null;
}

const ClinicalRecordViewModal: React.FC<ClinicalRecordViewModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
}) => {
  // 1. Fetch de datos
  const {
    data: apiResponse, // Renombrado: esto recibe el objeto { success: true, data: {...} }
    isLoading,
    isError
  } = useQuery({
    queryKey: ["clinicalRecord", selectedRecord?.id],
    queryFn: () => clinicalRecordService.getById(selectedRecord!.id),
    enabled: isOpen && !!selectedRecord?.id,
    staleTime: 0,
  });

  if (!isOpen) return null;

  // 2. Estado de Carga
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl h-[90vh]">
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <span className="text-gray-500 font-medium">Cargando información completa...</span>
        </div>
      </Modal>
    );
  }

  // 3. Estado de Error
  if (isError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center text-red-600">
          Error al cargar la información.
        </div>
      </Modal>
    );
  }

  // 4. EXTRAER LA DATA REAL
  // Tu API devuelve un wrapper, así que el historial real está en .data
  // Usamos 'as any' temporalmente para evitar conflictos de tipo si la interfaz de TS no incluye el wrapper
  const record = (apiResponse as any)?.data || apiResponse;

  // Si después de extraer, no hay record o no tiene ID, no mostramos nada (o error)
  if (!record || !record.id) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center text-gray-500">
          No se encontraron datos para este historial.
        </div>
      </Modal>
    );
  }

  // Helpers para acceder a la data anidada
  const personales = record.antecedentes_personales_data;
  const familiares = record.antecedentes_familiares_data;
  const vitales = record.constantes_vitales_data;
  const examen = record.examen_estomatognatico_data;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historial Clínico - Formulario 033
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registro #{record.id?.slice(0, 8) || '---'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* BODY - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto bg-white p-6 dark:bg-gray-900">
        <div className="space-y-8">

          {/* 1. INFORMACIÓN DEL PACIENTE Y ODONTÓLOGO */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Paciente */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-4 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <User className="h-5 w-5" />
                <h4 className="font-semibold">Información del Paciente</h4>
              </div>
              <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Nombre Completo</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {record.paciente_info?.nombres} {record.paciente_info?.apellidos}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Cédula</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-300">
                    {record.paciente_info?.cedula_pasaporte || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Sexo</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-300">
                    {record.paciente_info?.sexo === "M" ? "Masculino" : "Femenino"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Edad</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-300">
                    {record.paciente_info?.edad ? `${record.paciente_info.edad} años` : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Fecha Nacimiento</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-300">
                    {formatDateOnly(record.paciente_info?.fecha_nacimiento || "")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Datos de Atención */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-5 w-5" />
                <h4 className="font-semibold">Datos de Atención</h4>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Odontólogo Responsable</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-brand-500" />
                    {record.odontologo_info
                      ? `Dr(a). ${record.odontologo_info.nombres} ${record.odontologo_info.apellidos}`
                      : "No asignado"}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">Fecha Atención</dt>
                    <dd className="text-sm text-gray-900 dark:text-gray-300">
                      {formatDateToReadable(record.fecha_atencion)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase">Estado</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${record.estado === 'ABIERTO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {record.estado_display || record.estado}
                      </span>
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Motivo de Consulta</dt>
                  <dd className="mt-1 text-sm text-gray-700 italic border-l-2 border-brand-200 pl-3 dark:text-gray-300">
                    "{record.motivo_consulta || "No especificado"}"
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 2. ANTECEDENTES Y SIGNOS VITALES */}
          <section>
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
              <Activity className="h-5 w-5 text-brand-500" />
              Antecedentes y Signos Vitales
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* ANTECEDENTES PERSONALES */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Personales</h5>
                {personales ? (
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {/* Alergias */}
                    {personales.alergia_antibiotico && (
                      <li className="bg-red-50 p-2 rounded text-red-700 border border-red-100">
                        <span className="font-semibold">Alergia Antibiótico:</span> {personales.alergia_antibiotico}
                        {personales.alergia_antibiotico_otro && ` (${personales.alergia_antibiotico_otro})`}
                      </li>
                    )}
                    {personales.alergia_anestesia && (
                      <li className="bg-red-50 p-2 rounded text-red-700 border border-red-100">
                        <span className="font-semibold">Alergia Anestesia:</span> {personales.alergia_anestesia}
                        {personales.alergia_anestesia_otro && ` (${personales.alergia_anestesia_otro})`}
                      </li>
                    )}

                    {/* Enfermedades */}
                    {personales.hemorragias === "SI" && (
                      <li className="bg-orange-50 p-2 rounded text-orange-800 border border-orange-100 font-medium">
                        ⚠ Sufre de Hemorragias
                      </li>
                    )}
                    {personales.vih_sida && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>VIH/SIDA:</strong> {personales.vih_sida}
                      </li>
                    )}
                    {personales.tuberculosis && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Tuberculosis:</strong> {personales.tuberculosis}
                      </li>
                    )}
                    {personales.asma && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Asma:</strong> {personales.asma}
                      </li>
                    )}
                    {personales.diabetes && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Diabetes:</strong> {personales.diabetes}
                        {personales.diabetes_otro && ` (${personales.diabetes_otro})`}
                      </li>
                    )}
                    {personales.hipertension_arterial && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Hipertensión:</strong> {personales.hipertension_arterial}
                      </li>
                    )}
                    {personales.enfermedad_cardiaca && (
                      <li className="bg-gray-50 p-2 rounded border border-gray-100">
                        <strong>Enf. Cardíaca:</strong> {personales.enfermedad_cardiaca}
                        {personales.enfermedad_cardiaca_otro && ` (${personales.enfermedad_cardiaca_otro})`}
                      </li>
                    )}
                    {/* Mensaje si todo está vacío pero el objeto existe */}
                    {Object.values(personales).every(v => !v || v === 'NO') && (
                      <li className="text-gray-400 italic">Sin antecedentes patológicos marcados.</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No registra antecedentes personales.</p>
                )}

                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-500">Enfermedad Actual:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{record.enfermedad_actual || "Sin registrar"}</p>
                </div>
              </div>

              {/* ANTECEDENTES FAMILIARES */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Familiares</h5>
                {familiares ? (
                  <ul className="space-y-2 text-sm">
                    {familiares.diabetes && (
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Info className="h-3 w-3 text-blue-500" /> Diabetes
                      </li>
                    )}
                    {familiares.hipertension && (
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Info className="h-3 w-3 text-blue-500" /> Hipertensión
                      </li>
                    )}
                    {familiares.cardiopatias && (
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Info className="h-3 w-3 text-blue-500" /> Cardiopatías
                      </li>
                    )}
                    {familiares.cancer && (
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Info className="h-3 w-3 text-blue-500" /> Cáncer
                      </li>
                    )}
                    {familiares.otros && (
                      <li className="text-gray-600 dark:text-gray-400 border-t pt-2 mt-2">
                        <span className="font-medium">Otros:</span> {familiares.otros}
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No registra antecedentes familiares.</p>
                )}
              </div>

              {/* SIGNOS VITALES */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4" /> Signos Vitales
                </h5>
                {vitales ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-2 rounded shadow-sm dark:bg-gray-800">
                      <span className="text-xs text-gray-500 block">Presión Arterial</span>
                      <span className="font-mono font-medium">{vitales.presion_arterial || "--/--"}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm dark:bg-gray-800">
                      <span className="text-xs text-gray-500 block">Frecuencia C.</span>
                      <span className="font-mono font-medium">{vitales.frecuencia_cardiaca || "--"} lpm</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm dark:bg-gray-800">
                      <span className="text-xs text-gray-500 block">Temp.</span>
                      <span className="font-mono font-medium">{vitales.temperatura || "--"} °C</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm dark:bg-gray-800">
                      <span className="text-xs text-gray-500 block">Peso</span>
                      <span className="font-mono font-medium">{vitales.peso || "--"} kg</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4">Sin registro de signos vitales.</p>
                )}
              </div>
            </div>
          </section>

          {/* 3. EXAMEN ESTOMATOGNÁTICO */}
          <section>
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
              <Stethoscope className="h-5 w-5 text-brand-500" />
              Examen del Sistema Estomatognático
            </h4>
            {examen ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="font-medium text-xs text-gray-500 uppercase block mb-1">Labios</span>
                  <p className="text-sm text-gray-800">{examen.labios || "Sin novedad"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="font-medium text-xs text-gray-500 uppercase block mb-1">Lengua</span>
                  <p className="text-sm text-gray-800">{examen.lengua || "Sin novedad"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="font-medium text-xs text-gray-500 uppercase block mb-1">Paladar</span>
                  <p className="text-sm text-gray-800">{examen.paladar || "Sin novedad"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="font-medium text-xs text-gray-500 uppercase block mb-1">Encías</span>
                  <p className="text-sm text-gray-800">{examen.encias || "Sin novedad"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                <p className="text-gray-500">No se han registrado hallazgos en el examen físico.</p>
              </div>
            )}
          </section>

          {/* 4. OBSERVACIONES Y FOOTER */}
          <section className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/20">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 uppercase mb-2">Observaciones Generales</h4>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
              {record.observaciones || "Ninguna observación adicional registrada."}
            </p>
          </section>

          <div className="text-xs text-gray-400 pt-4 border-t mt-8 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Creado el: {formatDateToReadable(record.fecha_creacion)}</span>
            </div>
            {record.fecha_modificacion && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Última modificación: {formatDateToReadable(record.fecha_modificacion)}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};

export default ClinicalRecordViewModal;
