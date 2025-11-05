// users/UserForm.tsx - VERSIÓN MEJORADA
import type { UserFormProps } from "../../../types/IUser";
import { Modal } from "../../ui/modal";
import { useState } from "react"; // ← Agregar este import



export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  loading,
  user
}: UserFormProps) {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si está editando y no quiere cambiar contraseña, limpiar campos
    const submitData = { ...formData };
    if (user && !showPasswordFields) {
      submitData.contrasena = '';
      submitData.confirmar_contrasena = '';
    }
    
    await onSubmit(submitData);
  };

  const isEditing = !!user;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
              {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Actualice la información del usuario según sea necesario' : 'Complete la información del nuevo usuario'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ingrese los nombres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ingrese los apellidos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol *
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="asistente">Asistente</option>
                <option value="odontologo">Odontólogo</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            {/* SOLO PARA CREACIÓN O SI QUIERE CAMBIAR CONTRASEÑA */}
            {!isEditing || showPasswordFields ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={onInputChange}
                    required={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={isEditing ? "Nueva contraseña" : "Mínimo 6 caracteres"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Contraseña {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    name="confirmar_contrasena"
                    value={formData.confirmar_contrasena}
                    onChange={onInputChange}
                    required={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Repita la contraseña"
                  />
                </div>
              </>
            ) : (
              /* BOTÓN PARA CAMBIAR CONTRASEÑA (solo en edición) */
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full p-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  ✏️ Cambiar contraseña
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Opcional: Solo complete si desea cambiar la contraseña
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Checkbox de estado */}
        <div className="mt-6 flex items-center">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={onInputChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Usuario Activo
            </span>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => {
              setShowPasswordFields(false);
              onClose();
            }}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Guardando...' : (isEditing ? "Actualizar Usuario" : "Crear Usuario")}
          </button>
        </div>
      </form>
    </Modal>
  );
}