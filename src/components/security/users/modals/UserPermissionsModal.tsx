import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../../components/ui/modal";
import type { IUser } from "../../../../types/user/IUser";
import type { IUsuarioPermisos } from "../../../../types/permissions/IPermission";
import { usePermissionsByUser, type Metodo, type PermissionsMap } from "../../../../hooks/Permissions/usePermissionsByUser";
import { useNotification } from "../../../../context/notifications/NotificationContext";

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
}

export function UserPermissionsModal({ isOpen, onClose, user }: UserPermissionsModalProps) {
  const {
    setSelectedUser,
    permissionsMap,
    isSaving,
    savePermissions,
    MODELOS,
  } = usePermissionsByUser();

  const { notify } = useNotification();
  const [localMap, setLocalMap] = useState<PermissionsMap>({});
  const [originalMap, setOriginalMap] = useState<PermissionsMap>({});

  // Cuando el usuario del prop cambia, actualizamos el selectedUser del hook
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

  // Cargar permisos existentes
  useEffect(() => {
    setLocalMap(permissionsMap);
    setOriginalMap(permissionsMap);
  }, [permissionsMap]);

  // Detectar si hay cambios pendientes
  const hasChanges = useMemo(() => {
    return JSON.stringify(localMap) !== JSON.stringify(originalMap);
  }, [localMap, originalMap]);

  const toggleMethod = (modelo: string, metodo: Metodo) => {
    setLocalMap((prev) => {
      const current = prev[modelo] || ([] as Metodo[]);
      const exists = current.includes(metodo);
      const next = exists
        ? current.filter((m) => m !== metodo)
        : [...current, metodo];
      return { ...prev, [modelo]: next };
    });
  };

  const handleSave = async () => {
    try {
      await savePermissions(localMap);
      
      // Actualizar el mapa original después de guardar exitosamente
      setOriginalMap(localMap);
      
      notify({
        type: "success",
        title: "Permisos actualizados",
        message: `Los permisos de ${user.nombres} ${user.apellidos} se guardaron correctamente.`,
      });

      // Cerrar modal después de guardar
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      notify({
        type: "error",
        title: "Error al guardar",
        message: "No se pudieron guardar los permisos. Intente nuevamente.",
      });
      console.error("Error al guardar permisos:", error);
    }
  };

  const handleClearModule = (modelo: string) => {
    setLocalMap((prev) => ({ ...prev, [modelo]: [] as Metodo[] }));
    
    const moduloLabel = MODELOS.find(m => m.value === modelo)?.label || modelo;
    notify({
      type: "error",
      title: "Módulo limpiado",
      message: `Se eliminaron todos los permisos de ${moduloLabel}. Recuerde guardar los cambios.`,
    });
  };

  const handleClearAllModules = () => {
    const clearedMap: PermissionsMap = {};
    MODELOS.forEach((m) => {
      clearedMap[m.value] = [] as Metodo[];
    });
    setLocalMap(clearedMap);
    
    notify({
      type: "error",
      title: "Todos los módulos limpiados",
      message: "Se eliminaron todos los permisos. Recuerde guardar los cambios.",
    });
  };

  const getFullName = (): string => {
    return `${user.apellidos}, ${user.nombres}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {/* Cabecera Minimalista */}
        <div className="mb-8 bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">
                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Permisos de Usuario</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{getFullName()}</h3>
              
              <div className="flex items-center flex-wrap gap-3">
                <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                
                <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                  <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{user.correo}</span>
                </div>
                
                <div className={`inline-flex items-center rounded-lg px-3 py-1.5 ${
                  user.rol === "Administrador" ? "bg-purple-50 border border-purple-200" :
                  user.rol === "Odontologo" ? "bg-blue-50 border border-blue-200" :
                  "bg-emerald-50 border border-emerald-200"
                }`}>
                  <span className={`text-sm font-medium ${
                    user.rol === "Administrador" ? "text-purple-800" :
                    user.rol === "Odontologo" ? "text-blue-800" :
                    "text-emerald-800"
                  }`}>
                    {user.rol}
                  </span>
                </div>
                
                <div className={`inline-flex items-center rounded-lg px-3 py-1.5 ${
                  user.is_active 
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.is_active ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    user.is_active ? "text-green-800" : "text-red-800"
                  }`}>
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de permisos */}
        <div className="overflow-hidden rounded-lg border border-gray-300 mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MÓDULO
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  VER
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  CREAR
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  ACTUALIZAR
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  ELIMINAR
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  ACCIÓN
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MODELOS.map((mod, idx) => {
                const methods = localMap[mod.value] || ([] as Metodo[]);

                return (
                  <tr 
                    key={mod.value} 
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mod.label}</div>
                      <div className="text-xs text-gray-500">{mod.value}</div>
                    </td>
                    
                    {/* Ver (GET) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          methods.includes('GET')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {methods.includes('GET') ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMethod(mod.value, 'GET')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            methods.includes('GET') ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            methods.includes('GET') ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                    
                    {/* Crear (POST) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          methods.includes('POST')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {methods.includes('POST') ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMethod(mod.value, 'POST')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            methods.includes('POST') ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            methods.includes('POST') ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                    
                    {/* Actualizar (PUT/PATCH) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          methods.includes('PUT') || methods.includes('PATCH')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {methods.includes('PUT') || methods.includes('PATCH') ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const hasPutOrPatch = methods.includes('PUT') || methods.includes('PATCH');
                            if (hasPutOrPatch) {
                              const newMethods = methods.filter((m): m is Metodo => m !== 'PUT' && m !== 'PATCH');
                              setLocalMap(prev => ({ ...prev, [mod.value]: newMethods }));
                            } else {
                              const newMethods: Metodo[] = [...methods, 'PUT', 'PATCH'];
                              setLocalMap(prev => ({ ...prev, [mod.value]: newMethods }));
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            methods.includes('PUT') || methods.includes('PATCH') ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            methods.includes('PUT') || methods.includes('PATCH') ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                    
                    {/* Eliminar (DELETE) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          methods.includes('DELETE')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {methods.includes('DELETE') ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMethod(mod.value, 'DELETE')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            methods.includes('DELETE') ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            methods.includes('DELETE') ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleClearModule(mod.value)}
                        disabled={methods.length === 0}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                          methods.length > 0
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title="Limpiar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpiar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleClearAllModules}
            disabled={Object.values(localMap).flat().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar todos los módulos
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                hasChanges 
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : hasChanges ? (
                'Actualizar cambios'
              ) : (
                'Guardar permisos'
              )}
            </button>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Información sobre permisos:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>Ver (GET):</strong> Permite ver/listar elementos del módulo</li>
            <li><strong>Crear (POST):</strong> Permite agregar nuevos elementos</li>
            <li><strong>Actualizar (PUT/PATCH):</strong> Permite modificar elementos existentes</li>
            <li><strong>Eliminar (DELETE):</strong> Permite eliminar elementos</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
