/**
 * ============================================================================
 * TYPES: PROPS DE COMPONENTES DE USUARIOS
 * ============================================================================
 */

import type { IUser } from '../user/IUser';

/**
 * Form data para el formulario de usuario (incluye confirm_password)
 */
export interface UserFormData {
  nombres: string;
  apellidos: string;
  username: string;
  telefono: string;
  correo: string;
  rol: string; // ✅ string en el form, se valida al enviar
  password: string;
  confirm_password: string;
  activo: boolean;
}

/**
 * Props del formulario modal de usuario
 */
export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: UserFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  loading: boolean;
  user: IUser | null;
}

/**
 * Props del modal de confirmación de eliminación
 */
export interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Props del modal de vista de usuario
 */
export interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onEdit: () => void;
}

/**
 * Props de la tabla de usuarios
 */
export interface UserTableProps {
  users: IUser[];
  onViewUser: (user: IUser) => void;
  onEditUser: (user: IUser) => void;
  onDeleteUser: (user: IUser) => void;
  currentData: IUser[];
  loading?: boolean;
}

/**
 * Props del modal de éxito
 */
export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string | null;
  type: 'create' | 'edit' | 'delete';
}

/**
 * Props del badge de rol
 */
export interface RoleBadgeProps {
  rol: IUser['rol'];
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props del badge de estado
 */
export interface UserStatusBadgeProps {
  activo: boolean;
  size?: 'sm' | 'md' | 'lg';
}
