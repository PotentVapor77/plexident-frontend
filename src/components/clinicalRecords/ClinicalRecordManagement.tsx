// src/components/clinicalRecord/ClinicalRecordManagement.tsx

import React, { useState, useEffect, useMemo } from "react";
import { FileText, Search, Filter, Calendar, X } from "lucide-react";
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
    useDeleteClinicalRecord 
} from "../../hooks/clinicalRecord/useClinicalRecords";
import Button from "../ui/button/Button";
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
    const [pageSize] = useState(35); 
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [fechaDesde, setFechaDesde] = useState<string>("");
    const [fechaHasta, setFechaHasta] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    // Estados de modales
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<ClinicalRecordListResponse | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

    // Hook de mutación para eliminar
    const deleteMutation = useDeleteClinicalRecord(pacienteActivo?.id || null);

    // ==========================================================================
    //  SELECCIÓN DE DATOS
    // ==========================================================================
    const historiales = pacienteActivo ? historialesPaciente : historialesGeneral;
    const isLoading = pacienteActivo ? isLoadingPaciente : isLoadingGeneral;
    const error = pacienteActivo ? errorPaciente : errorGeneral;
    const refetch = pacienteActivo ? refetchPaciente : refetchGeneral;

    // ==========================================================================
    // FILTROS ACTIVOS
    // ==========================================================================
    const hasActiveFilters = useMemo(() => {
        return !!(searchTerm || estadoFilter || fechaDesde || fechaHasta);
    }, [searchTerm, estadoFilter, fechaDesde, fechaHasta]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (estadoFilter) count++;
        if (fechaDesde || fechaHasta) count++; 
        return count;
    }, [searchTerm, estadoFilter, fechaDesde, fechaHasta]);

    // ==========================================================================
    // HANDLERS
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

    /**
     * HANDLER DE CONFIRMACIÓN DE ELIMINACIÓN
     */
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
            let errorMessage = "Error al eliminar el historial clínico";
            
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            }

            notify({
                type: "error",
                title: "Error al eliminar",
                message: errorMessage,
            });
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setEstadoFilter("");
        setFechaDesde("");
        setFechaHasta("");
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, estadoFilter, fechaDesde, fechaHasta]);

    // ==========================================================================
    // RENDER - LOADING STATE
    // ==========================================================================
    if (isLoading && !historiales.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                <p className="ml-4 text-gray-600 dark:text-gray-300">
                    Cargando historiales clínicos...
                </p>
            </div>
        );
    }

    // ==========================================================================
    // RENDER - ERROR STATE
    // ==========================================================================
    if (error && !historiales.length) {
        return (
            <div className="bg-error-50 border border-error-200 text-error-700 p-6 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
                <h3 className="font-semibold text-lg mb-2">
                    Error al cargar los historiales
                </h3>
                <p className="text-sm mb-4">{error}</p>
                <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                >
                    Reintentar
                </Button>
            </div>
        );
    }

    // ==========================================================================
    // RENDER - MAIN CONTENT
    // ==========================================================================
    return (
        <div className="space-y-6.5 pt-7 pb-18 px-18">
            {/* ====================================================================
          HEADER
      ==================================================================== */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Historiales Clínicos
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pacienteActivo
                            ? `Historiales del paciente: ${pacienteActivo.nombres} ${pacienteActivo.apellidos}`
                            : "Administra todos los historiales clínicos del sistema"}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!pacienteActivo && (
                        <Button 
                            onClick={() => setShowFilters(!showFilters)} 
                            variant="outline"
                            size="md"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    )}
                    <Button onClick={handleCreateClick} size="md">
                        <FileText className="w-4 h-4 mr-2" />
                        Nuevo Historial
                    </Button>
                </div>
            </div>

            {/* ====================================================================
          FILTROS MEJORADOS (Solo cuando NO hay paciente activo)
      ==================================================================== */}
            {!pacienteActivo && showFilters && (
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        {/* Fila 1: Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Búsqueda general
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente, CI, motivo de consulta, odontólogo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Buscando en tiempo real...
                                </p>
                            )}
                        </div>

                        {/* Fila 2: Estado y Fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
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
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Fecha hasta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hasta
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        min={fechaDesde || undefined}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fila 3: Acciones */}
                        {hasActiveFilters && (
                            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ====================================================================
          INDICADOR DE BÚSQUEDA ACTIVA
      ==================================================================== */}
            {hasActiveFilters && !pacienteActivo && (
                <div className="bg-blue-light-50 border border-blue-light-200 text-blue-light-700 p-3 rounded-lg dark:bg-blue-light-900/20 dark:border-blue-light-800 dark:text-blue-light-400">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Filtros activos: {activeFiltersCount}
                            </span>
                        </div>
                        {isLoading && (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-light-600 border-t-transparent"></div>
                                <span className="text-xs">Buscando...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ====================================================================
          TABLA DE HISTORIALES
      ==================================================================== */}
            <ClinicalRecordTable
                historiales={historiales}
                onViewClick={handleViewClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onCloseClick={handleCloseClick}
            />

            {/* ====================================================================
          PAGINACIÓN (Solo para vista general)
      ==================================================================== */}
            {!pacienteActivo && pagination.total_pages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Página {pagination.page} de {pagination.total_pages}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {pagination.count} registro{pagination.count !== 1 ? 's' : ''} en total
                            {historiales.length > 0 && ` • Mostrando ${historiales.length} en esta página`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={!pagination.has_previous || isLoading}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center px-3 text-sm text-gray-700 dark:text-gray-300">
                            {currentPage}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={!pagination.has_next || isLoading}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}

            {/* ====================================================================
          INFORMACIÓN DEL PACIENTE ACTIVO
      ==================================================================== */}
            {pacienteActivo && (
                <div className="bg-blue-light-50 border border-blue-light-200 text-blue-light-700 p-4 rounded-lg dark:bg-blue-light-900/20 dark:border-blue-light-800 dark:text-blue-light-400">
                    <p className="text-sm">
                        <strong>Mostrando historiales del paciente activo:</strong>{" "}
                        {pacienteActivo.nombres} {pacienteActivo.apellidos} (CI:{" "}
                        {pacienteActivo.cedula_pasaporte})
                    </p>
                    <p className="text-xs mt-1">
                        Total de historiales: {historiales.length}
                    </p>
                </div>
            )}

            {/* ====================================================================
          MODALES
      ==================================================================== */}
            {/* Modal Ver Detalle */}
            <ClinicalRecordViewModal
                isOpen={viewModalOpen}
                onClose={handleModalClose} 
                selectedRecord={selectedRecord} 
            />

            {/* Modal Crear/Editar */}
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

            {/* Modal Eliminar */}
            {selectedRecord && (
                <ClinicalRecordDeleteModal
                    isOpen={deleteModalOpen}
                    onClose={handleModalClose}
                    record={selectedRecord} 
                    onConfirm={handleDeleteConfirm}
                    isDeleting={deleteMutation.isPending}
                />
            )}

            {/* Modal Cerrar */}
            <ClinicalRecordCloseModal
                isOpen={closeModalOpen}
                onClose={handleModalClose}
                recordId={selectedRecord?.id || ""}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default ClinicalRecordManagement;