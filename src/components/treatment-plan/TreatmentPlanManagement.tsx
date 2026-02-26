// src/components/odontogram/treatmentPlan/TreatmentPlanManagement.tsx

import { useState, useMemo, useEffect } from "react";
import { useNotification } from "../../context/notifications/NotificationContext";
import { useModal } from "../../hooks/useModal";
import type { PlanTratamientoListResponse, SesionTratamientoListResponse } from "../../types/treatmentPlan/typeBackendTreatmentPlan";
import { useDeletePlanTratamiento, usePlanesTratamiento, usePlanTratamiento } from "../../hooks/treatmentPlan/useTreatmentPlan";
import { useDeleteSesionTratamiento, useSesionesTratamiento } from "../../hooks/treatmentPlan/useTreatmentSession";
import {
    ArrowLeft,
    Plus,
    User,
    Activity,
    AlertCircle,
} from "lucide-react";
import TreatmentPlanTable from "./table/TreatmentPlanTable";
import SessionTable from "./table/SessionTable";
import TreatmentPlanCreateEditModal from "./modals/TreatmentPlanCreateEditModal";
import TreatmentPlanViewModal from "./modals/TreatmentPlanViewModal";
import TreatmentPlanDeleteModal from "./modals/TreatmentPlanDeleteModal";
import SessionCreateEditModal from "./modals/SessionCreateEditModal";
import SessionDeleteModal from "./modals/SessionDeleteModal";
import SessionViewModal from "./modals/SessionViewModal";
import { usePacienteActivo } from "../../context/PacienteContext";
import { Pagination, SearchBar, type PaginationState } from "../ui/pagination";

// ============================================================================
// COMPONENT - Adaptado al estilo de IndicatorsMain
// ============================================================================

export default function TreatmentPlanManagement() {
    // Contextos
    const { pacienteActivo } = usePacienteActivo();
    const { notify } = useNotification();

    // Estados de navegación
    const [vistaActual, setVistaActual] = useState<"planes" | "sesiones">("planes");
    const [planSeleccionadoId, setPlanSeleccionadoId] = useState<string | null>(null);

    // Estados de paginación
    const [pagePlanes, setPagePlanes] = useState(1);
    const [pageSesiones, setPageSesiones] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [pageSizeSesiones, setPageSizeSesiones] = useState(10);
    const [searchPlanesInput, setSearchPlanesInput] = useState("");
    const [searchSesionesInput, setSearchSesionesInput] = useState("");
    // Estados de búsqueda
    const [searchPlanes, setSearchPlanes] = useState("");
    const [searchSesiones, setSearchSesiones] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchPlanes(searchPlanesInput);
            setPagePlanes(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchPlanesInput]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchSesiones(searchSesionesInput);
            setPageSesiones(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchSesionesInput]);
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
    } = usePlanesTratamiento(pacienteActivo?.id ?? null, pagePlanes, pageSize, searchPlanes);

    const deletePlanMutation = useDeletePlanTratamiento(pacienteId);

    // Plan seleccionado
    const { data: planDetalle } = usePlanTratamiento(planSeleccionadoId);

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
        undefined,         
        searchSesiones, 
    );
    const deleteSesionMutation = useDeleteSesionTratamiento(planSeleccionadoId || "");

    // Normalizar paginación para planes
    const paginationPlanesNormalized = useMemo((): PaginationState => {
        if (!paginationPlanes) return { count: 0, page: pagePlanes, pageSize, totalPages: 1, hasNext: false, hasPrevious: false };
        return {
            count: paginationPlanes.count,
            page: paginationPlanes.page,
            pageSize: paginationPlanes.page_size,
            totalPages: paginationPlanes.total_pages,
            hasNext: paginationPlanes.has_next,
            hasPrevious: paginationPlanes.has_previous,
        };
    }, [paginationPlanes, pagePlanes, pageSize]);

    // Normalizar paginación para sesiones
    const paginationSesionesNormalized = useMemo((): PaginationState => {
        if (!paginationSesiones) return { count: 0, page: pageSesiones, pageSize: pageSizeSesiones, totalPages: 1, hasNext: false, hasPrevious: false };
        return {
            count: paginationSesiones.count,
            page: paginationSesiones.page,
            pageSize: paginationSesiones.page_size,
            totalPages: paginationSesiones.total_pages,
            hasNext: paginationSesiones.has_next,
            hasPrevious: paginationSesiones.has_previous,
        };
    }, [paginationSesiones, pageSesiones, pageSizeSesiones]);

    // ============================================================================
    // HANDLERS - PLANES
    // ============================================================================

    const handleCreatePlanClick = () => {
        if (!pacienteActivo) {
            notify({
                type: "warning",
                title: "Paciente no fijado",
                message: "Para crear un plan de tratamiento, primero debe fijar un paciente desde la vista principal de Gestión de Pacientes.",
            });
            return;
        }
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

    const handlePagePlanesChange = (newPage: number) => {
        setPagePlanes(newPage);
    };

    const handlePageSizePlanesChange = (newSize: number) => {
        setPageSize(newSize);
        setPagePlanes(1);
    };

    const handleSearchPlanes = (value: string) => {
        setSearchPlanesInput(value);
        // NO resetear página aquí — el useEffect lo hace tras el debounce
    };

    const handleSearchSesiones = (value: string) => {
        setSearchSesionesInput(value);
    };

    const handlePageSizeSesionesChange = (newSize: number) => {
        setPageSizeSesiones(newSize);
        setPageSesiones(1);
    };


    // ============================================================================
    // HANDLERS - SESIONES
    // ============================================================================

    const handleVolverAPlanes = () => {
        setVistaActual("planes");
        setPlanSeleccionadoId(null);
        setPageSesiones(1);
        setSearchSesiones("");
        setSearchSesionesInput("");
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

    const handlePageSesionesChange = (newPage: number) => {
        setPageSesiones(newPage);
    };

    // ============================================================================
    // COMPONENTE PARA PACIENTE FIJADO (estilo IndicatorsMain)
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
                                    Mostrando planes del paciente:
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
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total: {paginationPlanesNormalized.count} {paginationPlanesNormalized.count === 1 ? 'plan' : 'planes'}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================================
    // ALERTA SIN PACIENTE (estilo IndicatorsMain)
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
                        <strong>Nota:</strong> Para crear o gestionar planes de tratamiento, primero debe fijar un paciente desde la vista principal de 'Gestión de Pacientes'.
                    </p>
                </div>
            </div>
        </div>
    );

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div className="mb-8">
            {/* ======================================================================
            VISTA DE PLANES
            ====================================================================== */}
            {vistaActual === "planes" && (
                <>
                    {/* Header - Estilo IndicatorsMain */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Planes de Tratamiento
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                                Administra los planes de tratamiento y sus sesiones asociadas
                            </p>
                        </div>

                        <button
                            onClick={handleCreatePlanClick}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!pacienteActivo}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Plan
                        </button>
                    </div>

                    {/* Información del paciente fijado */}
                    {pacienteActivo && <PacienteFijadoInfo />}

                    {/* Alerta si no hay paciente fijado */}
                    {!pacienteActivo && <SinPacienteAlerta />}

                    {/* Loading State */}
                    {isLoadingPlanes && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Cargando planes de tratamiento...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {isErrorPlanes && (
                        <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-error-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
                                        Error al cargar planes
                                    </h3>
                                    <p className="mt-2 text-sm text-error-700 dark:text-error-300">
                                        {errorPlanes || "Error desconocido"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabla de Planes */}
                    {!isErrorPlanes && (
                        <div className="mt-4 space-y-4">
                            <SearchBar
                                value={searchPlanesInput}
                                onChange={handleSearchPlanes}
                                placeholder="Buscar por título, paciente, odontólogo..."
                            />
                            {isLoadingPlanes ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Cargando planes de tratamiento...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <TreatmentPlanTable
                                        planes={planes}
                                        totalCount={paginationPlanesNormalized.count}
                                        onViewClick={handleViewPlanClick}
                                        onEditClick={handleEditPlanClick}
                                        onDeleteClick={handleDeletePlanClick}
                                        onViewSessionsClick={handleVerSesionesClick}
                                    />
                                    <Pagination
                                        pagination={paginationPlanesNormalized}
                                        pageSize={pageSize}
                                        onPageChange={(newPage) => {
                                            handlePagePlanesChange(newPage);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        onPageSizeChange={handlePageSizePlanesChange}
                                        isLoading={isLoadingPlanes}
                                        entityLabel="planes"
                                    />
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ======================================================================
            VISTA DE SESIONES
            ====================================================================== */}
            {vistaActual === "sesiones" && (
                <>
                    {/* Header con botón volver */}
                    <div className="mb-6">
                        <button
                            onClick={handleVolverAPlanes}
                            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a planes
                        </button>

                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    Sesiones de Tratamiento
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                                    {planDetalle
                                        ? `Plan: "${planDetalle.titulo}"`
                                        : "Gestión de sesiones del plan seleccionado"}
                                </p>
                                {pacienteActivo && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <User className="h-3 w-3" />
                                        <span>{pacienteNombreCompleto}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCreateSesionClick}
                                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Sesión
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingSesiones && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Cargando sesiones...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {isErrorSesiones && (
                        <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-error-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
                                        Error al cargar sesiones
                                    </h3>
                                    <p className="mt-2 text-sm text-error-700 dark:text-error-300">
                                        {errorSesiones || "Error desconocido"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabla de Sesiones */}
                    {!isErrorSesiones && (
                        <div className="mt-4 space-y-4">
                            <SearchBar
                                value={searchSesionesInput}
                                onChange={handleSearchSesiones}
                                placeholder="Buscar por estado, odontólogo, notas..."
                            />
                            {isLoadingSesiones ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Cargando sesiones...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <SessionTable
                                        sesiones={sesiones}
                                        totalCount={paginationSesionesNormalized.count}
                                        onViewClick={handleViewSesionClick}
                                        onEditClick={handleEditSesionClick}
                                        onDeleteClick={handleDeleteSesionClick}
                                    />
                                    <Pagination
                                        pagination={paginationSesionesNormalized}
                                        pageSize={pageSizeSesiones}
                                        onPageChange={(newPage) => {
                                            handlePageSesionesChange(newPage);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        onPageSizeChange={handlePageSizeSesionesChange}
                                        isLoading={isLoadingSesiones}
                                        entityLabel="sesiones"
                                    />
                                </>
                            )}
                        </div>
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