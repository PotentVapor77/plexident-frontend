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

// =============================================================================
// MÓDULOS DEL SISTEMA
// =============================================================================

export const MODELOS = [
  { value: 'usuario',          label: 'Usuarios',         icon: '👤' },
  { value: 'paciente',         label: 'Pacientes',        icon: '🏥' },
  { value: 'agenda',           label: 'Agenda',           icon: '📅' },
  { value: 'odontograma',      label: 'Odontograma',      icon: '🦷' },
  { value: 'historia_clinica', label: 'Historia Clínica', icon: '📋' },
];

// =============================================================================
// MÉTODOS HTTP
// =============================================================================

export const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Metodo = (typeof METODOS)[number];

export const METHOD_LABELS: Record<Metodo, string> = {
  GET:    'Ver',
  POST:   'Crear',
  PUT:    'Editar',
  PATCH:  'Actualizar',
  DELETE: 'Eliminar',
};

export const METHOD_COLORS: Record<Metodo, string> = {
  GET:    'emerald',
  POST:   'blue',
  PUT:    'amber',
  PATCH:  'orange',
  DELETE: 'red',
};

// =============================================================================
// PERMISOS POR DEFECTO (espejo del backend signals.py)
// Sirve para el botón "Aplicar permisos del rol" en el modal
// =============================================================================

export type PermissionsMap = Record<string, Metodo[]>;

export const DEFAULT_PERMISSIONS_BY_ROL: Record<string, PermissionsMap> = {
  Odontologo: {
    usuario:          ['GET'],
    paciente:         ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    agenda:           ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    odontograma:      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    historia_clinica: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  Asistente: {
    usuario:          [],
    paciente:         ['GET', 'POST'],
    agenda:           ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    odontograma:      ['GET'],
    historia_clinica: ['GET'],
  },
  Administrador: {
    // Administradores no usan PermisoUsuario —
    // tienen acceso total por rol en UserBasedPermission
    usuario:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    paciente:         ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    agenda:           ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    odontograma:      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    historia_clinica: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
};

// =============================================================================
// HOOK
// =============================================================================

interface UsePermissionsByUserOptions {
  initialUser?: IUsuarioPermisos;
}

export function usePermissionsByUser(options?: UsePermissionsByUserOptions) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<IUsuarioPermisos | null>(
    options?.initialUser ?? null
  );

  // ---- Lista de usuarios ----
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['users-for-permissions'],
    queryFn: () => getUsers(),
    staleTime: 5 * 60 * 1000,
  });

  const usersList = useMemo((): IUsuarioPermisos[] => {
    if (!usersResponse?.data?.data) return [];
    const responseData = usersResponse.data.data;
    if (responseData.results && Array.isArray(responseData.results)) return responseData.results;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [usersResponse]);

  // ---- Permisos del usuario seleccionado ----
  const {
    data: permissionsResponse,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useQuery({
    queryKey: ['user-permissions', selectedUser?.id],
    queryFn: () => {
      if (!selectedUser) throw new Error('No user selected');
      return getPermissionsByUser(selectedUser.id);
    },
    enabled: !!selectedUser,
    staleTime: 5 * 60 * 1000,
  });

  // ---- Mutación: bulk update ----
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

  // ---- Mutación: eliminar ----
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

  // ---- Mapa de permisos actual ----
  const permissionsMap: PermissionsMap = useMemo(() => {
    const map: PermissionsMap = {};

    if (selectedUser && permissionsResponse?.data?.data) {
      const raw = permissionsResponse.data.data;
      if (Array.isArray(raw)) {
        raw.forEach((p: IPermission) => {
          if (p.modelo && p.metodos_permitidos) {
            const metodosValidos = (p.metodos_permitidos || [])
              .filter((m): m is Metodo => METODOS.includes(String(m).toUpperCase() as Metodo))
              .map(m => String(m).toUpperCase() as Metodo);
            map[p.modelo] = metodosValidos;
          }
        });
      }
    }

    // Garantizar que todos los módulos visibles existan en el mapa
    MODELOS.forEach(m => {
      if (!map[m.value]) map[m.value] = [];
    });

    return map;
  }, [permissionsResponse, selectedUser]);

  // ---- Permisos por defecto del rol del usuario seleccionado ----
  const defaultPermissionsForCurrentUser: PermissionsMap = useMemo(() => {
    if (!selectedUser?.rol) return {};
    return DEFAULT_PERMISSIONS_BY_ROL[selectedUser.rol] ?? {};
  }, [selectedUser]);

  /**
   * Retorna true si el permiso dado es "de fábrica" para el rol actual.
   * Útil para mostrar el candado en la UI.
   */
  const isDefaultPermission = useCallback(
    (modelo: string, metodo: Metodo): boolean => {
      return (defaultPermissionsForCurrentUser[modelo] ?? []).includes(metodo);
    },
    [defaultPermissionsForCurrentUser]
  );

  // ---- Guardar permisos ----
  const savePermissions = useCallback(
    async (updatedMap: PermissionsMap) => {
      if (!selectedUser) throw new Error('No user selected');

      const payload: IPermission[] = MODELOS.map(m => ({
        modelo: m.value,
        usuario_id: selectedUser.id,
        metodos_permitidos: (updatedMap[m.value] || []) as Metodo[],
      }));

      await mutation.mutateAsync({ userId: selectedUser.id, permisos: payload });
      return true;
    },
    [selectedUser, mutation]
  );

  // ---- Aplicar permisos por defecto del rol (sin guardar — solo actualiza el mapa local) ----
  const getDefaultMapForRole = useCallback(
    (rol: string): PermissionsMap => {
      const defaults = DEFAULT_PERMISSIONS_BY_ROL[rol] ?? {};
      const fullMap: PermissionsMap = {};
      MODELOS.forEach(m => {
        fullMap[m.value] = (defaults[m.value] ?? []) as Metodo[];
      });
      return fullMap;
    },
    []
  );

  // ---- Aplicar y guardar permisos por defecto (útil al crear usuario) ----
  const applyAndSaveDefaultPermissions = useCallback(
    async (userId: string, rol: string) => {
      const defaultMap = getDefaultMapForRole(rol);
      const payload: IPermission[] = MODELOS.map(m => ({
        modelo: m.value,
        usuario_id: userId,
        metodos_permitidos: defaultMap[m.value],
      }));

      await bulkUpdateUserPermissions(userId, payload);
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      return true;
    },
    [queryClient, getDefaultMapForRole]
  );

  // ---- Eliminar permisos de un módulo ----
  const deleteModulePermissions = useCallback(
    async (modelo: string) => {
      if (!selectedUser) throw new Error('No user selected');
      await deleteMutation.mutateAsync({ userId: selectedUser.id, modelo });
      return true;
    },
    [selectedUser, deleteMutation]
  );

  // ---- Eliminar todos los permisos ----
  const deleteAllPermissions = useCallback(
    async () => {
      if (!selectedUser) throw new Error('No user selected');
      await deleteMutation.mutateAsync({ userId: selectedUser.id });
      return true;
    },
    [selectedUser, deleteMutation]
  );

  return {
    selectedUser,
    setSelectedUser,
    users: usersList,
    permissionsMap,
    defaultPermissionsForCurrentUser,
    isDefaultPermission,
    getDefaultMapForRole,
    applyAndSaveDefaultPermissions,
    isLoading: isLoadingUsers || (isLoadingPermissions && !!selectedUser),
    isSaving: mutation.isPending,
    isDeleting: deleteMutation.isPending,
    savePermissions,
    deleteModulePermissions,
    deleteAllPermissions,
    MODELOS,
    METODOS,
    METHOD_LABELS,
    METHOD_COLORS,
    DEFAULT_PERMISSIONS_BY_ROL,
    usersError,
    permissionsError,
  };
}