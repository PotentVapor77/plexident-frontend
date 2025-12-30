// src/components/odontograma/index.tsx

/**
 * ============================================
 * MÓDULO ODONTOGRAMA - EXPORTACIONES CENTRALES
 * ============================================
 * 
 * Este archivo centraliza todas las exportaciones del módulo
 * de odontograma para facilitar las importaciones en otros
 * componentes del sistema Plexident.
 */

// ============================================
// COMPONENTES PRINCIPALES - VISTAS 3D
// ============================================

/**
 * Visualizador principal del odontograma 3D con capacidades
 * de edición y diagnóstico
 */
export { OdontogramaViewer } from './OdontogramaViewer';

/**
 * Modelo 3D del odontograma con animaciones de mandíbula
 */
export { OdontogramaModel } from './3d/OdontogramaModel';

/**
 * Visualizador de odontograma histórico (solo lectura)
 */
export { OdontogramaHistoryViewer } from './history/OdontogramaHistoryViewer';


// ============================================
// COMPONENTES DE CÁMARA Y CONTROLES 3D
// ============================================

/**
 * Sistema de control de cámara con vistas preestablecidas
 * y modo libre de exploración
 */
export {
    CameraControls,
    PerspectiveButtons,
    VIEW_PRESETS,
    type ViewPreset,
    type ViewPresetKey
} from './3d/CameraControls';

/**
 * Controles de rotación para enfocar corona y raíz
 */
export { default as RotationControls } from './3d/RotationControls';


// ============================================
// COMPONENTES DE SELECCIÓN DE SUPERFICIES
// ============================================

/**
 * Selector interactivo de superficies dentales (corona y raíz)
 * con validación de áreas requeridas
 */
export {
    SurfaceSelector,
    type SurfaceSelectorRef
} from './3d/SuperficieSelector';


// ============================================
// COMPONENTES DE DIAGNÓSTICO
// ============================================

/**
 * Panel principal para gestión de diagnósticos dentales
 */
export { DiagnosticoPanel } from './diagnostic/DiagnosticoPanel';

/**
 * Componente de selección de diagnósticos con lógica de negocio
 */
export { DiagnosticoSelect } from './diagnostic/DiagnosticoSelect';

/**
 * Interfaz de usuario para selección de diagnósticos
 */
export { DiagnosticoSelectUI } from './selection/DiagnosticoSelectUI';

/**
 * Grid de visualización de diagnósticos por diente
 * con agrupación inteligente
 */


// ============================================
// COMPONENTES DE PREVISUALIZACIÓN
// ============================================

/**
 * Display del estado de un diente con iconos de diagnóstico
 * y códigos de color según prioridad
 */
export {
    ToothStatusDisplay,
    type Diagnostico,
    type DatosDiente
} from './preview/ToothStatusDisplay';

/**
 * Panel de previsualización 3D de un diente individual
 */
export { PanelPreviewDiente } from './preview/ToothPreviewPanel';

/**
 * Overlay para mostrar diagnósticos sobre el diente
 */
export { ToothPreviewOverlay } from './preview/ToothPreviewOverlay';


// ============================================
// COMPONENTES DE HISTORIAL
// ============================================

/**
 * Línea de tiempo de snapshots del odontograma
 */
export { OdontogramaTimeline } from './history/OdontogramaTimeline';


// ============================================
// HOOKS PERSONALIZADOS
// ============================================

/**
 * Hook para determinar colores y visualización de diagnósticos
 * según prioridad y área afectada
 */
export {
    useToothColorDecision,
    COLOR_CLASSES_POR_PRIORIDAD,
    COLORES_PRIORIDAD
} from './preview/hooks/useToothColorDecision';

/**
 * Hook para filtrar diagnósticos por superficie seleccionada
 * y categoría en preview
 */
export { useToothDiagnosticsFilter } from './preview/hooks/useToothDiagnosticsFilter';

export type {
    OdontogramaData,
    OdontoColorKey,
    AreaAfectada,
    RootGroupKey,
    DiagnosticoCategory
} from '../../core/types/odontograma.types';

export type {
    OdontogramaSnapshot
} from '../../core/types/odontogramaHistory.types';

/**
 * Tipo para áreas principales del diente
 */
export type { PrincipalArea } from '../../hooks/odontogram/useDiagnosticoSelect';
export { NoPacienteOverlay } from '../../components/odontogram/patient/NoPacienteOverlay';
export { PacienteFloatingButton } from '../../components/odontogram/patient/PacienteFloatingButton';
export { PacienteInfoPanel } from '../../components/odontogram/patient/PacienteInfoPanel';