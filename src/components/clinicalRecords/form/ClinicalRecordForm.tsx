// src/components/clinicalRecord/form/ClinicalRecordForm.tsx

import React, { useEffect } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import Button from "../../ui/button/Button";
import { 
  useCreateClinicalRecord, 
  useUpdateClinicalRecord 
} from "../../../hooks/clinicalRecord/useClinicalRecords";
import { useAuth } from "../../../hooks/auth/useAuth";
import { useClinicalRecordForm } from "../../../hooks/clinicalRecord/useClinicalRecordForm";
import ClinicalRecordFormFields from "./ClinicalRecordFormFields";
import type { ClinicalRecordInitialData } from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import { useNotification } from "../../../context/notifications/NotificationContext";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordFormProps {
  mode: "create" | "edit";
  recordId?: string;
  pacienteId?: string;
  initialData?: ClinicalRecordInitialData;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * ============================================================================
 * COMPONENT: ClinicalRecordForm
 * ============================================================================
 */
const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({
  mode,
  recordId,
  pacienteId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { notify } = useNotification();
  const { user } = useAuth();

  // ========================================================================
  // FORM HOOK
  // ========================================================================
  const {
    formData,
    updateField,
    updateSectionData,
    resetForm,
    selectedPaciente,
    setSelectedPaciente,
    selectedOdontologo,
    setSelectedOdontologo,
    isValid,
    validate,
    validationErrors,
    initialDates,
    setInitialDates,
  } = useClinicalRecordForm();

  // ========================================================================
  // MUTATIONS - ✅ PASAR ARGUMENTOS REQUERIDOS
  // ========================================================================
  const createMutation = useCreateClinicalRecord(pacienteId ?? null);
  const updateMutation = useUpdateClinicalRecord(
    recordId ?? "",
    pacienteId ?? null
  );
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ========================================================================
  // CARGAR DATOS INICIALES
  // ========================================================================
  useEffect(() => {
    if (!initialData) return;

    // Configurar paciente
    if (initialData.paciente) {
      setSelectedPaciente({
        id: initialData.paciente.id,
        nombreCompleto: initialData.paciente.nombre_completo,
        cedulaPasaporte: initialData.paciente.cedula_pasaporte,
        sexo: initialData.paciente.sexo,
        edad: initialData.paciente.edad,
      } as any);
      updateField("paciente", initialData.paciente.id);
    }

    // Configurar odontólogo responsable
    if (user?.id) {
      updateField("odontologo_responsable", user.id);
      setSelectedOdontologo(user);
    }

    // Cargar campos de texto
    if (initialData.motivo_consulta) {
      updateField("motivo_consulta", initialData.motivo_consulta);
    }

    if (initialData.embarazada) {
      updateField("embarazada", initialData.embarazada);
    }

    if (initialData.enfermedad_actual) {
      updateField("enfermedad_actual", initialData.enfermedad_actual);
    }

    // Cargar datos de secciones estructuradas
    if (initialData.antecedentes_personales?.data) {
      updateSectionData(
        "antecedentes_personales_data",
        initialData.antecedentes_personales.data
      );
    }

    if (initialData.antecedentes_familiares?.data) {
      updateSectionData(
        "antecedentes_familiares_data",
        initialData.antecedentes_familiares.data
      );
    }

    if (initialData.constantes_vitales?.data) {
      updateSectionData(
        "constantes_vitales_data",
        initialData.constantes_vitales.data
      );
    }

    if (initialData.examen_estomatognatico?.data) {
      updateSectionData(
        "examen_estomatognatico_data",
        initialData.examen_estomatognatico.data
      );
    }

    // Guardar fechas de referencia
    setInitialDates({
      motivo_consulta: initialData.motivo_consulta_fecha,
      enfermedad_actual: initialData.enfermedad_actual_fecha,
      antecedentes_personales: initialData.antecedentes_personales?.fecha ?? null,
      antecedentes_familiares: initialData.antecedentes_familiares?.fecha ?? null,
      constantes_vitales: initialData.constantes_vitales?.fecha ?? null,
      examen_estomatognatico: initialData.examen_estomatognatico?.fecha ?? null,
    });
  }, [initialData, user]);

  // ========================================================================
  // SUBMIT HANDLER
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar
    if (!validate()) {
      notify({
        type: "error",
        title: "Validación fallida",
        message: "Por favor, corrija los errores en el formulario.",
      });
      return;
    }

    try {
      // ✅ PAYLOAD SIN 'id' - el id se maneja en el hook de mutation
      const payload = {
        paciente: formData.paciente,
        odontologo_responsable: formData.odontologo_responsable,
        motivo_consulta: formData.motivo_consulta,
        embarazada: formData.embarazada || undefined,
        enfermedad_actual: formData.enfermedad_actual || undefined,
        observaciones: formData.observaciones || undefined,
        estado: formData.estado || "BORRADOR",
        unicodigo: formData.unicodigo || undefined,
        establecimiento_salud: formData.establecimiento_salud || undefined,
      };

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Historial creado",
          message: "El historial clínico se ha creado exitosamente.",
        });
      } else if (mode === "edit") {
        // ✅ En modo EDIT, el hook ya tiene el id, solo pasamos el payload
        await updateMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Historial actualizado",
          message: "Los cambios se han guardado correctamente.",
        });
      }

      resetForm();
      onSuccess();
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message:
          mode === "create"
            ? "No se pudo crear el historial clínico."
            : "No se pudo actualizar el historial clínico.",
      });
      console.error("Error al guardar historial:", error);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ERRORES DE VALIDACIÓN */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertCircle className="h-5 w-5" />
            Hay {Object.keys(validationErrors).length} error(es) en el formulario
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {Object.entries(validationErrors).map(([field, message]) => (
              <li key={field}>{String(message)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CAMPOS DEL FORMULARIO */}
      <ClinicalRecordFormFields
        formData={formData}
        updateField={updateField}
        updateSectionData={updateSectionData}
        selectedPaciente={selectedPaciente}
        setSelectedPaciente={setSelectedPaciente}
        selectedOdontologo={selectedOdontologo}
        setSelectedOdontologo={setSelectedOdontologo}
        validationErrors={validationErrors}
        initialDates={initialDates}
        mode={mode}
      />

      {/* ACCIONES */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          startIcon={<X className="h-4 w-4" />}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isValid}
          loading={isSubmitting}
          startIcon={<Save className="h-4 w-4" />}
        >
          {mode === "create" ? "Crear historial" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
};

export default ClinicalRecordForm;
