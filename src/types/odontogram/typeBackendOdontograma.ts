// src/types/odontogram/typeBackendOdontograma.ts

/**
 * Tipos que mapean EXACTAMENTE a los modelos de Django
 * y los serializers del backend
 */

// ============================================================================
// CATÁLOGO DE DIAGNÓSTICOS
// ============================================================================

export interface CategoriaDiagnosticoBackend {
  id: number;
  key: string;
  nombre: string;
  color_key: string;
  prioridad_key: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  diagnosticos: DiagnosticoBackend[];
}

export interface OpcionAtributoClinicoBackend {
  key: string;
  nombre: string;
  prioridad: number | null;
  orden: number;
}

export interface AtributoClinicoBackend {
  key: string;
  nombre: string;
  descripcion: string;
  tipo_input: 'select' | 'radio' | 'checkbox' | 'text';
  requerido: boolean;
  opciones: OpcionAtributoClinicoBackend[];
}

export interface DiagnosticoBackend {
  id: number;
  key: string;
  categoria: number; // FK a CategoriaDiagnostico
  categoria_nombre?: string; // Nested desde serializer
  nombre: string;
  siglas: string;
  simbolo_color: string;
  prioridad: 1 | 2 | 3 | 4 | 5;
  activo: boolean;
  // Códigos estandarizados
  codigo_icd10: string;
  codigo_cdt: string;
  codigo_fhir: string;
  tipo_recurso_fhir: 'Condition' | 'Procedure' | 'Observation';
  // Formulario 033
  simbolo_formulario_033: string;

  superficie_aplicables: string[]; 

  atributos_relacionados?: AtributoClinicoBackend[];
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface TipoAtributoClinicoBackend {
  id: number;
  key: string;
  nombre: string;
  descripcion: string;
  opciones: OpcionAtributoClinicoBackend[];
  activo: boolean;
}

// ============================================================================
// INSTANCIAS DE DIENTES Y DIAGNÓSTICOS (Lectura/Escritura)
// ============================================================================

export interface DienteBackend {
  id: string; // UUID
  paciente: string; // UUID del paciente
  codigo_fdi: string; // "11", "21", etc.
  nombre: string;
  numero_3d: number | null;
  tipo_denticion: 'permanente' | 'temporal';
  ausente: boolean;
  razon_ausencia: 'caries' | 'otra_causa' | 'sin_erupcionar' | 'exodoncia_planificada' | '';
  movilidad: 0 | 1 | 2 | 3;
  recesion_gingival: 0 | 1 | 2 | 3 | 4;
  fecha_creacion: string;
  fecha_modificacion: string;
  // Propiedades computadas (readonly)
  posicion_arcada?: 'SUPERIOR' | 'INFERIOR';
  posicion_cuadrante?: number;
  es_temporal?: boolean;
  lado_arcada?: 'DERECHO' | 'IZQUIERDO';
}

export interface SuperficieDentalBackend {
  id: string; // UUID
  diente: string; // UUID
  nombre: 'vestibular' | 'lingual' | 'oclusal' | 'mesial' | 'distal'
    | 'raiz_mesial' | 'raiz_distal' | 'raiz_palatal' | 'raiz_vestibular' | 'raiz_principal';
  codigo_fhir_superficie: string; // 'F', 'L', 'O', 'M', 'D', 'RM', etc.
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface DiagnosticoDentalBackend {
  id: string; // UUID
  superficie: string; // UUID de SuperficieDental
  diagnostico_catalogo: number; // FK a Diagnostico
  odontologo: string; // UUID del usuario
  descripcion: string;
  atributos_clinicos: Record<string, any>;
  prioridad_asignada: number | null;
  movilidad: 0 | 1 | 2 | 3 | 4 | null;
  recesion_gingival: 0 | 1 | 2 | 3 | 4 | null;
  tipo_registro: 'rojo' | 'azul';
  estado_tratamiento: 'diagnosticado' | 'en_tratamiento' | 'tratado' | 'cancelado';
  fecha: string;
  fecha_modificacion: string;
  fecha_tratamiento: string | null;
  activo: boolean;
  // Nested data (si usas serializers anidados)
  diagnostico_catalogo_detalle?: DiagnosticoBackend;
  superficie_detalle?: SuperficieDentalBackend;
  odontologo_nombre?: string;
}

// ============================================================================
// PAYLOAD PARA CREAR/ACTUALIZAR DIAGNÓSTICO
// ============================================================================

export interface CrearDiagnosticoPayload {
  // IDs requeridos
  paciente_id: string; // UUID
  codigo_fdi: string; // "11", "21", etc.
  superficie_nombre: string; // "vestibular", "oclusal", etc.
  diagnostico_catalogo_id: number; // ID del diagnóstico del catálogo
  // Campos opcionales
  descripcion?: string;
  atributos_clinicos?: Record<string, any>;
  prioridad_asignada?: number;
  movilidad?: number;
  recesion_gingival?: number;
  tipo_registro?: 'rojo' | 'azul';
}

// ============================================================================
// RESPUESTA DEL ODONTOGRAMA COMPLETO
// ============================================================================

export interface OdontogramaCompletoBackend {
  paciente: {
    id: string;
    nombres: string;
    apellidos: string;
    cedula_pasaporte: string;
  };

  // Formato antiguo (si el backend lo sigue enviando)
  dientes: DienteConDiagnosticos[];

  // NUEVO: formato plano /completo/
  odontograma_data?: {
    [codigoFdi: string]: {
      [superficieNombre: string]: {
        id: string;
        procedimientoId: string;
        colorHex: string;
        secondaryOptions: Record<string, any>;
        descripcion: string;
        afectaArea: string[];
        estado_tratamiento: string;
        prioridad: number;
        fecha: string;
        odontologo: string;
      }[];
    };
  };

  // Si tu backend también manda esto:
  fecha_obtension?: string;
}

export interface DienteConDiagnosticos extends DienteBackend {
  superficies: SuperficieConDiagnosticos[];
}

export interface SuperficieConDiagnosticos extends SuperficieDentalBackend {
  diagnosticos: DiagnosticoDentalBackend[];
}
