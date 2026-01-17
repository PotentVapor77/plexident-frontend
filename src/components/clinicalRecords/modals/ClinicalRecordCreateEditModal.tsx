// src/components/clinicalRecord/modals/ClinicalRecordCreateEditModal.tsx

import React from "react";
import { FileText } from "lucide-react";
import { Modal } from "../../ui/modal";
import ClinicalRecordForm from "../form/ClinicalRecordForm";
import { useClinicalRecordInitialData } from "../../../hooks/clinicalRecord/useClinicalRecords";
import Spinner from "../../ui/spinner/Spinner";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  recordId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
}

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
const ClinicalRecordCreateEditModal: React.FC<ClinicalRecordCreateEditModalProps> = ({
  isOpen,
  onClose,
  mode,
  recordId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
}) => {
  // Solo cargamos initial data si estamos creando Y tenemos un paciente seleccionado
  const shouldFetchInitialData = mode === "create" && isOpen && !!pacienteId;

  const {
    data: initialData,
    isLoading: loadingInitial
  } = useClinicalRecordInitialData(
    shouldFetchInitialData ? pacienteId : null
  );

  if (!isOpen) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Editar historial clínico" : "Crear historial clínico";
  const subtitle = isEdit
    ? "Actualice la información del historial clínico (Formulario 033)"
    : pacienteNombreCompleto
    ? `Registre el historial clínico para ${pacienteNombreCompleto}`
    : "Seleccione un paciente y registre el historial clínico";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      {/* ====================================================================
        HEADER - Fijo en la parte superior
      ==================================================================== */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-8 py-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
            <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
        CONTENIDO - Con scroll interno
      ==================================================================== */}
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-8 py-6">
        {loadingInitial ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cargando antecedentes del paciente...
            </span>
          </div>
        ) : (
          <ClinicalRecordForm
            mode={mode}
            recordId={recordId}
            pacienteId={pacienteId}
            pacienteNombreCompleto={pacienteNombreCompleto}
            initialData={initialData}
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
