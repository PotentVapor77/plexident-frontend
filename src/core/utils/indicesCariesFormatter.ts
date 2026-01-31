// src/core/utils/indicesCariesFormatter.ts
import type { IndicesCariesData, LatestIndicesCariesResponse } from "../../types/clinicalRecords/typeBackendClinicalRecord";


/**
 * Formatea los índices CPO/ceo para visualización
 */
export const formatIndicesCaries = (indices: IndicesCariesData | LatestIndicesCariesResponse) => {
    const cpoTotal = indices.cpo_total ?? 0;
    const cpoC = indices.cpo_c ?? 0;
    const cpoP = indices.cpo_p ?? 0;
    const cpoO = indices.cpo_o ?? 0;
    const ceoTotal = indices.ceo_total ?? 0;
    const ceoC = indices.ceo_c ?? 0;
    const ceoE = indices.ceo_e ?? 0;
    const ceoO = indices.ceo_o ?? 0;

    const isAdult = cpoTotal > 0 || cpoC > 0 || cpoP > 0 || cpoO > 0;

    if (isAdult) {
        return {
            tipo: "CPO (Adulto)",
            desglose: [
                { label: "Cariados (C)", value: cpoC },
                { label: "Perdidos (P)", value: cpoP },
                { label: "Obturados (O)", value: cpoO },
            ],
            total: cpoTotal,
            interpretacion: interpretarCPO(cpoTotal), 
        };
    } else {
        return {
            tipo: "ceo (Niño)",
            desglose: [
                { label: "Cariados (c)", value: ceoC },
                { label: "Extraídos (e)", value: ceoE },
                { label: "Obturados (o)", value: ceoO },
            ],
            total: ceoTotal,
            interpretacion: interpretarCEO(ceoTotal), 
        };
    }
};


/**
 * Interpreta el índice CPO
 */
export const interpretarCPO = (total: number): string => {
    if (total === 0) return "Excelente salud dental";
    if (total <= 3) return "Baja actividad cariosa";
    if (total <= 6) return "Actividad cariosa moderada";
    if (total <= 9) return "Alta actividad cariosa";
    return "Actividad cariosa muy alta, necesita atención urgente";
};


/**
 * Interpreta el índice ceo
 */
export const interpretarCEO = (total: number): string => {
    if (total === 0) return "Excelente salud dental infantil";
    if (total <= 3) return "Baja actividad cariosa";
    if (total <= 6) return "Actividad cariosa moderada";
    if (total <= 9) return "Alta actividad cariosa";
    return "Actividad cariosa muy alta, necesita atención pediátrica urgente";
};


/**
 * Formatea fecha de evaluación
 */
export const formatFechaEvaluacion = (fecha: string | null | undefined): string => {
    if (!fecha) return "No especificada";

    const date = new Date(fecha);
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) return "Fecha inválida";

    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};


export const isIndicesAvailable = (
    indices: IndicesCariesData | LatestIndicesCariesResponse | null
): boolean => {
    if (!indices) return false;

    const hasCPO = ((indices.cpo_c ?? 0) + (indices.cpo_p ?? 0) + (indices.cpo_o ?? 0)) > 0;
    const hasCEO = ((indices.ceo_c ?? 0) + (indices.ceo_e ?? 0) + (indices.ceo_o ?? 0)) > 0;

    return hasCPO || hasCEO;
};
