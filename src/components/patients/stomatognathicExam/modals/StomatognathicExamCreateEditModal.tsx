// src/components/stomatognathicExam/modals/StomatognathicExamCreateEditModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "../../../ui/modal";
import type {
  IStomatognathicExam,
  IStomatognathicExamCreate,
  IStomatognathicExamUpdate,
  IPacienteBasico,
} from "../../../../types/stomatognathicExam/IStomatognathicExam";
import {
  useCreateStomatognathicExam,
  useUpdateStomatognathicExam,
} from "../../../../hooks/stomatognathicExam/useStomatognathicExam";
import { StomatognathicExamFormFields } from "../forms/StomatognathicExamFormFields";

type RegionKey = 
  | 'mejillas' 
  | 'maxilar_inferior' 
  | 'maxilar_superior' 
  | 'paladar' 
  | 'piso_boca' 
  | 'carrillos' 
  | 'glandulas_salivales' 
  | 'ganglios' 
  | 'lengua' 
  | 'labios';

// Tipo seguro para acceder a las propiedades del formulario
type StomatognathicExamCreateWithDynamic = IStomatognathicExamCreate & {
  [key: string]: string | boolean | undefined;
};

interface StomatognathicExamCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: IStomatognathicExam | null;
  examId?: string;
  onExamSaved?: () => void;
  notify?: (message: string, type: "success" | "error") => void;
}

export function StomatognathicExamCreateEditModal({
  isOpen,
  onClose,
  mode,
  initialData,
  examId,
  onExamSaved,
  notify,
}: StomatognathicExamCreateEditModalProps) {
  const createMutation = useCreateStomatognathicExam();
  const updateMutation = useUpdateStomatognathicExam();

  // Estado inicial - todos los SP en false inicialmente, se manejarán en el form
  const [formData, setFormData] = useState<IStomatognathicExamCreate>({
    paciente: "",
    examen_sin_patologia: false,
    atm_cp: false,
    atm_sp: false,
    atm_absceso: false,
    atm_fibroma: false,
    atm_herpes: false,
    atm_ulcera: false,
    atm_otra_patologia: false,
    atm_observacion: "",
    
    mejillas_cp: false,
    mejillas_sp: false,
    mejillas_absceso: false,
    mejillas_fibroma: false,
    mejillas_herpes: false,
    mejillas_ulcera: false,
    mejillas_otra_patologia: false,
    mejillas_descripcion: "",
    
    maxilar_inferior_cp: false,
    maxilar_inferior_sp: false,
    maxilar_inferior_absceso: false,
    maxilar_inferior_fibroma: false,
    maxilar_inferior_herpes: false,
    maxilar_inferior_ulcera: false,
    maxilar_inferior_otra_patologia: false,
    maxilar_inferior_descripcion: "",
    
    maxilar_superior_cp: false,
    maxilar_superior_sp: false,
    maxilar_superior_absceso: false,
    maxilar_superior_fibroma: false,
    maxilar_superior_herpes: false,
    maxilar_superior_ulcera: false,
    maxilar_superior_otra_patologia: false,
    maxilar_superior_descripcion: "",
    
    paladar_cp: false,
    paladar_sp: false,
    paladar_absceso: false,
    paladar_fibroma: false,
    paladar_herpes: false,
    paladar_ulcera: false,
    paladar_otra_patologia: false,
    paladar_descripcion: "",
    
    piso_boca_cp: false,
    piso_boca_sp: false,
    piso_boca_absceso: false,
    piso_boca_fibroma: false,
    piso_boca_herpes: false,
    piso_boca_ulcera: false,
    piso_boca_otra_patologia: false,
    piso_boca_descripcion: "",
    
    carrillos_cp: false,
    carrillos_sp: false,
    carrillos_absceso: false,
    carrillos_fibroma: false,
    carrillos_herpes: false,
    carrillos_ulcera: false,
    carrillos_otra_patologia: false,
    carrillos_descripcion: "",
    
    glandulas_salivales_cp: false,
    glandulas_salivales_sp: false,
    glandulas_salivales_absceso: false,
    glandulas_salivales_fibroma: false,
    glandulas_salivales_herpes: false,
    glandulas_salivales_ulcera: false,
    glandulas_salivales_otra_patologia: false,
    glandulas_salivales_descripcion: "",
    
    ganglios_cp: false,
    ganglios_sp: false,
    ganglios_absceso: false,
    ganglios_fibroma: false,
    ganglios_herpes: false,
    ganglios_ulcera: false,
    ganglios_otra_patologia: false,
    ganglios_descripcion: "",
    
    lengua_cp: false,
    lengua_sp: false,
    lengua_absceso: false,
    lengua_fibroma: false,
    lengua_herpes: false,
    lengua_ulcera: false,
    lengua_otra_patologia: false,
    lengua_descripcion: "",
    
    labios_cp: false,
    labios_sp: false,
    labios_absceso: false,
    labios_fibroma: false,
    labios_herpes: false,
    labios_ulcera: false,
    labios_otra_patologia: false,
    labios_descripcion: "",
  });

  const [activo, setActivo] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPacienteId = (
    paciente: string | IPacienteBasico | undefined
  ): string => {
    if (!paciente) return "";
    if (typeof paciente === "string") return paciente;
    return paciente.id || "";
  };

  useEffect(() => {
    if (initialData && mode === "edit") {
      const newFormData: StomatognathicExamCreateWithDynamic = {
        paciente: getPacienteId(initialData.paciente),
        examen_sin_patologia: initialData.examen_sin_patologia || false,
        atm_cp: initialData.atm_cp || false,
        atm_sp: initialData.atm_sp || false,
        atm_absceso: initialData.atm_absceso || false,
        atm_fibroma: initialData.atm_fibroma || false,
        atm_herpes: initialData.atm_herpes || false,
        atm_ulcera: initialData.atm_ulcera || false,
        atm_otra_patologia: initialData.atm_otra_patologia || false,
        atm_observacion: initialData.atm_observacion || "",
        
        mejillas_cp: initialData.mejillas_cp || false,
        mejillas_sp: initialData.mejillas_sp || false,
        mejillas_absceso: initialData.mejillas_absceso || false,
        mejillas_fibroma: initialData.mejillas_fibroma || false,
        mejillas_herpes: initialData.mejillas_herpes || false,
        mejillas_ulcera: initialData.mejillas_ulcera || false,
        mejillas_otra_patologia: initialData.mejillas_otra_patologia || false,
        mejillas_descripcion: initialData.mejillas_descripcion || "",
        
        maxilar_inferior_cp: initialData.maxilar_inferior_cp || false,
        maxilar_inferior_sp: initialData.maxilar_inferior_sp || false,
        maxilar_inferior_absceso: initialData.maxilar_inferior_absceso || false,
        maxilar_inferior_fibroma: initialData.maxilar_inferior_fibroma || false,
        maxilar_inferior_herpes: initialData.maxilar_inferior_herpes || false,
        maxilar_inferior_ulcera: initialData.maxilar_inferior_ulcera || false,
        maxilar_inferior_otra_patologia: initialData.maxilar_inferior_otra_patologia || false,
        maxilar_inferior_descripcion: initialData.maxilar_inferior_descripcion || "",
        
        maxilar_superior_cp: initialData.maxilar_superior_cp || false,
        maxilar_superior_sp: initialData.maxilar_superior_sp || false,
        maxilar_superior_absceso: initialData.maxilar_superior_absceso || false,
        maxilar_superior_fibroma: initialData.maxilar_superior_fibroma || false,
        maxilar_superior_herpes: initialData.maxilar_superior_herpes || false,
        maxilar_superior_ulcera: initialData.maxilar_superior_ulcera || false,
        maxilar_superior_otra_patologia: initialData.maxilar_superior_otra_patologia || false,
        maxilar_superior_descripcion: initialData.maxilar_superior_descripcion || "",
        
        paladar_cp: initialData.paladar_cp || false,
        paladar_sp: initialData.paladar_sp || false,
        paladar_absceso: initialData.paladar_absceso || false,
        paladar_fibroma: initialData.paladar_fibroma || false,
        paladar_herpes: initialData.paladar_herpes || false,
        paladar_ulcera: initialData.paladar_ulcera || false,
        paladar_otra_patologia: initialData.paladar_otra_patologia || false,
        paladar_descripcion: initialData.paladar_descripcion || "",
        
        piso_boca_cp: initialData.piso_boca_cp || false,
        piso_boca_sp: initialData.piso_boca_sp || false,
        piso_boca_absceso: initialData.piso_boca_absceso || false,
        piso_boca_fibroma: initialData.piso_boca_fibroma || false,
        piso_boca_herpes: initialData.piso_boca_herpes || false,
        piso_boca_ulcera: initialData.piso_boca_ulcera || false,
        piso_boca_otra_patologia: initialData.piso_boca_otra_patologia || false,
        piso_boca_descripcion: initialData.piso_boca_descripcion || "",
        
        carrillos_cp: initialData.carrillos_cp || false,
        carrillos_sp: initialData.carrillos_sp || false,
        carrillos_absceso: initialData.carrillos_absceso || false,
        carrillos_fibroma: initialData.carrillos_fibroma || false,
        carrillos_herpes: initialData.carrillos_herpes || false,
        carrillos_ulcera: initialData.carrillos_ulcera || false,
        carrillos_otra_patologia: initialData.carrillos_otra_patologia || false,
        carrillos_descripcion: initialData.carrillos_descripcion || "",
        
        glandulas_salivales_cp: initialData.glandulas_salivales_cp || false,
        glandulas_salivales_sp: initialData.glandulas_salivales_sp || false,
        glandulas_salivales_absceso: initialData.glandulas_salivales_absceso || false,
        glandulas_salivales_fibroma: initialData.glandulas_salivales_fibroma || false,
        glandulas_salivales_herpes: initialData.glandulas_salivales_herpes || false,
        glandulas_salivales_ulcera: initialData.glandulas_salivales_ulcera || false,
        glandulas_salivales_otra_patologia: initialData.glandulas_salivales_otra_patologia || false,
        glandulas_salivales_descripcion: initialData.glandulas_salivales_descripcion || "",
        
        ganglios_cp: initialData.ganglios_cp || false,
        ganglios_sp: initialData.ganglios_sp || false,
        ganglios_absceso: initialData.ganglios_absceso || false,
        ganglios_fibroma: initialData.ganglios_fibroma || false,
        ganglios_herpes: initialData.ganglios_herpes || false,
        ganglios_ulcera: initialData.ganglios_ulcera || false,
        ganglios_otra_patologia: initialData.ganglios_otra_patologia || false,
        ganglios_descripcion: initialData.ganglios_descripcion || "",
        
        lengua_cp: initialData.lengua_cp || false,
        lengua_sp: initialData.lengua_sp || false,
        lengua_absceso: initialData.lengua_absceso || false,
        lengua_fibroma: initialData.lengua_fibroma || false,
        lengua_herpes: initialData.lengua_herpes || false,
        lengua_ulcera: initialData.lengua_ulcera || false,
        lengua_otra_patologia: initialData.lengua_otra_patologia || false,
        lengua_descripcion: initialData.lengua_descripcion || "",
        
        labios_cp: initialData.labios_cp || false,
        labios_sp: initialData.labios_sp || false,
        labios_absceso: initialData.labios_absceso || false,
        labios_fibroma: initialData.labios_fibroma || false,
        labios_herpes: initialData.labios_herpes || false,
        labios_ulcera: initialData.labios_ulcera || false,
        labios_otra_patologia: initialData.labios_otra_patologia || false,
        labios_descripcion: initialData.labios_descripcion || "",
      };

      // Si los datos vienen con ambos campos en false, establecer SP en true para que los botones funcionen
      const regions: RegionKey[] = [
        "mejillas", "maxilar_inferior", "maxilar_superior", "paladar",
        "piso_boca", "carrillos", "glandulas_salivales", "ganglios", "lengua", "labios"
      ];

      // Asegurar que cada región tenga al menos SP en true si no hay CP
      regions.forEach(region => {
        const cpKey = `${region}_cp`;
        const spKey = `${region}_sp`;
        
        const cpValue = newFormData[cpKey];
        const spValue = newFormData[spKey];
        
        if (!cpValue && !spValue) {
          // Usando el tipo extendido que permite propiedades dinámicas
          newFormData[spKey] = true;
        }
      });

      // Lo mismo para ATM
      if (!newFormData.atm_cp && !newFormData.atm_sp) {
        newFormData.atm_sp = true;
      }

      setFormData(newFormData as IStomatognathicExamCreate);
      setActivo(initialData.activo ?? true);
    } else if (mode === "create") {
      // Reset para create - establecer SP en true para todas las regiones
      setFormData({
        paciente: "",
        examen_sin_patologia: false,
        atm_cp: false,
        atm_sp: true,
        atm_absceso: false,
        atm_fibroma: false,
        atm_herpes: false,
        atm_ulcera: false,
        atm_otra_patologia: false,
        atm_observacion: "",
        
        mejillas_cp: false,
        mejillas_sp: true,
        mejillas_absceso: false,
        mejillas_fibroma: false,
        mejillas_herpes: false,
        mejillas_ulcera: false,
        mejillas_otra_patologia: false,
        mejillas_descripcion: "",
        
        maxilar_inferior_cp: false,
        maxilar_inferior_sp: true,
        maxilar_inferior_absceso: false,
        maxilar_inferior_fibroma: false,
        maxilar_inferior_herpes: false,
        maxilar_inferior_ulcera: false,
        maxilar_inferior_otra_patologia: false,
        maxilar_inferior_descripcion: "",
        
        maxilar_superior_cp: false,
        maxilar_superior_sp: true,
        maxilar_superior_absceso: false,
        maxilar_superior_fibroma: false,
        maxilar_superior_herpes: false,
        maxilar_superior_ulcera: false,
        maxilar_superior_otra_patologia: false,
        maxilar_superior_descripcion: "",
        
        paladar_cp: false,
        paladar_sp: true,
        paladar_absceso: false,
        paladar_fibroma: false,
        paladar_herpes: false,
        paladar_ulcera: false,
        paladar_otra_patologia: false,
        paladar_descripcion: "",
        
        piso_boca_cp: false,
        piso_boca_sp: true,
        piso_boca_absceso: false,
        piso_boca_fibroma: false,
        piso_boca_herpes: false,
        piso_boca_ulcera: false,
        piso_boca_otra_patologia: false,
        piso_boca_descripcion: "",
        
        carrillos_cp: false,
        carrillos_sp: true,
        carrillos_absceso: false,
        carrillos_fibroma: false,
        carrillos_herpes: false,
        carrillos_ulcera: false,
        carrillos_otra_patologia: false,
        carrillos_descripcion: "",
        
        glandulas_salivales_cp: false,
        glandulas_salivales_sp: true,
        glandulas_salivales_absceso: false,
        glandulas_salivales_fibroma: false,
        glandulas_salivales_herpes: false,
        glandulas_salivales_ulcera: false,
        glandulas_salivales_otra_patologia: false,
        glandulas_salivales_descripcion: "",
        
        ganglios_cp: false,
        ganglios_sp: true,
        ganglios_absceso: false,
        ganglios_fibroma: false,
        ganglios_herpes: false,
        ganglios_ulcera: false,
        ganglios_otra_patologia: false,
        ganglios_descripcion: "",
        
        lengua_cp: false,
        lengua_sp: true,
        lengua_absceso: false,
        lengua_fibroma: false,
        lengua_herpes: false,
        lengua_ulcera: false,
        lengua_otra_patologia: false,
        lengua_descripcion: "",
        
        labios_cp: false,
        labios_sp: true,
        labios_absceso: false,
        labios_fibroma: false,
        labios_herpes: false,
        labios_ulcera: false,
        labios_otra_patologia: false,
        labios_descripcion: "",
      });
      setActivo(true);
    }
  }, [initialData, mode]);

  if (!isOpen) return null;

  const title =
    mode === "create" ? "Registrar Examen Estomatognático" : "Editar Examen Estomatognático";
  const subtitle =
    mode === "create"
      ? "Registra un nuevo examen estomatognático del paciente."
      : "Actualiza la información del examen estomatognático.";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar paciente
    const pacienteValue = formData.paciente;
    if (typeof pacienteValue !== 'string' || !pacienteValue.trim()) {
      newErrors.paciente = "El paciente es obligatorio.";
    }

    // ✅ SOLO validar regiones si NO está marcado "examen sin patología"
    if (!formData.examen_sin_patologia) {
      // Validar ATM
      const atmCP = formData.atm_cp === true;
      const atmSP = formData.atm_sp === true;
      
      if (atmCP === atmSP) {
        newErrors.atm_cp = "Debe seleccionar CP o SP para ATM";
      }

      // Si ATM tiene CP, validar que tenga observación
      if (atmCP && (!formData.atm_observacion || formData.atm_observacion.trim() === "")) {
        newErrors.atm_observacion = "Debe describir la observación para ATM";
      }

      // Validar cada región
      const regiones: RegionKey[] = [
        "mejillas", "maxilar_inferior", "maxilar_superior", "paladar",
        "piso_boca", "carrillos", "glandulas_salivales", "ganglios", "lengua", "labios"
      ];

      regiones.forEach(region => {
        const cpKey = `${region}_cp`;
        const spKey = `${region}_sp`;
        const descKey = `${region}_descripcion`;
        
        // Usar el tipo extendido para acceso seguro
        const formDataExtended = formData as StomatognathicExamCreateWithDynamic;
        
        const cp = formDataExtended[cpKey] === true;
        const sp = formDataExtended[spKey] === true;
        const desc = formDataExtended[descKey] as string | undefined;
        
        // Debe tener exactamente uno seleccionado
        if (cp === sp) {
          newErrors[cpKey] = `Debe seleccionar CP o SP para ${region.replace('_', ' ')}`;
        }
        
        // Si tiene CP marcado, requiere descripción
        if (cp && (!desc || desc.trim() === "")) {
          newErrors[descKey] = `Debe describir la patología para ${region.replace('_', ' ')}`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    field: keyof IStomatognathicExamCreate,
    value: string | boolean | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value ?? undefined }));

    // Limpiar error del campo
    if (errors[field as string]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field as string];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        notify?.("Examen estomatognático registrado exitosamente", "success");
      } else if (mode === "edit" && examId) {
        // Omitir el campo paciente para la actualización
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { paciente, ...updateDataWithoutPaciente } = formData;
        const updateData: IStomatognathicExamUpdate = {
          ...updateDataWithoutPaciente,
          activo,
        };
        
        await updateMutation.mutateAsync({ id: examId, data: updateData });
        notify?.("Examen estomatognático actualizado exitosamente", "success");
      }

      onExamSaved?.();
      onClose();
    } catch (error) {
      console.error("Error al guardar examen estomatognático:", error);
      notify?.(
        error instanceof Error
          ? error.message
          : "Error al guardar examen estomatognático",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <StomatognathicExamFormFields
          formData={formData}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
          activo={activo}
          onActivoChange={setActivo}
        />

        {/* Mostrar errores de validación */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
              Por favor corrija los siguientes errores:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field} className="text-sm text-red-700 dark:text-red-400">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : mode === "create" ? (
              "Registrar Examen"
            ) : (
              "Actualizar Examen"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}