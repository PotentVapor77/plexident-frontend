// src/mappers/odontogramaMapper.ts

import type { OdontoColorKey, DiagnosticoCategory, OdontogramaData } from "../components/odontogram";
import type { PrioridadKey, DiagnosticoItem, DiagnosticoEntry, TipoDiagnostico, AtributoClinicoDefinicion,  } from "../core/types/odontograma.types";
import type {
  DiagnosticoBackend,
  CategoriaDiagnosticoBackend,
  OdontogramaCompletoBackend,
  DiagnosticoDentalBackend,
  TipoAtributoClinicoBackend,
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

//const PRIORIDAD_KEY_TO_BACKEND: Record<PrioridadKey, string> = {
// 'ALTA': 'ALTA',
// 'ESTRUCTURAL': 'ESTRUCTURAL',
// 'MEDIA': 'MEDIA',
// 'BAJA': 'BAJA',
// 'INFORMATIVA': 'INFORMATIVA',
//};

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
    // AGREGAR ESTOS:
    'general': 'general',
    'diente_completo': 'general',
    'corona_completa': 'corona_completa',
    'raiz_completa': 'raiz_completa',
  };
  return map[superficieId] || superficieId;
}

// ============================================================================
// MAPEO BACKEND → FRONTEND (Para GET/Lectura)
// ============================================================================

/**
 * Mapea superficie_aplicables del backend a areasafectadas del frontend
 */
function mapearSuperficiesAplicables(superficies?: string[]): ('corona' | 'raiz' | 'general')[] {
  if (!superficies || superficies.length === 0) {
    return ['general'];
  }
  if (superficies.length === 1 && superficies[0] === 'general') {
    return ['general'];
  }
  
  const tieneCorona = superficies.some(s => 
    ['vestibular', 'lingual', 'oclusal', 'mesial', 'distal'].includes(s)
  );
  const tieneRaiz = superficies.some(s => s.startsWith('raiz'));
  
  const result: ('corona' | 'raiz' | 'general')[] = [];
  if (tieneCorona) result.push('corona');
  if (tieneRaiz) result.push('raiz');
  return result.length > 0 ? result : ['corona'];  
}

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
    areasafectadas: mapearSuperficiesAplicables(diagBackend.superficie_aplicables || []),
    atributos_clinicos: mapearAtributosClinicos(atributosClinicos),
  };
}

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


function mapearDiagnosticoInstanceBackendToFrontend(
  diag: DiagnosticoDentalBackend
): DiagnosticoEntry {
  const diagCatalogo = diag.diagnostico_catalogo_detalle;
  const prioridadBackend = diag.prioridad_asignada || diagCatalogo?.prioridad || 3;

  return {
    id: diag.id,
    key: diagCatalogo?.key || String(diag.diagnostico_catalogo),
    procedimientoId: diagCatalogo?.key || String(diag.diagnostico_catalogo),
    colorHex: diag.tipo_registro === 'azul' ? '#0ea5e9' : '#ef4444',
    priority: prioridadBackend,
    siglas: diagCatalogo?.siglas || '?',
    nombre: diagCatalogo?.nombre || 'Desconocido',
    areasafectadas: diagCatalogo?.superficie_aplicables
      ? mapearSuperficiesAplicables(diagCatalogo.superficie_aplicables)
      : ['general'],
    secondaryOptions: diag.atributos_clinicos || {},
    descripcion: diag.descripcion || '',
    superficieId: diag.superficie_detalle?.nombre,
    prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[prioridadBackend] || 'MEDIA',
  };
}

export function mapearOdontogramaBackendToFrontend(
  odontograma: OdontogramaCompletoBackend
): OdontogramaData {
  const data: OdontogramaData = {};

  const TODOS_LOS_DIENTES = [
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '38', '37', '36', '35', '34', '33', '32', '31',
    '41', '42', '43', '44', '45', '46', '47', '48',
  ];

  // 1) Inicializar todos los dientes vacíos
  TODOS_LOS_DIENTES.forEach(codigoFdi => {
    data[codigoFdi] = {};
  });

  // 2) Si viene el formato “viejo” con dientes, seguir soportándolo
  const dientes = Array.isArray(odontograma.dientes) ? odontograma.dientes : [];
  if (dientes.length > 0) {
    dientes.forEach(diente => {
      const toothId = diente.codigo_fdi;
      if (!TODOS_LOS_DIENTES.includes(toothId)) return;

      const superficies = diente.superficies || [];
      superficies.forEach(superficie => {
        const surfaceId = superficieBackendToFrontend(superficie.nombre);
        const diagnosticos = superficie.diagnosticos || [];
        data[toothId][surfaceId] = diagnosticos
          .filter(d => d.activo !== false)
          .map(diag => mapearDiagnosticoInstanceBackendToFrontend(diag));
      });
    });
  }

  // 3) Naplicar también odontograma_data plano (formato /completo/)
  const odData = odontograma.odontograma_data || {};

  Object.entries(odData).forEach(([codigoFdi, superficies]) => {
    if (!data[codigoFdi]) {
      data[codigoFdi] = {};
    }

    Object.entries(superficies as Record<string, any[]>).forEach(
      ([nombreSuperficie, lista]) => {
        if (!Array.isArray(lista)) return;

        const surfaceId = superficieBackendToFrontend(nombreSuperficie);
        if (!data[codigoFdi][surfaceId]) {
          data[codigoFdi][surfaceId] = [];
        }

        lista.forEach((diag: any) => {
          const entry: DiagnosticoEntry = {
            id: diag.id,
            key: diag.key || diag.procedimientoId,
            procedimientoId: diag.procedimientoId,
            colorHex: diag.colorHex ||
              (diag.tipo_registro === 'azul' ? '#0ea5e9' : '#ef4444'),
            secondaryOptions: diag.secondaryOptions || {},
            descripcion: diag.descripcion || '',
            areasafectadas: diag.afectaArea || ['general'],
            superficieId: surfaceId,
            siglas: diag.siglas || '?',
            nombre: diag.nombre || 'Desconocido',
            priority: diag.prioridad ?? 3,
            prioridadKey: PRIORIDAD_BACKEND_TO_FRONTEND[diag.prioridad ?? 3] || 'MEDIA',
          };

          data[codigoFdi][surfaceId].push(entry);
        });
      }
    );
  });


  return data;
}

// ============================================================================
//  MAPEO FRONTEND → BACKEND (Para POST/Guardado)
// ============================================================================

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
        id: diag.id,
        procedimientoId: diag.procedimientoId,
        colorHex: diag.colorHex,
        secondaryOptions: diag.secondaryOptions || {},
        descripcion: diag.descripcion || '',
        afectaArea: diag.areasafectadas || [],
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
  const nuevos: OdontogramaData = {}

  Object.entries(odontogramaData).forEach(([toothId, superficies]) => {
    Object.entries(superficies).forEach(([surfaceId, diagnosticos]) => {
      const diagnosticosNuevos = diagnosticos.filter(
        diag =>
          !diag.id ||
          diag.id.startsWith('temp-') ||
          diag.id.length === 0
      )

      if (diagnosticosNuevos.length > 0) {
        if (!nuevos[toothId]) nuevos[toothId] = {}
        nuevos[toothId][surfaceId] = diagnosticosNuevos
      }
    })
  })

  return nuevos
}
