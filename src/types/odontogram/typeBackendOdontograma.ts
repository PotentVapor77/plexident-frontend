// src/types/odontogram/typeBackendOdontograma.ts

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
// ============================================================================
// HISTORIAL DE ODONTOGRAMA (Lectura)
// ============================================================================

export interface HistorialOdontogramaBackend {
  id: string;
  version_id: string;  
  diente: string;
  tipo_cambio: string;
  tipo_cambio_display: string;
  descripcion: string;
  odontologo: string;
  odontologo_nombre: string | null;
  paciente_nombre: string | null;
  fecha: string;
  datos_anteriores: Record<string, any>;
  datos_nuevos: {
    [codigoFdi: string]: {
      [superficieNombre: string]: {
        id: string;
        procedimientoId: string;
        key: string;
        nombre: string;
        siglas: string;
        colorHex: string;
        prioridad: number;
        prioridadKey: string;
        categoria_nombre: string;
        categoria_color_key: string; 
        afectaArea: string[];
        secondaryOptions: Record<string, any>;
        descripcion: string;
      }[];
    };
  };
}

export interface PiezaInfo {
  codigo_usado: string | null;
  es_alternativa: boolean;
  disponible: boolean;
  codigo_original?: string;
  diente_id?: string | null;
  ausente?: boolean;
}
export interface InformacionPiezasResponse {
  denticion: 'permanente' | 'temporal';
  piezas: Record<string, PiezaInfo>;
  estadisticas: EstadisticasPiezas;
}

export interface VerificarDisponibilidadResponse {
  puede_crear_indicadores: boolean;
  piezas_disponibles: number;
  mensaje: string;
}
export interface EstadisticasPiezas {
  total_piezas: number;
  piezas_originales: number;
  piezas_alternativas: number;
  piezas_no_disponibles: number;
  porcentaje_disponible: number;
}

export interface CalculosIndicadores {
  ohi_s: {
    indice_placa: number | null;
    indice_calculo: number | null;
    ohi_s: number | null;
    interpretacion: string;
    detalle_piezas: Array<{
      pieza: string;
      placa: number;
      calculo: number;
      placa_descripcion: string;
      calculo_descripcion: string;
      subtotal: number;
    }>;
    totales: {
      placa: number;
      calculo: number;
      superficies_evaluadas: number;
    };
  };
  indice_gingival: {
    promedio: number | null;
    interpretacion: string;
    detalle_piezas: Array<{
      pieza: string;
      valor: number;
      descripcion: string;
    }>;
    totales: {
      gingivitis: number;
      superficies_evaluadas: number;
    };
  };
  recomendaciones: string[];
  resumen: {
    higiene_oral: string;
    salud_gingival: string;
    riesgo_periodontal: string;
  };
}

export interface InformacionCalculo {
  denticion: 'permanente' | 'temporal';
  piezas_usadas: Record<string, string>;
  estadisticas: EstadisticasPiezas;
  calculos: CalculosIndicadores;
}

export interface PiezaInfo {
  codigo_usado: string | null;
  es_alternativa: boolean;
  disponible: boolean;
  codigo_original?: string;
  diente_id?: string | null;
  ausente?: boolean;
}

export interface EstadisticasPiezas {
  total_piezas: number;
  piezas_originales: number;
  piezas_alternativas: number;
  piezas_no_disponibles: number;
  porcentaje_disponible: number;
}

export interface InformacionPiezasResponse {
  denticion: 'permanente' | 'temporal';
  piezas: Record<string, PiezaInfo>;
  estadisticas: EstadisticasPiezas;
}

export interface VerificarDisponibilidadResponse {
  puede_crear_indicadores: boolean;
  piezas_disponibles: number;
  mensaje: string;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export type BackendIndicadoresSaludBucal = {
  id: string;
  paciente: string;         
  fecha: string;   
  
  // ===== CAMPOS DE AUDITORÍA =====
  creado_por?: string | null;
  actualizado_por?: string | null;
  eliminado_por?: string | null;
  fecha_modificacion?: string | null;
  fecha_eliminacion?: string | null;
  informacion_calculo?: InformacionCalculo;
  // ===== BORRADO LÓGICO =====
  activo: boolean; 
  // ================================

  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_cedula?: string;

  pieza_16_placa?: number;
  pieza_16_calculo?: number;
  pieza_16_gingivitis?: number;
  pieza_11_placa?: number;
  pieza_11_calculo?: number;
  pieza_11_gingivitis?: number;
  pieza_26_placa?: number;
  pieza_26_calculo?: number;
  pieza_26_gingivitis?: number;
  pieza_36_placa?: number;
  pieza_36_calculo?: number;
  pieza_36_gingivitis?: number;
  pieza_31_placa?: number;
  pieza_31_calculo?: number;
  pieza_31_gingivitis?: number;
  pieza_46_placa?: number;
  pieza_46_calculo?: number;
  pieza_46_gingivitis?: number;

  ohi_promedio_placa: number | null;
  ohi_promedio_calculo: number | null;
  gi_promedio_gingivitis: number | null;
  enfermedad_periodontal: "LEVE" | "MODERADA" | "SEVERA" | null;
  tipo_oclusion: "ANGLE_I" | "ANGLE_II" | "ANGLE_III" | null;
  nivel_fluorosis: "NINGUNA" | "LEVE" | "MODERADA" | "SEVERA" | null;

  observaciones: string | null;

};
export interface CrearIndicadoresSaludBucalPayload {
  paciente_id: string;
  creado_por?: string;

}

export interface OralHealthIndicatorPiece {
  pieza: string;
  placa: number;    // 0, 1, 2, 3
  calculo: number;  // 0, 1, 2, 3
  gingivitis: number; // 0, 1
}

export interface OralHealthIndicatorsData {
  id: string;
  fecha_formateada: string;
  enfermedad_periodontal_display: string;
  tipo_oclusion_display: string;
  nivel_fluorosis_display: string;
  nivel_gingivitis_display: string;
  
  // Promedios y Totales
  ohi_promedio_placa: number;
  ohi_promedio_calculo: number;
  gi_promedio_gingivitis: number;
  
  // Resúmenes estructurados del backend
  resumen_higiene: {
    nivel: string;
    valor: number;
    recomendacion: string;
  };
  resumen_gingival: {
    nivel: string;
    valor: number;
    recomendacion: string;
  };
  
  valores_por_pieza: OralHealthIndicatorPiece[];
  observaciones: string;
}

