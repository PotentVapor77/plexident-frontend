// src/components/clinicalRecord/modals/ClinicalRecordCreateEditModal.tsx

import React from "react";
import { FileText, X } from "lucide-react";
import { Modal } from "../../ui/modal";
import ClinicalRecordForm from "../form/ClinicalRecordForm";
import {
  useClinicalRecordInitialData,
  useClinicalRecord,
} from "../../../hooks/clinicalRecord/useClinicalRecords";
import Spinner from "../../ui/spinner/Spinner";
import type { ClinicalRecordInitialData } from "../../../types/clinicalRecords/typeBackendClinicalRecord";

interface ClinicalRecordCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  recordId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
}

const ClinicalRecordCreateEditModal: React.FC<ClinicalRecordCreateEditModalProps> = ({
  isOpen,
  onClose,
  mode,
  recordId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
}) => {
  // ========================================================================
  // FETCH DATA SEGÚN MODO
  // ========================================================================

  // CREATE: Cargar datos iniciales del paciente
  const shouldFetchInitialData = mode === "create" && isOpen && !!pacienteId;
  const {
    data: initialData,
    isLoading: loadingInitial,
  } = useClinicalRecordInitialData(
    shouldFetchInitialData ? pacienteId : null
  );

  // EDIT: Cargar historial existente
  const shouldFetchExisting = mode === "edit" && isOpen && !!recordId;
  const {
    data: existingRecord,
    isLoading: loadingExisting,
  } = useClinicalRecord(shouldFetchExisting ? recordId : null);

  // ========================================================================
  // EARLY RETURN
  // ========================================================================
  if (!isOpen) return null;

  // ========================================================================
  // VARIABLES DE UI
  // ========================================================================
  const isEdit = mode === "edit";
  const title = isEdit ? "Editar historial clínico" : "Crear historial clínico";
  const subtitle = isEdit
    ? "Actualice la información del historial clínico (Formulario 033)"
    : pacienteNombreCompleto
      ? `Registre el historial clínico para ${pacienteNombreCompleto}`
      : "Seleccione un paciente y registre el historial clínico";

  const isLoading = loadingInitial || loadingExisting;

  // ========================================================================
  // TRANSFORMACIÓN DE DATOS PARA EL FORMULARIO
  // ========================================================================

  const formInitialData: ClinicalRecordInitialData | undefined =
    isEdit && existingRecord
      ? {
        // Información del paciente
        paciente: {
          id: existingRecord.paciente_info.id,
          nombre_completo: `${existingRecord.paciente_info.nombres} ${existingRecord.paciente_info.apellidos}`,
          cedula_pasaporte: existingRecord.paciente_info.cedula_pasaporte,
          sexo: existingRecord.paciente_info.sexo,
          edad: existingRecord.paciente_info.edad,
        },

        // Campos de texto principales
        motivo_consulta: existingRecord.motivo_consulta,
        motivo_consulta_fecha: existingRecord.fecha_atencion,
        embarazada: existingRecord.embarazada,
        enfermedad_actual: existingRecord.enfermedad_actual,
        enfermedad_actual_fecha: existingRecord.fecha_atencion,

        // Antecedentes Personales
        antecedentes_personales: existingRecord.antecedentes_personales_data
          ? {
            id: existingRecord.antecedentes_personales,
            fecha: existingRecord.antecedentes_personales_data.fecha_creacion,
            data: existingRecord.antecedentes_personales_data,
          }
          : null,

        // Antecedentes Familiares
        antecedentes_familiares: existingRecord.antecedentes_familiares_data
          ? {
            id: existingRecord.antecedentes_familiares,
            fecha: existingRecord.antecedentes_familiares_data.fecha_creacion,
            data: existingRecord.antecedentes_familiares_data,
          }
          : null,

        // Constantes Vitales
        constantes_vitales: existingRecord.constantes_vitales_data
          ? {
            id: existingRecord.constantes_vitales,
            fecha: existingRecord.constantes_vitales_data.fecha_creacion,
            data: existingRecord.constantes_vitales_data,
          }
          : null,

        // Examen Estomatognático
        examen_estomatognatico: existingRecord.examen_estomatognatico_data
          ? {
            id: existingRecord.examen_estomatognatico,
            fecha: existingRecord.examen_estomatognatico_data.fecha_creacion,
            data: existingRecord.examen_estomatognatico_data,
          }
          : null,
        campos_formulario:
          (existingRecord as any).campos_formulario ??
          initialData?.campos_formulario ??
          null,
        IndicadoresSaludBucal:
          (existingRecord as any).IndicadoresSaludBucal ??
          initialData?.IndicadoresSaludBucal ??
          null,
        indicadores_salud_bucal:
          (existingRecord as any).indicadores_salud_bucal ??
          initialData?.indicadores_salud_bucal ??
          null,
      }

      : initialData;

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-5xl"
    >
      {/* ====================================================================
          HEADER PERSONALIZADO
      ==================================================================== */}
      <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
            <FileText className="h-6 w-6" />
          </div>

          {/* Textos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ====================================================================
          CONTENIDO CON SCROLL
      ==================================================================== */}
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 mt-4">
              {mode === "create"
                ? "Cargando antecedentes del paciente..."
                : "Cargando datos del historial..."}
            </p>
          </div>
        ) : (
          <ClinicalRecordForm
            mode={mode}
            recordId={recordId}
            pacienteId={pacienteId ?? undefined}
            initialData={formInitialData}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
};

export default ClinicalRecordCreateEditModal;
