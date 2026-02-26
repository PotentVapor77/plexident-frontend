// src/components/odontogram/indicator/IndicatorsMain.tsx

import React, { useState } from "react";
import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import type { IndicadoresSaludBucalCreatePayload } from "../../../core/types/odontograma.types";
import {
  useIndicadoresSaludBucal,
  useCreateIndicadoresSaludBucal,
  useUpdateIndicadoresSaludBucal,
  useDeleteIndicadoresSaludBucal,
} from "../../../hooks/odontogram/useIndicadoresSaludBucal";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { usePacienteActivo } from "../../../context/PacienteContext";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  AlertCircle,
  FileText,
  Activity,
  User,
  Clipboard
} from "lucide-react";
import { IndicatorsCreateEditModal } from "./IndicatorsCreateEditModal";
import { IndicatorsDeleteModal } from "./IndicatorsDeleteModal";
import { IndicatorsSuccessModal } from "./IndicatorsSuccessModal";
import { IndicatorsTable } from "./IndicatorsTable";
import { IndicatorsViewModal } from "./IndicatorsViewModal";

export const IndicatorsMain: React.FC = () => {
  const { notify } = useNotification();
  const { pacienteActivo } = usePacienteActivo();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");

  const pacienteId = pacienteActivo?.id || null;
  const pacienteNombreCompleto = pacienteActivo
    ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
    : null;

  // Hook principal: usar search directo, sin debounce
  const {
    indicadores = [],
    pagination: rawPagination,
    isLoading,
    isError,
    error,
  } = useIndicadoresSaludBucal(pacienteId, {
    page,
    page_size: pageSize,
    search, 
  });

  // Normalizar paginación a camelCase para el componente
  const pagination = rawPagination
    ? {
        count: rawPagination.count,
        page: rawPagination.page,
        pageSize: rawPagination.page_size,
        totalPages: rawPagination.total_pages,
        hasNext: rawPagination.has_next,
        hasPrevious: rawPagination.has_previous,
      }
    : {
        count: 0,
        page,
        pageSize,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

  const createMutation = useCreateIndicadoresSaludBucal(pacienteId);
  const updateMutation = useUpdateIndicadoresSaludBucal(pacienteId);
  const deleteMutation = useDeleteIndicadoresSaludBucal(pacienteId);

  const [selectedRegistro, setSelectedRegistro] =
    useState<BackendIndicadoresSaludBucal | null>(null);

  // Modales
  const {
    isOpen: isCreateEditOpen,
    openModal: openCreateEditModal,
    closeModal: closeCreateEditModal,
  } = useModal();

  const {
    isOpen: isViewOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isSuccessOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModal();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleNew = () => {
    if (!pacienteActivo) {
      notify({
        type: "warning",
        title: "Paciente no fijado",
        message:
          "Para registrar indicadores, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
      });
      return;
    }
    setSelectedRegistro(null);
    openCreateEditModal();
  };

  const handleEdit = (row: BackendIndicadoresSaludBucal) => {
    setSelectedRegistro(row);
    openCreateEditModal();
  };

  const handleView = (row: BackendIndicadoresSaludBucal) => {
    setSelectedRegistro(row);
    openViewModal();
  };

  const handleDelete = (row: BackendIndicadoresSaludBucal) => {
    setSelectedRegistro(row);
    openDeleteModal();
  };

  const handleSubmit = async (payload: IndicadoresSaludBucalCreatePayload) => {
    try {
      if (selectedRegistro) {
        await updateMutation.mutateAsync({ id: selectedRegistro.id, payload });
        notify({
          type: "warning",
          title: "Indicadores actualizados",
          message:
            "Los indicadores de salud bucal se actualizaron correctamente.",
        });
      } else {
        await createMutation.mutateAsync(payload);
        notify({
          type: "success",
          title: "Indicadores registrados",
          message:
            "Los indicadores de salud bucal se registraron correctamente.",
        });
      }

      closeCreateEditModal();
      setSelectedRegistro(null);
      openSuccessModal();
    } catch (error) {
      console.error("Error al guardar indicadores:", error);
      notify({
        type: "error",
        title: "Error",
        message: "No se pudieron guardar los indicadores. Intente nuevamente.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRegistro) return;

    try {
      await deleteMutation.mutateAsync(selectedRegistro.id);
      notify({
        type: "success",
        title: "Registro eliminado",
        message: "El indicador se eliminó correctamente.",
      });
      closeDeleteModal();
      setSelectedRegistro(null);
    } catch (error) {
      console.error("Error al eliminar indicador:", error);
      notify({
        type: "error",
        title: "Error",
        message: "No se pudo eliminar el registro.",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // ============================================================================
  // LOADING STATE UNIFICADO
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando indicadores de salud bucal...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE UNIFICADO
  // ============================================================================

  if (isError) {
    return (
      <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-error-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error al cargar indicadores
            </h3>
            <p className="mt-2 text-sm text-error-700 dark:text-error-300">
              {error || "Error desconocido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // COMPONENTE PARA PACIENTE FIJADO
  // ============================================================================

  const PacienteFijadoInfo = () => {
    if (!pacienteActivo) return null;

    return (
      <div className="rounded-lg border p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Mostrando indicadores del paciente:
                </p>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
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

  // ============================================================================
  // ALERTA SIN PACIENTE
  // ============================================================================

  const SinPacienteAlerta = () => (
    <div className="rounded-lg bg-warning-50 dark:bg-warning-900/20 p-4 border border-warning-200 dark:border-warning-800 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
            Atención requerida
          </p>
          <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
            <strong>Nota:</strong> Para gestionar indicadores de salud bucal, primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'.
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER PRINCIPAL UNIFICADO
  // ============================================================================

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Indicadores de Salud Bucal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Administra los indicadores clínicos de salud bucal (enfermedad periodontal, oclusión, fluorosis, OHI)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNew}
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!pacienteActivo}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Indicadores
            </button>
          </div>
        </div>

        {/* Información del paciente fijado */}
        {pacienteActivo && <PacienteFijadoInfo />}
        
        {/* Alerta si no hay paciente fijado */}
        {!pacienteActivo && <SinPacienteAlerta />}

        {/* Tabla con paginación integrada */}
        <div className="mt-4">
          <IndicatorsTable
            registros={indicadores}
            showInactivos={false}
            showPatientColumn={!pacienteActivo}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            search={search}
            onSearchChange={handleSearch}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            totalPages={pagination.totalPages}
            totalCount={pagination.count}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Modales */}
      <IndicatorsCreateEditModal
        isOpen={isCreateEditOpen}
        onClose={() => {
          closeCreateEditModal();
          setSelectedRegistro(null);
        }}
        pacienteId={pacienteId}
        pacienteNombreCompleto={pacienteNombreCompleto}
        initialData={selectedRegistro}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
      />

      <IndicatorsViewModal
        isOpen={isViewOpen}
        onClose={() => {
          closeViewModal();
          setSelectedRegistro(null);
        }}
        registro={selectedRegistro}
        datosPaciente={pacienteActivo ? {
          nombres: pacienteActivo.nombres,
          apellidos: pacienteActivo.apellidos,
          cedula: pacienteActivo.cedula_pasaporte
        } : undefined}
      />

      <IndicatorsDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          closeDeleteModal();
          setSelectedRegistro(null);
        }}
        registro={selectedRegistro}
        onConfirm={handleConfirmDelete}
      />

      <IndicatorsSuccessModal
        isOpen={isSuccessOpen}
        onClose={closeSuccessModal}
      />
    </>
  );
};