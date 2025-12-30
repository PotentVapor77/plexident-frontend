// src/components/personalBackground/index.ts

// ============================================================================
// TYPES - Exportación selectiva (ACTUALIZADA)
// ============================================================================
export type {
  IPersonalBackground,
  IPersonalBackgroundCreate,
  IPersonalBackgroundUpdate,
  IPersonalBackgroundError,
  IPersonalBackgroundListResponse,
  IPersonalBackgroundSingleResponse,
  // ✅ Tipos actualizados - alergias separadas
  AlergiaAntibiotico,
  AlergiaAnestesia,
  Hemorragias,
  VIHSida,
  Tuberculosis,
  Asma,
  Diabetes,
  Hipertension,
  EnfermedadCardiaca,
  UsePersonalBackgroundsParams,
  UsePersonalBackgroundsReturn,
  IPacienteBasico,
  NivelRiesgo,
} from "../../../types/personalBackground/IPersonalBackground";

// ============================================================================
// CONSTANTES - Exportación actualizada
// ============================================================================

// ============================================================================
// HELPERS - Exportación completa
// ============================================================================

// ============================================================================
// SERVICES
// ============================================================================
export {
  getPersonalBackgrounds,
  getPersonalBackgroundById,
  getPersonalBackgroundByPaciente,
  createPersonalBackground,
  updatePersonalBackground,
  deletePersonalBackground,
} from "../../../services/personalBackground/personalBackgroundService";

// ============================================================================
// HOOKS
// ============================================================================
export {
  usePersonalBackgrounds,
  usePersonalBackground,
  usePersonalBackgroundByPaciente,
  useCreatePersonalBackground,
  useUpdatePersonalBackground,
  useDeletePersonalBackground,
  PERSONAL_BACKGROUND_QUERY_KEYS,
} from "../../../hooks/personalBackground/usePersonalBackgrounds";

// ============================================================================
// COMPONENTS
// ============================================================================
export { default as PersonalBackgroundMain } from "./PersonalBackgroundMain";
export { PersonalBackgroundTable } from "./table/PersonalBackgroundTable";
export { PersonalBackgroundFormFields } from "./forms/PersonalBackgroundFormFields";
export { PersonalBackgroundViewModal } from "./modals/PersonalBackgroundViewModal";
export { PersonalBackgroundDeleteModal } from "./modals/PersonalBackgroundDeleteModal";
export { SuccessModal } from "./modals/SuccesModal";
