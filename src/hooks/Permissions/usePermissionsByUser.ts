// src/hooks/permissions/usePermissionsByUser.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bulkUpdateUserPermissions,
  getPermissionsByUser,
  getUsers,
  deleteUserPermissions,
} from '../../services/permissions/permissionsService';
import type { IPermission, IUsuarioPermisos } from '../../types/permissions/IPermission';

/** Módulos del sistema */
export const MODELOS = [
  { value: 'usuario', label: 'Usuarios' },
  { value: 'paciente', label: 'Pacientes' },
  { value: 'agenda', label: 'Agenda' },
  { value: 'odontograma', label: 'Odontograma' },
  { value: 'historia_clinica', label: 'Historia Clínica' },
];

/** Métodos HTTP permitidos */
export const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Metodo = (typeof METODOS)[number];

/** Etiquetas amigables para la UI */
export const METHOD_LABELS: Record<Metodo, string> = {
  GET: 'Ver',
  POST: 'Crear',
  PUT: 'Editar',
  PATCH: 'Actualizar',
  DELETE: 'Eliminar',
};

/** Mapa de permisos: { modulo: [metodos] } */
export type PermissionsMap = Record<string, Metodo[]>;

interface UsePermissionsByUserOptions {
  initialUser?: IUsuarioPermisos;
}

export function usePermissionsByUser(options?: UsePermissionsByUserOptions) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<IUsuarioPermisos | null>(options?.initialUser || null);

  // ---- Obtener lista de usuarios ----
  const { 
    data: usersResponse, 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useQuery({
    queryKey: ['users-for-permissions'],
    queryFn: () => getUsers(),
    staleTime: 5 * 60 * 1000,
  });

  // ---- Extraer la lista de usuarios de la respuesta ----
  const usersList = useMemo((): IUsuarioPermisos[] => {
    if (!usersResponse?.data?.data) {
      return [];
    }

    const responseData = usersResponse.data.data;
    
    if (responseData.results && Array.isArray(responseData.results)) {
      return responseData.results;
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return [];
  }, [usersResponse]);

  // ---- Obtener permisos del usuario seleccionado ----
  const { 
    data: permissionsResponse, 
    isLoading: isLoadingPermissions,
    error: permissionsError 
  } = useQuery({
    queryKey: ['user-permissions', selectedUser?.id],
    queryFn: () => {
      if (!selectedUser) throw new Error('No user selected');
      return getPermissionsByUser(selectedUser.id);
    },
    enabled: !!selectedUser,
    staleTime: 5 * 60 * 1000,
  });

  // ---- Mutación para actualizar permisos ----
  const mutation = useMutation({
    mutationFn: ({ userId, permisos }: { userId: string; permisos: IPermission[] }) =>
      bulkUpdateUserPermissions(userId, permisos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
    },
    onError: (error) => {
      console.error('Error al actualizar permisos:', error);
    },
  });

  // ---- Mutación para eliminar permisos ----
  const deleteMutation = useMutation({
    mutationFn: ({ userId, modelo }: { userId: string; modelo?: string }) =>
      deleteUserPermissions(userId, modelo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
    },
    onError: (error) => {
      console.error('Error al eliminar permisos:', error);
    },
  });

  const permissionsMap: PermissionsMap = useMemo(() => {
    const map: PermissionsMap = {};

    if (selectedUser && permissionsResponse?.data?.data) {
      const raw = permissionsResponse.data.data;

      if (Array.isArray(raw)) {
        raw.forEach((p: IPermission) => {
          if (p.modelo && p.metodos_permitidos) {
            const metodosValidos = (p.metodos_permitidos || []).filter(
              (m): m is Metodo => {
                const metodoUpper = String(m).toUpperCase();
                return METODOS.includes(metodoUpper as Metodo);
              }
            ).map(m => String(m).toUpperCase() as Metodo);

            map[p.modelo] = metodosValidos;
          }
        });
      }
    } 
    // Asegurar que todos los modelos existan en el mapa
    MODELOS.forEach(m => {
      if (!map[m.value]) {
        map[m.value] = [];
      }
    });


    return map;
  }, [permissionsResponse, selectedUser]);

  // ---- Función para eliminar todos los permisos de un módulo específico ----
  const deleteModulePermissions = useCallback(async (modelo: string) => {
    if (!selectedUser) throw new Error('No user selected');
    
    try {
      await deleteMutation.mutateAsync({ userId: selectedUser.id, modelo });
      return true;
    } catch (error) {
      console.error(`Error al eliminar permisos para ${modelo}:`, error);
      throw error;
    }
  }, [selectedUser, deleteMutation]);

  // ---- Función para eliminar TODOS los permisos del usuario ----
  const deleteAllPermissions = useCallback(async () => {
    if (!selectedUser) throw new Error('No user selected');
    
    try {
      await deleteMutation.mutateAsync({ userId: selectedUser.id });
      return true;
    } catch (error) {
      console.error(`Error al eliminar todos los permisos:`, error);
      throw error;
    }
  }, [selectedUser, deleteMutation]);

  // ---- Función para guardar cambios de permisos ----
  const savePermissions = useCallback(async (updatedMap: PermissionsMap) => {
    if (!selectedUser) throw new Error('No user selected');
    
    const payload: IPermission[] = MODELOS.map((m) => ({
      modelo: m.value,
      usuario_id: selectedUser.id,
      metodos_permitidos: (updatedMap[m.value] || []) as Metodo[],
    }));
    
    console.log('Guardando permisos:', payload);
    
    try {
      await mutation.mutateAsync({ userId: selectedUser.id, permisos: payload });
      return true;
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      throw error;
    }
  }, [selectedUser, mutation]);

  return {
    selectedUser,
    setSelectedUser,
    users: usersList,
    permissionsMap,
    isLoading: isLoadingUsers || (isLoadingPermissions && !!selectedUser),
    isSaving: mutation.isPending,
    isDeleting: deleteMutation.isPending,
    savePermissions,
    deleteModulePermissions,
    deleteAllPermissions,
    MODELOS,
    METODOS,
    METHOD_LABELS,
    usersError,
    permissionsError,
  };
}