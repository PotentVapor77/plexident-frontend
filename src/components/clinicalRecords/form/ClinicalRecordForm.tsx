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
import type { 
  ClinicalRecordInitialData 
} from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import { useNotification } from "../../../context/notifications/NotificationContext";
import type { IPaciente } from "../../../types/patient/IPatient";
import clinicalRecordService from "../../../services/clinicalRecord/clinicalRecordService";
import axiosInstance from "../../../services/api/axiosInstance"; // ← AGREGAR ESTE IMPORT

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
  // MUTATIONS 
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
      const pacienteCompatible: IPaciente = {
        id: initialData.paciente.id,
        nombres: initialData.paciente.nombre_completo.split(' ')[0] || '',
        apellidos: initialData.paciente.nombre_completo.split(' ').slice(1).join(' ') || '',
        cedula_pasaporte: initialData.paciente.cedula_pasaporte,
        sexo: initialData.paciente.sexo,
        edad: initialData.paciente.edad,
        fecha_nacimiento: '',
        direccion: '',
        telefono: '',
        correo: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        fecha_ingreso: '',
        activo: true,
        fecha_creacion: '',
        condicion_edad: 'A',
      } as IPaciente;

      setSelectedPaciente(pacienteCompatible);
      updateField("paciente", initialData.paciente.id);
    }

    if (initialData.campos_formulario) {
      const campos = initialData.campos_formulario;
      updateField("institucion_sistema", campos.institucion_sistema);
      updateField("unicodigo", campos.unicodigo);
      updateField("establecimiento_salud", campos.establecimiento_salud);
      updateField("numero_historia_clinica_unica", campos.numero_historia_clinica_unica);
      updateField("numero_archivo", campos.numero_archivo);
      updateField("numero_hoja", campos.numero_hoja);
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
      // Preparar payload base
      const payload = {
        paciente: formData.paciente,
        odontologo_responsable: formData.odontologo_responsable,
        motivo_consulta: formData.motivo_consulta || undefined,
        embarazada: formData.embarazada || undefined,
        enfermedad_actual: formData.enfermedad_actual || undefined,
        observaciones: formData.observaciones || undefined,
        estado: formData.estado || "BORRADOR",
        institucion_sistema: formData.institucion_sistema || 'SISTEMA NACIONAL DE SALUD',
        unicodigo: formData.unicodigo || undefined,
        establecimiento_salud: formData.establecimiento_salud || undefined,
        numero_hoja: formData.numero_hoja || 1,
      };

      // Agregar constantes vitales al payload si existen
      if (formData.constantes_vitales_data) {
        const constantesVitales = formData.constantes_vitales_data as any;
        Object.assign(payload, {
          temperatura: constantesVitales.temperatura || undefined,
          pulso: constantesVitales.pulso || undefined,
          frecuencia_respiratoria: constantesVitales.frecuencia_respiratoria || undefined,
          presion_arterial: constantesVitales.presion_arterial || undefined,
        });
      }

      if (mode === "create") {
        // ============================================
        // CREAR HISTORIAL
        // ============================================
        const historialCreado = await createMutation.mutateAsync(payload);
        
        console.log("Historial creado:", historialCreado.id);

        // ============================================
        // GUARDAR FORM033 (ODONTOGRAMA)
        // ============================================
        if (selectedPaciente?.id) {
          try {
            console.log("Obteniendo datos del Form033...");
            
            // Obtener datos del Form033
            const form033Response = await axiosInstance.get<any>(
              `/odontogram/export/form033/${selectedPaciente.id}/json/`
            );

            if (form033Response.data.success && form033Response.data.data) {
              console.log(" Guardando Form033 en el historial...");
              
              // Guardar el Form033 en el historial
              await clinicalRecordService.addForm033(
                historialCreado.id,
                form033Response.data.data.form033,
                "Odontograma guardado automáticamente al crear el historial clínico"
              );

              console.log("Form033 guardado exitosamente");
            } else {
              console.warn(" No se pudo obtener Form033, continuando sin odontograma");
            }
          } catch (form033Error) {
            console.warn(
              " Error guardando Form033 (historial creado correctamente):",
              form033Error
            );
            // No bloqueamos el flujo si falla el Form033
          }
        }

        notify({
          type: "success",
          title: "Historial creado",
          message: "El historial clínico se ha creado exitosamente.",
        });
        
      } else if (mode === "edit") {
        // ============================================
        // ACTUALIZAR HISTORIAL
        // ============================================
        const updatePayload = {
          motivo_consulta: formData.motivo_consulta,
          embarazada: formData.embarazada || undefined,
          enfermedad_actual: formData.enfermedad_actual || undefined,
          observaciones: formData.observaciones || undefined,
          estado: formData.estado || undefined,
        };

        // Añadir constantes vitales para update también
        if (formData.constantes_vitales_data) {
          const constantesVitales = formData.constantes_vitales_data as any;
          Object.assign(updatePayload, {
            temperatura: constantesVitales.temperatura || undefined,
            pulso: constantesVitales.pulso || undefined,
            frecuencia_respiratoria: constantesVitales.frecuencia_respiratoria || undefined,
            presion_arterial: constantesVitales.presion_arterial || undefined,
          });
        }

        await updateMutation.mutateAsync(updatePayload);
        
        notify({
          type: "success",
          title: "Historial actualizado",
          message: "Los cambios se han guardado correctamente.",
        });
      }

      resetForm();
      onSuccess();
      
    } catch (error) {
      console.error("Error al guardar historial:", error);
      
      notify({
        type: "error",
        title: "Error",
        message:
          mode === "create"
            ? "No se pudo crear el historial clínico."
            : "No se pudo actualizar el historial clínico.",
      });
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
        refreshSections={async (_section: string) => {
          // Implementar si es necesario
          console.log("Refresh sections not implemented");
        }}
        historialId={recordId}
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
