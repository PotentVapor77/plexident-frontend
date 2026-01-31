// src/components/clinicalRecord/form/ClinicalRecordForm.tsx

import React, { useEffect, useState } from "react";
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
  ClinicalRecordDetailResponse,
  ClinicalRecordInitialData
} from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import { useNotification } from "../../../context/notifications/NotificationContext";
import type { IPaciente } from "../../../types/patient/IPatient";
import clinicalRecordService from "../../../services/clinicalRecord/clinicalRecordService";
import axiosInstance from "../../../services/api/axiosInstance";
import api from "../../../services/api/axiosInstance";
import { ENDPOINTS } from "../../../config/api";

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
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

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


  const refreshSection = async (section: string) => {
    if (!selectedPaciente?.id || mode !== "edit") return;

    try {
      const endpointMap: Record<string, string> = {
        antecedentes_personales: ENDPOINTS.clinicalRecords.antecedentesPersonales.latestByPaciente(selectedPaciente.id),
        antecedentes_familiares: ENDPOINTS.clinicalRecords.antecedentesFamiliares.latestByPaciente(selectedPaciente.id),
        constantes_vitales: ENDPOINTS.clinicalRecords.constantesVitales.latestByPaciente(selectedPaciente.id),
        examen_estomatognatico: ENDPOINTS.clinicalRecords.examenEstomatognatico.latestByPaciente(selectedPaciente.id),
        odontograma_2d: ENDPOINTS.clinicalRecords.odontograma2D.latestByPaciente(selectedPaciente.id),
        indicadores_salud_bucal: ENDPOINTS.clinicalRecords.indicadoresSaludBucal.latestByPaciente(selectedPaciente.id),
        indices_caries: ENDPOINTS.clinicalRecords.indicesCaries.latestByPaciente(selectedPaciente.id),
      };

      const endpoint = endpointMap[section];
      if (!endpoint) {
        notify({
          type: "warning",
          title: "Sección no soportada",
          message: `La sección ${section} no tiene datos actualizables automáticamente.`,
        });
        return;
      }

      const response = await api.get(endpoint);

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Actualizar el estado correspondiente
        switch (section) {
          case 'antecedentes_personales':
            updateSectionData('antecedentes_personales_data', data);
            setInitialDates(prev => ({
              ...prev,
              antecedentes_personales: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'antecedentes_familiares':
            updateSectionData('antecedentes_familiares_data', data);
            setInitialDates(prev => ({
              ...prev,
              antecedentes_familiares: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'constantes_vitales':
            updateSectionData('constantes_vitales_data', data);
            setInitialDates(prev => ({
              ...prev,
              constantes_vitales: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'examen_estomatognatico':
            updateSectionData('examen_estomatognatico_data', data);
            setInitialDates(prev => ({
              ...prev,
              examen_estomatognatico: data.fecha_creacion || new Date().toISOString(),
            }));
            break;
          case 'indicadores_salud_bucal':
            console.log('Actualizando indicadores de salud bucal:', data);
            updateSectionData('indicadores_salud_bucal_data', data);
            setInitialDates(prev => ({
              ...prev,
              indicadores_salud_bucal: data.fecha || data.fecha_creacion || new Date().toISOString(),
            }));
            break;
             case 'indices_caries': 
          updateSectionData('indices_caries_data', data);
          setInitialDates(prev => ({
            ...prev,
            indices_caries: data.fecha_evaluacion || data.fecha_creacion || new Date().toISOString(),
          }));
          break;
        }

        notify({
          type: "success",
          title: "Datos actualizados",
          message: `Se actualizaron los datos de ${getSectionName(section)}`,
        });
      }
    } catch (error) {
      console.error(`Error al refrescar ${section}:`, error);
      notify({
        type: "error",
        title: "Error al actualizar",
        message: `No se pudo actualizar la sección ${getSectionName(section)}`,
      });
    }
  };

  const getSectionName = (section: string): string => {
    const names: Record<string, string> = {
      antecedentes_personales: "Antecedentes Personales",
      antecedentes_familiares: "Antecedentes Familiares",
      constantes_vitales: "Constantes Vitales",
      examen_estomatognatico: "Examen Estomatognático",
      indicadores_salud_bucal: "Indicadores de Salud Bucal",
      indices_caries: "Índices de Caries",
    };
    return names[section] || section;
  };

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
  // CARGAR DATOS INICIALES EDIT
  // ========================================================================
  useEffect(() => {
    if (mode === "edit" && recordId) {
      setIsLoadingEdit(true);

      const fetchRecordData = async () => {
        try {
          console.log('=== CARGANDO DATOS PARA EDICIÓN ===');
          console.log('RecordId:', recordId);

          const response = await clinicalRecordService.getById(recordId);
          const detailData: ClinicalRecordDetailResponse = response;

          console.log('Detail data recibida:', detailData);

          // Configurar paciente desde paciente_info
          if (detailData.paciente_info) {
            console.log('Configurando paciente:', detailData.paciente_info);

            const pacienteCompatible: IPaciente = {
              id: detailData.paciente,
              nombres: detailData.paciente_info.nombres,
              apellidos: detailData.paciente_info.apellidos,
              cedula_pasaporte: detailData.paciente_info.cedula_pasaporte,
              sexo: detailData.paciente_info.sexo,
              edad: detailData.paciente_info.edad,
              fecha_nacimiento: detailData.paciente_info.fecha_nacimiento || '',
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
            updateField("paciente", detailData.paciente);
          }

          // Configurar odontólogo
          if (detailData.odontologo_responsable) {
            console.log('📌 Configurando odontólogo:', detailData.odontologo_info);

            updateField("odontologo_responsable", detailData.odontologo_responsable);

            if (detailData.odontologo_info) {
              const odontologoUser = {
                id: detailData.odontologo_responsable,
                nombres: detailData.odontologo_info.nombres,
                apellidos: detailData.odontologo_info.apellidos,
                rol: detailData.odontologo_info.rol,
              } as any;
              setSelectedOdontologo(odontologoUser);
            }
          }

          // Campos de texto
          console.log('📌 Cargando campos de texto');
          if (detailData.motivo_consulta) {
            updateField("motivo_consulta", detailData.motivo_consulta);
          }
          if (detailData.embarazada) {
            updateField("embarazada", detailData.embarazada);
          }
          if (detailData.enfermedad_actual) {
            updateField("enfermedad_actual", detailData.enfermedad_actual);
          }

          // CAMPOS INSTITUCIONALES
          console.log('Cargando campos institucionales:', {
            institucion_sistema: detailData.institucion_sistema,
            unicodigo: detailData.unicodigo,
            establecimiento_salud: detailData.establecimiento_salud,
            numero_hoja: detailData.numero_hoja,
            numero_historia_clinica_unica: detailData.numero_historia_clinica_unica,
            numero_archivo: detailData.numero_archivo,
          });

          updateField("institucion_sistema", detailData.institucion_sistema || "SISTEMA NACIONAL DE SALUD");
          updateField("unicodigo", detailData.unicodigo || "");
          updateField("establecimiento_salud", detailData.establecimiento_salud || "");
          updateField("numero_hoja", detailData.numero_hoja || 1);
          updateField("numero_historia_clinica_unica", detailData.numero_historia_clinica_unica || "");
          updateField("numero_archivo", detailData.numero_archivo || "");

          // Cargar datos de constantes vitales
          if (detailData.constantes_vitales_data) {
            console.log('Cargando constantes vitales:', detailData.constantes_vitales_data);
            updateSectionData("constantes_vitales_data", detailData.constantes_vitales_data);

            setInitialDates(prev => ({
              ...prev,
              constantes_vitales: detailData.constantes_vitales_data?.fecha_creacion || null,
            }));
          }

          // CARGAR INDICADORES DE SALUD BUCAL
          if (detailData.indicadores_salud_bucal_data) {
            console.log('Cargando indicadores de salud bucal:', detailData.indicadores_salud_bucal_data);
            updateSectionData("indicadores_salud_bucal_data", detailData.indicadores_salud_bucal_data);

            setInitialDates(prev => ({
              ...prev,
              indicadores_salud_bucal: detailData.indicadores_salud_bucal_data?.fecha || null,
            }));
          }

          if (detailData.indices_caries_data) {
  console.log(' Cargando índices de caries:', detailData.indices_caries_data);
  updateSectionData("indices_caries_data", detailData.indices_caries_data);
  
  setInitialDates(prev => ({
    ...prev,
    indices_caries: detailData.indices_caries_data?.fecha || null,
  }));
}

          // Cargar otras secciones
          if (detailData.antecedentes_personales_data) {
            console.log('📌 Cargando antecedentes personales');
            updateSectionData("antecedentes_personales_data", detailData.antecedentes_personales_data);

            setInitialDates(prev => ({
              ...prev,
              antecedentes_personales: detailData.antecedentes_personales_data?.fecha_creacion || null,
            }));
          }

          if (detailData.antecedentes_familiares_data) {
            console.log(' Cargando antecedentes familiares')
            updateSectionData("antecedentes_familiares_data", detailData.antecedentes_familiares_data);

            setInitialDates(prev => ({
              ...prev,
              antecedentes_familiares: detailData.antecedentes_familiares_data?.fecha_creacion || null,
            }));
          }

          if (detailData.examen_estomatognatico_data) {
            console.log(' Cargando examen estomatognático');
            updateSectionData("examen_estomatognatico_data", detailData.examen_estomatognatico_data);

            setInitialDates(prev => ({
              ...prev,
              examen_estomatognatico: detailData.examen_estomatognatico_data?.fecha_creacion || null,
            }));
          }
          console.log(' Cargando estado y observaciones:', {
            estado: detailData.estado,
            observaciones: detailData.observaciones
          });
          updateField("estado", detailData.estado);
          if (detailData.observaciones) {
            updateField("observaciones", detailData.observaciones);
          }

          // Guardar fechas principales
          setInitialDates(prev => ({
            ...prev,
            motivo_consulta: detailData.fecha_atencion || null,
            enfermedad_actual: detailData.fecha_atencion || null,
          }));

          console.log(' === DATOS CARGADOS EXITOSAMENTE ===');

        } catch (error) {
          console.error(' Error cargando historial para edición:', error);
          notify({
            type: "error",
            title: "Error",
            message: "No se pudieron cargar los datos del historial",
          });
        } finally {
          setIsLoadingEdit(false);
        }
      };

      fetchRecordData();
    }
  }, [mode, recordId]);

  // ========================================================================
  // CARGAR DATOS INICIALES PARA MODO CREATE
  // ========================================================================
  useEffect(() => {
    if (mode === "create" && initialData) {
      console.log('=== INITIAL DATA RECIBIDA (CREATE) ===');
      console.log('initialData completa:', initialData);
      console.log('indicadores_salud_bucal:', initialData.indicadores_salud_bucal);
      console.log('================================');

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

      if (initialData.indicadores_salud_bucal?.data) {
        updateSectionData(
          "indicadores_salud_bucal_data",
          initialData.indicadores_salud_bucal.data
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
        indicadores_salud_bucal: initialData.indicadores_salud_bucal?.fecha ?? null
      });
    }
  }, [initialData, user, mode]);
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
        refreshSections={refreshSection}
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
