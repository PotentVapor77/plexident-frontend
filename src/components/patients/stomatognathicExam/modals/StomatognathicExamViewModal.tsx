// src/components/stomatognathicExam/modals/StomatognathicExamViewModal.tsx

import { Modal } from "../../../ui/modal";
import Badge from "../../../ui/badge/Badge";
import type { BadgeColor } from "../../../ui/badge/Badge";
import type { IStomatognathicExam, IPacienteBasico } from "../../../../types/stomatognathicExam/IStomatognathicExam";
import { usePaciente } from "../../../../hooks/patient/usePatients";
import { Check, X, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

interface StomatognathicExamViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: IStomatognathicExam | null;
  onEdit?: () => void;
}

interface RegionConPatologia {
  region: string;
  regionKey: string;
  descripcion: string;
  patologias: string[];
  cp: boolean;
  sp: boolean;
}

// Tipo para acceder a propiedades dinámicas de manera segura
type StomatognathicExamWithDynamicKeys = IStomatognathicExam & {
  [key: string]: unknown;
};

// Tipo para paciente básico con propiedades opcionales
type PacienteBasicoWithInfo = IPacienteBasico & {
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  cedula?: string;
};

export function StomatognathicExamViewModal({
  isOpen,
  onClose,
  exam,
  onEdit,
}: StomatognathicExamViewModalProps) {
  // HOOKS AL INICIO
  const getPatientId = (): string => {
    if (!exam?.paciente) return "";
    if (typeof exam.paciente === "string") return exam.paciente;
    return (exam.paciente as IPacienteBasico).id || "";
  };

  const patientId = exam ? getPatientId() : "";
  const { data: pacienteData, isLoading: isLoadingPaciente } = usePaciente(patientId);

  // Definir todas las regiones
  const regiones = useMemo(() => [
    { key: "atm", label: "ATM (Articulación Temporomandibular)" },
    { key: "mejillas", label: "Mejillas" },
    { key: "maxilar_inferior", label: "Maxilar Inferior" },
    { key: "maxilar_superior", label: "Maxilar Superior" },
    { key: "paladar", label: "Paladar" },
    { key: "piso_boca", label: "Piso de Boca" },
    { key: "carrillos", label: "Carrillos" },
    { key: "glandulas_salivales", label: "Glándulas Salivales" },
    { key: "ganglios", label: "Ganglios" },
    { key: "lengua", label: "Lengua" },
    { key: "labios", label: "Labios" }
  ], []);

  // ✅ Función para obtener patologías específicas de una región
  const getPatologiasRegion = useMemo(() => {
    if (!exam) return () => [];
    
    return (regionKey: string): string[] => {
      const patologias: string[] = [];
      const examWithKeys = exam as StomatognathicExamWithDynamicKeys;
      
      // Verificar cada tipo de patología
      const abscesoKey = `${regionKey}_absceso`;
      const fibromaKey = `${regionKey}_fibroma`;
      const herpesKey = `${regionKey}_herpes`;
      const ulceraKey = `${regionKey}_ulcera`;
      const otraKey = `${regionKey}_otra_patologia`;
      
      // IMPORTANTE: Incluir también patologías específicas que pueden estar marcadas aunque cp sea false
      if (examWithKeys[abscesoKey] === true) patologias.push("Absceso");
      if (examWithKeys[fibromaKey] === true) patologias.push("Fibroma");
      if (examWithKeys[herpesKey] === true) patologias.push("Herpes");
      if (examWithKeys[ulceraKey] === true) patologias.push("Úlcera");
      if (examWithKeys[otraKey] === true) patologias.push("Otra patología");
      
      return patologias;
    };
  }, [exam]);

  // ✅ Obtener TODAS las regiones con sus patologías (sin filtrar por cp)
  const todasRegionesConInfo = useMemo((): RegionConPatologia[] => {
    if (!exam) return [];
    
    const regionesInfo: RegionConPatologia[] = [];
    const examWithKeys = exam as StomatognathicExamWithDynamicKeys;

    regiones.forEach(region => {
      const cpKey = `${region.key}_cp`;
      const spKey = `${region.key}_sp`;
      
      const cp = examWithKeys[cpKey] as boolean | undefined || false;
      const sp = examWithKeys[spKey] as boolean | undefined || false;
      
      const descKey = region.key === "atm" 
        ? "atm_observacion"
        : `${region.key}_descripcion`;
      
      const descripcion = examWithKeys[descKey] as string | undefined || "";
      const patologias = getPatologiasRegion(region.key);
      
      // ✅ IMPORTANTE: Incluir la región si tiene patologías o si está marcada como CP
      // Incluso si cp es false pero tiene patologías específicas, la incluimos
      if (patologias.length > 0 || cp === true) {
        regionesInfo.push({
          region: region.label,
          regionKey: region.key,
          descripcion: descripcion,
          patologias: patologias,
          cp: cp,
          sp: sp
        });
      }
    });

    return regionesInfo;
  }, [exam, regiones, getPatologiasRegion]);

  // ✅ Obtener solo regiones que tienen patologías (para resumen)
  const regionesConPatologias = useMemo(() => {
    return todasRegionesConInfo.filter(region => 
      region.patologias.length > 0 || region.cp === true
    );
  }, [todasRegionesConInfo]);

  // ✅ Verificar si hay patologías
  const tienePatologias = regionesConPatologias.length > 0;

  // ✅ Calcular total de regiones con patología (para mostrar en el header)
  const totalRegionesConPatologia = regionesConPatologias.length;

  // ✅ Dividir regiones con patologías en dos arrays para mostrar en dos columnas
  const mitadRegiones = Math.ceil(regionesConPatologias.length / 2);
  const regionesIzquierda = regionesConPatologias.slice(0, mitadRegiones);
  const regionesDerecha = regionesConPatologias.slice(mitadRegiones);

  // AHORA SÍ EL RETURN CONDICIONAL
  if (!isOpen || !exam) return null;

  const getStatusText = (status: boolean): string =>
    status ? "Activo" : "Inactivo";
  const getStatusColor = (status: boolean): BadgeColor =>
    status ? "success" : "error";

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month.toString().padStart(2, '0')}/${year}`;
    } catch {
      return "Fecha inválida";
    }
  };

  const getPacienteInfo = () => {
    if (pacienteData) {
      const nombres = pacienteData.nombres || "";
      const apellidos = pacienteData.apellidos || "";
      const cedula = pacienteData.cedula_pasaporte || "";
      const nombreCompleto =
        [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";
      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";
      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales,
      };
    }

    if (typeof exam.paciente === "object" && exam.paciente !== null) {
      const pacienteObj = exam.paciente as PacienteBasicoWithInfo;
      const nombres = pacienteObj.nombres || pacienteObj.nombre || "";
      const apellidos = pacienteObj.apellidos || "";
      const cedula = pacienteObj.cedula_pasaporte || pacienteObj.cedula || "";
      const nombreCompleto =
        [nombres, apellidos].filter(Boolean).join(" ").trim() || "Paciente";
      const firstInitial = nombres.charAt(0)?.toUpperCase() || "P";
      const lastInitial = apellidos.charAt(0)?.toUpperCase() || "";
      const iniciales = `${firstInitial}${lastInitial}` || "P";
      return {
        nombre: nombreCompleto,
        cedula: cedula || "No especificado",
        iniciales,
      };
    }

    if (isLoadingPaciente) {
      return {
        nombre: "Cargando...",
        cedula: patientId || "No especificado",
        iniciales: "C",
      };
    }

    return {
      nombre: "Paciente no especificado",
      cedula: patientId || "No especificado",
      iniciales: "P",
    };
  };

  const pacienteInfo = getPacienteInfo();

  const renderEstado = (cp: boolean, sp: boolean) => {
    if (cp) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">CP</span>
        </div>
      );
    }
    if (sp) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">SP</span>
        </div>
      );
    }
    return <span className="text-sm text-gray-400">No especificado</span>;
  };

  // Obtener fechas
  const examWithKeys = exam as StomatognathicExamWithDynamicKeys;
  const fechaCreacion = (examWithKeys.fecha_creacion || examWithKeys.created_at) as string | undefined;
  const fechaModificacion = (examWithKeys.fecha_modificacion || examWithKeys.updated_at || fechaCreacion) as string | undefined;
  const examenSinPatologia = (examWithKeys.examen_sin_patologia as boolean | undefined) || false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl overflow-hidden rounded-2xl bg-white p-0 shadow-xl dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-6 py-5 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Examen Estomatognático
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Evaluación completa de regiones orales y faciales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge size="sm" color={getStatusColor(exam.activo)}>
            {getStatusText(exam.activo)}
          </Badge>
          {tienePatologias && !examenSinPatologia && (
            <Badge size="sm" color="warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Con Patologías
            </Badge>
          )}
          {examenSinPatologia && (
            <Badge size="sm" color="success">
              <Check className="h-3 w-3 mr-1" />
              Sin Patologías
            </Badge>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:rotate-90 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Paciente info */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6 py-6 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/50">
            {pacienteInfo.iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Paciente
            </p>
            <h3 className="truncate text-xl font-bold text-gray-900 dark:text-white">
              {pacienteInfo.nombre}
              {isLoadingPaciente && (
                <span className="ml-2 text-sm text-gray-500">(cargando...)</span>
              )}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              CI/Pasaporte:{" "}
              <span className="font-semibold">{pacienteInfo.cedula}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Fecha de registro
              </span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(fechaCreacion)}
              </p>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Última modificación
              </span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(fechaModificacion)}
              </p>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Regiones con patología
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalRegionesConPatologia}
              </p>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Examen sin patología
              </span>
              <p className={`font-semibold ${examenSinPatologia ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {examenSinPatologia ? "Sí" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[60vh] space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6 dark:from-gray-900 dark:to-gray-900">
        {/* Regiones Estomatognáticas */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Regiones Estomatognáticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regiones.map(region => {
              const examWithKeys = exam as StomatognathicExamWithDynamicKeys;
              const cpKey = `${region.key}_cp`;
              const spKey = `${region.key}_sp`;
              
              const cp = examWithKeys[cpKey] as boolean | undefined || false;
              const sp = examWithKeys[spKey] as boolean | undefined || false;
              
              const descKey = region.key === "atm" 
                ? "atm_observacion"
                : `${region.key}_descripcion`;
              
              const descripcion = examWithKeys[descKey] as string | undefined || "";
              
              // Obtener patologías específicas
              const patologiasEspecificas = getPatologiasRegion(region.key);
              
              // Determinar si esta región tiene patologías
              const tienePatologiasRegion = patologiasEspecificas.length > 0 || cp === true;
              
              return (
                <div
                  key={region.key}
                  className={`rounded-lg border p-4 transition-colors ${
                    tienePatologiasRegion
                      ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {region.label}
                    </h4>
                    {renderEstado(cp, sp)}
                  </div>
                  
                  {/* Mostrar patologías específicas */}
                  {patologiasEspecificas.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {patologiasEspecificas.map((patologia, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        >
                          {patologia}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {descripcion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ Resumen de Patologías Detectadas - EN DOS COLUMNAS */}
        {tienePatologias && !examenSinPatologia && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                Resumen de Patologías Detectadas ({totalRegionesConPatologia} regiones)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                {regionesIzquierda.map((region, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-4 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-red-800 dark:text-red-300">
                              {region.region}
                            </p>
                            {region.cp && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">
                                CP
                              </span>
                            )}
                            {!region.cp && region.patologias.length > 0 && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300">
                                Patologías específicas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {region.patologias.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 ml-8">
                        {region.patologias.map((patologia, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          >
                            {patologia}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {region.descripcion && (
                      <p className="text-sm text-red-700 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded ml-8">
                        {region.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Columna Derecha */}
              <div className="space-y-4">
                {regionesDerecha.map((region, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-4 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-red-800 dark:text-red-300">
                              {region.region}
                            </p>
                            {region.cp && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300">
                                CP
                              </span>
                            )}
                            {!region.cp && region.patologias.length > 0 && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300">
                                Patologías específicas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {region.patologias.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 ml-8">
                        {region.patologias.map((patologia, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          >
                            {patologia}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {region.descripcion && (
                      <p className="text-sm text-red-700 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded ml-8">
                        {region.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Mensaje si no hay patologías */}
        {examenSinPatologia && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Sin Patologías Detectadas
              </h3>
            </div>
            <p className="mt-2 text-green-700 dark:text-green-400">
              El examen fue marcado como "Sin patologías". No se detectaron anomalías en ninguna de las regiones estomatognáticas.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 px-6 py-4 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
        >
          Cerrar
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            Editar Examen
          </button>
        )}
      </div>
    </Modal>
  );
}