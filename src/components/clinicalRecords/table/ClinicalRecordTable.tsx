// src/components/clinicalRecord/table/ClinicalRecordTable.tsx

import React, { useMemo, useCallback } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  Lock,
  Calendar,
  User,
} from "lucide-react";
import Button from "../../ui/button/Button";
import type {
  ClinicalRecordListResponse,
  ClinicalRecordDetailResponse,
} from "../../../types/clinicalRecords/typeBackendClinicalRecord";
import { formatDateToReadable } from "../../../mappers/treatmentPlanMapper";
import {
  getEstadoColor,
  getPDFButtonColor,
} from "../../../mappers/clinicalRecordMapper";
import PDFDownloadButton from "../pdf/PDFDownloadButton";
import {
  extractOdontologoNombre,
  extractPacienteCedula,
  extractPacienteNombre,
} from "../../../core/utils/clinicalRecordHelpers";
import { Pagination, SearchBar } from "../../ui/pagination";
import type { PaginationState } from "../../ui/pagination";

export type { PaginationState as ClinicalRecordPaginationProps };

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordTableProps {
  historiales: (ClinicalRecordListResponse | ClinicalRecordDetailResponse)[];
  onViewClick?: (record: any) => void;
  onEditClick?: (record: any) => void;
  onDeleteClick?: (record: any) => void;
  onCloseClick?: (record: any) => void;

  // ── Búsqueda ──
  searchTerm?: string;
  onSearchChange?: (value: string) => void;

  // ── Paginación ──
  pagination?: PaginationState;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  showPaginationControls?: boolean;
}

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
const ClinicalRecordTable: React.FC<ClinicalRecordTableProps> = ({
  historiales,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onCloseClick,
  searchTerm = "",
  onSearchChange,
  pagination,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showPaginationControls = true,
}) => {
  // ==========================================================================
  // HELPERS DE DATOS
  // ==========================================================================
  const getPacienteNombre = useCallback(
    (record: any) => extractPacienteNombre(record),
    []
  );
  const getPacienteCedula = useCallback(
    (record: any) => extractPacienteCedula(record),
    []
  );
  const getOdontologoNombre = useCallback(
    (record: any) => extractOdontologoNombre(record),
    []
  );

  // ==========================================================================
  // HELPERS UI
  // ==========================================================================
  const getEstadoBadge = useCallback(
    (estado: string, estadoDisplay: string) => {
      const badgeClass = getEstadoColor(estado);
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
        >
          {estado === "CERRADO" && (
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          )}
          {estado === "ABIERTO" && (
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          )}
          {estadoDisplay || estado}
        </span>
      );
    },
    []
  );

  const getInitials = (name: string) => {
    if (!name || name === "Nombre no disponible") return "??";
    const parts = name.split(",").map((p) => p.trim());
    if (parts.length > 1) {
      return (parts[1][0] + parts[0][0]).toUpperCase();
    }
    const spaces = name.split(" ");
    if (spaces.length > 1) {
      return (spaces[0][0] + spaces[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getCompletenessIndicator = useCallback((estaCompleto: boolean) => {
    return estaCompleto ? (
      <span className="inline-flex items-center text-xs text-success-600 dark:text-success-400">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completo
      </span>
    ) : (
      <span className="inline-flex items-center text-xs text-orange-600 dark:text-orange-400">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
        Incompleto
      </span>
    );
  }, []);

  // ==========================================================================
  // RENDER ROWS
  // ==========================================================================
  const rows = useMemo(
    () =>
      historiales.map((record: any) => {
        const nombrePaciente = getPacienteNombre(record);
        const pdfButtonColor = getPDFButtonColor(record.estado);

        return (
          <tr
            key={record.id}
            className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            {/* Paciente */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  {getInitials(nombrePaciente)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {nombrePaciente}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    CI: {getPacienteCedula(record)}
                  </span>
                </div>
              </div>
            </td>

            {/* Motivo de consulta */}
            <td className="px-6 py-4">
              <div
                className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400"
                title={record.motivo_consulta}
              >
                {record.motivo_consulta || "Sin motivo especificado"}
              </div>
            </td>

            {/* Fecha de atención */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {formatDateToReadable(record.fecha_atencion)}
              </div>
            </td>

            {/* Odontólogo */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {getOdontologoNombre(record)}
              </div>
            </td>

            {/* Estado */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-col gap-1 items-start">
                {getEstadoBadge(record.estado, record.estado_display)}
                {getCompletenessIndicator(record.esta_completo)}
              </div>
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end gap-1">
                {/* PDF */}
                <PDFDownloadButton
                  historialId={record.id}
                  pacienteNombre={nombrePaciente}
                  numeroHistoria={record.numero_historia_clinica_unica}
                  mode="download"
                  size="sm"
                  text=""
                  className={`${pdfButtonColor} p-2`}
                />

                {/* Ver */}
                {onViewClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewClick(record)}
                    className="text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalle</span>
                  </Button>
                )}

                {/* Editar */}
                {onEditClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(record)}
                    disabled={
                      !record.puede_editar || record.estado === "CERRADO"
                    }
                    className={`text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 ${
                      !record.puede_editar || record.estado === "CERRADO"
                        ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                        : ""
                    }`}
                    title={
                      !record.puede_editar || record.estado === "CERRADO"
                        ? "No se puede editar"
                        : "Editar historial"
                    }
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                )}

                {/* Cerrar */}
                {onCloseClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCloseClick(record)}
                    disabled={record.estado !== "ABIERTO" || !record.activo}
                    className={`text-success-600 hover:bg-success-50 hover:text-success-700 dark:text-success-400 dark:hover:bg-success-500/10 dark:hover:text-success-300 ${
                      record.estado !== "ABIERTO" || !record.activo
                        ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-success-600 dark:hover:bg-transparent dark:hover:text-success-400"
                        : ""
                    }`}
                    title={
                      record.estado !== "ABIERTO" || !record.activo
                        ? "No se puede cerrar"
                        : "Cerrar historial"
                    }
                  >
                    <Lock className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                  </Button>
                )}

                {/* Eliminar */}
                {onDeleteClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClick(record)}
                    disabled={!record.activo || record.estado === "CERRADO"}
                    className={`text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-300 ${
                      !record.activo || record.estado === "CERRADO"
                        ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500 dark:hover:bg-transparent dark:hover:text-gray-400"
                        : ""
                    }`}
                    title={
                      !record.activo || record.estado === "CERRADO"
                        ? "No se puede eliminar"
                        : "Eliminar historial"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </div>
            </td>
          </tr>
        );
      }),
    [
      historiales,
      onViewClick,
      onEditClick,
      onDeleteClick,
      onCloseClick,
      getEstadoBadge,
      getCompletenessIndicator,
      getPacienteNombre,
      getPacienteCedula,
      getOdontologoNombre,
    ]
  );

  // ==========================================================================
  // EMPTY STATE
  // ==========================================================================
  const isEmpty = !historiales || historiales.length === 0;

  // ── ¿Mostrar paginación? ──
  const showPagination =
    showPaginationControls && !!pagination && !!onPageChange;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="space-y-4">
      {/* ── Barra de búsqueda ── */}
      {onSearchChange && (
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por paciente, CI, motivo de consulta, odontólogo..."
        />
      )}

      {/* ── Tabla ── */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 w-full">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium min-w-[200px]">
                  Paciente
                </th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[250px]">
                  Motivo de consulta
                </th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">
                  Fecha atención
                </th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[180px]">
                  Odontólogo
                </th>
                <th scope="col" className="px-6 py-3 font-medium min-w-[150px]">
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right font-medium min-w-[220px]"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {isEmpty ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No hay historiales clínicos registrados
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : "Cree un nuevo historial para comenzar con el registro del Formulario 033"}
                      </p>
                      {searchTerm && onSearchChange && (
                        <button
                          onClick={() => onSearchChange("")}
                          className="mt-3 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pie de tabla: contador ── */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sticky bottom-0">
          {showPagination
            ? `Mostrando ${historiales.length} de ${pagination!.count} historiales`
            : `Total de registros: ${historiales.length}`}
        </div>
      </div>

      {/* ── Paginación global ── */}
      {showPagination && (
        <Pagination
          pagination={pagination!}
          pageSize={pageSize}
          onPageChange={onPageChange!}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          entityLabel="historiales"
        />
      )}
    </div>
  );
};

export default React.memo(
  ClinicalRecordTable,
  (prev, next) =>
    prev.historiales === next.historiales &&
    prev.searchTerm === next.searchTerm &&
    prev.pagination === next.pagination &&
    prev.pageSize === next.pageSize &&
    prev.isLoading === next.isLoading &&
    prev.onViewClick === next.onViewClick &&
    prev.onEditClick === next.onEditClick &&
    prev.onDeleteClick === next.onDeleteClick &&
    prev.onCloseClick === next.onCloseClick &&
    prev.onSearchChange === next.onSearchChange &&
    prev.onPageChange === next.onPageChange &&
    prev.onPageSizeChange === next.onPageSizeChange
);