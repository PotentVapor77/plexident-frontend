// src/hooks/clinicalRecord/useRefreshSection.ts
import { useState } from "react";
import api from "../../services/api/axiosInstance";
import { useNotification } from "../../context/notifications/NotificationContext";

// Definir las secciones válidas
export type RefreshableSection =
    | "antecedentes_personales_data"
    | "antecedentes_familiares_data"
    | "constantes_vitales_data"
    | "examen_estomatognatico_data"
    | "odontograma_2d_data"
    | "examenes_complementarios_data";

// Mapeo de secciones internas a endpoints
const sectionToEndpoint: Record<string, RefreshableSection> = {
    antecedentes_personales: "antecedentes_personales_data",
    antecedentes_familiares: "antecedentes_familiares_data",
    constantes_vitales: "constantes_vitales_data",
    examen_estomatognatico: "examen_estomatognatico_data",
    odontograma_2d: "odontograma_2d_data",
    examenes_complementarios: "examenes_complementarios_data",
};

interface RefreshSectionOptions {
    pacienteId: string;
    updateSectionData: (section: RefreshableSection, data: any) => void;
    setInitialDates?: (updater: (prev: Record<string, string | null>) => Record<string, string | null>) => void;
}

interface RefreshSectionResult {
    loading: boolean;
    error: string | null;
    refreshSection: (sectionKey: string) => Promise<boolean>;
    refreshLoadingMap: Record<string, boolean>;
}

export const useRefreshSection = ({
    pacienteId,
    updateSectionData,
    setInitialDates,
}: RefreshSectionOptions): RefreshSectionResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshLoadingMap, setRefreshLoadingMap] = useState<Record<string, boolean>>({});
    const { notify } = useNotification();

    // Mapeo de secciones a endpoints
    const sectionEndpoints: Record<string, string> = {
        antecedentes_personales: `/clinical-records/antecedentes-personales/${pacienteId}/latest/`,
        antecedentes_familiares: `/clinical-records/antecedentes-familiares/${pacienteId}/latest/`,
        constantes_vitales: `/clinical-records/constantes-vitales/${pacienteId}/latest/`,
        examen_estomatognatico: `/clinical-records/examen-estomatognatico/${pacienteId}/latest/`,
        odontograma_2d: `/clinical-records/odontograma-2d/${pacienteId}/latest/`,
        examenes_complementarios: `/clinical-records/examenes-complementarios/${pacienteId}/latest/`
    };

    // Nombres de sección para mostrar
    const sectionNames: Record<string, string> = {
        antecedentes_personales: "Antecedentes Personales",
        antecedentes_familiares: "Antecedentes Familiares",
        constantes_vitales: "Constantes Vitales",
        examen_estomatognatico: "Examen Estomatognático",
        odontograma_2d: "Odontograma 2D",
        plan_tratamiento: "Plan de Tratamiento",
        examenes_complementarios: "Examenes Complementarios"
    };

    // Función auxiliar para obtener la sección de datos correcta
    const getDataSection = (sectionKey: string): RefreshableSection => {
        return sectionToEndpoint[sectionKey] || sectionKey as RefreshableSection;
    };

    const refreshSection = async (sectionKey: string): Promise<boolean> => {
        if (!pacienteId) {
            setError("No hay paciente seleccionado");
            return false;
        }
        if (sectionKey === 'plan_tratamiento') {
            notify({
                type: "info",
                title: "Información",
                message: "Use el botón de refrescar dentro de la sección Plan de Tratamiento",
            });
            return false;
        }
        
        const normalizedSection = sectionKey.replace(/_/g, '-');
        const endpoint = `/clinical-records/${normalizedSection}/${pacienteId}/latest/`;
        
        if (!sectionEndpoints[sectionKey]) {
            setError(`Sección ${sectionKey} no soportada para refrescar`);
            return false;
        }

        // Establecer loading específico para esta sección
        setRefreshLoadingMap(prev => ({ ...prev, [sectionKey]: true }));
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(endpoint);

            if (response.data.success && response.data.data) {
                const data = response.data.data;
                const sectionName = sectionNames[sectionKey];
                const dataSection = getDataSection(sectionKey);

                // Actualizar los datos según la sección
                if (dataSection !== "odontograma_2d_data") {
                    updateSectionData(dataSection, data);
                }

                // Actualizar fecha si existe setInitialDates
                if (setInitialDates && data.fecha_creacion) {
                    setInitialDates(prev => ({
                        ...prev,
                        [sectionKey]: data.fecha_creacion,
                    }));
                }

                // Notificación de éxito
                notify({
                    type: "success",
                    title: "Datos actualizados",
                    message: `${sectionName} se actualizó correctamente`,
                });

                setRefreshLoadingMap(prev => ({ ...prev, [sectionKey]: false }));
                setLoading(false);
                return true;
            } else {
                throw new Error(response.data.message || "Error en la respuesta");
            }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                `Error al actualizar ${sectionNames[sectionKey]}`;

            setError(errorMessage);

            // Notificación de error
            notify({
                type: "error",
                title: "Error al actualizar",
                message: errorMessage,
            });

            setRefreshLoadingMap(prev => ({ ...prev, [sectionKey]: false }));
            setLoading(false);
            return false;
        }
    };

    return {
        loading,
        error,
        refreshSection,
        refreshLoadingMap,
    };
};