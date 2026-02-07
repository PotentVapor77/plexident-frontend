// Reemplazar el contenido del archivo diagnosticosCIEMapper.ts con:

import type {
  DiagnosticoCIEData,
  SincronizarDiagnosticosPayload,
} from "../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * Formatea la fecha del diagnóstico a formato legible
 */
export const formatFechaDiagnostico = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Fecha no disponible";
  }
};

/**
 * Obtiene el color según el tipo de CIE (PRE/DEF)
 */
export const getColorPorTipoCIE = (tipoCIE: "PRE" | "DEF"): string => {
  const colores = {
    PRE: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
    DEF: "bg-green-100 text-green-800 ring-green-600/20",
  };
  return colores[tipoCIE] || "bg-gray-100 text-gray-800 ring-gray-600/20";
};

/**
 * Obtiene el texto del tipo de CIE
 */
export const getTipoCIEDisplay = (tipoCIE: "PRE" | "DEF"): string => {
  const textos = {
    PRE: "Presuntivo",
    DEF: "Definitivo",
  };
  return textos[tipoCIE] || "Desconocido";
};

/**
 * Agrupa diagnósticos por diente FDI
 */
export const agruparDiagnosticosPorDiente = (
  diagnosticos: DiagnosticoCIEData[]
): Record<string, DiagnosticoCIEData[]> => {
  return diagnosticos.reduce((agrupados, diagnostico) => {
    const dienteFDI = diagnostico.diente_fdi;
    if (!agrupados[dienteFDI]) {
      agrupados[dienteFDI] = [];
    }
    agrupados[dienteFDI].push(diagnostico);
    return agrupados;
  }, {} as Record<string, DiagnosticoCIEData[]>);
};

/**
 * Agrupa diagnósticos por código CIE-10
 */
export const agruparDiagnosticosPorCIE = (
  diagnosticos: DiagnosticoCIEData[]
): Record<string, DiagnosticoCIEData[]> => {
  return diagnosticos.reduce((agrupados, diagnostico) => {
    const codigoCIE = diagnostico.codigo_cie;
    if (!agrupados[codigoCIE]) {
      agrupados[codigoCIE] = [];
    }
    agrupados[codigoCIE].push(diagnostico);
    return agrupados;
  }, {} as Record<string, DiagnosticoCIEData[]>);
};

/**
 * Calcula estadísticas básicas de diagnósticos
 */
export const calcularEstadisticasDiagnosticos = (
  diagnosticos: DiagnosticoCIEData[]
): {
  total: number;
  presuntivos: number;
  definitivos: number;
  porDiente: Record<string, number>;
  porCIE: Record<string, number>;
} => {
  const estadisticas = {
    total: diagnosticos.length,
    presuntivos: 0,
    definitivos: 0,
    porDiente: {} as Record<string, number>,
    porCIE: {} as Record<string, number>,
  };

  diagnosticos.forEach((diagnostico) => {
    // Contar por tipo
    if (diagnostico.tipo_cie === "PRE") {
      estadisticas.presuntivos++;
    } else if (diagnostico.tipo_cie === "DEF") {
      estadisticas.definitivos++;
    }

    // Contar por diente
    const dienteFDI = diagnostico.diente_fdi;
    estadisticas.porDiente[dienteFDI] = (estadisticas.porDiente[dienteFDI] || 0) + 1;

    // Contar por código CIE
    const codigoCIE = diagnostico.codigo_cie;
    estadisticas.porCIE[codigoCIE] = (estadisticas.porCIE[codigoCIE] || 0) + 1;
  });

  return estadisticas;
};

/**
 * Filtra diagnósticos por varios criterios
 */
export const filtrarDiagnosticos = (
  diagnosticos: DiagnosticoCIEData[],
  filtros: {
    tipoCIE?: "PRE" | "DEF" | "todos";
    dienteFDI?: string;
    codigoCIE?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    textoBusqueda?: string;
  }
): DiagnosticoCIEData[] => {
  return diagnosticos.filter((diagnostico) => {
    // Filtro por tipo CIE
    if (filtros.tipoCIE && filtros.tipoCIE !== "todos") {
      if (diagnostico.tipo_cie !== filtros.tipoCIE) return false;
    }

    // Filtro por diente FDI
    if (filtros.dienteFDI) {
      if (diagnostico.diente_fdi !== filtros.dienteFDI) return false;
    }

    // Filtro por código CIE
    if (filtros.codigoCIE) {
      if (diagnostico.codigo_cie !== filtros.codigoCIE) return false;
    }

    // Filtro por fecha
    if (filtros.fechaDesde || filtros.fechaHasta) {
      const fechaDiagnostico = new Date(diagnostico.fecha_diagnostico);
      
      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaDiagnostico < fechaDesde) return false;
      }
      
      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaDiagnostico > fechaHasta) return false;
      }
    }

    // Filtro por texto de búsqueda
    if (filtros.textoBusqueda) {
      const busqueda = filtros.textoBusqueda.toLowerCase();
      const textoCompleto = `
        ${diagnostico.diagnostico_nombre?.toLowerCase() || ""}
        ${diagnostico.diagnostico_siglas?.toLowerCase() || ""}
        ${diagnostico.codigo_cie?.toLowerCase() || ""}
        ${diagnostico.diente_fdi?.toLowerCase() || ""}
        ${diagnostico.superficie_nombre?.toLowerCase() || ""}
        ${diagnostico.descripcion?.toLowerCase() || ""}
      `;
      
      if (!textoCompleto.includes(busqueda)) return false;
    }

    return true;
  });
};

/**
 * Mapea datos de diagnóstico para la UI
 */
export const mapDiagnosticoToUI = (
  diagnostico: DiagnosticoCIEData
): DiagnosticoCIEData & {
  tipo_cie_display: string;
  fecha_formateada: string;
  puede_editar: boolean;
  puede_eliminar: boolean;
} => {
  return {
    ...diagnostico,
    tipo_cie_display: getTipoCIEDisplay(diagnostico.tipo_cie),
    fecha_formateada: formatFechaDiagnostico(diagnostico.fecha_diagnostico || diagnostico.fecha_creacion || new Date().toISOString()),
    puede_editar: diagnostico.activo === undefined || diagnostico.activo === true,
    puede_eliminar: diagnostico.activo === undefined || diagnostico.activo === true,
  };
};

/**
 * Valida si se puede eliminar/actualizar un diagnóstico
 */
export const validarAccionDiagnostico = (
  diagnostico: DiagnosticoCIEData,
  historialEstado: "BORRADOR" | "ABIERTO" | "CERRADO"
): {
  puedeEliminar: boolean;
  puedeActualizar: boolean;
  mensajeError?: string;
} => {
  const resultado = {
    puedeEliminar: true,
    puedeActualizar: true,
    mensajeError: undefined as string | undefined,
  };

  // Verificar si el historial está cerrado
  if (historialEstado === "CERRADO") {
    resultado.puedeEliminar = false;
    resultado.puedeActualizar = false;
    resultado.mensajeError = "No se pueden modificar diagnósticos de un historial cerrado";
    return resultado;
  }

  // Verificar si el diagnóstico está activo (si existe el campo)
  if (diagnostico.activo === false) {
    resultado.puedeEliminar = false;
    resultado.puedeActualizar = false;
    resultado.mensajeError = "Este diagnóstico ya fue eliminado";
    return resultado;
  }

  return resultado;
};

/**
 * Prepara payload para sincronización
 */
export const prepararPayloadSincronizacion = (
  diagnosticosSeleccionados: DiagnosticoCIEData[],
  tipoCarga: "nuevos" | "todos"
): SincronizarDiagnosticosPayload => {
  return {
    diagnosticos_finales: diagnosticosSeleccionados.map((diag) => ({
      diagnostico_dental_id: diag.diagnostico_dental_id,
      tipo_cie: diag.tipo_cie,
    })),
    tipo_carga: tipoCarga,
  };
};

export default {
  formatFechaDiagnostico,
  getColorPorTipoCIE,
  getTipoCIEDisplay,
  agruparDiagnosticosPorDiente,
  agruparDiagnosticosPorCIE,
  calcularEstadisticasDiagnosticos,
  filtrarDiagnosticos,
  mapDiagnosticoToUI,
  validarAccionDiagnostico,
  prepararPayloadSincronizacion,
};