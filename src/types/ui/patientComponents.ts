/**
 * ============================================================================
 * TYPES: PROPS DE COMPONENTES DE PACIENTES
 * ============================================================================
 * Define las props de todos los componentes relacionados con pacientes
 * Separado de IPatient.ts para mantener separación de responsabilidades
 * ============================================================================
 */

import type { IPatient } from '../../types/patient/IPatient';
import type { PatientFormData } from '../../hooks/patient/usePatientForm';

/**
 * Props del formulario modal de paciente
 */
export interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: PatientFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  loading: boolean;
  patient?: IPatient | null;
}

/**
 * Props del modal de confirmación de eliminación
 */
export interface PatientDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IPatient | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * Props del modal de vista de paciente
 */
export interface PatientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IPatient | null;
  onEdit: () => void;
}

/**
 * Props de la tabla de pacientes
 */
export interface PatientTableProps {
  patients: IPatient[];
  onViewPatient: (patient: IPatient) => void;
  onEditPatient: (patient: IPatient) => void;
  onDeletePatient: (patient: IPatient) => void;
  currentData: IPatient[];
  loading?: boolean;
}

/**
 * Props de los campos del formulario de paciente
 */
export interface PatientFormFieldsProps {
  formData: PatientFormData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  submitLoading: boolean;
  errors?: Record<string, string>;
}

/**
 * Props del modal de éxito
 */
export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  message: string | null;
}

/**
 * Props del componente principal de pacientes
 */
export interface PatientMainProps {
  onPatientCreated?: () => void;
  onPatientUpdated?: () => void;
  onPatientDeleted?: () => void;
}

/**
 * Props de la card de información del paciente
 */
export interface PatientInfoCardProps {
  patient: IPatient;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

/**
 * Props del selector de paciente (para agenda, etc.)
 */
export interface PatientSelectorProps {
  value?: string | null;
  onChange: (patientId: string | null) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

/**
 * Props del componente de búsqueda de pacientes
 */
export interface PatientSearchProps {
  onSelectPatient: (patient: IPatient) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Props del badge de estado del paciente
 */
export interface PatientStatusBadgeProps {
  activo: boolean;
  size?: 'sm' | 'md' | 'lg';
}
