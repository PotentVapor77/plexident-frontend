// src/core/utils/groupDiagnostics.ts

import { ROOT_SURFACES_BY_TYPE } from "./groupDentalSurfaces";

export interface GroupedDiagnostic {
    // Identificador único del grupo
    groupId: string;
    // Datos del diagnóstico
    procedimientoId: string;
    nombre: string;
    descripcion: string;
    colorHex: string;
    prioridadKey: string;
    areasafectadas: string[];
    secondaryOptions?: Record<string, any>;
    // Lista de superficies donde está aplicado
    superficies: string[];
    // IDs individuales para eliminación
    diagnosticoIds: Array<{ id: string; superficieId: string }>;
    // Indicadores de agrupación
    isCoronaCompleta: boolean;
    isRaizCompleta: boolean;
    isGeneral: boolean;
    atributosclinicos?: Record<string, any>;
}

/**
 * Agrupa diagnósticos idénticos aplicados en múltiples superficies
 */
export function groupDiagnostics(
    diagnosticos: Array<any>,
    rootType?: string | null
): GroupedDiagnostic[] {
    const groupMap = new Map<string, GroupedDiagnostic>();

    diagnosticos.forEach((diag) => {
        const groupKey = [
            diag.procedimientoId,
            diag.colorHex,
            diag.descripcion,
            JSON.stringify(diag.areasafectadas),
            JSON.stringify(diag.atributosclinicos),
            JSON.stringify(diag.secondaryOptions || {}),
        ].join('|');

        if (groupMap.has(groupKey)) {
            const existing = groupMap.get(groupKey)!;
            existing.superficies.push(diag.superficieId);
            existing.diagnosticoIds.push({
                id: diag.id,
                superficieId: diag.superficieId,
            });
        } else {
            groupMap.set(groupKey, {
                groupId: groupKey,
                procedimientoId: diag.procedimientoId,
                nombre: diag.nombre,
                descripcion: diag.descripcion,
                colorHex: diag.colorHex,
                prioridadKey: diag.prioridadKey,
                areasafectadas: diag.areasafectadas,
                atributosclinicos: diag.atributosclinicos, 
                secondaryOptions: diag.secondaryOptions || {},
                superficies: [diag.superficieId],
                diagnosticoIds: [
                    {
                        id: diag.id,
                        superficieId: diag.superficieId,
                    },
                ],
                isCoronaCompleta: false,
                isRaizCompleta: false,
                isGeneral: diag.superficieId === 'general',
            });
        }
    });

    // Normalización consistente
    const normalize = (s: string) => s.replace(/^raiz[:_-]/, '').toLowerCase();

    const result = Array.from(groupMap.values()).map((group) => {
        if (group.superficies.includes('general')) {
            return { ...group, isGeneral: true };
        }

        const coronaSurfaces = group.superficies.filter((s) =>
            s.startsWith('cara_')
        );
        const raizSurfaces = group.superficies.filter((s) =>
            s.startsWith('raiz:')
        );

        // Detectar corona completa (5 caras)
        const isCoronaCompleta = coronaSurfaces.length === 5;

        // Detectar raíz completa
        const expectedRootSurfaces =
            ROOT_SURFACES_BY_TYPE[rootType || 'raiz_dental'] || [];

        // Normalizar AMBOS arrays UNA SOLA VEZ
        const normalizedExpected = expectedRootSurfaces.map(normalize);
        const normalizedRaiz = raizSurfaces.map(normalize);

        console.log('[groupDiagnostics] DEBUG raíz', {
            rootType,
            groupId: group.groupId,
            superficies: group.superficies,
            raizSurfaces,
            expectedRootSurfaces,
            normalizedExpected,
            normalizedRaiz,
        });

        // Verificar si TODOS los esperados están en los actuales
        const isRaizCompleta = expectedRootSurfaces.length > 0 &&
            normalizedExpected.every((expectedNorm) =>
                normalizedRaiz.includes(expectedNorm)
            );

        console.log('[groupDiagnostics] resultado', {
            groupId: group.groupId,
            isCoronaCompleta,
            isRaizCompleta,
        });

        return {
            ...group,
            isCoronaCompleta,
            isRaizCompleta,
        };
    });

    return result;
}

/**
 * Formatea las superficies agrupadas para mostrar
 */
export function formatGroupedSurfaces(group: GroupedDiagnostic): string {
    if (group.isGeneral) {
        return 'General';
    }

    const parts: string[] = [];

    if (group.isCoronaCompleta) {
        parts.push('Corona completa');
    } else {
        const coronas = group.superficies
            .filter((s) => s.startsWith('cara_'))
            .map((s) =>
                s
                    .replace('cara_', '')
                    .replace(/-/g, ' ')
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
            );
        parts.push(...coronas);
    }

    if (group.isRaizCompleta) {
        parts.push('Raíz completa');
    } else {
        const raices = group.superficies
            .filter((s) => s.startsWith('raiz:'))
            .map((s) => 'R ' + s.replace('raiz:', '').replace('-g', ''));
        parts.push(...raices);
    }

    return parts.join(', ');
}
