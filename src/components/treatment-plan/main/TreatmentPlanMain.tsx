// src/components/odontogram/treatmentPlan/TreatmentPlanMain.tsx

import { useState } from "react";
import { useNotification } from "../../../context/notifications/NotificationContext";
import { useModal } from "../../../hooks/useModal";
import type { PlanTratamientoListResponse } from "../../../types/treatmentPlan/typeBackendTreatmentPlan";
import { useDeletePlanTratamiento, usePlanesTratamiento } from "../../../hooks/treatmentPlan/useTreatmentPlan";
import { FileText, Plus, Search } from "lucide-react";
import Button from "../../ui/button/Button";
import TreatmentPlanViewModal from "../modals/TreatmentPlanViewModal";
import TreatmentPlanDeleteModal from "../modals/TreatmentPlanDeleteModal";
import TreatmentPlanTable from "../table/TreatmentPlanTable";
import TreatmentPlanCreateEditModal from "../modals/TreatmentPlanCreateEditModal";
import { usePacienteActivo } from "../../../context/PacienteContext";

// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanMain() {
  // Contextos
  const { pacienteActivo } = usePacienteActivo();
  console.log("[TreatmentPlanMain] pacienteActivo:", pacienteActivo);
  const { notify } = useNotification();

  // Estados de paginación y búsqueda
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  // Estados de modales
  const {
    isOpen: isCreateModalOpen,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();

  const {
    isOpen: isViewModalOpen,
    openModal: openViewModal,
    closeModal: closeViewModal,
  } = useModal();

  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  // Estados de selección
  const [selectedPlan, setSelectedPlan] = useState<PlanTratamientoListResponse | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanTratamientoListResponse | null>(null);

  // Hooks de datos
  const pacienteId = pacienteActivo?.id || null;
  const pacienteNombreCompleto = pacienteActivo
    ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
    : null;

const { planes, pagination, isLoading, isError, error } = usePlanesTratamiento(
  pacienteActivo?.id ?? null,
  page,
  pageSize,
  ""
);

  const deletePlanMutation = useDeletePlanTratamiento(pacienteId);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateClick = () => {
    setSelectedPlan(null);
    openCreateModal();
  };

  const handleViewClick = (plan: PlanTratamientoListResponse) => {
    setSelectedPlan(plan);
    openViewModal();
  };

  const handleEditClick = (plan: PlanTratamientoListResponse) => {
    setSelectedPlan(plan);
    openCreateModal();
  };

  const handleDeleteClick = (plan: PlanTratamientoListResponse) => {
    setPlanToDelete(plan);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      notify({
        type: "success",
        title: "Plan eliminado",
        message: `El plan "${planToDelete.titulo}" se eliminó correctamente.`,
      });
      closeDeleteModal();
      setPlanToDelete(null);
    } catch (err) {
      notify({
        type: "error",
        title: "Error al eliminar",
        message: err instanceof Error ? err.message : "No se pudo eliminar el plan.",
      });
    }
  };

  const handlePlanCreatedOrUpdated = () => {
    closeCreateModal();
    setSelectedPlan(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset a primera página al buscar
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="treatment-plan-main-container">
      {/* ======================================================================
          HEADER
      ====================================================================== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
            <FileText className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {pacienteActivo
                ? `Planes de tratamiento de ${pacienteNombreCompleto}`
                : "Planes de tratamiento"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pacienteActivo
                ? "Gestiona los planes de tratamiento del paciente"
                : "Administra los planes de tratamiento de todos los pacientes"}
            </p>
          </div>
        </div>

        {pacienteActivo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Solo se muestran planes del paciente activo seleccionado en la gestión de pacientes.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================
          BARRA DE ACCIONES
      ====================================================================== */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o paciente..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Botón crear */}
        <Button
          variant="primary"
          onClick={handleCreateClick}
          className="whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear plan
        </Button>
      </div>

      {/* ======================================================================
          CONTENIDO PRINCIPAL
      ====================================================================== */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">
            Cargando planes de tratamiento...
          </span>
        </div>
      ) : isError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200 font-semibold">
            Error al cargar los planes
          </p>
          <p className="text-red-600 dark:text-red-400 mt-2">
            {error || "Error desconocido"}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla de planes */}
          <TreatmentPlanTable
            planes={planes}
            onViewClick={handleViewClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />

          {/* Paginación */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Mostrando página <span className="font-semibold">{pagination.page}</span> de{" "}
                <span className="font-semibold">{pagination.total_pages}</span>, {pagination.count}{" "}
                registros totales
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.has_previous}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.has_next}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================================
          MODALES
      ====================================================================== */}
      {/* Modal Crear/Editar */}
      {isCreateModalOpen && (
        <TreatmentPlanCreateEditModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          mode={selectedPlan ? "edit" : "create"}
          planId={selectedPlan?.id}
          pacienteId={pacienteId}
          pacienteNombreCompleto={pacienteNombreCompleto}
          onSuccess={handlePlanCreatedOrUpdated}
        />
      )}

      {/* Modal Ver Detalle */}
      {isViewModalOpen && selectedPlan && (
        <TreatmentPlanViewModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          planId={selectedPlan.id}
        />
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && planToDelete && (
        <TreatmentPlanDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          plan={planToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={deletePlanMutation.isPending}
        />
      )}
    </div>
  );
}
