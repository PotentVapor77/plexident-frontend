// types/IUser.ts

export interface IUser {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'admin' | 'odontologo' | 'asistente';
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateUserData {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string; // Se envía como texto plano, el backend la hashea
  rol: 'admin' | 'odontologo' | 'asistente';
  status?: boolean;
}

export interface IUpdateUserData {
  nombres?: string;
  apellidos?: string;
  correo?: string;
  contrasena?: string;
  rol?: 'admin' | 'odontologo' | 'asistente';
  status?: boolean;
}


export interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onConfirm: () => void;
}

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  formData: UserFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
  user?: IUser | null;
}

export interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onEdit: () => void;
}

// types/IUser.ts - Agregar estas interfaces corregidas
export interface UserFormPageProps {
  onUserCreated?: () => void;
}


export interface UserFormData {
  status: boolean;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmar_contrasena: string;
  rol: 'admin' | 'odontologo' | 'asistente';
}

export interface UserFormFieldsProps {
  formData: UserFormData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onReset: () => void;
  submitLoading: boolean;
}

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  message?: string | null;
}

// Para el formulario modal (mantener los existentes si los necesitas)
export interface UserModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  formData: UserFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
  user?: IUser | null;
}