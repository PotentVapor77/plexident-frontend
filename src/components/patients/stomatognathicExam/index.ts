// src/components/stomatognathicExam/index.ts

export type {
  IStomatognathicExam,
  IStomatognathicExamCreate,
  IStomatognathicExamUpdate,
  IPacienteBasico,
} from "../../../types/stomatognathicExam/IStomatognathicExam";

export {
  getStomatognathicExams,
  getStomatognathicExamById,
  createStomatognathicExam,
  updateStomatognathicExam,
  deleteStomatognathicExam,
} from "../../../services/stomatognathicExam/stomatognathicExamService";

export {
  useStomatognathicExams,
  useStomatognathicExam,
  useCreateStomatognathicExam,
  useUpdateStomatognathicExam,
} from "../../../hooks/stomatognathicExam/useStomatognathicExam";

export { default as StomatognathicExamMain } from "./StomatognathicExamMain";
export { StomatognathicExamTable } from "./table/StomatognathicExamTable";
export { StomatognathicExamForm } from "./forms/StomatognathicExamForm";
export { StomatognathicExamFormFields } from "./forms/StomatognathicExamFormFields";
export { StomatognathicExamViewModal } from "./modals/StomatognathicExamViewModal";
export { StomatognathicExamDeleteModal } from "./modals/StomatognathicExamDeleteModal";
export { StomatognathicExamCreateEditModal } from "./modals/StomatognathicExamCreateEditModal";
export { SuccessModal } from "./modals/SuccessModal";