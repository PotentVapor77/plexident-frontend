// src/hooks/permissions/useOdontogramaPermisos.ts

import { useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import type { Rol } from "../../types/user/IUser";
import { useNavPermissions } from "../useNavPermissions";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface OdontogramaPermisos {
  // ── Acciones sobre diagnósticos ──────────────────────────────
  /** Puede ver diagnósticos existentes en el 3D */
  puedeVerDiagnosticos: boolean;
  /** Puede añadir un nuevo diagnóstico a un diente */
  puedeAgregarDiagnostico: boolean;
  /** Puede editar/modificar un diagnóstico ya registrado */
  puedeEditarDiagnostico: boolean;
  /** Puede eliminar un diagnóstico del diente */
  puedeEliminarDiagnostico: boolean;
  /** Puede guardar/enviar el odontograma al backend */
  puedeGuardar: boolean;

  // ── Archivos clínicos ─────────────────────────────────────────
  /** Puede subir fotos o archivos al odontograma */
  puedeSubirArchivos: boolean;

  // ── Interacción 3D ───────────────────────────────────────────
  /** Puede seleccionar dientes en el modelo 3D (click) */
  puedeSeleccionarDiente: boolean;
  /** Puede cambiar la perspectiva / rotar el modelo */
  puedeCambiarPerspectiva: boolean;

  // ── UI helpers ───────────────────────────────────────────────
  /** true si el usuario es solo lectura en el odontograma */
  esSoloLectura: boolean;
  /** Etiqueta descriptiva del nivel de acceso para mostrar en UI */
  nivelAccesoLabel: string;
  /** Color del badge de nivel (clases Tailwind) */
  nivelAccesoColor: string;
  /** Razón textual cuando una acción está bloqueada */
  razonBloqueo: string | null;

  // ── Estado de carga ──────────────────────────────────────────
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useOdontogramaPermisos(): OdontogramaPermisos {
  const { user } = useAuth();
  const rol = user?.rol as Rol | undefined;

  const { canRead, canCreate, canEdit, canDelete, isLoading } = useNavPermissions({
    userId: user?.id,
    rol,
  });

  return useMemo<OdontogramaPermisos>(() => {
    // Permisos base sobre el modelo odontograma
    const leer    = canRead("odontograma");
    const crear   = canCreate("odontograma");
    const editar  = canEdit("odontograma");
    const eliminar = canDelete("odontograma");

    const subirArchivos = canCreate("paciente") || crear;

    // ── Derivar nivel de acceso ──────────────────────────────────
    const tieneAccesoCompleto = leer && crear && editar && eliminar;
    const tieneSoloLectura    = leer && !crear && !editar && !eliminar;
    const sinAcceso           = !leer;

    let nivelAccesoLabel: string;
    let nivelAccesoColor: string;
    let razonBloqueo: string | null = null;

    if (sinAcceso) {
      nivelAccesoLabel = "Sin acceso";
      nivelAccesoColor = "bg-gray-100 text-gray-600 border-gray-200";
      razonBloqueo = "No tienes permiso para acceder al odontograma.";
    } else if (tieneSoloLectura) {
      nivelAccesoLabel = "Solo lectura";
      nivelAccesoColor = "bg-amber-50 text-amber-700 border-amber-200";
      razonBloqueo = "Solo puedes ver el odontograma. Contacta al administrador para más permisos.";
    } else if (tieneAccesoCompleto) {
      nivelAccesoLabel = "Acceso completo";
      nivelAccesoColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else {
      nivelAccesoLabel = "Acceso parcial";
      nivelAccesoColor = "bg-blue-50 text-blue-700 border-blue-200";
    }

    return {
      puedeVerDiagnosticos:    leer,
      puedeAgregarDiagnostico: crear,
      puedeEditarDiagnostico:  editar,
      puedeEliminarDiagnostico: eliminar,
      puedeGuardar:            crear || editar,
      puedeSubirArchivos:      subirArchivos,
      puedeSeleccionarDiente:  leer,
      puedeCambiarPerspectiva: leer,
      esSoloLectura:           leer && !crear && !editar && !eliminar,
      nivelAccesoLabel,
      nivelAccesoColor,
      razonBloqueo: tieneSoloLectura ? razonBloqueo : null,
      isLoading,
    };
  }, [canRead, canCreate, canEdit, canDelete, isLoading]);
}