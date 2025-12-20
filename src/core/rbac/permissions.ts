// core/rbac/permissions.ts
import type { Rol } from "../../types/user/IUser";

export type Permission =
  | "menu.dashboard"
  | "menu.pacientes"
  | "menu.agenda"
  | "menu.odontograma"
  | "menu.historia_clinica"
  | "menu.plan_tratamiento"
  | "menu.presupuestos"
  | "menu.usuarios"
  | "menu.reportes"
  | "menu.configuracion";

const ROLE_PERMISSIONS: Record<Rol, Permission[]> = {
  Administrador: [
    "menu.dashboard",
    "menu.pacientes",
    "menu.agenda",
    "menu.odontograma",
    "menu.historia_clinica",
    "menu.plan_tratamiento",
    "menu.presupuestos",
    "menu.usuarios",
    "menu.reportes",
    "menu.configuracion",
  ],
  Odontologo: [
    "menu.dashboard",
    "menu.pacientes",
    "menu.agenda",
    "menu.odontograma",
    "menu.historia_clinica",
    "menu.plan_tratamiento",
    "menu.presupuestos", // si luego quieres quitarlo, se elimina de aquí
    "menu.reportes",     // solo clínicos (lógica interna del módulo)
  ],
  Asistente: [
    "menu.dashboard",
    "menu.pacientes",
    "menu.agenda",
    "menu.presupuestos",
    // sin odontograma, historia, plan, usuarios, configuración
  ],
};

export function can(permission: Permission, rol: Rol | undefined): boolean {
  if (!rol) return false;
  return ROLE_PERMISSIONS[rol]?.includes(permission) ?? false;
}
