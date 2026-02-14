// src/components/clinicalRecord/modals/ClinicalRecordViewModal.tsx

import React, { useRef } from "react";
import {
  X,
  FileText,
  Clock,
} from "lucide-react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Spinner from "../../ui/spinner/Spinner";
import { useQuery } from "@tanstack/react-query";
import {
  formatDateToReadable,
} from "../../../mappers/clinicalRecordMapper";
import type { ClinicalRecordListResponse } from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import clinicalRecordService from "../../../services/clinicalRecord/clinicalRecordService";
import { EstablecimientoPacienteSection } from "./sectionsView/EstablecimientoPacienteSectionView";
import { MotivoConsultaSectionView } from "./sectionsView/MotivoConsultaSection";
import { EnfermedadActualSectionView } from "./sectionsView/EnfermedadActualSectionView";
import { AntecedentesPersonalesSectionView } from "./sectionsView/AntecedentesPersonalesSectionView";
import { ConstantesVitalesSectionView } from "./sectionsView/ConstantesVitalesSectionView";
import { ExamenEstomatognaticoSectionView } from "./sectionsView/ExamEstomatognaticoSectionView";
import { Odontograma2DSectionView } from "./sectionsView/Odontograma2DSectionView";
import { IndicadoresSaludBucalSectionView } from "./sectionsView/IndicadoresSaludBucalSectionView";
import { IndicesCariesSectionView } from "./sectionsView/IndicesCariesSectionView";
import { SimbologiaOdontogramaSectionView } from "./sectionsView/SimbologiaOdontogramaSectionView";
import { AntecedentesFamiliaresSectionView } from "./sectionsView/AntecedentesFamiliaresSection";
import { PedidoExamenesSectionView } from "./sectionsView/PedidoExamenesSectionView";
import { InformeExamenesSectionView } from "./sectionsView/InformeExamenesSectionView";
import { DiagnosticosCIESectionView } from "./sectionsView/DiagnosticosCIESectionView";
import { DatosProfesionalSectionView } from "./sectionsView/DatosProfesionalSectionView";
import { PlanTratamientoSectionView } from "./sectionsView/PlanTratamientoSectionView";

interface ClinicalRecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: ClinicalRecordListResponse | null;
}

const ClinicalRecordViewModal: React.FC<ClinicalRecordViewModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // 1. Fetch de datos
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clinicalRecord", selectedRecord?.id],
    queryFn: () => clinicalRecordService.getById(selectedRecord!.id),
    enabled: isOpen && !!selectedRecord?.id,
    staleTime: 0,
  });

  // Función para descargar como PDF

  if (!isOpen) return null;

  // 2. Estado de Carga
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
        <div className="flex h-[90vh] flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <span className="text-gray-500 font-medium">
            Cargando información completa...
          </span>
        </div>
      </Modal>
    );
  }

  // 3. Estado de Error
  if (isError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center text-red-600">
          Error al cargar la información.
        </div>
      </Modal>
    );
  }

  // 4. EXTRAER LA DATA REAL
  const record = (apiResponse as any)?.data || apiResponse;

  if (!record || !record.id) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center text-gray-500">
          No se encontraron datos para este historial.
        </div>
      </Modal>
    );
  }

  const isComplete = record.esta_completo;
  const hasPlanTratamiento = !!record.plan_tratamiento_data;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
      {/* CONTENEDOR PRINCIPAL CON FLEX COL Y ALTURA COMPLETA */}
      <div ref={modalContentRef} className="flex flex-col h-full max-h-[90vh]">
        {/* HEADER - FIXED */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historial Clínico - Formulario 033
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {record.id?.slice(0, 8) || "---"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isComplete ? 'COMPLETO' : 'EN PROGRESO'}
                </span>
                {hasPlanTratamiento && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    CON PLAN
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
           
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-700"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* BODY - SCROLLABLE (usa el espacio restante) */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* A. DATOS DE ESTABLECIMIENTO Y PACIENTE */}
            <EstablecimientoPacienteSection record={record} />
            {/* B. MOTIVO DE CONSULTA */}
            <MotivoConsultaSectionView record={record} />
            {/* C. ENFERMEDAD ACTUAL */}
            <EnfermedadActualSectionView record={record} />
            {/* D. ANTECEDENTES PERSONALES */}
            <AntecedentesPersonalesSectionView record={record} />
            {/* E. ANTECEDENTES FAMILIARES */}
            <AntecedentesFamiliaresSectionView record={record} />
            {/* F. CONSTANTES VITALES */}
            <ConstantesVitalesSectionView record={record} />
            {/* G. EXAMEN ESTOMATOLOGICO */}
            <ExamenEstomatognaticoSectionView record={record} />
            {/* H. ODONTOGRAMA */}
            <Odontograma2DSectionView record={record} />
            {/* I. INDICADORES DE SALUD BUCAL */}
            <IndicadoresSaludBucalSectionView record={record} />
            {/* J. INDICES CPO */}
            <IndicesCariesSectionView record={record} />
            {/* K. SIMBOLOGÍA DEL ODONTOGRAMA */}
            <SimbologiaOdontogramaSectionView />
            {/* L. PEDIDO DE EXÁMENES */}
            <PedidoExamenesSectionView record={record} />
            {/* M. INFORME DE EXÁMENES */}
            <InformeExamenesSectionView record={record} />
            {/* N. DIAGNÓSTICOS */}
            <DiagnosticosCIESectionView record={record} />
            {/* O. DATOS PROFESIONALES */}
            <DatosProfesionalSectionView record={record} />
            {/* P. PLAN DE TRATAMIENTO */}
            <PlanTratamientoSectionView record={record} />

            <div className="text-xs text-gray-400 pt-4 border-t mt-8 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  Creado el: {formatDateToReadable(record.fecha_creacion)}
                </span>
              </div>
              {record.fecha_modificacion && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    Última modificación:{" "}
                    {formatDateToReadable(record.fecha_modificacion)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS - FIXED */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClinicalRecordViewModal;