// src/components/patients/modals/PatientCreateEditModal.tsx

import { useState } from "react";
import { Modal } from "../../../ui/modal";
import PatientForm from "../forms/PatientForm";
import type { IPaciente } from "../../../../types/patient/IPatient";
import { useUpdatePaciente } from "../../../../hooks/patient/usePatients";
import { SuccessModal } from "./SuccessModal";

interface PatientCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IPaciente | null;
}

export function PatientCreateEditModal({ isOpen, onClose, patient }: PatientCreateEditModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const updatePaciente = useUpdatePaciente();

  if (!patient) return null;

  const initials = `${patient.nombres?.[0] ?? ""}${patient.apellidos?.[0] ?? ""}`.toUpperCase();

  const getCondicionEdadLabel = (cond: IPaciente["condicion_edad"]) => {
    switch (cond) {
      case "H": return "horas";
      case "D": return "días";
      case "M": return "meses";
      case "A": return "años";
      default: return "";
    }
  };

  const handlePatientCreated = async () => {
    try {
      await updatePaciente.mutateAsync({ 
        id: patient.id, 
        data: {
          nombres: patient.nombres,
          apellidos: patient.apellidos,
          sexo: patient.sexo,
          edad: patient.edad,
          condicion_edad: patient.condicion_edad,
          cedula_pasaporte: patient.cedula_pasaporte,
          fecha_nacimiento: patient.fecha_nacimiento,
          telefono: patient.telefono,
          correo: patient.correo,
          direccion: patient.direccion,
          contacto_emergencia_nombre: patient.contacto_emergencia_nombre,
          contacto_emergencia_telefono: patient.contacto_emergencia_telefono,
          embarazada: patient.embarazada,
          fecha_ingreso: patient.fecha_ingreso,
          activo: patient.activo,
        } 
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose} 
        className="max-w-4xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col">
          {/* Barra superior (igual estilo que UserViewModal) */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h5 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
                Editar Paciente
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete los datos del paciente
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

          {/* Contenido con el formulario */}
          <div className="space-y-6">
            {/* Cabecera pequeña con avatar opcional */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-semibold text-xl">
                {initials || "P"}
              </div>
              <div>
                <h6 className="font-semibold text-gray-800 dark:text-white/90 text-lg">
                  {patient.apellidos}, {patient.nombres}
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {patient.cedula_pasaporte} · {patient.edad} {getCondicionEdadLabel(patient.condicion_edad)}
                </p>
              </div>
            </div>

            {/* PatientForm - usa onPatientCreated que ya existe */}
            <PatientForm
              mode="edit"
              patientId={patient.id}
              initialData={{
                nombres: patient.nombres,
                apellidos: patient.apellidos,
                sexo: patient.sexo,
                edad: patient.edad,
                condicion_edad: patient.condicion_edad,
                cedula_pasaporte: patient.cedula_pasaporte,
                fecha_nacimiento: patient.fecha_nacimiento,
                telefono: patient.telefono,
                correo: patient.correo ?? "",
                direccion: patient.direccion ?? "",
                contacto_emergencia_nombre: patient.contacto_emergencia_nombre ?? "",
                contacto_emergencia_telefono: patient.contacto_emergencia_telefono ?? "",
                embarazada: patient.embarazada,

                activo: patient.activo,
              }}
              onPatientCreated={handlePatientCreated}
              notify={handlePatientCreated} 
            />
          </div>
        </div>
      </Modal>

      {/* SuccessModal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Paciente actualizado correctamente"
      />
    </>
  );
}
