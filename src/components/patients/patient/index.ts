// src/components/patients/index.ts

// Types
export * from '../../../types/patient/IPatient';

// Services
export * from '../../../services/patient/patientService';

// Hooks
export * from '../../../hooks/patient/usePatients';

// Components
export { default as PatientMain } from './PatientMain';
export { PatientTable } from './table/PatientTable';
export { default as PatientForm } from './forms/PatientForm';
export { default as PatientFormFields } from './forms/PatientFormFields';
export { SuccessModal } from './modals/SuccessModal';
export { PacienteViewModal } from './modals/PatientViewModal';
export { PatientDeleteModal } from './modals/PatientDeleteModal';

