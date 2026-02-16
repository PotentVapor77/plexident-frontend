// src/components/users/modals/UserPermissionsModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../../components/ui/modal";
import type { IUser } from "../../../../types/user/IUser";
import type { IUsuarioPermisos } from "../../../../types/permissions/IPermission";
import {
  usePermissionsByUser,
  type Metodo,
  type PermissionsMap,
} from "../../../../hooks/Permissions/usePermissionsByUser";
import { useNotification } from "../../../../context/notifications/NotificationContext";
import { Shield, Key, Save, X, RotateCcw, AlertCircle, CheckCircle, Lock } from "lucide-react";

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
}

// =============================================================================
// BADGE DE MÉTODO — con estado ON/OFF y candado si es permiso por defecto
// =============================================================================
interface MethodBadgeProps {
  metodo: Metodo;
  active: boolean;
  isDefault: boolean;
  label: string;
  onToggle: () => void;
}

function MethodBadge({ metodo, active, isDefault, label, onToggle }: MethodBadgeProps) {
  const colorMap: Record<Metodo, { on: string; off: string; ring: string }> = {
    GET:    { on: "bg-emerald-500 border-emerald-600", off: "bg-gray-50 border-gray-200 text-gray-400", ring: "focus:ring-emerald-500/30" },
    POST:   { on: "bg-blue-500 border-blue-600",       off: "bg-gray-50 border-gray-200 text-gray-400", ring: "focus:ring-blue-500/30" },
    PUT:    { on: "bg-amber-500 border-amber-600",     off: "bg-gray-50 border-gray-200 text-gray-400", ring: "focus:ring-amber-500/30" },
    PATCH:  { on: "bg-orange-500 border-orange-600",   off: "bg-gray-50 border-gray-200 text-gray-400", ring: "focus:ring-orange-500/30" },
    DELETE: { on: "bg-red-500 border-red-600",         off: "bg-gray-50 border-gray-200 text-gray-400", ring: "focus:ring-red-500/30" },
  };

  const colors = colorMap[metodo];

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDefault ? `"${label}" es un permiso por defecto del rol` : undefined}
      className={`
        relative inline-flex flex-col items-center gap-0.5 min-w-[64px] px-2 py-1.5
        rounded-lg border text-xs font-semibold transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-1 ${colors.ring}
        ${active
          ? `${colors.on} text-white shadow-sm`
          : `${colors.off} hover:border-gray-300 hover:bg-gray-100`
        }
      `}
    >
      {/* Candado — solo si es permiso por defecto */}
      {isDefault && (
        <span
          className={`
            absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center
            rounded-full border text-[9px]
            ${active
              ? "bg-white border-white/30 text-gray-700"
              : "bg-gray-200 border-gray-300 text-gray-500"
            }
          `}
          aria-label="Permiso por defecto del rol"
        >
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}

      {/* Toggle switch mini */}
      <span className={`
        relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors
        ${active ? "bg-white/30" : "bg-gray-200"}
      `}>
        <span className={`
          inline-block h-2.5 w-2.5 rounded-full bg-white shadow transition-transform
          ${active ? "translate-x-3.5" : "translate-x-0.5"}
        `} />
      </span>

      {/* Label */}
      <span className="leading-none">{label}</span>
    </button>
  );
}

// =============================================================================
// FILA DE MÓDULO
// =============================================================================
interface ModuleRowProps {
  modLabel: string;
  modValue: string;
  methods: Metodo[];
  metodos: readonly Metodo[];
  methodLabels: Record<Metodo, string>;
  isDefaultFn: (modelo: string, metodo: Metodo) => boolean;
  onToggle: (modelo: string, metodo: Metodo) => void;
  onClear: (modelo: string) => void;
  defaultMethods: Metodo[];
}

function ModuleRow({
  modLabel,
  modValue,
  methods,
  metodos,
  methodLabels,
  isDefaultFn,
  onToggle,
  onClear,
  defaultMethods,
}: ModuleRowProps) {
  const allActive = metodos.every(m => methods.includes(m));
  const noneActive = methods.length === 0;
  const matchesDefault =
    JSON.stringify([...defaultMethods].sort()) === JSON.stringify([...methods].sort());

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      {/* Header de la fila */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {modLabel}
          </span>
          {/* Indicador de cuántos permisos activos */}
          <span className={`
            inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border
            ${noneActive
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : allActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }
          `}>
            {noneActive ? "Sin acceso" : allActive ? "Acceso total" : `${methods.length}/${metodos.length}`}
          </span>
          {/* Indicador de "igual al default" */}
          {matchesDefault && !noneActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
              <Lock className="h-3 w-3" />
              Por defecto
            </span>
          )}
        </div>

        {/* Botón limpiar */}
        <button
          onClick={() => onClear(modValue)}
          disabled={noneActive}
          className="text-xs font-medium text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Badges de métodos */}
      <div className="flex flex-wrap gap-2">
        {metodos.map(metodo => (
          <MethodBadge
            key={metodo}
            metodo={metodo}
            active={methods.includes(metodo)}
            isDefault={isDefaultFn(modValue, metodo)}
            label={methodLabels[metodo]}
            onToggle={() => onToggle(modValue, metodo)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MODAL PRINCIPAL
// =============================================================================
export function UserPermissionsModal({ isOpen, onClose, user }: UserPermissionsModalProps) {
  const {
    setSelectedUser,
    permissionsMap,
    isSaving,
    savePermissions,
    isDefaultPermission,
    getDefaultMapForRole,
    MODELOS,
    METODOS,
    METHOD_LABELS,
    defaultPermissionsForCurrentUser,
  } = usePermissionsByUser();

  const { notify } = useNotification();
  const [localMap, setLocalMap] = useState<PermissionsMap>({});
  const [originalMap, setOriginalMap] = useState<PermissionsMap>({});

  // Sincronizar usuario seleccionado
  useEffect(() => {
    if (user) {
      const usuarioPermisos: IUsuarioPermisos = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        username: user.username,
        correo: user.correo,
        rol: user.rol,
        is_active: user.is_active,
        telefono: user.telefono,
      };
      setSelectedUser(usuarioPermisos);
    }
  }, [user, setSelectedUser]);

  // Cargar permisos al recibirlos
  useEffect(() => {
    setLocalMap(permissionsMap);
    setOriginalMap(permissionsMap);
  }, [permissionsMap]);

  // ¿Hay cambios sin guardar?
  const hasChanges = useMemo(
    () => JSON.stringify(localMap) !== JSON.stringify(originalMap),
    [localMap, originalMap]
  );

  // ¿El mapa local coincide exactamente con los defaults del rol?
  const matchesRoleDefaults = useMemo(() => {
    const defaults = getDefaultMapForRole(user.rol);
    return JSON.stringify(
      Object.fromEntries(MODELOS.map(m => [m.value, [...(localMap[m.value] ?? [])].sort()]))
    ) === JSON.stringify(
      Object.fromEntries(MODELOS.map(m => [m.value, [...(defaults[m.value] ?? [])].sort()]))
    );
  }, [localMap, user.rol, getDefaultMapForRole, MODELOS]);

  // ----- Handlers -----
  const toggleMethod = (modelo: string, metodo: Metodo) => {
    setLocalMap(prev => {
      const current = prev[modelo] ?? ([] as Metodo[]);
      const exists = current.includes(metodo);
      // PUT y PATCH van siempre juntos
      if (metodo === "PUT" || metodo === "PATCH") {
        const hasPutPatch = current.includes("PUT") || current.includes("PATCH");
        const without = current.filter(m => m !== "PUT" && m !== "PATCH");
        return { ...prev, [modelo]: hasPutPatch ? without : [...without, "PUT", "PATCH"] };
      }
      return { ...prev, [modelo]: exists ? current.filter(m => m !== metodo) : [...current, metodo] };
    });
  };

  const handleClearModule = (modelo: string) => {
    setLocalMap(prev => ({ ...prev, [modelo]: [] as Metodo[] }));
  };

  const handleClearAll = () => {
    const cleared: PermissionsMap = {};
    MODELOS.forEach(m => { cleared[m.value] = [] as Metodo[]; });
    setLocalMap(cleared);
    notify({ type: "warning", title: "Permisos limpiados", message: "Se eliminaron todos los permisos. Guarda para confirmar." });
  };

  const handleApplyRoleDefaults = () => {
    const defaults = getDefaultMapForRole(user.rol);
    setLocalMap(defaults);
    notify({ type: "success", title: "Template aplicado", message: `Permisos por defecto del rol "${user.rol}" cargados. Guarda para confirmar.` });
  };

  const handleSave = async () => {
    try {
      await savePermissions(localMap);
      setOriginalMap(localMap);
      notify({ type: "success", title: "Permisos actualizados", message: `Los permisos de ${user.nombres} ${user.apellidos} se guardaron correctamente.` });
      setTimeout(() => onClose(), 900);
    } catch {
      notify({ type: "error", title: "Error al guardar", message: "No se pudieron guardar los permisos. Intente nuevamente." });
    }
  };

  // Conteo de permisos totales activos
  const totalActive = useMemo(
    () => Object.values(localMap).flat().length,
    [localMap]
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-hidden">
      <section className="flex flex-col h-full bg-white rounded-lg overflow-hidden">

        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
                <Shield className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Gestionar Permisos
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Configura los permisos específicos para este usuario
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-sm">
                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
              </div>
              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {user.apellidos}, {user.nombres}
                  </h4>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                    ${user.rol === "Administrador" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                    ${user.rol === "Odontologo" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                    ${user.rol === "Asistente" ? "bg-green-50 text-green-700 border-green-200" : ""}
                  `}>
                    {user.rol}
                  </span>
                </div>
                <p className="text-xs text-gray-500">@{user.username} · {user.correo}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                <Key className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {totalActive} permisos
                </span>
              </div>
              {hasChanges && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    Sin guardar
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-b border-gray-200 px-6 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Acciones rápidas:</span>
              <button
                onClick={handleApplyRoleDefaults}
                disabled={matchesRoleDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar defaults del rol
              </button>
            </div>
            <button
              onClick={handleClearAll}
              disabled={totalActive === 0}
              className="text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-gray-400">Leyenda:</span>
            {(["GET", "POST", "PUT", "DELETE"] as Metodo[]).map(m => {
              const colorMap: Record<string, string> = {
                GET:    "bg-emerald-500",
                POST:   "bg-blue-500",
                PUT:    "bg-amber-500",
                DELETE: "bg-red-500",
              };
              return (
                <span key={m} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${colorMap[m]}`} />
                  {METHOD_LABELS[m]}
                </span>
              );
            })}
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <Lock className="h-3 w-3 text-gray-400" />
              Permiso por defecto
            </span>
          </div>
        </div>

        {/* Grid de Módulos */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELOS.map(mod => {
              const methods = (localMap[mod.value] ?? []) as Metodo[];
              const defaultMethods = (defaultPermissionsForCurrentUser[mod.value] ?? []) as Metodo[];
              return (
                <ModuleRow
                  key={mod.value}
                  modLabel={mod.label}
                  modValue={mod.value}
                  methods={methods}
                  metodos={METODOS}
                  methodLabels={METHOD_LABELS}
                  isDefaultFn={isDefaultPermission}
                  onToggle={toggleMethod}
                  onClear={handleClearModule}
                  defaultMethods={defaultMethods}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
              <p className="text-xs text-gray-500">
                {totalActive} permisos activos • {MODELOS.length} módulos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${hasChanges
                    ? "bg-brand-600 hover:bg-brand-700"
                    : "bg-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {hasChanges ? "Guardar cambios" : "Sin cambios"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </section>
    </Modal>
  );
}