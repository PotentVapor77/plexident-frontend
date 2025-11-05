// dentist/PatientViewModal.tsx
import { Modal } from "../../ui/modal";
import Badge from "../../ui/badge/Badge";
import type { PatientViewModalProps } from "../../../types/IPatient";


export function PatientViewModal({ isOpen, onClose, patient, onEdit }: PatientViewModalProps) {
  
  // Función para obtener el texto del estado según el booleano
  const getStatusText = (status: boolean | undefined): string => {
    if (status === undefined || status === null) {
      return "sin estado";
    }
    return status ? "Activo" : "Inactivo";
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status?: boolean): "primary" | "success" | "error" => {
  if (status === undefined || status === null) {
    return "primary";
  }
  return status ? "success" : "error";
};


  // Función para mostrar el sexo en texto legible
  const getSexoText = (sexo: string): string => {
    switch (sexo) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
              Información del Paciente
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Detalles completos del paciente
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Información Personal</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombres</label>
                <p className="text-gray-800 dark:text-white/90">{patient.nombres}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Apellidos</label>
                <p className="text-gray-800 dark:text-white/90">{patient.apellidos}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cédula/Pasaporte</label>
                <p className="text-gray-800 dark:text-white/90">{patient.cedula_pasaporte}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Nacimiento</label>
                <p className="text-gray-800 dark:text-white/90">{formatDate(patient.fecha_nacimiento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sexo</label>
                <p className="text-gray-800 dark:text-white/90">{getSexoText(patient.sexo)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Estado</label>
                <Badge size="sm" color={getStatusColor(patient.status)}>
                  {getStatusText(patient.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Información de Contacto</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</label>
                <p className="text-gray-800 dark:text-white/90">{patient.direccion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</label>
                <p className="text-gray-800 dark:text-white/90">{patient.telefono}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Correo Electrónico</label>
                <p className="text-gray-800 dark:text-white/90">{patient.correo}</p>
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Contacto de Emergencia</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                <p className="text-gray-800 dark:text-white/90">{patient.contacto_emergencia_nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</label>
                <p className="text-gray-800 dark:text-white/90">{patient.contacto_emergencia_telefono}</p>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h6 className="font-medium text-gray-800 dark:text-white/90 mb-4">Información Médica</h6>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Alergias</label>
                <p className="text-gray-800 dark:text-white/90 mt-1">{patient.alergias || "Ninguna"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Enfermedades Sistémicas</label>
                <p className="text-gray-800 dark:text-white/90 mt-1">{patient.enfermedades_sistemicas || "Ninguna"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Hábitos</label>
                <p className="text-gray-800 dark:text-white/90 mt-1">{patient.habitos || "No especificados"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
          <button
            onClick={onEdit}
            type="button"
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Editar Paciente
          </button>
        </div>
      </div>
    </Modal>
  );
}