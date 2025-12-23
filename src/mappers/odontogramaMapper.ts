// src/mappers/odontogramaMapper.ts

import type { OdontoColorKey, DiagnosticoCategory, OdontogramaData } from "../components/odontogram";
import type { PrioridadKey, DiagnosticoItem, DiagnosticoEntry, TipoDiagnostico, AtributoClinicoDefinicion } from "../core/types/typeOdontograma";
import type {
  DiagnosticoBackend,
  CategoriaDiagnosticoBackend,
  OdontogramaCompletoBackend,
  DiagnosticoDentalBackend,
  TipoAtributoClinicoBackend
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

const PRIORIDAD_KEY_TO_BACKEND: Record<PrioridadKey, string> = {
  'ALTA': 'ALTA',
  'ESTRUCTURAL': 'ESTRUCTURAL',
  'MEDIA': 'MEDIA',
  'BAJA': 'BAJA',
  'INFORMATIVA': 'INFORMATIVA',
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
// MAPEO DE TIPOS DE DIAGNÓSTICO (CATEGORÍAS)
// ============================================================================
const CATEGORIA_BACKEND_TO_FRONTEND: Record<string, TipoDiagnostico> = {
  'patologia_activa': 'Patología Activa',
  'Patología Activa': 'Patología Activa',
  'restauracion': 'Restauración',
  'Restauración': 'Restauración',
  'tratamiento_conductos': 'Tratamiento de Conductos',
  'Tratamiento de Conductos': 'Tratamiento de Conductos',
  'ausencia': 'Ausencia',
  'Ausencia': 'Ausencia',
  'anomalia': 'Anomalía',
  'Anomalía': 'Anomalía',
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
  if (!superficies || superficies.length === 0) return ['general'];
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
 * ✅ FIXED: Mapea atributos clínicos del backend al formato del frontend
 */
function mapearAtributosClinicos(
  atributosTipos?: TipoAtributoClinicoBackend[]
): Record<string, AtributoClinicoDefinicion> {
  if (!atributosTipos || atributosTipos.length === 0) {
    return {};
  }

  const atributos: Record<string, AtributoClinicoDefinicion> = {};
  
  atributosTipos.forEach(tipo => {
    if (tipo.key && tipo.opciones && tipo.opciones.length > 0) {
      atributos[tipo.key] = {
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        tipo_input: 'select',
        requerido: false,
        opciones: tipo.opciones.map(opt => ({
          key: opt.key,
          label: opt.nombre,
          prioridad: opt.prioridad,
          orden: opt.orden,
        }))
      };
    }
  });

  return atributos;
}

/**
 * 🆕 MEJORADO: Convierte un diagnóstico del backend al formato del frontend
 */
export function mapearDiagnosticoBackendToFrontend(
  diagBackend: DiagnosticoBackend,
  atributosClinicos?: TipoAtributoClinicoBackend[]
): DiagnosticoItem {
  return {
    id: diagBackend.key,
    nombre: diagBackend.nombre,
    siglas: diagBackend.siglas,
    simboloColor: SIMBOLO_BACKEND_TO_FRONTEND[diagBackend.simbolo_color] || 'PATOLOGIA',
    categoria: CATEGORIA_BACKEND_TO_FRONTEND[diagBackend.categoria_nombre || ''] || 'Patología Activa',
    prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[diagBackend.prioridad] || 'MEDIA',
    areas_afectadas: mapearSuperficiesAplicables(diagBackend.superficie_aplicables || []),
    atributos_clinicos: mapearAtributosClinicos(atributosClinicos),
  };
}

/**
 * 🆕 REFACTORIZADO: Convierte categorías completas del backend al formato del frontend
 */
export function mapearCategoriasBackendToFrontend(
  categorias: CategoriaDiagnosticoBackend[],
  atributosClinicos?: TipoAtributoClinicoBackend[]
): DiagnosticoCategory[] {
  return categorias
    .filter(cat => cat.activo)
    .map(cat => {
      const diagnosticosMapeados: DiagnosticoItem[] = (cat.diagnosticos || [])
        .filter((diag: DiagnosticoBackend) => diag.activo)
        .map((diag: DiagnosticoBackend) =>
          mapearDiagnosticoBackendToFrontend(diag, atributosClinicos)
        );

      const categoriaId = CATEGORIA_BACKEND_TO_FRONTEND[cat.nombre] || cat.nombre;

      return {
        id: categoriaId as TipoDiagnostico,
        nombre: cat.nombre,
        colorKey: SIMBOLO_BACKEND_TO_FRONTEND[cat.color_key] || 'PATOLOGIA',
        prioridadKey: cat.prioridad_key as PrioridadKey,
        diagnosticos: diagnosticosMapeados,
      };
    })
    .filter(cat => cat.diagnosticos.length > 0);
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
    descripcion: diag.descripcion || '',
    superficieId: diag.superficie_detalle?.nombre,
    prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[diag.prioridad_asignada || diagCatalogo?.prioridad || 3] || 'MEDIA',
  };
}

/**
 * ✅ FIXED: Convierte la respuesta completa del odontograma
 * IMPORTANTE: Genera TODOS los 32 dientes, no solo los que tienen diagnósticos
 */
export function mapearOdontogramaBackendToFrontend(
  odontograma: OdontogramaCompletoBackend
): OdontogramaData {
  const data: OdontogramaData = {};
  
  // ✅ Todos los códigos FDI para dentición permanente (32 dientes)
  const TODOS_LOS_DIENTES = [
    // Cuadrante 1 (Superior derecho): 18-11
    '18', '17', '16', '15', '14', '13', '12', '11',
    // Cuadrante 2 (Superior izquierdo): 21-28
    '21', '22', '23', '24', '25', '26', '27', '28',
    // Cuadrante 3 (Inferior izquierdo): 38-31
    '38', '37', '36', '35', '34', '33', '32', '31',
    // Cuadrante 4 (Inferior derecho): 41-48
    '41', '42', '43', '44', '45', '46', '47', '48'
  ];

  // ✅ Inicializar TODOS los dientes con objetos vacíos
  TODOS_LOS_DIENTES.forEach(codigoFdi => {
    data[codigoFdi] = {};
  });

  // ✅ VALIDACIÓN: Verificar que dientes existe
  if (!odontograma || !odontograma.dientes) {
    console.info('ℹ️ Odontograma nuevo - todos los dientes limpios');
    return data;
  }

  const dientes = Array.isArray(odontograma.dientes) ? odontograma.dientes : [];

  // ✅ Llenar solo los dientes que tienen diagnósticos
  dientes.forEach(diente => {
    const toothId = diente.codigo_fdi;
    
    // Si el diente no está en nuestra lista, omitir (dientes temporales)
    if (!TODOS_LOS_DIENTES.includes(toothId)) {
      return;
    }

    const superficies = diente.superficies || [];

    superficies.forEach(superficie => {
      const surfaceId = superficieBackendToFrontend(superficie.nombre);
      const diagnosticos = superficie.diagnosticos || [];
      
      data[toothId][surfaceId] = diagnosticos
        .filter(d => d.activo !== false)
        .map(diag => mapearDiagnosticoInstanceBackendToFrontend(diag));
    });
  });

  console.log(`✅ Mapper: ${TODOS_LOS_DIENTES.length} dientes totales, ${dientes.length} con diagnósticos`);
  return data;
}

// ============================================================================
// 🆕 MAPEO FRONTEND → BACKEND (Para POST/Guardado)
// ============================================================================

/**
 * Convierte el OdontogramaData del frontend al formato esperado por el backend
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
