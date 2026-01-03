// src/components/vitalSigns/index.ts

export type {
  IVitalSigns,
  IVitalSignsCreate,
  IVitalSignsUpdate,
  IVitalSignsPaginatedResponse,
  IVitalSignsFilters,
  IVitalSignsListResponse,
  IVitalSignsSingleResponse,
  IPacienteBasico,
} from "../../../types/vitalSigns/IVitalSigns"; // [file:1]

export {
  getVitalSigns,
  getVitalSignsById,
  getVitalSignsByPaciente,
  createVitalSigns,
  updateVitalSigns,
  deleteVitalSigns,
} from "../../../services/vitalSigns/vitalSignsService"; // [file:2]

export {
  useVitalSigns,
  useVitalSign,
  useVitalSignsByPaciente,
  useCreateVitalSigns,
  useUpdateVitalSigns,
  VITALSIGNS_QUERY_KEYS as VITALSIGNSQUERYKEYS,
} from "../../../hooks/vitalSigns/useVitalSigns"; // [file:6]

export { default as VitalSignsMain } from "./VitalSignsMain";
export { VitalSignsTable } from "./table/VitalSignsTable";
export { VitalSignsForm } from "./forms/VitalSignsForm";
export { VitalSignsFormFields } from "./forms/VitalSignsFormFields";
export { VitalSignsViewModal } from "./modals/VitalSignsViewModal";
export { VitalSignsDeleteModal } from "./modals/VitalSignsDeleteModal";
export { SuccessModal } from "./modals/SuccessModal";