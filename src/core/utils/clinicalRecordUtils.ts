// src/core/utils/clinicalRecordUtils.ts

import { formatDateOnly } from "../../mappers/clinicalRecordMapper";
import type { 
  AntecedentesFamiliaresData, 
  AntecedentesPersonalesData, 
  ClinicalRecordDetailResponse, 
  ClinicalRecordListResponse, 
  ExamenEstomatognaticoData, 
  IndicadoresSaludBucalData 
} from "../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * ============================================================================
 * UTILIDADES - CLINICAL RECORDS
 * ============================================================================
 */

/**
 * Filtra historiales por estado
 */
export const filterByEstado = (
  historiales: ClinicalRecordListResponse[],
  estado: string | undefined
): ClinicalRecordListResponse[] => {
  if (!estado || estado === "") return historiales;
  return historiales.filter((h) => h.estado === estado);
};

/**
 * Filtra historiales por paciente
 */
export const filterByPaciente = (
  historiales: ClinicalRecordListResponse[],
  pacienteId: string | undefined
): ClinicalRecordListResponse[] => {
  if (!pacienteId) return historiales;
  return historiales.filter((h) => h.paciente === pacienteId);
};

/**
 * Ordena historiales por fecha de atención
 */
export const sortByFechaAtencion = (
  historiales: ClinicalRecordListResponse[]
): ClinicalRecordListResponse[] => {
  return [...historiales].sort((a, b) => {
    const dateA = new Date(a.fecha_atencion).getTime();
    const dateB = new Date(b.fecha_atencion).getTime();
    return dateB - dateA;
  });
};

/**
 * Cuenta historiales por estado
 */
export const countByEstado = (
  historiales: ClinicalRecordListResponse[]
): Record<string, number> => {
  return historiales.reduce((acc, h) => {
    acc[h.estado] = (acc[h.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Verifica si un historial puede ser editado
 */
export const canEditRecord = (record: ClinicalRecordListResponse): boolean => {
  return record.puede_editar && record.estado !== "CERRADO" && record.activo;
};

/**
 * Verifica si un historial puede ser cerrado
 */
export const canCloseRecord = (record: ClinicalRecordListResponse): boolean => {
  return record.estado === "ABIERTO" && record.activo;
};

/**
 * Obtiene el color del badge según el nivel de completitud
 */
export const getCompletenessColor = (estaCompleto: boolean): string => {
  return estaCompleto
    ? "bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-400/10 dark:text-success-400"
    : "bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-400/10 dark:text-warning-400";
};

/**
 * Calcula estadísticas de historiales
 */
export const calculateStatistics = (historiales: ClinicalRecordListResponse[]) => {
  const total = historiales.length;
  const borradores = historiales.filter((h) => h.estado === "BORRADOR").length;
  const abiertos = historiales.filter((h) => h.estado === "ABIERTO").length;
  const cerrados = historiales.filter((h) => h.estado === "CERRADO").length;
  const completos = historiales.filter((h) => h.esta_completo).length;

  return {
    total,
    borradores,
    abiertos,
    cerrados,
    completos,
    incompletos: total - completos,
    porcentajeCompletos: total > 0 ? Math.round((completos / total) * 100) : 0,
  };
};

export const getEstablecimientoPacienteSummary = (record: ClinicalRecordDetailResponse) => {
  return {
    establecimiento: {},
    paciente: {
      nombre: record.paciente_info
        ? `${record.paciente_info.nombres} ${record.paciente_info.apellidos}`
        : "No registrado",
      identificacion: record.paciente_info?.cedula_pasaporte || "N/A",
      sexo:
        record.paciente_info?.sexo === "M"
          ? "Masculino"
          : record.paciente_info?.sexo === "F"
          ? "Femenino"
          : "No especificado",
      edad: record.paciente_info?.edad?.toString() || "N/A",
      fechaNacimiento: formatDateOnly(record.paciente_info?.fecha_nacimiento),
    },
  };
};

// ============================================================================
// ANTECEDENTES PERSONALES - UTILIDADES COMPLETAS
// ============================================================================

interface AntecedentesPersonalesDisplay {
  tieneContenido: boolean;
  alergias: string[];
  patologias: string[];
  otros: string[];
  habitos: string[];
  observaciones: string[];
}

/**
 * Procesa y organiza los antecedentes personales para mostrar en la UI
 * Incluye TODOS los campos del modelo Django
 */
export const getAntecedentesPersonalesDisplay = (
  data: AntecedentesPersonalesData | null | undefined
): AntecedentesPersonalesDisplay | null => {
  const resultado: AntecedentesPersonalesDisplay = {
    tieneContenido: false,
    alergias: [],
    patologias: [],
    otros: [],
    habitos: [],
    observaciones: [],
  };

  if (!data) return null;

  // ===== ALERGIAS =====
  if (data.alergia_antibiotico && data.alergia_antibiotico !== "NO") {
    const detalle =
      data.alergia_antibiotico === "OTRO" && data.alergia_antibiotico_otro
        ? ` (${data.alergia_antibiotico_otro})`
        : "";
    resultado.alergias.push(`Antibiótico: ${data.alergia_antibiotico}${detalle}`);
  }

  if (data.alergia_anestesia && data.alergia_anestesia !== "NO") {
    const detalle =
      data.alergia_anestesia === "OTRO" && data.alergia_anestesia_otro
        ? ` (${data.alergia_anestesia_otro})`
        : "";
    resultado.alergias.push(`Anestesia: ${data.alergia_anestesia}${detalle}`);
  }

  // ===== PATOLOGÍAS =====
  if (data.hemorragias && data.hemorragias === "SI") {
    const detalle = data.hemorragias_detalle ? `: ${data.hemorragias_detalle}` : "";
    resultado.patologias.push(`Hemorragias${detalle}`);
  }

  // ✅ VIH/SIDA
  if (data.vih_sida && data.vih_sida !== "NEGATIVO") {
    const label = getVihSidaLabel(data.vih_sida);
    const detalle =
      data.vih_sida === "OTRO" && data.vih_sida_otro ? ` (${data.vih_sida_otro})` : "";
    resultado.patologias.push(`VIH/SIDA: ${label}${detalle}`);
  }

  // ✅ TUBERCULOSIS
  if (data.tuberculosis && data.tuberculosis !== "NUNCA") {
    const label = getTuberculosisLabel(data.tuberculosis);
    const detalle =
      data.tuberculosis === "OTRO" && data.tuberculosis_otro
        ? ` (${data.tuberculosis_otro})`
        : "";
    resultado.patologias.push(`Tuberculosis: ${label}${detalle}`);
  }

  if (data.asma && data.asma !== "NO") {
    const detalle = data.asma === "OTRO" && data.asma_otro ? ` (${data.asma_otro})` : "";
    resultado.patologias.push(`Asma: ${data.asma}${detalle}`);
  }

  if (data.diabetes && data.diabetes !== "NO") {
    const label = getDiabetesLabel(data.diabetes);
    const detalle = data.diabetes_otro ? ` (${data.diabetes_otro})` : "";
    resultado.patologias.push(`Diabetes: ${label}${detalle}`);
  }

  if (data.hipertension_arterial && data.hipertension_arterial !== "NO") {
    const label = getHipertensionLabel(data.hipertension_arterial);
    const detalle =
      data.hipertension_arterial === "OTRO" && data.hipertension_arterial_otro
        ? ` (${data.hipertension_arterial_otro})`
        : "";
    resultado.patologias.push(`Hipertensión arterial: ${label}${detalle}`);
  }

  if (data.enfermedad_cardiaca && data.enfermedad_cardiaca !== "NO") {
    const label = getEnfermedadCardiacaLabel(data.enfermedad_cardiaca);
    const detalle =
      data.enfermedad_cardiaca === "OTRO" && data.enfermedad_cardiaca_otro
        ? ` (${data.enfermedad_cardiaca_otro})`
        : "";
    resultado.patologias.push(`Enfermedad cardíaca: ${label}${detalle}`);
  }

  // ✅ OTROS ANTECEDENTES
  if (data.otros_antecedentes_personales?.trim()) {
    resultado.otros.push(data.otros_antecedentes_personales.trim());
  }

  // ✅ HÁBITOS
  if (data.habitos?.trim()) {
    resultado.habitos.push(data.habitos.trim());
  }

  // ✅ OBSERVACIONES
  if (data.observaciones?.trim()) {
    resultado.observaciones.push(data.observaciones.trim());
  }

  // Determinar si tiene contenido
  resultado.tieneContenido =
    resultado.alergias.length > 0 ||
    resultado.patologias.length > 0 ||
    resultado.otros.length > 0 ||
    resultado.habitos.length > 0 ||
    resultado.observaciones.length > 0;

  return resultado;
};

// ============================================================================
// ANTECEDENTES FAMILIARES - UTILIDADES COMPLETAS
// ============================================================================

interface AntecedentesFamiliaresDisplay {
  tieneContenido: boolean;
  cardiovasculares: string[];
  metabolicas: string[];
  cancer: string[];
  infecciosas: string[];
  mentales: string[];
  malformaciones: string[];
  otros: string[];
}

/**
 * Procesa y organiza los antecedentes familiares para mostrar en la UI
 * Incluye TODOS los campos del modelo Django
 */
export const getAntecedentesFamiliaresDisplay = (
  data: AntecedentesFamiliaresData | null | undefined
): AntecedentesFamiliaresDisplay | null => {
  const resultado: AntecedentesFamiliaresDisplay = {
    tieneContenido: false,
    cardiovasculares: [],
    metabolicas: [],
    cancer: [],
    infecciosas: [],
    mentales: [],
    malformaciones: [],
    otros: [],
  };

  if (!data) return null;

  // ===== ENFERMEDADES CARDIOVASCULARES =====
  if (data.cardiopatia_familiar && data.cardiopatia_familiar !== "NO") {
    const familiar = getFamiliarLabel(data.cardiopatia_familiar);
    const detalle =
      data.cardiopatia_familiar === "OTRO" && data.cardiopatia_familiar_otro
        ? ` (${data.cardiopatia_familiar_otro})`
        : "";
    resultado.cardiovasculares.push(`Cardiopatía: ${familiar}${detalle}`);
  }

  if (
    data.hipertension_arterial_familiar &&
    data.hipertension_arterial_familiar !== "NO"
  ) {
    const familiar = getFamiliarLabel(data.hipertension_arterial_familiar);
    const detalle =
      data.hipertension_arterial_familiar === "OTRO" &&
      data.hipertension_arterial_familiar_otro
        ? ` (${data.hipertension_arterial_familiar_otro})`
        : "";
    resultado.cardiovasculares.push(`Hipertensión arterial: ${familiar}${detalle}`);
  }

  if (
    data.enfermedad_vascular_familiar &&
    data.enfermedad_vascular_familiar !== "NO"
  ) {
    const familiar = getFamiliarLabel(data.enfermedad_vascular_familiar);
    const detalle =
      data.enfermedad_vascular_familiar === "OTRO" &&
      data.enfermedad_vascular_familiar_otro
        ? ` (${data.enfermedad_vascular_familiar_otro})`
        : "";
    resultado.cardiovasculares.push(`Enfermedad vascular: ${familiar}${detalle}`);
  }

  // ===== ENFERMEDADES METABÓLICAS =====
  // ✅ ENDÓCRINO METABÓLICO
  if (
    data.endocrino_metabolico_familiar &&
    data.endocrino_metabolico_familiar !== "NO"
  ) {
    const familiar = getFamiliarLabel(data.endocrino_metabolico_familiar);
    const detalle =
      data.endocrino_metabolico_familiar === "OTRO" &&
      data.endocrino_metabolico_familiar_otro
        ? ` (${data.endocrino_metabolico_familiar_otro})`
        : "";
    resultado.metabolicas.push(`Endócrino metabólico: ${familiar}${detalle}`);
  }

  // ===== CÁNCER =====
  if (data.cancer_familiar && data.cancer_familiar !== "NO") {
    const familiar = getFamiliarLabel(data.cancer_familiar);
    const familiarDetalle =
      data.cancer_familiar === "OTRO" && data.cancer_familiar_otro
        ? ` (${data.cancer_familiar_otro})`
        : "";

    let tipoCancer = "";
    if (data.tipo_cancer) {
      const tipoLabel = getTipoCancerLabel(data.tipo_cancer);
      const tipoDetalle =
        data.tipo_cancer === "OTRO" && data.tipo_cancer_otro
          ? ` (${data.tipo_cancer_otro})`
          : "";
      tipoCancer = ` - Tipo: ${tipoLabel}${tipoDetalle}`;
    }

    resultado.cancer.push(`Cáncer: ${familiar}${familiarDetalle}${tipoCancer}`);
  }

  // ===== ENFERMEDADES INFECCIOSAS =====
  // ✅ TUBERCULOSIS
  if (data.tuberculosis_familiar && data.tuberculosis_familiar !== "NO") {
    const familiar = getFamiliarLabel(data.tuberculosis_familiar);
    const detalle =
      data.tuberculosis_familiar === "OTRO" && data.tuberculosis_familiar_otro
        ? ` (${data.tuberculosis_familiar_otro})`
        : "";
    resultado.infecciosas.push(`Tuberculosis: ${familiar}${detalle}`);
  }

  // ✅ ENFERMEDAD INFECCIOSA
  if (
    data.enfermedad_infecciosa_familiar &&
    data.enfermedad_infecciosa_familiar !== "NO"
  ) {
    const familiar = getFamiliarLabel(data.enfermedad_infecciosa_familiar);
    const detalle =
      data.enfermedad_infecciosa_familiar === "OTRO" &&
      data.enfermedad_infecciosa_familiar_otro
        ? ` (${data.enfermedad_infecciosa_familiar_otro})`
        : "";
    resultado.infecciosas.push(`Enfermedad infecciosa: ${familiar}${detalle}`);
  }

  // ===== ENFERMEDADES MENTALES =====
  if (data.enfermedad_mental_familiar && data.enfermedad_mental_familiar !== "NO") {
    const familiar = getFamiliarLabel(data.enfermedad_mental_familiar);
    const detalle =
      data.enfermedad_mental_familiar === "OTRO" &&
      data.enfermedad_mental_familiar_otro
        ? ` (${data.enfermedad_mental_familiar_otro})`
        : "";
    resultado.mentales.push(`Enfermedad mental: ${familiar}${detalle}`);
  }

  // ===== MALFORMACIONES =====
  // ✅ MALFORMACIÓN
  if (data.malformacion_familiar && data.malformacion_familiar !== "NO") {
    const familiar = getFamiliarLabel(data.malformacion_familiar);
    const detalle =
      data.malformacion_familiar === "OTRO" && data.malformacion_familiar_otro
        ? ` (${data.malformacion_familiar_otro})`
        : "";
    resultado.malformaciones.push(`Malformación: ${familiar}${detalle}`);
  }

  // ===== OTROS =====
  if (data.otros_antecedentes_familiares?.trim()) {
    resultado.otros.push(data.otros_antecedentes_familiares.trim());
  }

  // Determinar si tiene contenido
  resultado.tieneContenido =
    resultado.cardiovasculares.length > 0 ||
    resultado.metabolicas.length > 0 ||
    resultado.cancer.length > 0 ||
    resultado.infecciosas.length > 0 ||
    resultado.mentales.length > 0 ||
    resultado.malformaciones.length > 0 ||
    resultado.otros.length > 0;

  return resultado;
};

// ============================================================================
// FUNCIONES HELPER PARA LABELS
// ============================================================================

function getVihSidaLabel(value: string): string {
  const labels: Record<string, string> = {
    NEGATIVO: "Negativo",
    POSITIVO: "Positivo",
    DESCONOCIDO: "Desconocido",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

function getTuberculosisLabel(value: string): string {
  const labels: Record<string, string> = {
    NUNCA: "Nunca",
    TRATADA: "Tratada",
    ACTIVA: "Activa",
    DESCONOCIDO: "Desconocido",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

function getDiabetesLabel(value: string): string {
  const labels: Record<string, string> = {
    NO: "No",
    TIPO_1: "Tipo 1",
    TIPO_2: "Tipo 2",
    GESTACIONAL: "Gestacional",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

function getHipertensionLabel(value: string): string {
  const labels: Record<string, string> = {
    NO: "No",
    CONTROLADA: "Controlada",
    NO_CONTROLADA: "No controlada",
    SIN_TRATAMIENTO: "Sin tratamiento",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

function getEnfermedadCardiacaLabel(value: string): string {
  const labels: Record<string, string> = {
    NO: "No",
    INSUFICIENCIA: "Insuficiencia cardíaca",
    ARRITMIA: "Arritmia",
    VALVULOPATIA: "Valvulopatía",
    INFARTO: "Infarto",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

function getFamiliarLabel(value: string): string {
  const labels: Record<string, string> = {
    NO: "No",
    PADRE: "Padre",
    MADRE: "Madre",
    HERMANO: "Hermano(a)",
    ABUELO: "Abuelo(a)",
    TIO: "Tío(a)",
    OTRO: "Otro familiar",
  };
  return labels[value] || value;
}

function getTipoCancerLabel(value: string): string {
  const labels: Record<string, string> = {
    MAMA: "Mama",
    PULMON: "Pulmón",
    PROSTATA: "Próstata",
    COLON: "Colon",
    ESTOMAGO: "Estómago",
    HIGADO: "Hígado",
    PANCREAS: "Páncreas",
    LEUCEMIA: "Leucemia",
    PIEL: "Piel",
    OTRO: "Otro",
  };
  return labels[value] || value;
}

// ============================================================================
// EXAMEN ESTOMATOGNÁTICO
// ============================================================================

export const getExamenHallazgos = (
  data: ExamenEstomatognaticoData | null | undefined
) => {
  if (!data) return [];
  if (data.examen_sin_patologia)
    return [{ region: "General", detalle: "Sin patología aparente" }];

  const regiones = [
    { nombre: "Labios", cp: data.labios_cp, desc: data.labios_descripcion },
    { nombre: "Mejillas", cp: data.mejillas_cp, desc: data.mejillas_descripcion },
    {
      nombre: "Maxilar Superior",
      cp: data.maxilar_superior_cp,
      desc: data.maxilar_superior_descripcion,
    },
    {
      nombre: "Maxilar Inferior",
      cp: data.maxilar_inferior_cp,
      desc: data.maxilar_inferior_descripcion,
    },
    { nombre: "Lengua", cp: data.lengua_cp, desc: data.lengua_descripcion },
    { nombre: "Paladar", cp: data.paladar_cp, desc: data.paladar_descripcion },
    {
      nombre: "Piso de la boca",
      cp: data.piso_boca_cp,
      desc: data.piso_boca_descripcion,
    },
    { nombre: "Carrillos", cp: data.carrillos_cp, desc: data.carrillos_descripcion },
    {
      nombre: "Glándulas Salivales",
      cp: data.glandulas_salivales_cp,
      desc: data.glandulas_salivales_descripcion,
    },
    { nombre: "ATM", cp: data.atm_cp, desc: data.atm_observacion },
    { nombre: "Ganglios", cp: data.ganglios_cp, desc: data.ganglios_descripcion },
  ];

  return regiones
    .filter((r) => r.cp)
    .map((r) => ({
      region: r.nombre,
      detalle: r.desc || "Patología detectada (sin descripción detallada)",
    }));
};

// ============================================================================
// INDICADORES DE SALUD BUCAL
// ============================================================================

export const getIndicadoresResumen = (indicadores: IndicadoresSaludBucalData) => {
  const ohis = indicadores.ohi_promedio_placa + indicadores.ohi_promedio_calculo;

  // Determinar nivel de higiene oral
  let higieneNivel = "";
  if (ohis <= 0.6) higieneNivel = "Excelente";
  else if (ohis <= 1.2) higieneNivel = "Bueno";
  else if (ohis <= 1.8) higieneNivel = "Regular";
  else if (ohis <= 3.0) higieneNivel = "Deficiente";
  else higieneNivel = "Pésimo";

  // Determinar nivel de gingivitis
  let gingivitisNivel = "";
  const gi = indicadores.gi_promedio_gingivitis;
  if (gi <= 0.1) gingivitisNivel = "Ausente";
  else if (gi <= 1.0) gingivitisNivel = "Leve";
  else if (gi <= 2.0) gingivitisNivel = "Moderada";
  else gingivitisNivel = "Severa";

  // Calcular porcentaje de piezas completas
  const piezasCompletas = indicadores.valores_por_pieza.filter((p) => p.completo)
    .length;
  const totalPiezas = indicadores.valores_por_pieza.length;
  const completitud = totalPiezas > 0 ? (piezasCompletas / totalPiezas) * 100 : 0;

  return {
    higieneNivel,
    gingivitisNivel,
    ohisTotal: ohis,
    completitud,
    piezasCompletas,
    totalPiezas,
    fecha: indicadores.fecha_formateada,
  };
};