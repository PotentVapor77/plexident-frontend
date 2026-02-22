// src/components/vitalSigns/VitalSignsMain.tsx - CÓDIGO COMPLETO CON UI UNIFICADA

import { useState } from "react";
import { VitalSignsTable } from "./table/VitalSignsTable";
import { VitalSignsViewModal } from "./modals/VitalSignsViewModal";
import { VitalSignsDeleteModal } from "./modals/VitalSignsDeleteModal";
import { VitalSignsCreateEditModal } from "./modals/VitalSignsCreateEditModal";

import type { IVitalSigns } from "../../../types/vitalSigns/IVitalSigns";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useVitalSigns } from "../../../hooks/vitalSigns/useVitalSigns";
import { usePacienteActivo } from "../../../context/PacienteContext";
import type { IPaciente } from "../../../types/patient/IPatient";

// Importar Exámenes Estomatognáticos
import { StomatognathicExamTable } from "../stomatognathicExam/table/StomatognathicExamTable";
import { StomatognathicExamViewModal } from "../stomatognathicExam/modals/StomatognathicExamViewModal";
import { StomatognathicExamCreateEditModal } from "../stomatognathicExam/modals/StomatognathicExamCreateEditModal";
import { StomatognathicExamDeleteModal } from "../stomatognathicExam/modals/StomatognathicExamDeleteModal";
import type { IStomatognathicExam } from "../../../types/stomatognathicExam/IStomatognathicExam";
import { useStomatognathicExams } from "../../../hooks/stomatognathicExam/useStomatognathicExam";

// ✅ Importar Exámenes Complementarios
import { ComplementaryExamTable } from "../complementaryExam/table/ComplementaryExamTable";
import { ComplementaryExamViewModal } from "../complementaryExam/modals/ComplementaryExamViewModal";
import { ComplementaryExamCreateEditModal } from "../complementaryExam/modals/ComplementaryExamCreateEditModal";
import { ComplementaryExamDeleteModal } from "../complementaryExam/modals/ComplementaryExamDeleteModal";
import type { IComplementaryExam } from "../../../types/complementaryExam/IComplementaryExam";
import { useDeleteComplementaryExam } from "../../../hooks/complementaryExam/useComplementaryExam";

// Importar componentes de Antecedentes
import { BackgroundsCreateEditModal } from "../backgrounds/modals/BackgroundsCreateEditModal";
import { BackgroundsViewModal } from "../backgrounds/modals/BackgroundsViewModal";
import { BackgroundsDeleteModal } from "../backgrounds/modals/BackgroundsDeleteModal";
import type { IAntecedenteCombinado } from "../../../hooks/backgrounds/useBackgrounds";
import {
  useRemoveAntecedentePersonal,
  useRemoveAntecedenteFamiliar,
  useAntecedentes,
} from "../../../hooks/backgrounds/useBackgrounds";
import type {
  IAntecedentePersonal,
  IAntecedenteFamiliar,
} from "../../../types/backgrounds/IBackground";
import { BackgroundsTable } from "../backgrounds/table/BackgroundsTable";

// Iconos para unificación
import { 
  FileText, 
  Activity, 
  Heart, 
  Thermometer,
  User,
  AlertCircle,
  Plus,
  Clipboard,
  Stethoscope,
  Microscope,
  ChevronRight
} from "lucide-react";

// ✅ Definir tipos de pestañas (agregamos complementarios)
type TabType = "signos-vitales" | "estomatognatico" | "antecedentes" | "complementarios";

export default function VitalSignsMain() {
  const { notify } = useNotification();
  const { removeVitalSign } = useVitalSigns();
  const { removeExam } = useStomatognathicExams();
  const removeAntecedentePersonal = useRemoveAntecedentePersonal();
  const removeAntecedenteFamiliar = useRemoveAntecedenteFamiliar();
  const deleteComplementaryExamMutation = useDeleteComplementaryExam(); // ✅ Hook para eliminar
  const { pacienteActivo } = usePacienteActivo();

  const [activeTab, setActiveTab] = useState<TabType>("signos-vitales");

  // ✅ Estados para Exámenes Complementarios
  const [complementaryExamToView, setComplementaryExamToView] = useState<IComplementaryExam | null>(null);
  const [complementaryExamToEdit, setComplementaryExamToEdit] = useState<IComplementaryExam | null>(null);
  const [complementaryExamToDelete, setComplementaryExamToDelete] = useState<IComplementaryExam | null>(null);

  // Estados para Antecedentes
  const [backgroundToView, setBackgroundToView] = useState<IAntecedenteCombinado | null>(null);
  const [backgroundToEdit, setBackgroundToEdit] = useState<IAntecedenteCombinado | null>(null);
  const [backgroundToDelete, setBackgroundToDelete] = useState<IAntecedenteCombinado | null>(null);

  // Estados para exámenes estomatognáticos
  const [examToView, setExamToView] = useState<IStomatognathicExam | null>(null);
  const [examToEdit, setExamToEdit] = useState<IStomatognathicExam | null>(null);
  const [examToDelete, setExamToDelete] = useState<IStomatognathicExam | null>(null);

  // Estados para signos vitales
  const [vitalToView, setVitalToView] = useState<IVitalSigns | null>(null);
  const [vitalToEdit, setVitalToEdit] = useState<IVitalSigns | null>(null);
  const [vitalToDelete, setVitalToDelete] = useState<IVitalSigns | null>(null);

  // Obtener TODOS los antecedentes cuando no hay paciente fijado
  const { antecedentes: allAntecedentes } = useAntecedentes({
    ...(pacienteActivo?.id ? { paciente: pacienteActivo.id } : {}),
    page: 1,
    page_size: 100,
  });

  // ✅ Modales para Exámenes Complementarios
  const {
    isOpen: isComplementaryExamViewModalOpen,
    openModal: openComplementaryExamViewModal,
    closeModal: closeComplementaryExamViewModal,
  } = useModal();

  const {
    isOpen: isComplementaryExamCreateModalOpen,
    openModal: openComplementaryExamCreateModal,
    closeModal: closeComplementaryExamCreateModal,
  } = useModal();

  const {
    isOpen: isComplementaryExamEditModalOpen,
    openModal: openComplementaryExamEditModal,
    closeModal: closeComplementaryExamEditModal,
  } = useModal();

  const {
    isOpen: isComplementaryExamDeleteModalOpen,
    openModal: openComplementaryExamDeleteModal,
    closeModal: closeComplementaryExamDeleteModal,
  } = useModal();

  // Modales para Antecedentes
  const {
    isOpen: isBackgroundViewModalOpen,
    openModal: openBackgroundViewModal,
    closeModal: closeBackgroundViewModal,
  } = useModal();

  const {
    isOpen: isBackgroundCreateModalOpen,
    openModal: openBackgroundCreateModal,
    closeModal: closeBackgroundCreateModal,
  } = useModal();

  const {
    isOpen: isBackgroundEditModalOpen,
    openModal: openBackgroundEditModal,
    closeModal: closeBackgroundEditModal,
  } = useModal();

  const {
    isOpen: isBackgroundDeleteModalOpen,
    openModal: openBackgroundDeleteModal,
    closeModal: closeBackgroundDeleteModal,
  } = useModal();

  // Modales para exámenes estomatognáticos
  const {
    isOpen: isExamViewModalOpen,
    openModal: openExamViewModal,
    closeModal: closeExamViewModal,
  } = useModal();

  const {
    isOpen: isExamCreateModalOpen,
    openModal: openExamCreateModal,
    closeModal: closeExamCreateModal,
  } = useModal();

  const {
    isOpen: isExamEditModalOpen,
    openModal: openExamEditModal,
    closeModal: closeExamEditModal,
  } = useModal();

  const {
    isOpen: isExamDeleteModalOpen,
    openModal: openExamDeleteModal,
    closeModal: closeExamDeleteModal,
  } = useModal();

  // Modales para signos vitales
  const {
    isOpen: isVitalViewModalOpen,
    openModal: openVitalViewModal,
    closeModal: closeVitalViewModal,
  } = useModal();

  const {
    isOpen: isVitalCreateModalOpen,
    openModal: openVitalCreateModal,
    closeModal: closeVitalCreateModal,
  } = useModal();

  const {
    isOpen: isVitalEditModalOpen,
    openModal: openVitalEditModal,
    closeModal: closeVitalEditModal,
  } = useModal();

  const {
    isOpen: isVitalDeleteModalOpen,
    openModal: openVitalDeleteModal,
    closeModal: closeVitalDeleteModal,
  } = useModal();

  // ✅ Handlers para Exámenes Complementarios
  const handleViewComplementaryExam = (exam: IComplementaryExam) => {
    setComplementaryExamToView(exam);
    openComplementaryExamViewModal();
  };

  const handleEditComplementaryExam = (exam: IComplementaryExam) => {
    setComplementaryExamToEdit(exam);
    openComplementaryExamEditModal();
  };

  const handleCreateComplementaryExam = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message:
          "Para registrar exámenes complementarios, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openComplementaryExamCreateModal();
  };

  const handleOpenDeleteComplementaryExam = (exam: IComplementaryExam) => {
    setComplementaryExamToDelete(exam);
    openComplementaryExamDeleteModal();
  };

  const handleComplementaryExamDeleteFinished = async () => {
    if (!complementaryExamToDelete) return;
    try {
      await deleteComplementaryExamMutation.mutateAsync(complementaryExamToDelete.id);
      notify({
        type: "success",
        title: "¡Eliminación Exitosa!",
        message: "El examen complementario se eliminó correctamente.",
      });
      closeComplementaryExamDeleteModal();
      setComplementaryExamToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar examen complementario",
      });
    }
  };

  const handleComplementaryExamCreateEditSuccess = () => {
    closeComplementaryExamCreateModal();
    closeComplementaryExamEditModal();
    setComplementaryExamToEdit(null);
  };

  // Handlers para Antecedentes
  const handleViewBackground = (background: IAntecedenteCombinado) => {
    setBackgroundToView(background);
    openBackgroundViewModal();
  };

  const handleEditBackground = (background: IAntecedenteCombinado) => {
    setBackgroundToEdit(background);
    openBackgroundEditModal();
  };

  const handleCreateBackground = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message:
          "Para crear antecedentes, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openBackgroundCreateModal();
  };

  const handleOpenDeleteBackground = (background: IAntecedenteCombinado) => {
    setBackgroundToDelete(background);
    openBackgroundDeleteModal();
  };

  const handleBackgroundViewEdit = () => {
    if (backgroundToView) {
      const bg = backgroundToView;
      setBackgroundToView(null);
      handleEditBackground(bg);
      closeBackgroundViewModal();
    }
  };

  const handleBackgroundDeleteFinished = async () => {
    if (!backgroundToDelete) return;

    try {
      if (backgroundToDelete.tipo === "personal") {
        await removeAntecedentePersonal.mutateAsync(backgroundToDelete.id);
      } else {
        await removeAntecedenteFamiliar.mutateAsync(backgroundToDelete.id);
      }

      notify({
        type: "success",
        title: "¡Eliminación Exitosa!",
        message: `El antecedente ${backgroundToDelete.tipo} se eliminó correctamente.`,
      });
      closeBackgroundDeleteModal();
      setBackgroundToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar antecedente",
      });
    }
  };

  // Handlers para Exámenes Estomatognáticos
  const handleViewExam = (exam: IStomatognathicExam) => {
    setExamToView(exam);
    openExamViewModal();
  };

  const handleEditExam = (exam: IStomatognathicExam) => {
    setExamToEdit(exam);
    openExamEditModal();
  };

  const handleCreateExam = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message:
          "Para registrar un examen, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openExamCreateModal();
  };

  const handleOpenDeleteExam = (exam: IStomatognathicExam) => {
    setExamToDelete(exam);
    openExamDeleteModal();
  };

  const handleExamViewEdit = () => {
    if (examToView) {
      const e = examToView;
      setExamToView(null);
      handleEditExam(e);
      closeExamViewModal();
    }
  };

  const handleExamDeleteFinished = async () => {
    if (!examToDelete) return;
    try {
      await removeExam(examToDelete.id);
      notify({
        type: "success",
        title: "¡Eliminación Exitosa!",
        message: "El examen estomatognático se desactivó correctamente.",
      });
      closeExamDeleteModal();
      setExamToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar examen",
      });
    }
  };

  // Handlers para Signos Vitales
  const handleViewVital = (vital: IVitalSigns) => {
    setVitalToView(vital);
    openVitalViewModal();
  };

  const handleEditVital = (vital: IVitalSigns) => {
    setVitalToEdit(vital);
    openVitalEditModal();
  };

  const handleCreateVital = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message:
          "Para registrar consultas y signos vitales, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    openVitalCreateModal();
  };

  const handleOpenDeleteVital = (vital: IVitalSigns) => {
    setVitalToDelete(vital);
    openVitalDeleteModal();
  };

  const handleVitalCreated = () => {
    closeVitalCreateModal();
  };

  const handleCloseVitalEditModal = () => {
    closeVitalEditModal();
    setVitalToEdit(null);
  };

  const handleVitalViewEdit = () => {
    if (vitalToView) {
      const v = vitalToView;
      setVitalToView(null);
      handleEditVital(v);
      closeVitalViewModal();
    }
  };

  const handleVitalDeleteFinished = async () => {
    if (!vitalToDelete) return;
    try {
      await removeVitalSign(vitalToDelete.id);
      notify({
        type: "success",
        title: "Registro médico eliminado",
        message: "El registro médico (consulta y signos vitales) se desactivó correctamente.",
      });
      closeVitalDeleteModal();
      setVitalToDelete(null);
    } catch (error) {
      notify({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Error al eliminar registro médico",
      });
    }
  };

  const handleNotify = (message: string, type: "success" | "error") => {
    notify({
      type,
      title: type === "success" ? "Éxito" : "Error",
      message,
    });
  };

  // ✅ Tabs actualizados con Exámenes Complementarios - CON ESTILO UNIFICADO
  const tabs = [
    {
      id: "signos-vitales",
      label: "Registros Médicos",
      icon: <Clipboard className="h-5 w-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      description: "Consultas y constantes vitales integradas",
    },
    {
      id: "antecedentes",
      label: "Antecedentes Médicos",
      icon: <FileText className="h-5 w-5" />,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      description: "Antecedentes personales y familiares",
    },
    {
      id: "estomatognatico",
      label: "Exámenes Estomatognáticos",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      description: "Exámenes de regiones orales y faciales",
    },
    {
      id: "complementarios",
      label: "Exámenes Complementarios",
      icon: <Microscope className="h-5 w-5" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      description: "Solicitud e informes de exámenes de laboratorio",
    },
  ] as const;

  // Función mejorada que usa el background clicado
  const getAntecedentesForModals = (
    currentBackground?: IAntecedenteCombinado
  ): {
    personal: IAntecedentePersonal | null;
    familiar: IAntecedenteFamiliar | null;
  } => {
    if (!currentBackground) {
      return { personal: null, familiar: null };
    }

    const pacienteId = currentBackground.paciente;

    const personalAntecedente = allAntecedentes?.find(
      (a) => a.tipo === "personal" && a.paciente === pacienteId
    );
    const familiarAntecedente = allAntecedentes?.find(
      (a) => a.tipo === "familiar" && a.paciente === pacienteId
    );

    const personal: IAntecedentePersonal | null = personalAntecedente
      ? ({
          id: personalAntecedente.id,
          paciente: personalAntecedente.paciente,
          alergia_antibiotico: personalAntecedente.alergia_antibiotico ?? "",
          alergia_antibiotico_otro: personalAntecedente.alergia_antibiotico_otro,
          alergia_anestesia: personalAntecedente.alergia_anestesia ?? "",
          alergia_anestesia_otro: personalAntecedente.alergia_anestesia_otro,
          hemorragias: personalAntecedente.hemorragias ?? "",
          hemorragias_detalle: personalAntecedente.hemorragias_detalle,
          vih_sida: personalAntecedente.vih_sida ?? "",
          vih_sida_otro: personalAntecedente.vih_sida_otro,
          tuberculosis: personalAntecedente.tuberculosis ?? "",
          tuberculosis_otro: personalAntecedente.tuberculosis_otro,
          asma: personalAntecedente.asma ?? "",
          asma_otro: personalAntecedente.asma_otro,
          diabetes: personalAntecedente.diabetes ?? "",
          diabetes_otro: personalAntecedente.diabetes_otro,
          hipertension_arterial: personalAntecedente.hipertension_arterial ?? "",
          hipertension_arterial_otro: personalAntecedente.hipertension_arterial_otro,
          enfermedad_cardiaca: personalAntecedente.enfermedad_cardiaca ?? "",
          enfermedad_cardiaca_otro: personalAntecedente.enfermedad_cardiaca_otro,
          otros_antecedentes_personales: personalAntecedente.otros_antecedentes_personales,
          habitos: personalAntecedente.habitos,
          observaciones: personalAntecedente.observaciones,
          fecha_creacion: personalAntecedente.fecha_creacion,
          fecha_modificacion: personalAntecedente.fecha_modificacion,
        } as IAntecedentePersonal)
      : null;

    const familiar: IAntecedenteFamiliar | null = familiarAntecedente
      ? ({
          id: familiarAntecedente.id,
          paciente: familiarAntecedente.paciente,
          cardiopatia_familiar: familiarAntecedente.cardiopatia_familiar ?? "",
          cardiopatia_familiar_otro: familiarAntecedente.cardiopatia_familiar_otro,
          hipertension_arterial_familiar: familiarAntecedente.hipertension_arterial_familiar ?? "",
          hipertension_arterial_familiar_otro:
            familiarAntecedente.hipertension_arterial_familiar_otro,
          enfermedad_vascular_familiar: familiarAntecedente.enfermedad_vascular_familiar ?? "",
          enfermedad_vascular_familiar_otro:
            familiarAntecedente.enfermedad_vascular_familiar_otro,
          endocrino_metabolico_familiar: familiarAntecedente.endocrino_metabolico_familiar ?? "",
          endocrino_metabolico_familiar_otro:
            familiarAntecedente.endocrino_metabolico_familiar_otro,
          cancer_familiar: familiarAntecedente.cancer_familiar ?? "",
          cancer_familiar_otro: familiarAntecedente.cancer_familiar_otro,
          tipo_cancer: familiarAntecedente.tipo_cancer,
          tipo_cancer_otro: familiarAntecedente.tipo_cancer_otro,
          tuberculosis_familiar: familiarAntecedente.tuberculosis_familiar ?? "",
          tuberculosis_familiar_otro: familiarAntecedente.tuberculosis_familiar_otro,
          enfermedad_mental_familiar: familiarAntecedente.enfermedad_mental_familiar ?? "",
          enfermedad_mental_familiar_otro: familiarAntecedente.enfermedad_mental_familiar_otro,
          enfermedad_infecciosa_familiar:
            familiarAntecedente.enfermedad_infecciosa_familiar ?? "",
          enfermedad_infecciosa_familiar_otro:
            familiarAntecedente.enfermedad_infecciosa_familiar_otro,
          malformacion_familiar: familiarAntecedente.malformacion_familiar ?? "",
          malformacion_familiar_otro: familiarAntecedente.malformacion_familiar_otro,
          otros_antecedentes_familiares: familiarAntecedente.otros_antecedentes_familiares,
          fecha_creacion: familiarAntecedente.fecha_creacion,
          fecha_modificacion: familiarAntecedente.fecha_modificacion,
        } as IAntecedenteFamiliar)
      : null;

    return { personal, familiar };
  };

  // Componente unificado para mostrar paciente fijado
  const PacienteFijadoInfo = ({ title }: { title: string }) => {
  if (!pacienteActivo) return null;
  
  const iconMap = {
    "signos-vitales": <Activity className="h-4 w-4" />,
    "antecedentes": <FileText className="h-4 w-4" />,
    "estomatognatico": <Stethoscope className="h-4 w-4" />,
    "complementarios": <Microscope className="h-4 w-4" />,
  };

  const colorClasses = {
    "signos-vitales": {
      container: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30",
      iconBg: "bg-blue-100 dark:bg-blue-800/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
    },
    "antecedentes": {
      container: "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30",
      iconBg: "bg-purple-100 dark:bg-purple-800/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      text: "text-purple-700 dark:text-purple-300",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
    },
    "estomatognatico": {
      container: "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30",
      iconBg: "bg-orange-100 dark:bg-orange-800/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      text: "text-orange-700 dark:text-orange-300",
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
    },
    "complementarios": {
      container: "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30",
      iconBg: "bg-green-100 dark:bg-green-800/30",
      iconColor: "text-green-600 dark:text-green-400",
      text: "text-green-700 dark:text-green-300",
      badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
    }
  };

  const colors = colorClasses[activeTab];

  return (
    <div className={`rounded-lg border p-3 mb-3 ${colors.container}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconColor}`}>
            {iconMap[activeTab]}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className={`text-xs font-medium ${colors.text}`}>
                {title} del paciente:
              </p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}>
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Filtrado
              </span>
            </div>
            <div className="mt-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {pacienteActivo.nombres} {pacienteActivo.apellidos}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  CI: {pacienteActivo.cedula_pasaporte}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {pacienteActivo.sexo === "M" ? "♂" : "♀"}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Edad: {pacienteActivo.edad}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Componente unificado para alerta sin paciente
  const SinPacienteAlerta = ({ mensaje }: { mensaje: string }) => (
    <div className="rounded-lg bg-warning-50 dark:bg-warning-900/20 p-4 border border-warning-200 dark:border-warning-800 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
            Atención requerida
          </p>
          <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
            <strong>Nota:</strong> {mensaje}
          </p>
        </div>
      </div>
    </div>
  );

  // ✅ Renderizar contenido de tabs (agregamos caso complementarios)
  const renderTabContent = () => {
    const tabMessages = {
      "complementarios": {
        title: "Mostrando exámenes complementarios",
        alerta: "Para gestionar exámenes complementarios, primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'."
      },
      "estomatognatico": {
        title: "Mostrando examen estomatognático",
        alerta: "Para gestionar exámenes, primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'."
      },
      "antecedentes": {
        title: "Mostrando antecedentes médicos",
        alerta: "Para gestionar antecedentes, primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'."
      },
      "signos-vitales": {
        title: "Mostrando registros médicos",
        alerta: "Para gestionar registros médicos (consultas y signos vitales), primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'."
      }
    };

    const currentTab = tabMessages[activeTab];

    return (
      <>
        {pacienteActivo && <PacienteFijadoInfo title={currentTab.title} />}
        
        {!pacienteActivo && (
          <>
            <SinPacienteAlerta mensaje={currentTab.alerta} />
            {activeTab === "antecedentes" && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Vista general
                    </p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      Mostrando antecedentes de todos los pacientes. Fije un paciente para filtrar o crear nuevos antecedentes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Renderizar la tabla correspondiente */}
        <div className="mt-4">
          {activeTab === "complementarios" && (
            <ComplementaryExamTable
              onView={handleViewComplementaryExam}
              onEdit={handleEditComplementaryExam}
              onDelete={handleOpenDeleteComplementaryExam}
              pacienteId={pacienteActivo?.id}
            />
          )}
          {activeTab === "estomatognatico" && (
            <StomatognathicExamTable
              onView={handleViewExam}
              onEdit={handleEditExam}
              onDelete={handleOpenDeleteExam}
              pacienteId={pacienteActivo?.id}
            />
          )}
          {activeTab === "antecedentes" && (
            <BackgroundsTable
              pacienteId={pacienteActivo?.id}
              onView={handleViewBackground}
              onEdit={handleEditBackground}
              onDelete={handleOpenDeleteBackground}
            />
          )}
          {activeTab === "signos-vitales" && (
            <VitalSignsTable
              onView={handleViewVital}
              onEdit={handleEditVital}
              onDelete={handleOpenDeleteVital}
              pacienteId={pacienteActivo?.id}
            />
          )}
        </div>
      </>
    );
  };

  // Renderizar botón de acción con estilo unificado
  const renderActionButton = () => {
    const buttonConfig = {
      "complementarios": {
        label: "Registrar Examen Complementario",
        color: "bg-green-600 hover:bg-green-700",
        icon: <Microscope className="h-4 w-4 mr-2" />,
      },
      "estomatognatico": {
        label: "Registrar Examen",
        color: "bg-orange-600 hover:bg-orange-700",
        icon: <Stethoscope className="h-4 w-4 mr-2" />,
      },
      "antecedentes": {
        label: "Crear Antecedentes",
        color: "bg-purple-600 hover:bg-purple-700",
        icon: <FileText className="h-4 w-4 mr-2" />,
      },
      "signos-vitales": {
        label: "Nuevo Registro Médico",
        color: "bg-blue-600 hover:bg-blue-700",
        icon: <Plus className="h-4 w-4 mr-2" />,
      },
    };

    const config = buttonConfig[activeTab];

    return (
      <button
        onClick={
          activeTab === "complementarios" ? handleCreateComplementaryExam :
          activeTab === "estomatognatico" ? handleCreateExam :
          activeTab === "antecedentes" ? handleCreateBackground :
          handleCreateVital
        }
        className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${config.color} disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={!pacienteActivo}
      >
        {config.icon}
        {config.label}
      </button>
    );
  };

  // Obtener los datos para los modales usando backgroundToView
  const modalData = backgroundToView
    ? getAntecedentesForModals(backgroundToView)
    : { personal: null, familiar: null };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Gestión Clínica - Detalles del Paciente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Administra los aspectos clínicos de los pacientes (consultas, signos vitales, antecedentes, exámenes)
            </p>
          </div>

          <div className="flex gap-3">
            {renderActionButton()}
          </div>
        </div>

        {/* Tabs con estilo unificado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-1">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group relative flex-1 sm:flex-none min-w-[150px] sm:min-w-0
                  flex items-center justify-center gap-2 sm:gap-3
                  py-3 px-3 sm:px-4 rounded-md
                  transition-all duration-200
                  ${activeTab === tab.id 
                    ? `${tab.bgColor} ${tab.color} font-semibold shadow-sm` 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? 'bg-white/50 dark:bg-white/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {tab.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                  <span className={`text-xs ${activeTab === tab.id ? 'opacity-80' : 'text-gray-500 dark:text-gray-500'} hidden sm:block`}>
                    {tab.description}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <ChevronRight className="h-4 w-4 ml-auto hidden sm:block" />
                )}
                {activeTab === tab.id && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 ${tab.color.replace('text-', 'bg-')} rounded-full`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-0">{renderTabContent()}</div>

      {complementaryExamToView && (
        <ComplementaryExamViewModal
          isOpen={isComplementaryExamViewModalOpen}
          onClose={closeComplementaryExamViewModal}
          exam={complementaryExamToView}
        />
      )}

      {isComplementaryExamCreateModalOpen && pacienteActivo && (
        <ComplementaryExamCreateEditModal
          isOpen={isComplementaryExamCreateModalOpen}
          onClose={closeComplementaryExamCreateModal}
          onSuccess={handleComplementaryExamCreateEditSuccess}
          exam={null}
          pacienteId={pacienteActivo.id}
        />
      )}

      {complementaryExamToEdit && (
        <ComplementaryExamCreateEditModal
          isOpen={isComplementaryExamEditModalOpen}
          onClose={() => {
            closeComplementaryExamEditModal();
            setComplementaryExamToEdit(null);
          }}
          onSuccess={handleComplementaryExamCreateEditSuccess}
          exam={complementaryExamToEdit}
          pacienteId={
            typeof complementaryExamToEdit.paciente === 'string'
              ? complementaryExamToEdit.paciente
              : complementaryExamToEdit.paciente.id
          }
        />
      )}

      {complementaryExamToDelete && (
        <ComplementaryExamDeleteModal
          isOpen={isComplementaryExamDeleteModalOpen}
          onClose={closeComplementaryExamDeleteModal}
          onSuccess={handleComplementaryExamDeleteFinished}
          exam={complementaryExamToDelete}
        />
      )}

      {/* Modales para Exámenes Estomatognáticos */}
      {examToView && (
        <StomatognathicExamViewModal
          isOpen={isExamViewModalOpen}
          onClose={closeExamViewModal}
          exam={examToView}
          onEdit={handleExamViewEdit}
        />
      )}

      {isExamCreateModalOpen && (
        <StomatognathicExamCreateEditModal
          isOpen={isExamCreateModalOpen}
          onClose={closeExamCreateModal}
          mode="create"
          initialData={null}
          examId={undefined}
          notify={handleNotify}
          pacienteActivo={pacienteActivo}
        />
      )}

      {examToEdit && (
        <StomatognathicExamCreateEditModal
          isOpen={isExamEditModalOpen}
          onClose={() => {
            closeExamEditModal();
            setExamToEdit(null);
          }}
          mode="edit"
          initialData={examToEdit}
          examId={examToEdit.id}
          notify={handleNotify}
          pacienteActivo={pacienteActivo}
        />
      )}

      {examToDelete && (
        <StomatognathicExamDeleteModal
          isOpen={isExamDeleteModalOpen}
          onClose={closeExamDeleteModal}
          exam={examToDelete}
          onDeleted={handleExamDeleteFinished}
          notify={handleNotify}
        />
      )}

      {/* Modales para Signos Vitales */}
      {vitalToView && (
        <VitalSignsViewModal
          isOpen={isVitalViewModalOpen}
          onClose={closeVitalViewModal}
          vital={vitalToView}
          onEdit={handleVitalViewEdit}
        />
      )}

      {isVitalCreateModalOpen && (
        <VitalSignsCreateEditModal
          isOpen={isVitalCreateModalOpen}
          onClose={closeVitalCreateModal}
          mode="create"
          initialData={null}
          vitalId={undefined}
          onVitalSaved={handleVitalCreated}
          notify={handleNotify}
          pacienteActivo={pacienteActivo as IPaciente | null}
        />
      )}

      {vitalToEdit && (
        <VitalSignsCreateEditModal
          isOpen={isVitalEditModalOpen}
          onClose={handleCloseVitalEditModal}
          mode="edit"
          initialData={vitalToEdit}
          vitalId={vitalToEdit.id}
          onVitalSaved={handleCloseVitalEditModal}
          notify={handleNotify}
        />
      )}

      {vitalToDelete && (
        <VitalSignsDeleteModal
          isOpen={isVitalDeleteModalOpen}
          onClose={closeVitalDeleteModal}
          vital={vitalToDelete}
          onDeleted={handleVitalDeleteFinished}
          notify={handleNotify}
        />
      )}

      {/* Modales para Antecedentes */}
      {backgroundToView && (
        <BackgroundsViewModal
          isOpen={isBackgroundViewModalOpen}
          onClose={closeBackgroundViewModal}
          backgroundPersonal={modalData.personal}
          backgroundFamiliar={modalData.familiar}
          onEdit={handleBackgroundViewEdit}
          pacienteNombre={
            backgroundToView.paciente_nombre ||
            (pacienteActivo
              ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
              : "Paciente")
          }
        />
      )}

      {/* Modal de CREACIÓN */}
      {isBackgroundCreateModalOpen && pacienteActivo && (
        <BackgroundsCreateEditModal
          isOpen={isBackgroundCreateModalOpen}
          onClose={closeBackgroundCreateModal}
          mode="create"
          pacienteId={pacienteActivo.id}
          pacienteNombre={`${pacienteActivo.nombres} ${pacienteActivo.apellidos}`}
        />
      )}

      {/* Modal de EDICIÓN */}
      {backgroundToEdit && (
        <BackgroundsCreateEditModal
          isOpen={isBackgroundEditModalOpen}
          onClose={() => {
            closeBackgroundEditModal();
            setBackgroundToEdit(null);
          }}
          mode="edit"
          backgroundPersonal={getAntecedentesForModals(backgroundToEdit).personal}
          backgroundFamiliar={getAntecedentesForModals(backgroundToEdit).familiar}
          pacienteId={backgroundToEdit.paciente || (pacienteActivo?.id ?? "")}
          pacienteNombre={
            backgroundToEdit.paciente_nombre ||
            (pacienteActivo ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}` : "Paciente")
          }
        />
      )}

      {backgroundToDelete && (
        <BackgroundsDeleteModal
          isOpen={isBackgroundDeleteModalOpen}
          onClose={closeBackgroundDeleteModal}
          background={backgroundToDelete}
          onDeleted={handleBackgroundDeleteFinished}
          notify={notify}
        />
      )}
    </>
  );
}