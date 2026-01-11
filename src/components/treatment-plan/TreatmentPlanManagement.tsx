// src/components/odontogram/treatmentPlan/TreatmentPlanManagement.tsx

import { useState } from "react";
import { useNotification } from "../../context/notifications/NotificationContext";
import { useModal } from "../../hooks/useModal";
import type { PlanTratamientoDetailResponse, PlanTratamientoListResponse, SesionTratamientoListResponse } from "../../types/treatmentPlan/typeBackendTreatmentPlan";
import { useDeletePlanTratamiento, usePlanesTratamiento, usePlanTratamiento } from "../../hooks/treatmentPlan/useTreatmentPlan";
import { useDeleteSesionTratamiento, useSesionesTratamiento } from "../../hooks/treatmentPlan/useTreatmentSession";
import { ArrowLeft, Calendar, FileText, Plus } from "lucide-react";
import Button from "../ui/button/Button";
import TreatmentPlanTable from "./table/TreatmentPlanTable";
import SessionTable from "./table/SessionTable";
import TreatmentPlanCreateEditModal from "./modals/TreatmentPlanCreateEditModal";
import TreatmentPlanViewModal from "./modals/TreatmentPlanViewModal";
import TreatmentPlanDeleteModal from "./modals/TreatmentPlanDeleteModal";
import SessionCreateEditModal from "./modals/SessionCreateEditModal";
import SessionDeleteModal from "./modals/SessionDeleteModal";
import SessionViewModal from "./modals/SessionViewModal";
import { usePacienteActivo } from "../../context/PacienteContext";
// ============================================================================
// COMPONENT
// ============================================================================

export default function TreatmentPlanManagement() {
    // Contextos
    const { pacienteActivo } = usePacienteActivo();
    const { notify } = useNotification();

    // Estados de navegación
    const [vistaActual, setVistaActual] = useState<"planes" | "sesiones">("planes");
    const [planSeleccionadoId, setPlanSeleccionadoId] = useState<string | null>(null);
    const [planSeleccionado, setPlanSeleccionado] = useState<PlanTratamientoDetailResponse | null>(null);

    // Estados de paginación
    const [pagePlanes, setPagePlanes] = useState(1);
    const [pageSesiones, setPageSesiones] = useState(1);
    const [pageSize] = useState(10);

    // Estados de modales - PLANES
    const {
        isOpen: isCreatePlanModalOpen,
        openModal: openCreatePlanModal,
        closeModal: closeCreatePlanModal,
    } = useModal();

    const {
        isOpen: isViewPlanModalOpen,
        openModal: openViewPlanModal,
        closeModal: closeViewPlanModal,
    } = useModal();

    const {
        isOpen: isDeletePlanModalOpen,
        openModal: openDeletePlanModal,
        closeModal: closeDeletePlanModal,
    } = useModal();

    // Estados de modales - SESIONES
    const {
        isOpen: isCreateSesionModalOpen,
        openModal: openCreateSesionModal,
        closeModal: closeCreateSesionModal,
    } = useModal();

    const {
        isOpen: isViewSesionModalOpen,
        openModal: openViewSesionModal,
        closeModal: closeViewSesionModal,
    } = useModal();

    const {
        isOpen: isDeleteSesionModalOpen,
        openModal: openDeleteSesionModal,
        closeModal: closeDeleteSesionModal,
    } = useModal();

    // Estados de selección
    const [selectedPlan, setSelectedPlan] = useState<PlanTratamientoListResponse | null>(null);
    const [planToDelete, setPlanToDelete] = useState<PlanTratamientoListResponse | null>(null);
    const [selectedSesion, setSelectedSesion] = useState<SesionTratamientoListResponse | null>(null);
    const [sesionToDelete, setSesionToDelete] = useState<SesionTratamientoListResponse | null>(null);

    // Hooks de datos
    const pacienteId = pacienteActivo?.id || null;
    const pacienteNombreCompleto = pacienteActivo
        ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
        : null;

    // Planes
    const {
        planes,
        pagination: paginationPlanes,
        isLoading: isLoadingPlanes,
        isError: isErrorPlanes,
        error: errorPlanes,
    } = usePlanesTratamiento(pacienteActivo?.id ?? null, pagePlanes, pageSize, "");

    const deletePlanMutation = useDeletePlanTratamiento(pacienteId);

    // Plan seleccionado
    const { data: planDetalle } = usePlanTratamiento(planSeleccionadoId);
    const pageSizeSesiones = 10;
    // Sesiones del plan seleccionado
    const {
        sesiones,
        pagination: paginationSesiones,
        isLoading: isLoadingSesiones,
        isError: isErrorSesiones,
        error: errorSesiones,
    } = useSesionesTratamiento(
        planSeleccionadoId,  
        pageSesiones,
        pageSizeSesiones,
        pacienteActivo?.id,
    );

    const deleteSesionMutation = useDeleteSesionTratamiento(planSeleccionadoId || "");

    // ============================================================================
    // HANDLERS - PLANES
    // ============================================================================

    const handleCreatePlanClick = () => {
        setSelectedPlan(null);
        openCreatePlanModal();
    };

    const handleViewPlanClick = (plan: PlanTratamientoListResponse) => {
        setSelectedPlan(plan);
        openViewPlanModal();
    };

    const handleEditPlanClick = (plan: PlanTratamientoListResponse) => {
        setSelectedPlan(plan);
        openCreatePlanModal();
    };

    const handleDeletePlanClick = (plan: PlanTratamientoListResponse) => {
        setPlanToDelete(plan);
        openDeletePlanModal();
    };

    const handleConfirmDeletePlan = async () => {
        if (!planToDelete) return;

        try {
            await deletePlanMutation.mutateAsync(planToDelete.id);
            notify({
                type: "success",
                title: "Plan eliminado",
                message: `El plan "${planToDelete.titulo}" se eliminó correctamente.`,
            });
            closeDeletePlanModal();
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
        closeCreatePlanModal();
        setSelectedPlan(null);
    };

    const handleVerSesionesClick = (plan: PlanTratamientoListResponse) => {
        setPlanSeleccionadoId(plan.id);
        setVistaActual("sesiones");
        setPageSesiones(1);
    };

    // ============================================================================
    // HANDLERS - SESIONES
    // ============================================================================

    const handleVolverAPlanes = () => {
        setVistaActual("planes");
        setPlanSeleccionadoId(null);
        setPageSesiones(1);
    };

    const handleCreateSesionClick = () => {
        setSelectedSesion(null);
        openCreateSesionModal();
    };

    const handleViewSesionClick = (sesion: SesionTratamientoListResponse) => {
        setSelectedSesion(sesion);
        openViewSesionModal();
    };

    const handleEditSesionClick = (sesion: SesionTratamientoListResponse) => {
        setSelectedSesion(sesion);
        openCreateSesionModal();
    };

    const handleDeleteSesionClick = (sesion: SesionTratamientoListResponse) => {
        setSesionToDelete(sesion);
        openDeleteSesionModal();
    };

    const handleConfirmDeleteSesion = async () => {
        if (!sesionToDelete) return;

        try {
            await deleteSesionMutation.mutateAsync(sesionToDelete.id);
            notify({
                type: "success",
                title: "Sesión eliminada",
                message: `La sesión #${sesionToDelete.numero_sesion} se eliminó correctamente.`,
            });
            closeDeleteSesionModal();
            setSesionToDelete(null);
        } catch (err) {
            notify({
                type: "error",
                title: "Error al eliminar",
                message: err instanceof Error ? err.message : "No se pudo eliminar la sesión.",
            });
        }
    };

    const handleSesionCreatedOrUpdated = () => {
        closeCreateSesionModal();
        setSelectedSesion(null);
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div className="treatment-plan-management-container">
            {/* ======================================================================
          VISTA DE PLANES
      ====================================================================== */}
            {vistaActual === "planes" && (
                <>
                    {/* Header */}
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
                                    Solo se muestran planes del paciente activo. Haga clic en "Ver sesiones" para
                                    gestionar las sesiones de tratamiento de cada plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Barra de acciones */}
                    <div className="flex justify-end mb-6">
                        <Button variant="primary" onClick={handleCreatePlanClick}>
                            <Plus className="w-5 h-5 mr-2" />
                            Crear plan
                        </Button>
                    </div>

                    {/* Contenido */}
                    {isLoadingPlanes ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                            <span className="ml-4 text-gray-600 dark:text-gray-400">
                                Cargando planes de tratamiento...
                            </span>
                        </div>
                    ) : isErrorPlanes ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                            <p className="text-red-800 dark:text-red-200 font-semibold">
                                Error al cargar los planes
                            </p>
                            <p className="text-red-600 dark:text-red-400 mt-2">
                                {errorPlanes || "Error desconocido"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <TreatmentPlanTable
                                planes={planes}
                                onViewClick={handleViewPlanClick}
                                onEditClick={handleEditPlanClick}
                                onDeleteClick={handleDeletePlanClick}
                                onViewSessionsClick={handleVerSesionesClick}
                            />

                            {paginationPlanes && paginationPlanes.total_pages > 1 && (
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p>
                                        Mostrando página <span className="font-semibold">{paginationPlanes.page}</span>{" "}
                                        de <span className="font-semibold">{paginationPlanes.total_pages}</span>,{" "}
                                        {paginationPlanes.count} registros totales
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPagePlanes(pagePlanes - 1)}
                                            disabled={!paginationPlanes.has_previous}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPagePlanes(pagePlanes + 1)}
                                            disabled={!paginationPlanes.has_next}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ======================================================================
          VISTA DE SESIONES
      ====================================================================== */}
            {vistaActual === "sesiones" && (
                <>
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            onClick={handleVolverAPlanes}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a planes
                        </Button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                                <Calendar className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Sesiones de tratamiento
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {planDetalle
                                        ? `Plan: ${planDetalle.titulo}`
                                        : "Gestiona las sesiones del plan seleccionado"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Las sesiones representan las visitas o procedimientos programados dentro del plan de
                                tratamiento seleccionado.
                            </p>
                        </div>
                    </div>

                    {/* Barra de acciones */}
                    <div className="flex justify-end mb-6">
                        <Button variant="primary" onClick={handleCreateSesionClick}>
                            <Plus className="w-5 h-5 mr-2" />
                            Crear sesión
                        </Button>
                    </div>

                    {/* Contenido */}
                    {isLoadingSesiones ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                            <span className="ml-4 text-gray-600 dark:text-gray-400">
                                Cargando sesiones...
                            </span>
                        </div>
                    ) : isErrorSesiones ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                            <p className="text-red-800 dark:text-red-200 font-semibold">
                                Error al cargar las sesiones
                            </p>
                            <p className="text-red-600 dark:text-red-400 mt-2">
                                {errorSesiones || "Error desconocido"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <SessionTable
                                sesiones={sesiones}
                                onViewClick={handleViewSesionClick}
                                onEditClick={handleEditSesionClick}
                                onDeleteClick={handleDeleteSesionClick}
                            />

                            {paginationSesiones && paginationSesiones.total_pages > 1 && (
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p>
                                        Mostrando página{" "}
                                        <span className="font-semibold">{paginationSesiones.page}</span> de{" "}
                                        <span className="font-semibold">{paginationSesiones.total_pages}</span>,{" "}
                                        {paginationSesiones.count} registros totales
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPageSesiones(pageSesiones - 1)}
                                            disabled={!paginationSesiones.has_previous}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPageSesiones(pageSesiones + 1)}
                                            disabled={!paginationSesiones.has_next}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ======================================================================
          MODALES - PLANES
      ====================================================================== */}
            {isCreatePlanModalOpen && (
                <TreatmentPlanCreateEditModal
                    isOpen={isCreatePlanModalOpen}
                    onClose={closeCreatePlanModal}
                    mode={selectedPlan ? "edit" : "create"}
                    planId={selectedPlan?.id}
                    pacienteId={pacienteId}
                    pacienteNombreCompleto={pacienteNombreCompleto}
                    onSuccess={handlePlanCreatedOrUpdated}
                />
            )}

            {isViewPlanModalOpen && selectedPlan && (
                <TreatmentPlanViewModal
                    isOpen={isViewPlanModalOpen}
                    onClose={closeViewPlanModal}
                    planId={selectedPlan.id}
                />
            )}

            {isDeletePlanModalOpen && planToDelete && (
                <TreatmentPlanDeleteModal
                    isOpen={isDeletePlanModalOpen}
                    onClose={closeDeletePlanModal}
                    plan={planToDelete}
                    onConfirm={handleConfirmDeletePlan}
                    isDeleting={deletePlanMutation.isPending}
                />
            )}

            {/* ======================================================================
          MODALES - SESIONES
      ====================================================================== */}
            {isCreateSesionModalOpen && planSeleccionadoId && (
                <SessionCreateEditModal
                    isOpen={isCreateSesionModalOpen}
                    onClose={closeCreateSesionModal}
                    mode={selectedSesion ? "edit" : "create"}
                    planId={planSeleccionadoId}
                    sesionId={selectedSesion?.id}
                    onSuccess={handleSesionCreatedOrUpdated}
                />
            )}

            {isViewSesionModalOpen && selectedSesion && (
                <SessionViewModal
                    isOpen={isViewSesionModalOpen}
                    onClose={closeViewSesionModal}
                    sesionId={selectedSesion.id}
                />
            )}

            {isDeleteSesionModalOpen && sesionToDelete && (
                <SessionDeleteModal
                    isOpen={isDeleteSesionModalOpen}
                    onClose={closeDeleteSesionModal}
                    sesion={sesionToDelete}
                    onConfirm={handleConfirmDeleteSesion}
                    isDeleting={deleteSesionMutation.isPending}
                />
            )}
        </div>
    );
}
