// src/components/clinicalRecord/ClinicalRecordManagement.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
    FileText,
    Filter,
    Calendar,
    X,
    AlertCircle,
    Activity,
} from "lucide-react";
import ClinicalRecordTable from "./table/ClinicalRecordTable";
import ClinicalRecordViewModal from "./modals/ClinicalRecordViewModal";
import ClinicalRecordCreateEditModal from "./modals/ClinicalRecordCreateEditModal";
import ClinicalRecordDeleteModal from "./modals/ClinicalRecordDeleteModal";
import ClinicalRecordCloseModal from "./modals/ClinicalRecordCloseModal";
import { usePacienteActivo } from "../../context/PacienteContext";
import { useNotification } from "../../context/notifications/NotificationContext";
import type { ClinicalRecordListResponse } from "../../types/clinicalRecords/typeBackendClinicalRecord";
import {
    useClinicalRecords,
    useClinicalRecordsByPaciente,
    useDeleteClinicalRecord,
} from "../../hooks/clinicalRecord/useClinicalRecords";
import { useDebounce } from "../../hooks/useDebounce";

/**
 * ============================================================================
 * COMPONENT - CLINICAL RECORD MANAGEMENT
 * ============================================================================
 */
const ClinicalRecordManagement: React.FC = () => {
    const { pacienteActivo } = usePacienteActivo();
    const { notify } = useNotification();

    // ==========================================================================
    // ESTADOS LOCALES
    // ==========================================================================
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [fechaDesde, setFechaDesde] = useState<string>("");
    const [fechaHasta, setFechaHasta] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    // Modales
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<ClinicalRecordListResponse | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    // ==========================================================================
    // HOOKS DE DATOS
    // ==========================================================================
    const {
        historiales: historialesPaciente,
        isLoading: isLoadingPaciente,
        error: errorPaciente,
        refetch: refetchPaciente,
    } = useClinicalRecordsByPaciente(pacienteActivo?.id || null);

    const {
        historiales: historialesGeneral,
        pagination,
        isLoading: isLoadingGeneral,
        error: errorGeneral,
        refetch: refetchGeneral,
    } = useClinicalRecords({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchTerm,
        estado: estadoFilter,
        activo: true,
        ...(fechaDesde && { fecha_desde: fechaDesde }),
        ...(fechaHasta && { fecha_hasta: fechaHasta }),
    });

    const deleteMutation = useDeleteClinicalRecord(pacienteActivo?.id || null);

    // ==========================================================================
    // FILTRADO Y PAGINACIÓN LOCAL (modo paciente fijado)
    // ==========================================================================
    const historialesPacienteFiltrados = useMemo(() => {
        if (!pacienteActivo) return historialesPaciente;

        let result = [...historialesPaciente] as any[];

        // Búsqueda
        if (debouncedSearchTerm) {
            const q = debouncedSearchTerm.toLowerCase();
            result = result.filter((r) => {
                const fields = [
                    r.motivo_consulta,
                    r.enfermedad_actual,
                    r.observaciones,
                    r.numero_historia_clinica_unica,
                    r.numero_archivo,
                    r.odontologo_nombre,
                    r.odontologo_nombres,
                    r.odontologo_apellidos,
                ].map((v) => (v || "").toString().toLowerCase());
                return fields.some((f) => f.includes(q));
            });
        }

        // Filtro estado
        if (estadoFilter) {
            result = result.filter((r) => r.estado === estadoFilter);
        }

        // Filtro fecha desde
        if (fechaDesde) {
            result = result.filter(
                (r) => r.fecha_atencion && r.fecha_atencion >= fechaDesde
            );
        }

        // Filtro fecha hasta
        if (fechaHasta) {
            result = result.filter(
                (r) => r.fecha_atencion && r.fecha_atencion <= fechaHasta
            );
        }

        return result;
    }, [
        pacienteActivo,
        historialesPaciente,
        debouncedSearchTerm,
        estadoFilter,
        fechaDesde,
        fechaHasta,
    ]);

    // Paginación local para modo paciente fijado
    const paginacionLocal = useMemo(() => {
        if (!pacienteActivo) return null;
        const total = historialesPacienteFiltrados.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(currentPage, totalPages);
        const start = (safePage - 1) * pageSize;
        const items = historialesPacienteFiltrados.slice(start, start + pageSize);
        return {
            items,
            pagination: {
                count: total,
                page: safePage,
                pageSize,
                totalPages,
                hasNext: safePage < totalPages,
                hasPrevious: safePage > 1,
            },
        };
    }, [pacienteActivo, historialesPacienteFiltrados, currentPage, pageSize]);

    // ==========================================================================
    // SELECCIÓN DE DATOS SEGÚN MODO
    // ==========================================================================
    const historiales = pacienteActivo
        ? (paginacionLocal?.items ?? [])
        : historialesGeneral;

    const isLoading = pacienteActivo ? isLoadingPaciente : isLoadingGeneral;
    const error = pacienteActivo ? errorPaciente : errorGeneral;
    const refetch = pacienteActivo ? refetchPaciente : refetchGeneral;

    // Paginación unificada
    const paginationNormalized = pacienteActivo
        ? paginacionLocal?.pagination
        : pagination
        ? {
              count: pagination.count,
              page: pagination.page,
              pageSize: pagination.page_size,
              totalPages: pagination.total_pages,
              hasNext: pagination.has_next,
              hasPrevious: pagination.has_previous,
          }
        : undefined;

    // ==========================================================================
    // FILTROS ACTIVOS
    // ==========================================================================
    const hasActiveFilters = useMemo(
        () => !!(searchTerm || estadoFilter || fechaDesde || fechaHasta),
        [searchTerm, estadoFilter, fechaDesde, fechaHasta]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (estadoFilter) count++;
        if (fechaDesde || fechaHasta) count++;
        return count;
    }, [searchTerm, estadoFilter, fechaDesde, fechaHasta]);

    // Reiniciar página al cambiar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, estadoFilter, fechaDesde, fechaHasta, pageSize]);

    // Reiniciar página al cambiar de modo (paciente fijado / global)
    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm("");
        setEstadoFilter("");
        setFechaDesde("");
        setFechaHasta("");
    }, [pacienteActivo?.id]);

    // ==========================================================================
    // HANDLERS - MODALES
    // ==========================================================================
    const handleViewClick = (record: ClinicalRecordListResponse) => {
        setSelectedRecord(record);
        setViewModalOpen(true);
    };

    const handleEditClick = (record: ClinicalRecordListResponse) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (record: ClinicalRecordListResponse) => {
        setSelectedRecord(record);
        setDeleteModalOpen(true);
    };

    const handleCloseClick = (record: ClinicalRecordListResponse) => {
        setSelectedRecord(record);
        setCloseModalOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedRecord(null);
        setEditModalOpen(true);
    };

    const handleModalClose = () => {
        setViewModalOpen(false);
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setCloseModalOpen(false);
        setSelectedRecord(null);
    };

    const handleSuccess = () => {
        refetch();
        handleModalClose();
    };

    // ==========================================================================
    // HANDLER - ELIMINACIÓN
    // ==========================================================================
    const handleDeleteConfirm = async () => {
        if (!selectedRecord) return;

        try {
            await deleteMutation.mutateAsync(selectedRecord.id);
            notify({
                type: "success",
                title: "Historial eliminado",
                message: "El historial clínico se eliminó correctamente del sistema.",
            });
            handleSuccess();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Error al eliminar el historial clínico";
            notify({
                type: "error",
                title: "Error al eliminar",
                message: errorMessage,
            });
        }
    };

    // ==========================================================================
    // HANDLERS - BÚSQUEDA Y PAGINACIÓN
    // ==========================================================================
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setEstadoFilter("");
        setFechaDesde("");
        setFechaHasta("");
        setCurrentPage(1);
    };

    // ==========================================================================
    // LOADING STATE
    // ==========================================================================
    if (isLoading && !historiales.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cargando historiales clínicos...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================================================
    // ERROR STATE
    // ==========================================================================
    if (error && !historiales.length) {
        return (
            <div className="rounded-lg bg-error-50 dark:bg-error-900/20 p-4 border border-error-200 dark:border-error-800">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-error-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
                            Error al cargar historiales clínicos
                        </h3>
                        <p className="mt-2 text-sm text-error-700 dark:text-error-300">
                            {error}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="mt-3 text-sm text-error-700 dark:text-error-300 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================================================
    // SUB-COMPONENTES LOCALES
    // ==========================================================================
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
                                    Mostrando historiales del paciente:
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
                        Total:{" "}
                        {historialesPacienteFiltrados.length}{" "}
                        {historialesPacienteFiltrados.length === 1 ? "historial" : "historiales"}
                    </div>
                </div>
            </div>
        );
    };

    const SinPacienteAlerta = () => (
        <div className="rounded-lg bg-warning-50 dark:bg-warning-900/20 p-4 border border-warning-200 dark:border-warning-800 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                        Atención requerida
                    </p>
                    <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
                        <strong>Nota:</strong> Para gestionar historiales clínicos, puede
                        fijar un paciente desde la vista principal de 'Gestión de Pacientes'
                        o trabajar en modo global.
                    </p>
                </div>
            </div>
        </div>
    );

    // ==========================================================================
    // RENDER PRINCIPAL
    // ==========================================================================
    return (
        <>
            <div className="mb-8">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            Historiales Clínicos
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                            Administra los historiales clínicos y el Formulario 033 de los
                            pacientes
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Botón de filtros avanzados — siempre visible */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleCreateClick}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Nuevo Historial
                        </button>
                    </div>
                </div>

                {/* Paciente fijado / alerta */}
                {pacienteActivo && <PacienteFijadoInfo />}
                {!pacienteActivo && <SinPacienteAlerta />}

                {/* ── Filtros avanzados (estado + fechas) — siempre disponible ── */}
                {showFilters && (
                    <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={estadoFilter}
                                        onChange={(e) => setEstadoFilter(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="BORRADOR">Borrador</option>
                                        <option value="ABIERTO">Abierto</option>
                                        <option value="CERRADO">Cerrado</option>
                                    </select>
                                </div>

                                {/* Fecha desde */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Desde
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={fechaDesde}
                                            onChange={(e) => setFechaDesde(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>

                                {/* Fecha hasta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hasta
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={fechaHasta}
                                            onChange={(e) => setFechaHasta(e.target.value)}
                                            min={fechaDesde || undefined}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Limpiar filtros avanzados */}
                            {hasActiveFilters && (
                                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
                                    >
                                        <X className="h-3.5 w-3.5 mr-1.5" />
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tabla con búsqueda y paginación integradas (siempre activas) ── */}
                <div className="mt-4">
                    <ClinicalRecordTable
                        historiales={historiales}
                        onViewClick={handleViewClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                        onCloseClick={handleCloseClick}
                        // Búsqueda — siempre habilitada
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        // Paginación — siempre habilitada
                        pagination={paginationNormalized}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        isLoading={isLoading}
                        showPaginationControls={true}
                    />
                </div>
            </div>

            {/* ── Modales ── */}
            <ClinicalRecordViewModal
                isOpen={viewModalOpen}
                onClose={handleModalClose}
                selectedRecord={selectedRecord}
            />

            <ClinicalRecordCreateEditModal
                isOpen={editModalOpen}
                onClose={handleModalClose}
                mode={selectedRecord ? "edit" : "create"}
                recordId={selectedRecord?.id}
                pacienteId={pacienteActivo?.id || selectedRecord?.paciente || null}
                pacienteNombreCompleto={
                    pacienteActivo
                        ? `${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
                        : selectedRecord?.paciente_nombre || null
                }
                onSuccess={handleSuccess}
            />

            {selectedRecord && (
                <ClinicalRecordDeleteModal
                    isOpen={deleteModalOpen}
                    onClose={handleModalClose}
                    record={selectedRecord}
                    onConfirm={handleDeleteConfirm}
                    isDeleting={deleteMutation.isPending}
                />
            )}

            <ClinicalRecordCloseModal
                isOpen={closeModalOpen}
                onClose={handleModalClose}
                recordId={selectedRecord?.id || ""}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default ClinicalRecordManagement;