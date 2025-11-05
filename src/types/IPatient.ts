import type { PatientFormData } from "../hooks/usePatientForm";

// src/types/IPatient.ts
// Definición de tipos para el paciente
export interface IPatient {
  id: string;
  status: boolean;
  nombres: string;
  apellidos: string;
  cedula_pasaporte: string;
  fecha_nacimiento: string;
  sexo: string;
  direccion: string;
  telefono: string;
  correo: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  alergias: string;
  enfermedades_sistemicas: string;
  habitos: string;
}


export interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: PatientFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  loading: boolean;
  patient?: IPatient | null;
}

export interface PatientDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IPatient | null;
  onConfirm: () => void;
}

export interface PatientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IPatient | null;
  onEdit: () => void;
}

export interface PatientTableProps {
  patients: IPatient[];
  onViewPatient: (patient: IPatient) => void;
  onEditPatient: (patient: IPatient) => void;
  onDeletePatient: (patient: IPatient) => void;
  currentData: IPatient[];
}


export interface PatientFormProps {
  onPatientCreated?: () => void;
}


export interface PatientFormFieldsProps {
  formData: PatientFormData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  submitLoading: boolean;
}

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  message: string | null;
}
