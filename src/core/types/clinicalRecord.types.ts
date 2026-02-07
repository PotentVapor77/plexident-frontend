// src/core/types/clinicalRecord.types.ts

import type { AntecedentesFamiliaresData, AntecedentesPersonalesData, ConstantesVitalesData, DiagnosticoCIEData, DiagnosticosCIEResponse, EmbarazoEstado, EstadoHistorial, ExamenEstomatognaticoData, IndicadoresSaludBucalData, IndicesCariesData, SesionTratamientoData,  } from "../../types/clinicalRecords/typeBackendClinicalRecord";

/**
 * Datos del formulario de historial clínico
 */
export interface ClinicalRecordFormData {
    paciente: string;
    odontologo_responsable: string;
    motivo_consulta: string;
    embarazada: EmbarazoEstado | "";
    enfermedad_actual: string;
    estado: EstadoHistorial;
    observaciones: string;

    // Estos campos pueden venir de la cabecera
    unicodigo: string;
    establecimiento_salud: string;
    numero_archivo: string;
    numero_historia_clinica_unica?: string;
    institucion_sistema: string;
    numero_hoja: number;

    usar_ultimos_datos: boolean;

    // Mantener IDs para el payload
    antecedentes_personales_id?: string | null;
    antecedentes_familiares_id?: string | null;
    constantes_vitales_id?: string | null;
    examen_estomatognatico_id?: string | null;
    indicadores_salud_bucal_id?: string | null;

    // Datos editables de secciones
    antecedentes_personales_data?: AntecedentesPersonalesData | null;
    antecedentes_familiares_data?: AntecedentesFamiliaresData | null;
    constantes_vitales_data?: ConstantesVitalesData | null;
    examen_estomatognatico_data?: ExamenEstomatognaticoData | null;

    // Campos para indicadores de salud bucal
    indicadores_salud_bucal_data?: IndicadoresSaludBucalData | null;

    // Campos para indicadores de caries
    indices_caries_id?: string | null;
    indices_caries_data?: IndicesCariesData | null;
    diagnosticos_cie_id?: string | null;
    diagnosticos_cie_data?: DiagnosticosCIEResponse | null;
    plan_tratamiento_id?: string | null;
  plan_tratamiento_titulo?: string;
  plan_tratamiento_descripcion?: string;
  plan_tratamiento_sesiones?: SesionTratamientoData[];
  plan_tratamiento_odontograma_id?: string | null;
    
    

}
/**
 * Filtros para la tabla de historiales
 */
export interface ClinicalRecordFilters {
    search?: string;
    estado?: EstadoHistorial | "";
    paciente?: string;
    odontologo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    activo?: boolean;
}

/**
 * Estado de un historial 
 */
export interface ClinicalRecordStatus {
    value: EstadoHistorial;
    label: string;
    color: "blue" | "orange" | "green";
    icon: React.ComponentType<{ className?: string }>;
}
export interface DiagnosticoCIEPanelState {
    // Estado de carga de diagnósticos CIE
    diagnosticosCIE: DiagnosticoCIEData[];
    diagnosticosCargados: boolean;
    tipoCargaActual: "nuevos" | "todos" | null;

    // Estado de selección y edición
    diagnosticosSeleccionados: Set<string>;
    diagnosticoEditando: string | null;
    mostrarInactivos: boolean;

    // Estado de operaciones
    sincronizando: boolean;
    eliminandoIndividual: string | null;
    actualizandoTipo: string | null;
}

export interface DiagnosticoCIEActionHandlers {
    // Carga y gestión
    handleCargarDiagnosticosCIE: (tipoCarga: "nuevos" | "todos") => Promise<void>;
    handleObtenerDiagnosticosCIE: () => Promise<void>;

    // Selección
    handleSeleccionarDiagnosticoCIE: (diagnosticoId: string, seleccionar: boolean) => void;
    handleSeleccionarTodosDiagnosticosCIE: (seleccionar: boolean) => void;

    // Operaciones individuales
    handleEliminarDiagnosticoCIEIndividual: (diagnosticoId: string) => Promise<void>;
    handleActualizarTipoCIE: (diagnosticoId: string, nuevoTipo: "PRE" | "DEF") => Promise<void>;
    handleRestaurarDiagnosticoCIE: (diagnosticoId: string) => Promise<void>;

    // Operaciones masivas
    handleSincronizarDiagnosticosCIE: () => Promise<void>;
    handleEliminarTodosDiagnosticosCIE: () => Promise<void>;

    // Filtros
    handleToggleMostrarInactivos: () => void;
}

export interface DiagnosticoCIEFilterOptions {
    mostrarInactivos: boolean;
    filtrarPorTipoCIE: "todos" | "PRE" | "DEF";
    filtrarPorDiente: string | null;
    filtrarPorCodigoCIE: string | null;
    ordenarPor: "fecha" | "diente" | "codigo" | "tipo";
    ordenDescendente: boolean;
}
export interface DiagnosticosCIEListProps {
    diagnosticos: DiagnosticoCIEData[];
    seleccionados: Set<string>;
    mostrarInactivos: boolean;
    onSeleccionar: (diagnosticoId: string, seleccionar: boolean) => void;
    onEliminar: (diagnosticoId: string) => void;
    onActualizarTipo: (diagnosticoId: string, nuevoTipo: "PRE" | "DEF") => void;
    onRestaurar?: (diagnosticoId: string) => void;
    puedeEditar: boolean;
    historialEstado: "BORRADOR" | "ABIERTO" | "CERRADO";
}

// ============================================================================
// COMPONENTE DE SINCRO
// ============================================================================

export interface SincronizacionCIEProps {
    historialId: string;
    totalDiagnosticos: number;
    diagnosticosSeleccionados: number;
    onSincronizar: () => Promise<void>;
    sincronizando: boolean;
    puedeSincronizar: boolean;
}

export interface DiagnosticosCIEFormState {
    // Datos
    diagnosticos: DiagnosticoCIEData[];
    tipoCarga: "nuevos" | "todos" | null;
    cargando: boolean;
    error: string | null;

    // Selección
    seleccionados: string[]; // IDs de DiagnosticoCIEHistorial
    todosSeleccionados: boolean;

    // Operaciones
    eliminando: string | null;
    actualizandoTipo: string | null;
    sincronizando: boolean;
}

/**
 * Acciones de gestión de diagnósticos CIE
 */
export interface DiagnosticosCIEActions {
    // Carga de datos
    cargarDiagnosticos: (tipoCarga?: "nuevos" | "todos") => Promise<void>;
    obtenerDiagnosticosHistorial: () => Promise<void>;

    // Selección
    seleccionarDiagnostico: (diagnosticoId: string, seleccionar: boolean) => void;
    seleccionarTodos: (seleccionar: boolean) => void;

    // Operaciones individuales
    eliminarDiagnostico: (diagnosticoId: string) => Promise<void>;
    actualizarTipoCIE: (diagnosticoId: string, tipoCIE: "PRE" | "DEF") => Promise<void>;
    restaurarDiagnostico: (diagnosticoId: string) => Promise<void>;

    // Operaciones masivas
    sincronizarDiagnosticos: () => Promise<void>;
    eliminarTodosDiagnosticos: () => Promise<void>;

    // Filtros
    setMostrarInactivos: (mostrar: boolean) => void;
}
/**
 * Opciones de paginación
 */
export interface PaginationOptions {
    page: number;
    page_size: number;
}
