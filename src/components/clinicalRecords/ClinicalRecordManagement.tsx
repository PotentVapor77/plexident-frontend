// src/components/clinicalRecord/ClinicalRecordManagement.tsx

import React, { useState, useEffect } from "react";
import { FileText, Search, Filter } from "lucide-react";
import ClinicalRecordTable from "./table/ClinicalRecordTable";
import ClinicalRecordViewModal from "./modals/ClinicalRecordViewModal";
import ClinicalRecordCreateEditModal from "./modals/ClinicalRecordCreateEditModal";
import ClinicalRecordDeleteModal from "./modals/ClinicalRecordDeleteModal";
import ClinicalRecordCloseModal from "./modals/ClinicalRecordCloseModal";
import { usePacienteActivo } from "../../context/PacienteContext";
import type { ClinicalRecordListResponse } from "../../types/clinicalRecords/typeBackendClinicalRecord";
import { useClinicalRecords, useClinicalRecordsByPaciente } from "../../hooks/clinicalRecord/useClinicalRecords";
import Button from "../ui/button/Button";


/**
 * ============================================================================
 * COMPONENT - CLINICAL RECORD MANAGEMENT
 * ============================================================================
 */

const ClinicalRecordManagement: React.FC = () => {
    const { pacienteActivo } = usePacienteActivo();

    // ==========================================================================
    // ESTADOS LOCALES
    // ==========================================================================
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");

    // Estados de modales
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<ClinicalRecordListResponse | null>(null);

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
        search: searchTerm,
        estado: estadoFilter,
        activo: true,
    });

    // ==========================================================================
    // ✅ SELECCIÓN CONDICIONAL DE DATOS (SOLUCIÓN AL PROBLEMA)
    // ==========================================================================
    const historiales = pacienteActivo ? historialesPaciente : historialesGeneral;
    const isLoading = pacienteActivo ? isLoadingPaciente : isLoadingGeneral;
    const error = pacienteActivo ? errorPaciente : errorGeneral;
    const refetch = pacienteActivo ? refetchPaciente : refetchGeneral;

    // ==========================================================================
    // DEBUG (Puedes eliminarlo después de verificar)
    // ==========================================================================
    useEffect(() => {
        console.log("=== ClinicalRecordManagement Debug ===");
        console.log("pacienteActivo:", pacienteActivo);
        console.log("pacienteActivo?.id:", pacienteActivo?.id);
        console.log("historialesPaciente:", historialesPaciente);
        console.log("historialesPaciente.length:", historialesPaciente?.length);
        console.log("historialesGeneral:", historialesGeneral);
        console.log("historiales (seleccionados):", historiales);
        console.log("historiales.length:", historiales.length);
        console.log("isLoading:", isLoading);
        console.log("error:", error);
    }, [pacienteActivo, historialesPaciente, historialesGeneral, historiales, isLoading, error]);

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

    // ==========================================================================
    // RENDER - LOADING STATE
    // ==========================================================================
    if (isLoading) {
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
    if (error) {
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
                <Button onClick={handleCreateClick} size="md">
                    <FileText className="w-4 h-4 mr-2" />
                    Nuevo Historial
                </Button>
            </div>

            {/* ====================================================================
          FILTROS (Solo cuando NO hay paciente activo)
      ==================================================================== */}
            {!pacienteActivo && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-4 flex-wrap">
                        {/* Búsqueda */}
                        <div className="flex-1 min-w-[250px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, cédula, motivo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Filtro de estado */}
                        <div className="min-w-[200px]">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="BORRADOR">Borrador</option>
                                    <option value="ABIERTO">Abierto</option>
                                    <option value="CERRADO">Cerrado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================================
          TABLA DE HISTORIALES
          ✅ CORREGIDO: Ahora recibe la variable correcta "historiales"
      ==================================================================== */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <ClinicalRecordTable
                    historiales={historiales}
                    onViewClick={handleViewClick}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                    onCloseClick={handleCloseClick}
                />
            </div>

            {/* ====================================================================
          PAGINACIÓN (Solo cuando NO hay paciente activo)
      ==================================================================== */}
            {!pacienteActivo && pagination && pagination.total_pages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando página {pagination.page} de {pagination.total_pages},{" "}
                        {pagination.count} registros totales
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.has_previous}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.has_next}
                            onClick={() => setCurrentPage(currentPage + 1)}
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
                    onConfirm={() => {
                        
                    }}
                    isDeleting={false}
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