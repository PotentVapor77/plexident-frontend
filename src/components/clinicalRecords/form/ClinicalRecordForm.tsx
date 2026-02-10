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
  ClinicalRecordInitialData,
  SesionTratamientoData,
  SincronizarDiagnosticosPayload,
} from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import { useNotification } from "../../../context/notifications/NotificationContext";
import type { IPaciente } from "../../../types/patient/IPatient";
import clinicalRecordService from "../../../services/clinicalRecord/clinicalRecordService";
import axiosInstance from "../../../services/api/axiosInstance";
import api from "../../../services/api/axiosInstance";
import { ENDPOINTS } from "../../../config/api";
import { useSyncDiagnosticosCIEInRecord } from "../../../hooks/clinicalRecord/useDiagnosticosCIE";

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
  const [isSavingDiagnosticos, setIsSavingDiagnosticos] = useState(false);
  const [odontogramaData, setOdontogramaData] = useState<any>(null);
  const [hasRefreshedOdontograma, setHasRefreshedOdontograma] = useState(false);

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

  // Hook para sincronizar diagnósticos (modo editar)
  const syncDiagnosticosMutation = useSyncDiagnosticosCIEInRecord(recordId!);

  const refreshSection = async (section: string) => {
    if (!selectedPaciente?.id) return;

    try {
      const endpointMap: Record<string, string> = {
        antecedentes_personales: ENDPOINTS.clinicalRecords.antecedentesPersonales.latestByPaciente(selectedPaciente.id),
        antecedentes_familiares: ENDPOINTS.clinicalRecords.antecedentesFamiliares.latestByPaciente(selectedPaciente.id),
        constantes_vitales: ENDPOINTS.clinicalRecords.constantesVitales.latestByPaciente(selectedPaciente.id),
        examen_estomatognatico: ENDPOINTS.clinicalRecords.examenEstomatognatico.latestByPaciente(selectedPaciente.id),
        odontograma_2d: ENDPOINTS.clinicalRecords.odontograma2D.latestByPaciente(selectedPaciente.id),
        indicadores_salud_bucal: ENDPOINTS.clinicalRecords.indicadoresSaludBucal.latestByPaciente(selectedPaciente.id),
        indices_caries: ENDPOINTS.clinicalRecords.indicesCaries.latestByPaciente(selectedPaciente.id),
        diagnosticos_cie: ENDPOINTS.clinicalRecords.diagnosticosCIE.getAvailable(selectedPaciente.id, 'nuevos'),
        plan_tratamiento: '',
        examenes_complementarios: ENDPOINTS.clinicalRecords.examenesComplementarios.latestByPaciente(selectedPaciente.id),
      };
      if (section === 'plan_tratamiento') {
        if (!recordId) {
          notify({
            type: "warning",
            title: "Historial requerido",
            message: "Debe guardar el historial primero para actualizar el plan de tratamiento.",
          });
          return;
        }

        try {
          console.log('Refrescando plan de tratamiento...');

          const planActualizado = await clinicalRecordService.getPlanTratamientoByHistorial(recordId);

          if (planActualizado) {
            console.log('Plan encontrado:', planActualizado);

            // Actualizar todos los campos del plan
            updateField('plan_tratamiento_id', planActualizado.id);
            updateField('plan_tratamiento_titulo', planActualizado.titulo || '');
            updateField('plan_tratamiento_descripcion', planActualizado.descripcion || '');
            updateField('plan_tratamiento_odontograma_id', planActualizado.version_odontograma || null);

            // Obtener sesiones actualizadas
            try {
              const sesionesActualizadas = await clinicalRecordService.getSesionesByHistorial(recordId);
              updateField('plan_tratamiento_sesiones', sesionesActualizadas || []);
              console.log('Sesiones actualizadas:', sesionesActualizadas?.length || 0);
            } catch (sesionesError) {
              console.warn('Error cargando sesiones:', sesionesError);
              updateField('plan_tratamiento_sesiones', planActualizado.sesiones || []);
            }

            setInitialDates(prev => ({
              ...prev,
              plan_tratamiento: planActualizado.fecha_creacion || new Date().toISOString(),
            }));

            notify({
              type: "success",
              title: "Plan actualizado",
              message: `Plan "${planActualizado.titulo}" actualizado correctamente`,
            });
          } else {
            console.log('No hay plan asociado al historial');

            updateField('plan_tratamiento_id', null);
            updateField('plan_tratamiento_titulo', '');
            updateField('plan_tratamiento_descripcion', '');
            updateField('plan_tratamiento_sesiones', []);
            updateField('plan_tratamiento_odontograma_id', null);

            notify({
              type: "info",
              title: "Sin plan",
              message: "No hay plan de tratamiento asociado a este historial",
            });
          }
        } catch (error) {
          console.error('Error refrescando plan:', error);
          notify({
            type: "error",
            title: "Error",
            message: "No se pudo actualizar el plan de tratamiento",
          });
        }
        return; // Salir temprano para plan_tratamiento
      }
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
            if (data.id) {
              updateField('antecedentes_familiares_id', data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              antecedentes_familiares: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'constantes_vitales':
            updateSectionData('constantes_vitales_data', data);
            if (data.id) {
              updateField('constantes_vitales_id', data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              constantes_vitales: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'examen_estomatognatico':
            updateSectionData('examen_estomatognatico_data', data);
            if (data.id) {
              updateField('examen_estomatognatico_id', data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              examen_estomatognatico: data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'indicadores_salud_bucal':
            console.log('Actualizando indicadores de salud bucal:', data);
            updateSectionData('indicadores_salud_bucal_data', data);
            if (data.id) {
              updateField('indicadores_salud_bucal_id', data.id);
              console.log(' ID de indicadores actualizado:', data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              indicadores_salud_bucal: data.fecha || data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'indices_caries':
            updateSectionData('indices_caries_data', data);
            if (data.id) {
              updateField('indices_caries_id', data.id);
              console.log(' ID de índices actualizado:', data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              indices_caries: data.fecha_evaluacion || data.fecha_creacion || new Date().toISOString(),
            }));
            break;

          case 'odontograma_2d':
            setOdontogramaData(data);
            setHasRefreshedOdontograma(true);
            setInitialDates(prev => ({
              ...prev,
              odontograma_2d: data.fecha_captura || data.fecha_creacion || new Date().toISOString(),
            }));
            console.log('Odontograma refrescado localmente:', data);
            break;

          case "diagnosticos_cie":
            const diagnosticosData = data;
            if (diagnosticosData.diagnosticos) {
              updateSectionData("diagnosticos_cie_data", diagnosticosData);
              setInitialDates(prev => ({
                ...prev,
                diagnosticos_cie: new Date().toISOString(),
              }));
            }
            break;

          case "examenes_complementarios":
            updateSectionData("examenes_complementarios_data", data);
            if (data.id) {
              updateField("examenes_complementarios_id", data.id);
            }
            setInitialDates(prev => ({
              ...prev,
              examenes_complementarios: data.fecha_creacion || new Date().toISOString(),
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
      diagnosticos_cie: "Diagnósticos CIE-10",
      odontograma_2d: "Odontograma 2D",
      plan_tratamiento: "Plan de Tratamiento",
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
  const isSubmitting = createMutation.isPending || updateMutation.isPending || syncDiagnosticosMutation.isPending || isSavingDiagnosticos;

  // ========================================================================
  // CARGAR DATOS INICIALES EDIT
  // ========================================================================
  useEffect(() => {
    if (mode === "edit" && recordId) {
      const fetchRecordData = async () => {
        try {
          console.log('=== CARGANDO DATOS PARA EDICIÓN ===');
          console.log('RecordId:', recordId);

          const response = await clinicalRecordService.getById(recordId);
          const detailData: ClinicalRecordDetailResponse = response;

          console.log('=== DETAIL DATA COMPLETA ===');
          console.log('Datos del plan de tratamiento en la respuesta:', {
            plan_tratamiento: detailData.plan_tratamiento,
            plan_tratamiento_data: detailData.plan_tratamiento_data,
            plan_tratamiento_sesiones: detailData.plan_tratamiento_sesiones,
            plan_tratamiento_titulo: detailData.plan_tratamiento_titulo,
            plan_tratamiento_descripcion: detailData.plan_tratamiento_descripcion,
            plan_tratamiento_id: detailData.plan_tratamiento_id,
          });
          let sesionesPlan: SesionTratamientoData[] = [];
          // Configurar paciente desde paciente_info
          if (detailData.paciente_info) {
            console.log('Configurando paciente:', detailData.paciente_info);
            try {
              console.log('Obteniendo sesiones del plan de tratamiento...');
              const sesionesResponse = await clinicalRecordService.getSesionesByHistorial(recordId);
              sesionesPlan = Array.isArray(sesionesResponse) ? sesionesResponse : [];
              console.log('Sesiones obtenidas del endpoint:', sesionesPlan.length);
            } catch (sesionesError) {
              console.warn('No se pudieron obtener las sesiones:', sesionesError);

              // Si falla, intentar obtener del plan de tratamiento
              if (detailData.plan_tratamiento_data?.sesiones) {
                sesionesPlan = detailData.plan_tratamiento_data.sesiones;
              } else if (detailData.plan_tratamiento_sesiones) {
                sesionesPlan = detailData.plan_tratamiento_sesiones;
              }
            }














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
if (detailData.examenes_complementarios_data) {
  console.log('📌 Cargando exámenes complementarios:', detailData.examenes_complementarios_data);
  updateSectionData("examenes_complementarios_data", detailData.examenes_complementarios_data);
  if (detailData.examenes_complementarios_data.id) {
    updateField("examenes_complementarios_id", detailData.examenes_complementarios_data.id);
  }
  setInitialDates(prev => ({
    ...prev,
    examenes_complementarios: detailData.examenes_complementarios_data?.fecha_creacion || null,
  }));
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

          // ============================================
          // CARGAR DATOS DEL PLAN DE TRATAMIENTO
          // ============================================
          const cargarDatosPlanTratamiento = () => {
            // Intentar múltiples fuentes posibles
            const planDataSource = detailData.plan_tratamiento_data || detailData.plan_tratamiento;

            if (planDataSource) {
              console.log('🎯 Cargando datos del plan de tratamiento desde:', {
                source: detailData.plan_tratamiento_data ? 'plan_tratamiento_data' : 'plan_tratamiento',
                data: planDataSource
              });

              // Usar el ID del plan
              updateField("plan_tratamiento_id", planDataSource.id);

              // Cargar título y descripción
              updateField("plan_tratamiento_titulo",
                planDataSource.titulo ||
                detailData.plan_tratamiento_titulo ||
                "Plan de Tratamiento"
              );
              updateField("plan_tratamiento_descripcion",
                planDataSource.descripcion ||
                detailData.plan_tratamiento_descripcion ||
                ""
              );

              // Cargar sesiones obtenidas
              console.log('Cargando sesiones en el formulario:', sesionesPlan.length);
              updateField("plan_tratamiento_sesiones", sesionesPlan);

              // Cargar odontograma (verificar múltiples nombres de campo)
              const odontogramaId =
                planDataSource.version_odontograma ||
                detailData.version_odontograma ||
                null;

              if (odontogramaId) {
                console.log('Cargando version_odontograma:', odontogramaId);
                updateField("plan_tratamiento_odontograma_id", odontogramaId);
              } else {
                console.log('No hay odontograma asociado');
                updateField("plan_tratamiento_odontograma_id", null);
              }
            } else {
              console.log('No hay datos de plan de tratamiento en la respuesta');
              // Asegurar que los campos estén limpios
              updateField("plan_tratamiento_id", null);
              updateField("plan_tratamiento_titulo", "");
              updateField("plan_tratamiento_descripcion", "");
              updateField("plan_tratamiento_sesiones", []);
              updateField("plan_tratamiento_odontograma_id", null);
            }
          };

          // Llamar a la función para cargar el plan
          cargarDatosPlanTratamiento();

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
            console.log('Cargando índices de caries:', detailData.indices_caries_data);
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
            console.log('Cargando antecedentes familiares')
            updateSectionData("antecedentes_familiares_data", detailData.antecedentes_familiares_data);
            setInitialDates(prev => ({
              ...prev,
              antecedentes_familiares: detailData.antecedentes_familiares_data?.fecha_creacion || null,
            }));
          }

          if (detailData.examen_estomatognatico_data) {
            console.log('Cargando examen estomatognático');
            updateSectionData("examen_estomatognatico_data", detailData.examen_estomatognatico_data);
            setInitialDates(prev => ({
              ...prev,
              examen_estomatognatico: detailData.examen_estomatognatico_data?.fecha_modificacion || null,
            }));
          }

          // Cargar diagnósticos CIE
          if (detailData.diagnosticos_cie_data) {
            console.log('Cargando diagnósticos CIE desde detailData:', detailData.diagnosticos_cie_data);
            updateSectionData("diagnosticos_cie_data", detailData.diagnosticos_cie_data);
          }

          // CARGAR ODONTOGRAMA (FORM033) - usando el endpoint específico
          try {
            console.log('Obteniendo odontograma del historial...');
            const form033Response = await clinicalRecordService.getForm033(recordId);
            if (form033Response && form033Response.datos_form033) {
              console.log('Odontograma cargado:', form033Response);
              setOdontogramaData(form033Response.datos_form033);
              setInitialDates(prev => ({
                ...prev,
                odontograma_2d: form033Response.fecha_captura || form033Response.fecha_creacion || null,
              }));
            }
          } catch (form033Error) {
            console.warn('No se pudo cargar el odontograma inicial:', form033Error);
          }

          updateField("estado", detailData.estado);
          if (detailData.observaciones) {
            updateField("observaciones", detailData.observaciones);
          }

          if (detailData.diagnosticos_cie) {
            updateField("diagnosticos_cie_id", detailData.diagnosticos_cie);
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

      if (initialData.diagnosticos_cie?.data) {
        updateSectionData("diagnosticos_cie_data", initialData.diagnosticos_cie.data);
      }

      if (initialData.plan_tratamiento) {
        console.log('📌 Cargando datos iniciales del plan de tratamiento (CREATE):', initialData.plan_tratamiento);

        const planData = initialData.plan_tratamiento;
        if (planData.id) {
          updateField("plan_tratamiento_id", planData.id);
        }
        if (planData.titulo) {
          updateField("plan_tratamiento_titulo", planData.titulo);
        }
        if (planData.descripcion) {
          updateField("plan_tratamiento_descripcion", planData.descripcion);
        }
        if (planData.sesiones) {
          const sesiones = Array.isArray(planData.sesiones) ? planData.sesiones : [];
          updateField("plan_tratamiento_sesiones", sesiones);
        }
        if (planData.version_odontograma) {
          updateField("plan_tratamiento_odontograma_id", planData.version_odontograma);
        }
      }

      // Guardar fechas de referencia
      setInitialDates({
        motivo_consulta: initialData.motivo_consulta_fecha,
        enfermedad_actual: initialData.enfermedad_actual_fecha,
        antecedentes_personales: initialData.antecedentes_personales?.fecha ?? null,
        antecedentes_familiares: initialData.antecedentes_familiares?.fecha ?? null,
        constantes_vitales: initialData.constantes_vitales?.fecha ?? null,
        examen_estomatognatico: initialData.examen_estomatognatico?.fecha ?? null,
        indicadores_salud_bucal: initialData.indicadores_salud_bucal?.fecha ?? null,
        diagnosticos_cie: initialData.diagnosticos_cie?.fecha ?? null,
      });
    }
  }, [initialData, user, mode]);

  // ========================================================================
  // SUBMIT HANDLER - CON ODONTOGRAMA INCLUIDO
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Mostrar todos los datos del plan antes de enviar
    console.log('[SUBMIT] Datos del plan a enviar:', {
      plan_tratamiento_id: formData.plan_tratamiento_id,
      plan_tratamiento_titulo: formData.plan_tratamiento_titulo,
      plan_tratamiento_descripcion: formData.plan_tratamiento_descripcion,
      plan_tratamiento_sesiones: formData.plan_tratamiento_sesiones?.length || 0,
      plan_tratamiento_odontograma_id: formData.plan_tratamiento_odontograma_id,
    });

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
        plan_tratamiento_id: formData.plan_tratamiento_id || undefined,
        plan_tratamiento_titulo: formData.plan_tratamiento_titulo || undefined,
        plan_tratamiento_descripcion: formData.plan_tratamiento_descripcion || undefined,
        plan_tratamiento_sesiones: formData.plan_tratamiento_sesiones || undefined,
        plan_tratamiento_odontograma_id: formData.plan_tratamiento_odontograma_id || undefined,
        plan_tratamiento: formData.plan_tratamiento_id || undefined,
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
        // GUARDAR FORM033 (ODONTOGRAMA) DESDE EL ENDPOINT ACTUAL
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

              // Guardar el Form033 en el historial usando el endpoint
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
          }
        }

        // ============================================
        // GUARDAR DIAGNÓSTICOS CIE (si existen)
        // ============================================
        if (
          formData.diagnosticos_cie_data &&
          formData.diagnosticos_cie_data.diagnosticos &&
          formData.diagnosticos_cie_data.diagnosticos.length > 0
        ) {
          try {
            setIsSavingDiagnosticos(true);
            console.log("Guardando diagnósticos CIE en historial recién creado...");

            const diagnosticosPayload = {
              diagnosticos_finales: formData.diagnosticos_cie_data.diagnosticos.map((diag) => ({
                diagnostico_dental_id: diag.diagnostico_dental_id,
                tipo_cie: diag.tipo_cie || "PRE",
              })),
              tipo_carga: formData.diagnosticos_cie_data.tipo_carga || "nuevos",
            };

            const diagnosticosResult = await clinicalRecordService.syncDiagnosticsInRecord(
              historialCreado.id,
              diagnosticosPayload
            );

            console.log("Diagnósticos CIE guardados:", diagnosticosResult);
          } catch (diagnosticosError) {
            console.warn(
              "Error guardando diagnósticos CIE (historial creado correctamente):",
              diagnosticosError
            );
            notify({
              type: "warning",
              title: "Diagnósticos no guardados",
              message:
                "El historial se creó correctamente, pero algunos diagnósticos CIE no se pudieron guardar.",
            });
          } finally {
            setIsSavingDiagnosticos(false);
          }
        }

        notify({
          type: "success",
          title: "Historial creado",
          message: "El historial clínico se ha creado exitosamente.",
        });

      } else if (mode === "edit" && recordId) {
        // ============================================
        // ACTUALIZAR HISTORIAL
        // ============================================
        console.log('[EDIT] Preparando payload de actualización...');
        console.log('[EDIT] FormData actual:', {
          examen_estomatognatico_id: formData.examen_estomatognatico_id,
          indicadores_salud_bucal_id: formData.indicadores_salud_bucal_id,
          indices_caries_id: formData.indices_caries_id,
          plan_tratamiento_id: formData.plan_tratamiento_id,
        });
        const updatePayload = {
          motivo_consulta: formData.motivo_consulta,
          embarazada: formData.embarazada || undefined,
          enfermedad_actual: formData.enfermedad_actual || undefined,
          observaciones: formData.observaciones || undefined,
          estado: formData.estado || undefined,
          plan_tratamiento_id: formData.plan_tratamiento_id || undefined,
          plan_tratamiento_titulo: formData.plan_tratamiento_titulo || undefined,
          plan_tratamiento_descripcion: formData.plan_tratamiento_descripcion || undefined,
          plan_tratamiento_sesiones: formData.plan_tratamiento_sesiones || undefined,
          plan_tratamiento_odontograma_id: formData.plan_tratamiento_odontograma_id || undefined,
          examen_estomatognatico: formData.examen_estomatognatico_id || undefined,
          indicadores_salud_bucal: formData.indicadores_salud_bucal_id || undefined,
          indices_caries: formData.indices_caries_id || undefined,
          plan_tratamiento: formData.plan_tratamiento_id || undefined,
        };

        // ==========================================================================
        // AGREGAR CONSTANTES VITALES SI SE MODIFICARON
        // ==========================================================================
        if (formData.constantes_vitales_data) {
          const constantesVitales = formData.constantes_vitales_data as any;
          Object.assign(updatePayload, {
            temperatura: constantesVitales.temperatura || undefined,
            pulso: constantesVitales.pulso || undefined,
            frecuencia_respiratoria: constantesVitales.frecuencia_respiratoria || undefined,
            presion_arterial: constantesVitales.presion_arterial || undefined,
          });
        }
        console.log('[EDIT] Payload completo a enviar:', updatePayload);
        await updateMutation.mutateAsync(updatePayload);
        console.log('[EDIT] Historial actualizado exitosamente');
        // ============================================
        // GUARDAR ODONTOGRAMA ACTUALIZADO (si se refrescó)
        // ============================================
        if (hasRefreshedOdontograma && odontogramaData && recordId) {
          try {
            console.log("Guardando odontograma refrescado...");

            // Obtener el odontograma más reciente del paciente
            const form033Response = await axiosInstance.get<any>(
              `/odontogram/export/form033/${selectedPaciente?.id}/json/`
            );

            if (form033Response.data.success && form033Response.data.data) {
              // Usar el endpoint agregar-form033 para guardar/actualizar
              await clinicalRecordService.addForm033(
                recordId,
                form033Response.data.data.form033,
                "Odontograma actualizado al guardar el historial clínico"
              );

              console.log("Odontograma actualizado exitosamente");
              setHasRefreshedOdontograma(false); // Resetear flag
            }
          } catch (odontogramaError) {
            console.warn("Error guardando odontograma actualizado:", odontogramaError);
          }
        }
        if (formData.diagnosticos_cie_data?.diagnosticos && formData.diagnosticos_cie_data.diagnosticos.length > 0) {
          try {
            setIsSavingDiagnosticos(true);
            console.log("[MODO EDIT] Guardando diagnósticos CIE...");

            // Preparar el payload exactamente como lo espera el backend
            const diagnosticosPayload: SincronizarDiagnosticosPayload = {
              diagnosticos_finales: formData.diagnosticos_cie_data.diagnosticos.map((diag: any) => ({
                diagnostico_dental_id: diag.diagnostico_dental_id,
                tipo_cie: diag.tipo_cie || "PRE",
              })),
              tipo_carga: formData.diagnosticos_cie_data.tipo_carga || "todos",
            };

            console.log(" Payload para sincronizar:", {
              historialId: recordId,
              cantidad: diagnosticosPayload.diagnosticos_finales.length,
              tipo_carga: diagnosticosPayload.tipo_carga,
              primeros: diagnosticosPayload.diagnosticos_finales.slice(0, 3),
            });

            // Usar el hook de sincronización
            const resultado = await syncDiagnosticosMutation.mutateAsync(diagnosticosPayload);

            console.log(" Resultado de sincronización:", resultado);

            if (resultado.success) {
              console.log(` Diagnósticos sincronizados exitosamente: ${resultado.total_diagnosticos}`);
            } else {
              console.warn(" La sincronización reportó problemas:", resultado.message);
            }
          } catch (diagnosticosError: any) {
            console.error(" Error guardando diagnósticos CIE:", {
              error: diagnosticosError.message,
              response: diagnosticosError.response?.data,
            });

            notify({
              type: "error",
              title: "Error en diagnósticos",
              message: `No se pudieron guardar los cambios en los diagnósticos CIE-10: ${diagnosticosError.message}`,
            });

          } finally {
            setIsSavingDiagnosticos(false);
          }
        } else {
          console.log("No hay diagnósticos CIE para guardar en este historial");
        }


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
    } finally {
      setIsSavingDiagnosticos(false);
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