// src/core/utils/groupTreatmentDiagnostics.ts

import type { DiagnosticoSnapshot } from '../../types/treatmentPlan/typeBackendTreatmentPlan';

export interface GroupedTreatmentDiagnostic {
    // Identificador único del grupo
    groupId: string;

    // Datos del diagnóstico
    diente: string;
    diagnostico_key: string;
    diagnostico_nombre: string;
    siglas: string;
    color_hex: string;
    prioridad: number;
    categoria: string;
    descripcion: string;
    estado_tratamiento: string;

    // Atributos clínicos (usados para agrupar)
    atributos_clinicos: Record<string, any>;

    // Lista de superficies donde está aplicado
    superficies: string[];

    // IDs individuales de los diagnósticos originales
    diagnostico_ids: string[];

    // Flag de diagnóstico nuevo
    es_nuevo?: boolean;

    // Indicador de agrupación
    count: number;
}

/**
 * Agrupa diagnósticos del plan de tratamiento que comparten:
 * - Mismo diente
 * - Mismo diagnóstico (diagnostico_key)
 * - Misma categoría
 * - Mismos atributos clínicos (notas adicionales)
 */
export function groupTreatmentDiagnostics(
    diagnosticos: DiagnosticoSnapshot[]
): GroupedTreatmentDiagnostic[] {
    const groupMap = new Map<string, GroupedTreatmentDiagnostic>();

    diagnosticos.forEach((diag) => {
        // Clave de agrupación: diente + diagnóstico + categoría + atributos
        const groupKey = [
            diag.diente,
            diag.diagnostico_key,
            diag.categoria || 'sin-categoria',
            JSON.stringify(diag.atributos_clinicos || {}),
            diag.descripcion || '', // Incluir descripción en la agrupación
        ].join('|');

        if (groupMap.has(groupKey)) {
            const existing = groupMap.get(groupKey)!;
            existing.superficies.push(diag.superficie);
            existing.diagnostico_ids.push(diag.id);
            existing.count += 1;
        } else {
            groupMap.set(groupKey, {
                groupId: groupKey,
                diente: diag.diente,
                diagnostico_key: diag.diagnostico_key,
                diagnostico_nombre: diag.diagnostico_nombre,
                siglas: diag.siglas,
                color_hex: diag.color_hex,
                prioridad: diag.prioridad,
                categoria: diag.categoria,
                descripcion: diag.descripcion,
                estado_tratamiento: diag.estado_tratamiento,
                atributos_clinicos: diag.atributos_clinicos || {},
                superficies: [diag.superficie],
                diagnostico_ids: [diag.id],
                es_nuevo: diag.es_nuevo,
                count: 1,
            });
        }
    });

    return Array.from(groupMap.values());
}

/**
 * Formatea las superficies agrupadas para mostrar
 */
export function formatTreatmentSurfaces(superficies: string[]): string {
    if (superficies.length === 0) return 'Sin superficie';
    if (superficies.length === 1) return superficies[0];

    // Ordenar superficies alfabéticamente
    const sorted = [...superficies].sort();

    // Si son más de 3, abreviar
    if (sorted.length > 3) {
        return `${sorted.slice(0, 3).join(', ')} +${sorted.length - 3}`;
    }

    return sorted.join(', ');
}

/**
 * Cuenta total de superficies afectadas
 */
export function getTotalSurfaces(group: GroupedTreatmentDiagnostic): number {
    return group.superficies.length;
}
