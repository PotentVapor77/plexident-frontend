// src/mappers/clinicalRecordMapper.ts
import type { ClinicalRecordFormData } from "../core/types/clinicalRecord.types";
import type { 
  AntecedentesFamiliaresData,
  AntecedentesPersonalesData,
  CamposFormulario,
  ClinicalRecordCreatePayload, 
  ClinicalRecordDetailResponse,
  ClinicalRecordInitialData,
  ConstantesVitalesData,
  ExamenesComplementariosData,
  ExamenEstomatognaticoData,
  IndicadoresSaludBucalData,
  IndicesCariesData,
  PlanTratamientoData,
} from "../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatDateToReadable = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Función para formato aaaa-mm-dd
export const formatDateAAAAMMDD = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para hora hh:mm
export const formatTimeHHMM = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
export const formatTime = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};
/**
 * Formatea solo la fecha (sin hora)
 */
export const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Convierte los datos iniciales del backend al formato del formulario
 */
export const mapInitialDataToFormData = (
  initialData: ClinicalRecordInitialData,
  odontologoId?: string
): Partial<ClinicalRecordFormData> & { 
  _dates: {[key: string]: string | null} 
  _hasPlanTratamiento: boolean;
} => {
  const antecedentesPersonales = initialData.antecedentes_personales || null;
  const antecedentesFamiliares = initialData.antecedentes_familiares || null;
  const constantesVitales = initialData.constantes_vitales || null;
  const examenEstomatognatico = initialData.examen_estomatognatico || null;
  const indicadoresSaludBucal = initialData.indicadores_salud_bucal || null;
  const indicesCaries = initialData.indices_caries || null;
  const diagnosticosCIE = initialData.diagnosticos_cie || null;

  console.log("[HC][mapper] initialData recibido:", initialData);

  const planTratamiento = initialData.plan_tratamiento || null;
  
  console.log("[HC][mapper] planTratamiento detectado:", planTratamiento);
  console.log("[HC][mapper] sesiones del plan:", planTratamiento?.sesiones);
  const examenesComplementarios = initialData.examenes_complementarios || null;




  // Usar los datos del backend o valores por defecto
  const camposBackend = initialData.campos_formulario || {};
  const camposFormulario: CamposFormulario = {
    institucion_sistema: camposBackend.institucion_sistema || "SISTEMA NACIONAL DE SALUD",
    unicodigo: camposBackend.unicodigo || "",
    establecimiento_salud: camposBackend.establecimiento_salud || "FamySALUD",
    numero_historia_clinica_unica: camposBackend.numero_historia_clinica_unica || "",
    numero_archivo: camposBackend.numero_archivo || "",
    numero_hoja: camposBackend.numero_hoja || 1,
  };

  return {
    // Datos básicos del paciente
    paciente: initialData.paciente?.id || "",
    odontologo_responsable: odontologoId || "",
    motivo_consulta: initialData.motivo_consulta || "",
    embarazada: initialData.embarazada || "",
    enfermedad_actual: initialData.enfermedad_actual || "",
    
    institucion_sistema: camposFormulario.institucion_sistema,
    unicodigo: camposFormulario.unicodigo,
    establecimiento_salud: camposFormulario.establecimiento_salud,
    numero_historia_clinica_unica: camposFormulario.numero_historia_clinica_unica,
    numero_archivo: camposFormulario.numero_archivo,
    numero_hoja: camposFormulario.numero_hoja,

    antecedentes_personales_id: antecedentesPersonales?.id || null,
    antecedentes_familiares_id: antecedentesFamiliares?.id || null,
    constantes_vitales_id: constantesVitales?.id || null,
    examen_estomatognatico_id: examenEstomatognatico?.id || null,

    indicadores_salud_bucal_id: indicadoresSaludBucal?.id || null,
    indicadores_salud_bucal_data: indicadoresSaludBucal?.data || null,

    antecedentes_personales_data: antecedentesPersonales?.data || null,
    antecedentes_familiares_data: antecedentesFamiliares?.data || null,
    constantes_vitales_data: constantesVitales?.data || null,
    examen_estomatognatico_data: examenEstomatognatico?.data || null,
    indices_caries_id: indicesCaries?.id || null,
    indices_caries_data: indicesCaries?.data || null,
    diagnosticos_cie_id: diagnosticosCIE?.id || null,
    diagnosticos_cie_data: diagnosticosCIE?.data || null,


    plan_tratamiento_id: planTratamiento?.id || null,
    plan_tratamiento_sesiones: planTratamiento?.sesiones || [],
    plan_tratamiento_odontograma_id: planTratamiento?.version_odontograma || null,
 examenes_complementarios_id: examenesComplementarios?.id || null,
    examenes_complementarios_data: examenesComplementarios?.data || null,

    // Metadata de fechas (para mostrar en headers)
    _dates: {
      motivo_consulta: initialData.motivo_consulta_fecha || null,
      enfermedad_actual: initialData.enfermedad_actual_fecha || null,
      antecedentes_personales: antecedentesPersonales?.fecha || null,
      antecedentes_familiares: antecedentesFamiliares?.fecha || null,
      constantes_vitales: constantesVitales?.fecha || null,
      examen_estomatognatico: examenEstomatognatico?.fecha || null,
      indicadores_salud_bucal: indicadoresSaludBucal?.fecha || null,
      indices_caries: indicesCaries?.fecha || null,
      diagnosticos_cie: diagnosticosCIE?.fecha || null,
      plan_tratamiento: planTratamiento?.fecha_creacion || null,
      examenes_complementarios: examenesComplementarios?.fecha || null
    },
    _hasPlanTratamiento: !!planTratamiento
  };
};

/**
 * Convierte los datos del formulario al payload del backend para CREATE
 */
export const mapFormDataToPayload = (
    formData: ClinicalRecordFormData
): ClinicalRecordCreatePayload => {
    return {
        paciente: formData.paciente,
        odontologo_responsable: formData.odontologo_responsable,
        motivo_consulta: formData.motivo_consulta || undefined,
        embarazada: (formData.embarazada === "SI" || formData.embarazada === "NO")
            ? formData.embarazada
            : undefined,
        enfermedad_actual: formData.enfermedad_actual || undefined,
        
        antecedentes_personales: formData.antecedentes_personales_id || undefined,
        antecedentes_familiares: formData.antecedentes_familiares_id || undefined,
        constantes_vitales: formData.constantes_vitales_id || undefined,
        examen_estomatognatico: formData.examen_estomatognatico_id || undefined,

        indicadores_salud_bucal: formData.indicadores_salud_bucal_id || undefined,

        estado: formData.estado || "BORRADOR",
        observaciones: formData.observaciones || undefined,
        unicodigo: formData.unicodigo || undefined,
        establecimiento_salud: formData.establecimiento_salud || undefined,
        plan_tratamiento: formData.plan_tratamiento_id || undefined,
        examenes_complementarios: formData.examenes_complementarios_id || undefined,
    };
};

/**
 * Convierte la respuesta del backend (detalle) al formato del formulario para EDIT
 */
export const mapResponseToFormData = (
  response: ClinicalRecordDetailResponse
): Partial<ClinicalRecordFormData> => {
  const safeResponse = response as ClinicalRecordDetailResponse & {
    unicodigo?: string;
    establecimiento_salud?: string;
    institucion_sistema?: string;
    numero_hoja?: number;
    numero_historia_clinica_unica?: string;
    numero_archivo?: string;
    indicadores_salud_bucal_data?: IndicadoresSaludBucalData;
    constantes_vitales_data?: ConstantesVitalesData;
    antecedentes_personales_data?: AntecedentesPersonalesData;
    antecedentes_familiares_data?: AntecedentesFamiliaresData;
    examen_estomatognatico_data?: ExamenEstomatognaticoData;
    indices_caries_data?: IndicesCariesData | null;
    plan_tratamiento?: PlanTratamientoData | null;
    plan_tratamiento_data?: PlanTratamientoData | null;
    examenes_complementarios?: ExamenesComplementariosData | null;
    examenes_complementarios_data?: ExamenesComplementariosData | null;
  };
const planTratamientoData = safeResponse.plan_tratamiento_data;

  return {
    paciente: response.paciente,
    odontologo_responsable: response.odontologo_responsable,
    motivo_consulta: response.motivo_consulta,
    embarazada: response.embarazada || "",
    enfermedad_actual: response.enfermedad_actual,

    unicodigo: safeResponse.unicodigo || "",
    establecimiento_salud: safeResponse.establecimiento_salud || "",
    institucion_sistema: safeResponse.institucion_sistema || "SISTEMA NACIONAL DE SALUD",
    numero_hoja: safeResponse.numero_hoja || 1,
    numero_historia_clinica_unica: safeResponse.numero_historia_clinica_unica || "",
    numero_archivo: safeResponse.numero_archivo || "",

    indicadores_salud_bucal_id: response.indicadores_salud_bucal,
    antecedentes_personales_id: response.antecedentes_personales,
    antecedentes_familiares_id: response.antecedentes_familiares,
    constantes_vitales_id: response.constantes_vitales,
    examen_estomatognatico_id: response.examen_estomatognatico,
    indicadores_salud_bucal_data: safeResponse.indicadores_salud_bucal_data || null,
    antecedentes_personales_data: safeResponse.antecedentes_personales_data || null,
    antecedentes_familiares_data: safeResponse.antecedentes_familiares_data || null,
    constantes_vitales_data: safeResponse.constantes_vitales_data || null,
    examen_estomatognatico_data: safeResponse.examen_estomatognatico_data || null,
    estado: response.estado,
    observaciones: response.observaciones,
    indices_caries_id: response.indices_caries,
    indices_caries_data: safeResponse.indices_caries_data || null,
    diagnosticos_cie_id: response.diagnosticos_cie || null,
    diagnosticos_cie_data: safeResponse.diagnosticos_cie_data || null,
     plan_tratamiento_id: planTratamientoData?.id || null,
  plan_tratamiento_sesiones: planTratamientoData?.sesiones || [],
  plan_tratamiento_odontograma_id: planTratamientoData?.version_odontograma || null,
  plan_tratamiento_titulo: planTratamientoData?.titulo || "",
  plan_tratamiento_descripcion: planTratamientoData?.descripcion || "",
  examenes_complementarios_data: safeResponse.examenes_complementarios_data || null,

  };
};

/**
 * Obtiene el texto del estado en español
 */
export const getEstadoDisplay = (estado: string): string => {
  const estados: Record<string, string> = {
    BORRADOR: "Borrador",
    ABIERTO: "Abierto",
    CERRADO: "Cerrado",
  };
  return estados[estado] || estado;
};

/**
 * Obtiene el color del badge según el estado
 */
export const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    BORRADOR: "bg-gray-100 text-gray-700 ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
    ABIERTO: "bg-blue-light-50 text-blue-light-700 ring-blue-light-600/20 dark:bg-blue-light-400/10 dark:text-blue-light-400 dark:ring-blue-light-400/20",
    CERRADO: "bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-400/10 dark:text-success-400 dark:ring-success-400/20",
  };
  return colores[estado] || colores.BORRADOR;
};

export const getPDFButtonColor = (estado: string): string => {
  switch (estado) {
    case "CERRADO":
      return "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-500/10 dark:hover:text-gray-300";
    default:
      return "text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300";
  }
};