// src/services/permissions/permissionsService.ts

import type { AxiosResponse } from 'axios';
import api from '../api/axiosInstance';
import type { 
  IPermission, 
  IPermissionUserResponse, 
  IUsersListResponse 
} from '../../types/permissions/IPermission';

// GET /users/usuarios/ (para listar todos los usuarios con paginación)
export const getUsers = (): Promise<AxiosResponse<IUsersListResponse>> =>
  api.get<IUsersListResponse>('/users/usuarios/', {
    params: { page_size: 50 } // Obtener más usuarios de una vez
  });

// GET /users/permisos-usuario/by_user/?user_id=UUID
export const getPermissionsByUser = (
  userId: string,
): Promise<AxiosResponse<IPermissionUserResponse>> =>
  api.get<IPermissionUserResponse>(`/users/permisos-usuario/by_user/?user_id=${userId}`);

// POST /users/permisos-usuario/bulk_update/
export const bulkUpdateUserPermissions = (userId: string, permisos: IPermission[]) =>
  api.post('/users/permisos-usuario/bulk_update/', { 
    user_id: userId, 
    permisos 
  });

// DELETE /users/permisos-usuario/delete_by_user/?user_id=UUID&modelo=usuario (opcional)
export const deleteUserPermissions = (userId: string, modelo?: string) => {
  const params: any = { user_id: userId };
  if (modelo) {
    params.modelo = modelo;
  }
  return api.delete('/users/permisos-usuario/delete_by_user/', { params });
};