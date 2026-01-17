// src/components/clinicalRecord/form/ClinicalRecordForm.tsx

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ZodError } from "zod";
import Button from "../../ui/button/Button";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePacientes } from "../../../hooks/patient/usePatients";
import {
  useCreateClinicalRecord,
  useClinicalRecord,
  useUpdateClinicalRecord,
} from "../../../hooks/clinicalRecord/useClinicalRecords";
import { clinicalRecordCreateSchema } from "../../../core/schemas/clinicalRecord.schema";
import { mapFormDataToPayload, mapResponseToFormData } from "../../../mappers/clinicalRecordMapper";
import type { ClinicalRecordFormData } from "../../../core/types/clinicalRecord.types";
import type { IPaciente } from "../../../types/patient/IPatient";
import type { IUser } from "../../../types/user/IUser";
import { useUsers } from "../../../hooks/user/useUsers";
import { useAuth } from "../../../hooks/auth/useAuth";
import ClinicalRecordFormFields from "./ClinicalRecordFormFields";

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordFormProps {
  mode: "create" | "edit";
  recordId?: string;
  pacienteId: string | null;
  pacienteNombreCompleto: string | null;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;

}

const ESTABLECIMIENTO_SALUD = {
  unicodigo: "12345-EC-SALUD",
  nombre: "Centro de Salud Dental Plexident"
};

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
export default function ClinicalRecordForm({
  mode,
  recordId,
  pacienteId,
  pacienteNombreCompleto,
  onSuccess,
  initialData,
  onCancel,
}: ClinicalRecordFormProps) {
  const { notify } = useNotification();
  const { user: currentUser } = useAuth();
  const isCurrentUserOdontologo = currentUser?.rol === "Odontologo";

  // ==========================================================================
  // STATE - FORMULARIO
  // ==========================================================================
  const [formData, setFormData] = useState<ClinicalRecordFormData>({
    paciente: pacienteId || "",
    odontologo_responsable: isCurrentUserOdontologo ? currentUser.id : "",
    motivo_consulta: "",
    embarazada: "",
    enfermedad_actual: "",
    estado: "BORRADOR",
    observaciones: "",
    unicodigo: ESTABLECIMIENTO_SALUD.unicodigo,
    establecimiento_salud: ESTABLECIMIENTO_SALUD.nombre,
    usar_ultimos_datos: true,
  });

  useEffect(() => {
    if (isCurrentUserOdontologo && currentUser) {
      setSelectedOdontologo(currentUser);
      setFormData((prev) => ({
        ...prev,
        odontologo_responsable: currentUser.id,
      }));
    }
  }, [isCurrentUserOdontologo, currentUser]);

  const [submitLoading, setSubmitLoading] = useState(false);

  // ==========================================================================
  // STATE - BÚSQUEDA DE PACIENTE
  // ==========================================================================
  const [searchPaciente, setSearchPaciente] = useState("");
  const debouncedSearchPaciente = useDebounce(searchPaciente, 300);
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<IPaciente | null>(null);

  // ==========================================================================
  // STATE - BÚSQUEDA DE ODONTÓLOGO
  // ==========================================================================
  const [searchOdontologo, setSearchOdontologo] = useState("");
  const debouncedSearchOdontologo = useDebounce(searchOdontologo, 300);
  const [showOdontologoDropdown, setShowOdontologoDropdown] = useState(false);
  const [selectedOdontologo, setSelectedOdontologo] = useState<IUser | null>(null);

  // ==========================================================================
  // HOOKS
  // ==========================================================================
  const { data: recordData, isLoading: loadingRecord } = useClinicalRecord(
    mode === "edit" ? recordId || null : null
  );

  const createMutation = useCreateClinicalRecord(pacienteId);
  const updateMutation = useUpdateClinicalRecord(recordId || "", pacienteId);

  const { pacientes, isLoading: loadingPacientes } = usePacientes({
    page: 1,
    page_size: 100,
    search: debouncedSearchPaciente,
  });

  const { users: odontologos, isLoading: loadingOdontologos } = useUsers({
    page: 1,
    page_size: 100,
    search: debouncedSearchOdontologo,
    rol: "Odontologo",
  });

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Cargar datos del historial en modo edición
  useEffect(() => {
    if (mode === "edit" && recordData) {
      // 1. Mapear datos planos al formulario
      const mappedData = mapResponseToFormData(recordData);
      setFormData((prev) => ({
        ...prev,
        ...mappedData,
        usar_ultimos_datos: false,
      }));

      // 2. Reconstruir objeto paciente para el selector visual
      if (recordData.paciente_info) {
        setSelectedPaciente({
          id: recordData.paciente_info.id,
          nombres: recordData.paciente_info.nombres,
          apellidos: recordData.paciente_info.apellidos,
          cedula_pasaporte: recordData.paciente_info.cedula_pasaporte,
          sexo: recordData.paciente_info.sexo,
          edad: recordData.paciente_info.edad,
          fecha_nacimiento: recordData.paciente_info.fecha_nacimiento,
          activo: true,
        } as unknown as IPaciente);
      }

      // 3. Reconstruir objeto odontólogo para el selector visual
      if (recordData.odontologo_info) {
        setSelectedOdontologo({
          id: recordData.odontologo_info.id,
          nombres: recordData.odontologo_info.nombres,
          apellidos: recordData.odontologo_info.apellidos,
          rol: recordData.odontologo_info.rol,
          email: "",
          username: "",
          is_active: true,
        } as unknown as IUser);
      }
    }
  }, [mode, recordData]);

  // Pre-cargar datos iniciales del paciente
  useEffect(() => {
    if (mode === "create" && initialData) {
      setFormData(prev => ({
        ...prev,
        paciente: initialData.paciente?.id || prev.paciente,
        motivo_consulta: initialData.motivo_consulta || "",
        enfermedad_actual: initialData.enfermedad_actual || "",
        embarazada: initialData.embarazada || undefined,
        // Guardamos los IDs de antecedentes
        antecedentes_personales: initialData.antecedentes_personales_id || "",
        antecedentes_familiares: initialData.antecedentes_familiares_id || "",
        constantes_vitales: initialData.constantes_vitales_id || "",
        examen_estomatognatico: initialData.examen_estomatognatico_id || "",
      }));

      // Opcional: Si el componente de paciente necesita el objeto completo
      if (initialData.paciente) {
        setSelectedPaciente({
          id: initialData.paciente.id,
          nombres: initialData.paciente.nombre_completo.split(",")[1]?.trim() || "",
          apellidos: initialData.paciente.nombre_completo.split(",")[0]?.trim() || "",
          cedula_pasaporte: initialData.paciente.cedula_pasaporte,
          // ... mapear resto de campos si es necesario para visualización
        } as any);
      }
    }
  }, [mode, initialData]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectPaciente = (paciente: IPaciente) => {
    setSelectedPaciente(paciente);
    setFormData((prev) => ({
      ...prev,
      paciente: paciente.id,
    }));
    setSearchPaciente("");
    setShowPacienteDropdown(false);
  };

  const handleClearPaciente = () => {
    setSelectedPaciente(null);
    setFormData((prev) => ({
      ...prev,
      paciente: "",
    }));
  };

  const handleSelectOdontologo = (odontologo: IUser) => {
    setSelectedOdontologo(odontologo);
    setFormData((prev) => ({
      ...prev,
      odontologo_responsable: odontologo.id,
    }));
    setSearchOdontologo("");
    setShowOdontologoDropdown(false);
  };

  const handleClearOdontologo = () => {
    setSelectedOdontologo(null);
    setFormData((prev) => ({
      ...prev,
      odontologo_responsable: "",
    }));
  };

  const validateFormData = (): string[] => {
    try {
      clinicalRecordCreateSchema.parse(formData);
      return [];
    } catch (error) {
      if (error instanceof ZodError) {
        return error.issues.map((err) => {
          const fieldPath = err.path.length > 0 ? err.path.join(".") : "formulario";
          return `${String(fieldPath)}: ${err.message}`;
        });
      }
      return ["Error de validación desconocido"];
    }
  };

  const resetForm = () => {
    setFormData({
      paciente: pacienteId || "",
      odontologo_responsable: "",
      motivo_consulta: "",
      embarazada: "",
      enfermedad_actual: "",
      estado: "BORRADOR",
      observaciones: "",
      unicodigo: "",
      establecimiento_salud: "",
      usar_ultimos_datos: true,
    });
    setSelectedPaciente(null);
    setSelectedOdontologo(null);
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

    setSubmitLoading(true);
    try {
      const payload = mapFormDataToPayload(formData);

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Historial creado",
          message: "El historial clínico se registró correctamente.",
        });
      } else {
        if (!recordId) throw new Error("Falta el ID del historial para editar");
        await updateMutation.mutateAsync(payload);
        notify({
          type: "warning",
          title: "Historial actualizado",
          message: "El historial clínico se actualizó correctamente.",
        });
      }

      resetForm();
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Error al guardar el historial clínico";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string };
        if (data.message) {
          errorMessage = data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      notify({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (mode === "edit" && loadingRecord) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Cargando historial...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ClinicalRecordFormFields
        mode={mode}
        formData={formData}
        selectedPaciente={selectedPaciente}
        selectedOdontologo={selectedOdontologo}
        pacienteId={pacienteId}
        pacienteNombreCompleto={pacienteNombreCompleto}
        searchPaciente={searchPaciente}
        showPacienteDropdown={showPacienteDropdown}
        loadingPacientes={loadingPacientes}
        pacientes={pacientes}
        searchOdontologo={searchOdontologo}
        showOdontologoDropdown={showOdontologoDropdown}
        loadingOdontologos={loadingOdontologos}
        odontologos={odontologos}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onSelectPaciente={handleSelectPaciente}
        onClearPaciente={handleClearPaciente}
        onSelectOdontologo={handleSelectOdontologo}
        onClearOdontologo={handleClearOdontologo}
        onSearchPacienteChange={setSearchPaciente}
        setShowPacienteDropdown={setShowPacienteDropdown}
        onSearchOdontologoChange={setSearchOdontologo}
        setShowOdontologoDropdown={setShowOdontologoDropdown} isCurrentUserOdontologo={false} />

      {/* Botones de acción - Sticky al final del área de scroll */}
      <div className="sticky bottom-0 z-10 -mx-8 -mb-6 border-t border-gray-200 bg-white px-8 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            disabled={submitLoading}
            loading={submitLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitLoading}
          >
            {submitLoading
              ? mode === "create"
                ? "Creando..."
                : "Guardando..."
              : mode === "create"
                ? "Crear historial"
                : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
