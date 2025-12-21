// src/mappers/odontogramaMapper.ts

import type { OdontoColorKey, DiagnosticoCategory, OdontogramaData } from "../components/odontogram";
import type { PrioridadKey, DiagnosticoItem, DiagnosticoEntry } from "../core/types/typeOdontograma";
import type { 
  DiagnosticoBackend, 
  CategoriaDiagnosticoBackend, 
  OdontogramaCompletoBackend, 
  DiagnosticoDentalBackend 
} from "../types/odontogram/typeBackendOdontograma";

// ============================================================================
// MAPEO DE PRIORIDADES
// ============================================================================

const PRIORIDAD_BACKEND_TO_FRONTEND: Record<number, PrioridadKey> = {
  5: 'ALTA',
  4: 'ESTRUCTURAL',
  3: 'MEDIA',
  2: 'BAJA',
  1: 'INFORMATIVA',
};

// ============================================================================
// MAPEO DE SÍMBOLOS DE COLOR
// ============================================================================

const SIMBOLO_BACKEND_TO_FRONTEND: Record<string, OdontoColorKey> = {
  PATOLOGIA: 'PATOLOGIA',
  ANOMALIA: 'ANOMALIA',
  ENDODONCIA: 'ENDODONCIA',
  REALIZADO: 'REALIZADO',
  AUSENCIA: 'AUSENCIA',
};

// ============================================================================
// MAPEO DE SUPERFICIES (BIDIRECCIONAL)
// ============================================================================

/**
 * Convierte superficie del backend a ID del frontend
 * Backend: "vestibular", "oclusal", "raiz_mesial"
 * Frontend: "cara_vestibular", "cara_oclusal", "raiz:raiz-mesial"
 */
export function superficieBackendToFrontend(nombre: string): string {
  const map: Record<string, string> = {
    vestibular: 'cara_vestibular',
    lingual: 'cara_lingual',
    oclusal: 'cara_oclusal',
    mesial: 'cara_mesial',
    distal: 'cara_distal',
    raiz_mesial: 'raiz:raiz-mesial',
    raiz_distal: 'raiz:raiz-distal',
    raiz_palatal: 'raiz:raiz-palatal',
    raiz_vestibular: 'raiz:raiz-vestibular',
    raiz_principal: 'raiz:raiz-principal',
  };
  return map[nombre] || nombre;
}

/**
 * Convierte superficie del frontend a nombre del backend
 */
export function superficieFrontendToBackend(superficieId: string): string {
  const map: Record<string, string> = {
    cara_vestibular: 'vestibular',
    cara_lingual: 'lingual',
    cara_oclusal: 'oclusal',
    cara_mesial: 'mesial',
    cara_distal: 'distal',
    'raiz:raiz-mesial': 'raiz_mesial',
    'raiz:raiz-distal': 'raiz_distal',
    'raiz:raiz-palatal': 'raiz_palatal',
    'raiz:raiz-vestibular': 'raiz_vestibular',
    'raiz:raiz-principal': 'raiz_principal',
  };
  return map[superficieId] || superficieId;
}

// ============================================================================
// MAPEO BACKEND → FRONTEND (Para GET/Lectura)
// ============================================================================

/**
 * Mapea superficie_aplicables del backend a areas_afectadas del frontend
 * Backend: ["vestibular", "oclusal"] o ["general"]
 * Frontend: ["corona"] o ["general"]
 */
function mapearSuperficiesAplicables(superficies: string[]): ('corona' | 'raiz' | 'general')[] {
  if (superficies.includes('general')) return ['general'];
  
  const tieneCorona = superficies.some(s =>
    ['vestibular', 'lingual', 'oclusal', 'mesial', 'distal'].includes(s)
  );
  const tieneRaiz = superficies.some(s => s.startsWith('raiz_'));
  
  const result: ('corona' | 'raiz' | 'general')[] = [];
  if (tieneCorona) result.push('corona');
  if (tieneRaiz) result.push('raiz');
  
  return result.length > 0 ? result : ['general'];
}

/**
 * Convierte una instancia de diagnóstico dental del backend a DiagnosticoEntry del frontend
 */
function mapearDiagnosticoInstanceBackendToFrontend(
  diag: DiagnosticoDentalBackend
): DiagnosticoEntry {
  const diagCatalogo = diag.diagnostico_catalogo_detalle;
  
  return {
    id: diag.id,
    procedimientoId: diagCatalogo?.key || String(diag.diagnostico_catalogo),
    colorHex: diag.tipo_registro === 'azul' ? '#0ea5e9' : '#ef4444',
    priority: diag.prioridad_asignada || diagCatalogo?.prioridad || 3,
    siglas: diagCatalogo?.siglas || '?',
    nombre: diagCatalogo?.nombre || 'Desconocido',
    areas_afectadas: diagCatalogo?.superficie_aplicables
      ? mapearSuperficiesAplicables(diagCatalogo.superficie_aplicables)
      : ['general'],
    secondaryOptions: diag.atributos_clinicos || {},
    descripcion: diag.descripcion,
    superficieId: diag.superficie_detalle?.nombre,
    prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[diag.prioridad_asignada || diagCatalogo?.prioridad || 3],
  };
}

/**
 * Convierte la respuesta completa del odontograma del backend al formato OdontogramaData del frontend
 * 
 * Backend:
 * {
 *   dientes: [
 *     { codigo_fdi: "11", superficies: [{ nombre: "vestibular", diagnosticos: [...] }] }
 *   ]
 * }
 * 
 * Frontend:
 * {
 *   "11": {
 *     "cara_vestibular": [{ id: "uuid", procedimientoId: "caries_icdas_3", ... }]
 *   }
 * }
 */
export function mapearOdontogramaBackendToFrontend(
  odontograma: OdontogramaCompletoBackend
): OdontogramaData {
  const data: OdontogramaData = {};
  
  odontograma.dientes.forEach(diente => {
    const toothId = diente.codigo_fdi;
    data[toothId] = {};
    
    diente.superficies.forEach(superficie => {
      const surfaceId = superficieBackendToFrontend(superficie.nombre);
      data[toothId][surfaceId] = superficie.diagnosticos
        .filter(d => d.activo)
        .map(diag => mapearDiagnosticoInstanceBackendToFrontend(diag));
    });
  });
  
  return data;
}

// ============================================================================
// 🆕 MAPEO FRONTEND → BACKEND (Para POST/Guardado)
// ============================================================================

/**
 * Convierte el OdontogramaData del frontend al formato esperado por el backend
 * 
 * Frontend (OdontogramaData):
 * {
 *   "11": {
 *     "cara_vestibular": [
 *       { 
 *         id: "uuid", 
 *         procedimientoId: "caries_icdas_3",
 *         colorHex: "#ef4444",
 *         descripcion: "Caries profunda",
 *         secondaryOptions: { material: "resina" },
 *         areas_afectadas: ["corona"]
 *       }
 *     ]
 *   }
 * }
 * 
 * Backend esperado:
 * {
 *   "11": {
 *     "vestibular": [
 *       { 
 *         procedimientoId: "caries_icdas_3",
 *         colorHex: "#ef4444",
 *         descripcion: "Caries profunda",
 *         secondaryOptions: { material: "resina" },
 *         afectaArea: ["corona"]
 *       }
 *     ]
 *   }
 * }
 */
export function mapearOdontogramaFrontendToBackend(
  odontogramaData: OdontogramaData
): Record<string, Record<string, any[]>> {
  const backendData: Record<string, Record<string, any[]>> = {};
  
  // Iterar por cada diente
  Object.entries(odontogramaData).forEach(([codigoFdi, superficies]) => {
    backendData[codigoFdi] = {};
    
    // Iterar por cada superficie del diente
    Object.entries(superficies).forEach(([surfaceIdFrontend, diagnosticos]) => {
      // Convertir ID de superficie (cara_vestibular → vestibular)
      const nombreBackend = superficieFrontendToBackend(surfaceIdFrontend);
      
      // Mapear cada diagnóstico al formato del backend
      backendData[codigoFdi][nombreBackend] = diagnosticos.map(diag => ({
        procedimientoId: diag.procedimientoId,
        colorHex: diag.colorHex,
        secondaryOptions: diag.secondaryOptions || {},
        descripcion: diag.descripcion || '',
        afectaArea: diag.areas_afectadas || [],
      }));
    });
  });
  
  return backendData;
}

/**
 * Filtra solo los diagnósticos nuevos (sin ID del backend o con ID temporal)
 * Útil para guardado incremental
 * 
 * @param odontogramaData - OdontogramaData completo del frontend
 * @returns OdontogramaData solo con diagnósticos nuevos
 */
export function extraerDiagnosticosNuevos(
  odontogramaData: OdontogramaData
): OdontogramaData {
  const nuevos: OdontogramaData = {};
  
  Object.entries(odontogramaData).forEach(([toothId, superficies]) => {
    Object.entries(superficies).forEach(([surfaceId, diagnosticos]) => {
      const diagnosticosNuevos = diagnosticos.filter(
        diag => !diag.id || diag.id.startsWith('temp-')
      );
      
      if (diagnosticosNuevos.length > 0) {
        if (!nuevos[toothId]) nuevos[toothId] = {};
        nuevos[toothId][surfaceId] = diagnosticosNuevos;
      }
    });
  });
  
  return nuevos;
}

// ============================================================================
// MAPEO DE CATÁLOGO (Opcional, solo si lo usas)
// ============================================================================

/**
 * Convierte un diagnóstico del backend al formato del frontend
 */
export function mapearDiagnosticoBackendToFrontend(diagBackend: DiagnosticoBackend): DiagnosticoItem {
  return {
    id: diagBackend.key,
    nombre: diagBackend.nombre,
    siglas: diagBackend.siglas,
    simboloColor: SIMBOLO_BACKEND_TO_FRONTEND[diagBackend.simbolo_color] || 'PATOLOGIA',
    categoria: diagBackend.categoria_nombre as any,
    areas_afectadas: mapearSuperficiesAplicables(diagBackend.superficie_aplicables),
    atributos_clinicos: {},
  };
}

/**
 * Convierte categorías completas del backend al formato del frontend
 */
export function mapearCategoriasBackendToFrontend(
  categorias: CategoriaDiagnosticoBackend[],
  diagnosticos: DiagnosticoBackend[]
): DiagnosticoCategory[] {
  return categorias.map(cat => ({
    id: cat.nombre as any,
    nombre: cat.nombre,
    colorKey: SIMBOLO_BACKEND_TO_FRONTEND[cat.color_key] || 'PATOLOGIA',
    prioridadKey: cat.prioridad_key as PrioridadKey,
    diagnosticos: diagnosticos
      .filter(d => d.categoria === cat.id)
      .map(mapearDiagnosticoBackendToFrontend),
  }));
}
