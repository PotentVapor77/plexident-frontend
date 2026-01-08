// src/components/odontogram/indicator/IndicatorsCreateEditModal.tsx

import React from "react";

import { Modal } from "../../ui/modal";
import IndicatorsForm from "./IndicatorsForm";

import type { BackendIndicadoresSaludBucal } from "../../../types/odontogram/typeBackendOdontograma";
import type { IndicadoresSaludBucalCreatePayload } from "../../../core/types/odontograma.types";
import { useNotification } from "../../../context/notifications/NotificationContext";

interface IndicatorsCreateEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    pacienteId: string | null;
    pacienteNombreCompleto: string | null;
    initialData?: BackendIndicadoresSaludBucal | null;
    onSubmit?: (payload: IndicadoresSaludBucalCreatePayload) => Promise<void>;
    submitting?: boolean;
}

export const IndicatorsCreateEditModal: React.FC<IndicatorsCreateEditModalProps> = ({
    isOpen,
    onClose,
    pacienteId,
    pacienteNombreCompleto,
    initialData,
    onSubmit,
    submitting = false,
}) => {
    const isEdit = !!initialData;
    const { notify } = useNotification();

    if (!isOpen) return null;

    const handleSubmit = async (payload: IndicadoresSaludBucalCreatePayload) => {
        if (onSubmit) {
            await onSubmit(payload);
        }
    };

    const subtitle = isEdit
        ? "Actualice los indicadores de salud bucal"
        : pacienteNombreCompleto
            ? `Registre los indicadores para ${pacienteNombreCompleto}`
            : "Seleccione un paciente y registre sus indicadores de salud bucal";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl w-full max-h-[90vh] p-0 overflow-hidden"
        >
            <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEdit ? "Editar Indicadores" : "Registrar Indicadores"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {subtitle}
                    </p>
                </div>

                {/* Contenido scrollable */}
                <div className="px-6 py-4 overflow-y-auto">
                    <IndicatorsForm
                        mode={isEdit ? "edit" : "create"}
                        pacienteId={pacienteId}
                        pacienteNombreCompleto={pacienteNombreCompleto}
                        initialData={initialData ?? undefined}
                        
                        indicatorId={initialData?.id}
                        notify={notify}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </Modal>
    );
};
