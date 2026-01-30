// src/core/utils/clinicalRecordUtils.ts

import { formatDateOnly } from "../../mappers/clinicalRecordMapper";
import type { AntecedentesFamiliaresData, AntecedentesPersonalesData, ClinicalRecordDetailResponse, ClinicalRecordListResponse, ExamenEstomatognaticoData, IndicadoresSaludBucalData } from "../../types/clinicalRecords/typeBackendClinicalRecord";


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
    establecimiento: {
    },
    paciente: {
      nombre: record.paciente_info ? 
              `${record.paciente_info.nombres} ${record.paciente_info.apellidos}` : 
              "No registrado",
      identificacion: record.paciente_info?.cedula_pasaporte || "N/A",
      sexo: record.paciente_info?.sexo === "M" ? "Masculino" : 
            record.paciente_info?.sexo === "F" ? "Femenino" : "No especificado",
      edad: record.paciente_info?.edad?.toString() || "N/A",
      fechaNacimiento: formatDateOnly(record.paciente_info?.fecha_nacimiento),
    }
  };
};

// ============================================================================
// ANTECEDENTES UTILITIES
// ============================================================================

export const getAntecedentesPersonalesDisplay = (data: AntecedentesPersonalesData | null | undefined) => {
  if (!data) return null;

  const antecedentes = {
    alergias: [] as string[],
    patologias: [] as string[],
    otros: [] as string[],
    tieneContenido: false
  };

  // Alergias
  if (data.alergia_antibiotico && data.alergia_antibiotico !== 'NO') {
    const detalle = data.alergia_antibiotico === 'OTRO' && data.alergia_antibiotico_otro 
      ? `Antibiótico: ${data.alergia_antibiotico_otro}`
      : `Antibiótico: ${data.alergia_antibiotico}`;
    antecedentes.alergias.push(detalle);
    antecedentes.tieneContenido = true;
  }

  if (data.alergia_anestesia && data.alergia_anestesia !== 'NO') {
    const detalle = data.alergia_anestesia === 'OTRO' && data.alergia_anestesia_otro 
      ? `Anestesia: ${data.alergia_anestesia_otro}`
      : `Anestesia: ${data.alergia_anestesia}`;
    antecedentes.alergias.push(detalle);
    antecedentes.tieneContenido = true;
  }

  // Patologías principales
  if (data.hemorragias === 'SI') {
    antecedentes.patologias.push('Hemorragias');
    antecedentes.tieneContenido = true;
  }

  if (data.vih_sida === 'POSITIVO') {
    antecedentes.patologias.push('VIH/SIDA (Positivo)');
    antecedentes.tieneContenido = true;
  }

  if (data.tuberculosis === 'ACTIVA') {
    antecedentes.patologias.push('Tuberculosis (Activa)');
    antecedentes.tieneContenido = true;
  }

  // Enfermedades crónicas
  if (data.asma && data.asma !== 'NO') {
    antecedentes.patologias.push(`Asma: ${data.asma}`);
    antecedentes.tieneContenido = true;
  }

  if (data.diabetes && data.diabetes !== 'NO') {
    antecedentes.patologias.push(`Diabetes: ${data.diabetes}`);
    antecedentes.tieneContenido = true;
  }

  if (data.hipertension_arterial && data.hipertension_arterial !== 'NO') {
    antecedentes.patologias.push(`Hipertensión arterial: ${data.hipertension_arterial}`);
    antecedentes.tieneContenido = true;
  }

  if (data.enfermedad_cardiaca && data.enfermedad_cardiaca !== 'NO') {
    antecedentes.patologias.push(`Enfermedad cardíaca: ${data.enfermedad_cardiaca}`);
    antecedentes.tieneContenido = true;
  }

  // Otros
 // if (data.otros_antecedentes && data.otros_antecedentes.trim()) {
   // antecedentes.otros.push(data.otros_antecedentes);
  //  antecedentes.tieneContenido = true;
 // }

  return antecedentes;
};




export const getAntecedentesFamiliaresDisplay = (data: AntecedentesFamiliaresData | null | undefined) => {
  if (!data) return null;

  const familiares = {
    patologias: [] as Array<{patologia: string, parentesco: string}>,
    tieneContenido: false
  };

  // Patologías familiares
  const patologias = [
    { field: data.cardiopatia_familiar, label: 'Cardiopatía' },
    { field: data.hipertension_arterial_familiar, label: 'Hipertensión arterial' },
    { field: data.enfermedad_vascular_familiar, label: 'Enfermedad vascular' },
    { field: data.cancer_familiar, label: 'Cáncer' },
    { field: data.enfermedad_mental_familiar, label: 'Enfermedad mental' },
  ];

  patologias.forEach(p => {
    if (p.field && p.field !== 'NO') {
      familiares.patologias.push({
        patologia: p.label,
        parentesco: p.field
      });
      familiares.tieneContenido = true;
    }
  });

  // Otros antecedentes
  if (data.otros_antecedentes_familiares && data.otros_antecedentes_familiares.trim()) {
    familiares.patologias.push({
      patologia: 'Otros antecedentes',
      parentesco: data.otros_antecedentes_familiares
    });
    familiares.tieneContenido = true;
  }

  return familiares;
};


export const getExamenHallazgos = (data: ExamenEstomatognaticoData | null | undefined) => {
  if (!data) return [];
  if (data.examen_sin_patologia) return [{ region: "General", detalle: "Sin patología aparente" }];

  const regiones = [
    { nombre: "Labios", cp: data.labios_cp, desc: data.labios_descripcion },
    { nombre: "Mejillas", cp: data.mejillas_cp, desc: data.mejillas_descripcion },
    { nombre: "Maxilar Superior", cp: data.maxilar_superior_cp, desc: data.maxilar_superior_descripcion },
    { nombre: "Maxilar Inferior", cp: data.maxilar_inferior_cp, desc: data.maxilar_inferior_descripcion },
    { nombre: "Lengua", cp: data.lengua_cp, desc: data.lengua_descripcion },
    { nombre: "Paladar", cp: data.paladar_cp, desc: data.paladar_descripcion },
    { nombre: "Piso de la boca", cp: data.piso_boca_cp, desc: data.piso_boca_descripcion },
    { nombre: "Carrillos", cp: data.carrillos_cp, desc: data.carrillos_descripcion },
    { nombre: "Glándulas Salivales", cp: data.glandulas_salivales_cp, desc: data.glandulas_salivales_descripcion },
    { nombre: "ATM", cp: data.atm_cp, desc: data.atm_observacion },
    { nombre: "Ganglios", cp: data.ganglios_cp, desc: data.ganglios_descripcion },
  ];

  return regiones
    .filter(r => r.cp) 
    .map(r => ({
      region: r.nombre,
      detalle: r.desc || "Patología detectada (sin descripción detallada)"
    }));
};


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
  const piezasCompletas = indicadores.valores_por_pieza.filter(p => p.completo).length;
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