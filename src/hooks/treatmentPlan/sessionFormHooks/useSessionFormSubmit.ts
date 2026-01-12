import { AxiosError } from 'axios';
import type { DiagnosticoSnapshot } from '../../../types/treatmentPlan/typeBackendTreatmentPlan';
import { useState } from 'react';
import { sessionFormSchema } from '../../../core/schemas/treatmentPlan.schema';
import { ZodError } from 'zod';
import { mapFrontendSesionToPayload } from '../../../mappers/treatmentPlanMapper';
// src/hooks/treatmentPlan/sessionFormHooks/useDiagnosticosFilter.ts
type NotificationType = 'success' | 'error' | 'warning' | 'info';
interface UseSessionFormSubmitParams {
    formData: any;
    selectedDiagnosticos: DiagnosticoSnapshot[];
    mode: "create" | "edit";
    planId: string;
    sesionId?: string;
    createMutation: any;
    updateMutation: any;
    onSuccess: () => void;
    notify: (notification: { type: NotificationType; title: string; message: string }) => void;
}
export function useSessionFormSubmit({
  formData,
  selectedDiagnosticos,
  mode,
  planId,
  sesionId,
  createMutation,
  updateMutation,
  onSuccess,
  notify,
}: UseSessionFormSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFormData = (): string[] => {
    try {
      sessionFormSchema.parse(formData);
      return [];
    } catch (error) {
      if (error instanceof ZodError) {
        return error.issues.map((err) => `${err.path.join(".")}: ${err.message}`);
      }
      return ["Error de validación desconocido"];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      notify({
        type: "error",
        title: "Errores de validación",
        message: validationErrors.join("\n"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const basePayload = mapFrontendSesionToPayload(formData);
      const diagnosticosSeleccionados =
        selectedDiagnosticos.length > 0 ? selectedDiagnosticos : [];

      console.log("🟦 selectedDiagnosticos al enviar:", selectedDiagnosticos);
      console.log("🟩 payload base sesión:", basePayload);
      console.log("🟧 diagnosticos_complicaciones enviados:", diagnosticosSeleccionados);

      if (mode === "create") {
        await createMutation.mutateAsync({
          ...basePayload,
          diagnosticos_complicaciones: diagnosticosSeleccionados,
        });
        notify({
          type: "success",
          title: "Sesión creada",
          message: "La sesión de tratamiento se registró correctamente.",
        });
      } else {
        if (!sesionId) {
          throw new Error("Falta el ID de la sesión para editar");
        }

        await updateMutation.mutateAsync({
          fecha_programada: basePayload.fecha_programada,
          procedimientos: basePayload.procedimientos,
          prescripciones: basePayload.prescripciones,
          notas: basePayload.notas,
          estado: basePayload.estado,
          diagnosticos_complicaciones: diagnosticosSeleccionados,
        });
        notify({
          type: "warning",
          title: "Sesión actualizada",
          message: "La sesión de tratamiento se actualizó correctamente.",
        });
      }

      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar la sesión de tratamiento";

      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) errorMessage = data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notify({ type: "error", title: "Error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}