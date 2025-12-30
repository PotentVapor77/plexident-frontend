// src/mappers/historialMapper.ts

import type { OdontogramaSnapshot, TimelineEvent } from "../core/types/odontogramaHistory.types";
import type { HistorialOdontogramaBackend } from "../types/odontogram/typeBackendOdontograma";

export function mapHistorialToSnapshots(
    historial: HistorialOdontogramaBackend[],
): OdontogramaSnapshot[] {
    return historial.map((h) => ({
        id: h.id,
        fecha: new Date(h.fecha),
        descripcion: h.descripcion,
        odontogramaData: {
            datosAnteriores: h.datos_anteriores,
            datosNuevos: h.datos_nuevos,
            dienteId: h.diente,
            tipoCambio: h.tipo_cambio,
            tipoCambioDisplay: h.tipo_cambio_display,
        },
        profesionalId: h.odontologo,
        profesionalNombre: h.odontologo_nombre ?? 'N/A',
    }));
}

export function mapHistorialToTimeline(
    historial: HistorialOdontogramaBackend[],
): TimelineEvent[] {
    return historial.map((h) => ({
        id: h.id,
        fecha: new Date(h.fecha),
        titulo: h.tipo_cambio_display ?? h.tipo_cambio,
        descripcion: h.descripcion,
        isActive: false,
    }));
}