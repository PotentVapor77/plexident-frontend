// src/hooks/permissions/useNavPermissions.ts
//
// Traduce el permissionsMap del backend (modelo → métodos[])
// a un conjunto de rutas/módulos visibles en el sidebar.
//
// Regla: un módulo aparece en el sidebar si el usuario tiene
// al menos un método permitido en él (mínimo GET).
// Los Administradores siempre ven todo (acceso total por rol en backend).

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Rol } from '../types/user/IUser';
import { getPermissionsByUser } from '../services/permissions/permissionsService';
import type { IPermission } from '../types/permissions/IPermission';


// ─────────────────────────────────────────────────────────────
// Mapeo: modelo del backend → módulos del sidebar que desbloquea
// ─────────────────────────────────────────────────────────────
const MODEL_TO_NAV_MODULES: Record<string, string[]> = {
  usuario:          ['Usuarios'],
  paciente:         ['Pacientes'],
  agenda:           ['Agenda'],
  odontograma:      ['Odontograma'],
  historia_clinica: ['Historia Clínica', 'Plan Tratamiento'],
};

// Módulos que siempre están visibles (sin importar permisos)
const ALWAYS_VISIBLE = ['Dashboard'];

// Módulos solo para Administrador (configuración del sistema)
const ADMIN_ONLY = ['Parametros'];

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
interface UseNavPermissionsOptions {
  userId?: string;
  rol?: Rol | null;
}

export interface NavPermissionsResult {
  /** Set de nombres de módulos que el usuario puede ver */
  visibleModules: Set<string>;
  /** true mientras carga los permisos */
  isLoading: boolean;
  /** true si el usuario tiene permiso GET sobre un modelo */
  canRead: (modelo: string) => boolean;
  /** true si el usuario puede crear (POST) */
  canCreate: (modelo: string) => boolean;
  /** true si el usuario puede editar (PUT | PATCH) */
  canEdit: (modelo: string) => boolean;
  /** true si el usuario puede eliminar (DELETE) */
  canDelete: (modelo: string) => boolean;
}

export function useNavPermissions({ userId, rol }: UseNavPermissionsOptions): NavPermissionsResult {
  const isAdmin = rol === 'Administrador';

  // Administradores no necesitan consultar la tabla de permisos —
  // tienen acceso total por defecto en el backend.
  const { data, isLoading } = useQuery({
    queryKey: ['nav-permissions', userId],
    queryFn: () => getPermissionsByUser(userId!),
    enabled: !!userId && !isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // ── Construir mapa modelo → Set<metodo> ──────────────────────
  const permissionsMap = useMemo<Record<string, Set<string>>>(() => {
    if (isAdmin) {
      // Administrador: acceso total a todo
      const allModels = Object.keys(MODEL_TO_NAV_MODULES);
      return Object.fromEntries(
        allModels.map(m => [m, new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])])
      );
    }
const responseBody = data?.data;
const raw: IPermission[] = Array.isArray(responseBody?.data)
  ? (responseBody.data as IPermission[])
  : [];
    const map: Record<string, Set<string>> = {};

    raw.forEach((p: IPermission) => {
      if (p.modelo && Array.isArray(p.metodos_permitidos)) {
        map[p.modelo] = new Set(p.metodos_permitidos.map(m => String(m).toUpperCase()));
      }
    });

    return map;
  }, [data, isAdmin]);

  // ── Helpers de permiso ───────────────────────────────────────
  const canRead   = (modelo: string) => permissionsMap[modelo]?.has('GET')    ?? false;
  const canCreate = (modelo: string) => permissionsMap[modelo]?.has('POST')   ?? false;
  const canEdit   = (modelo: string) =>
    (permissionsMap[modelo]?.has('PUT') || permissionsMap[modelo]?.has('PATCH')) ?? false;
  const canDelete = (modelo: string) => permissionsMap[modelo]?.has('DELETE') ?? false;

  // ── Calcular módulos visibles ────────────────────────────────
  const visibleModules = useMemo<Set<string>>(() => {
    const visible = new Set<string>(ALWAYS_VISIBLE);

    // Módulos de admin de sistema
    if (isAdmin) {
      ADMIN_ONLY.forEach(m => visible.add(m));
    }

    // Módulos por permisos
    Object.entries(MODEL_TO_NAV_MODULES).forEach(([modelo, navModules]) => {
      // Un módulo es visible si tiene al menos GET
      if (canRead(modelo)) {
        navModules.forEach(m => visible.add(m));
      }
    });

    return visible;
  }, [permissionsMap, isAdmin]);

  return {
    visibleModules,
    isLoading: !isAdmin && isLoading,
    canRead,
    canCreate,
    canEdit,
    canDelete,
  };
}