/**
 * ============================================================================
 * MÓDULO DE USUARIOS - EXPORTS
 * ============================================================================
 */

// Componente principal
export { default as UserMain } from './UserMain';

// Formularios
export { default as UserForm } from './forms/UserForm';
export { default as UserFormFields } from './forms/UserFormFields';

// Modales
export { UserDeleteModal } from './modals/UserDeleteModal';
export { UserViewModal } from './modals/UserViewModal';
export { default as SuccessModal } from './modals/SuccessModal';
export { UserPermissionsModal } from './modals/UserPermissionsModal'; // NUEVO

// Tabla
export { UserTable } from './table/UserTable';
