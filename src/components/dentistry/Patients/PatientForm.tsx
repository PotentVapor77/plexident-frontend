// dentist/PatientForm.tsx
import type { PatientFormProps } from "../../../types/IPatient";
import { Modal } from "../../ui/modal";


export function PatientForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  loading,
  patient
}: PatientFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
              {patient ? 'Editar Paciente' : 'Crear Paciente'}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {patient ? 'Actualice la información del paciente según sea necesario' : 'Complete la información del nuevo paciente'}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cédula/Pasaporte * (10 dígitos)
              </label>
              <input
                type="text"
                name="cedula_pasaporte"
                value={formData.cedula_pasaporte}
                onChange={onInputChange}
                required
                placeholder="Ej: 1709876543"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sexo *
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Seleccionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono * (10 dígitos)
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={onInputChange}
                required
                placeholder="Ej: 0991234567"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contacto de Emergencia (Nombre) *
              </label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre}
                onChange={onInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contacto de Emergencia (Teléfono) * (10 dígitos)
              </label>
              <input
                type="tel"
                name="contacto_emergencia_telefono"
                value={formData.contacto_emergencia_telefono}
                onChange={onInputChange}
                required
                placeholder="Ej: 0987654321"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Campos de texto largos - full width */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alergias *
            </label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={onInputChange}
              rows={3}
              placeholder="Lista de alergias conocidas..."
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enfermedades Sistémicas *
            </label>
            <textarea
              name="enfermedades_sistemicas"
              value={formData.enfermedades_sistemicas}
              onChange={onInputChange}
              rows={3}
              placeholder="Enfermedades crónicas o condiciones médicas..."
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hábitos *
            </label>
            <textarea
              name="habitos"
              value={formData.habitos}
              onChange={onInputChange}
              rows={3}
              placeholder="Hábitos de vida, consumo de tabaco, alcohol, etc..."
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
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
              Paciente Activo
            </span>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
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
            {loading ? 'Guardando...' : (patient ? "Actualizar Paciente" : "Crear Paciente")}
          </button>
        </div>
      </form>
    </Modal>
  );
}