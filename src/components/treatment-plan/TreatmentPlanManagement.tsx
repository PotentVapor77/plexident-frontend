// src/components/odontogram/treatmentPlan/TreatmentPlanManagement.tsx

import { useState } from "react";
import { useNotification } from "../../context/notifications/NotificationContext";
import { useModal } from "../../hooks/useModal";
import type { PlanTratamientoDetailResponse, PlanTratamientoListResponse, SesionTratamientoListResponse } from "../../types/treatmentPlan/typeBackendTreatmentPlan";
import { useDeletePlanTratamiento, usePlanesTratamiento, usePlanTratamiento } from "../../hooks/treatmentPlan/useTreatmentPlan";
import { useDeleteSesionTratamiento, useSesionesTratamiento } from "../../hooks/treatmentPlan/useTreatmentSession";
import { ArrowLeft, Calendar, FileText, Plus, User, Users } from "lucide-react";
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
        refetch: refetchPlanes,
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
        refetchPlanes();
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
                        <div className="flex items-start justify-between gap-4">
                            {/* Título + descripciones */}
                            <div className="flex items-start gap-4">
                                {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                                    <FileText className="h-6 w-6" />
                                </div> */}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Planes de Tratamiento
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {pacienteActivo
                                            ? `Gestión de planes para ${pacienteNombreCompleto}`
                                            : "Administra los planes de tratamiento de todos los pacientes"}
                                    </p>
                                    
                                    {pacienteActivo && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
                                            <User className="h-3 w-3" />
                                            <span>Paciente activo seleccionado</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Button 
                                    variant="primary" 
                                    onClick={handleCreatePlanClick}
                                    className="inline-flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Crear plan
                                </Button>
                            </div>
                        </div>

                        {pacienteActivo && (
                            <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <span className="font-medium">Nota:</span> Solo se muestran planes del paciente activo. 
                                    Haga clic en <span className="font-semibold">"Sesiones"</span> para gestionar 
                                    las sesiones de tratamiento de cada plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contenido */}
                    {isLoadingPlanes ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 py-12 dark:border-gray-700">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
                            <span className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Cargando planes de tratamiento...
                            </span>
                        </div>
                    ) : isErrorPlanes ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                            <p className="font-semibold text-red-800 dark:text-red-200">
                                Error al cargar los planes
                            </p>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
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
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Mostrando página <span className="font-semibold">{paginationPlanes.page}</span>{" "}
                                        de <span className="font-semibold">{paginationPlanes.total_pages}</span>,{" "}
                                        <span className="font-semibold">{paginationPlanes.count}</span> registros totales
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagePlanes(pagePlanes - 1)}
                                            disabled={!paginationPlanes.has_previous}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
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
                        {/* Botón volver */}
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleVolverAPlanes}
                                className="inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver a planes
                            </Button>
                        </div>

                        {/* Título + texto + botón Crear sesión */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Sesiones de Tratamiento
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {planDetalle
                                            ? `Plan: "${planDetalle.titulo}"`
                                            : "Gestión de sesiones del plan seleccionado"}
                                    </p>
                                    {pacienteActivo && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Users className="h-3 w-3" />
                                            <span>{pacienteNombreCompleto}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Button 
                                    variant="primary" 
                                    onClick={handleCreateSesionClick}
                                    className="inline-flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Crear sesión
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <span className="font-medium">Nota:</span> Las sesiones representan las visitas o procedimientos programados
                                dentro del plan de tratamiento seleccionado.
                            </p>
                        </div>
                    </div>

                    {/* Contenido */}
                    {isLoadingSesiones ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 py-12 dark:border-gray-700">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
                            <span className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Cargando sesiones...
                            </span>
                        </div>
                    ) : isErrorSesiones ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                            <p className="font-semibold text-red-800 dark:text-red-200">
                                Error al cargar las sesiones
                            </p>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
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
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Mostrando página{" "}
                                        <span className="font-semibold">{paginationSesiones.page}</span> de{" "}
                                        <span className="font-semibold">{paginationSesiones.total_pages}</span>,{" "}
                                        <span className="font-semibold">{paginationSesiones.count}</span> registros totales
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPageSesiones(pageSesiones - 1)}
                                            disabled={!paginationSesiones.has_previous}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
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