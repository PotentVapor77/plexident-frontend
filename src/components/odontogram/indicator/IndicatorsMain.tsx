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
import { Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Button from "../../ui/button/Button";
import { IndicatorsCreateEditModal } from "./IndicatorsCreateEditModal";
import { IndicatorsDeleteModal } from "./IndicatorsDeleteModal";
import { IndicatorsSuccessModal } from "./IndicatorsSuccessModal";
import { IndicatorsTable } from "./IndicatorsTable";
import { IndicatorsViewModal } from "./IndicatorsViewModal";

export const IndicatorsMain: React.FC = () => {
  const { notify } = useNotification();
  const { pacienteActivo } = usePacienteActivo();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const pacienteId = pacienteActivo?.id || null;
  const pacienteNombreCompleto = pacienteActivo
    ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
    : null;

  const { indicadores, pagination, isLoading, isError, error } =
    useIndicadoresSaludBucal(pacienteId, {
      page,
      page_size: pageSize,
      search,
    });

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

  const handleViewEdit = () => {
    if (selectedRegistro) {
      closeViewModal();
      openCreateEditModal();
    }
  };

  const handleSubmit = async (payload: IndicadoresSaludBucalCreatePayload) => {
  try {
    if (selectedRegistro) {
      await updateMutation.mutateAsync({ id: selectedRegistro.id, payload });
      notify({
        type: "warning",
        title: "Indicadores actualizados",
        message: "Los indicadores de salud bucal se actualizaron correctamente.",
      });
    } else {
      await createMutation.mutateAsync(payload);
      notify({
        type: "success",
        title: "Indicadores registrados",
        message: "Los indicadores de salud bucal se registraron correctamente.",
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

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando indicadores...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (isError) {
    return (
      <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-6 shadow-theme-sm">
        <h3 className="text-lg font-semibold text-error-900 dark:text-error-100 mb-2">
          Error al cargar indicadores
        </h3>
        <p className="text-error-700 dark:text-error-300">
          {error || "Error desconocido"}
        </p>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Cabecera principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestión de indicadores
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pacienteActivo
              ? `Indicadores de salud bucal del paciente ${pacienteNombreCompleto}`
              : "Administra los registros de indicadores de salud bucal de los pacientes"}
          </p>
          {pacienteActivo && (
            <p className="mt-1 text-xs text-brand-700 dark:text-brand-300">
              Solo se muestran indicadores del paciente activo seleccionado en
              la gestión de pacientes.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de registros por página */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              registros por página
            </span>
          </div>

          {/* Botón de nuevo registro */}
          <Button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 rounded-lg shadow-theme-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar indicadores
          </Button>
        </div>
      </div>

      {/* Card principal con tabla */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm p-0">
        {pacienteActivo && (
          <div className="mb-0 inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 px-3 py-1 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Filtrando por paciente:{" "}
              <span className="font-semibold">{pacienteNombreCompleto}</span>
            </span>
          </div>
        )}

        <IndicatorsTable
          registros={indicadores}
          showInactivos={false}
          showPatientColumn={!pacienteActivo}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          search={search}
          onSearchChange={handleSearch}
        />
      </div>

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-sm px-4 sm:px-6 py-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando página{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {pagination.page}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {pagination.total_pages}
            </span>{" "}
            ({pagination.count} registros totales)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_previous}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-xs"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};
