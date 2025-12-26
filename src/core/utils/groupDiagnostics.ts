// src/core/utils/groupDiagnostics.ts

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
    // Lista de superficies donde está aplicado
    superficies: string[];
    // IDs individuales para eliminación
    diagnosticoIds: Array<{ id: string; superficieId: string }>;
    // Indicadores de agrupación
    isCoronaCompleta: boolean;
    isRaizCompleta: boolean;
    isGeneral: boolean;
}

/**
 * Agrupa diagnósticos idénticos aplicados en múltiples superficies
 */
export function groupDiagnostics(
    diagnosticos: Array<any>
): GroupedDiagnostic[] {
    // Mapa para agrupar diagnósticos por características idénticas
    const groupMap = new Map<string, GroupedDiagnostic>();

    diagnosticos.forEach((diag) => {
        // Crear clave única basada en las propiedades del diagnóstico (sin superficie)
        const groupKey = [
            diag.procedimientoId,
            diag.colorHex,
            diag.descripcion || '',
            JSON.stringify(diag.areasafectadas || []),
            JSON.stringify(diag.atributosclinicos || {}),
        ].join('|');

        if (groupMap.has(groupKey)) {
            // Agregar superficie a grupo existente
            const existing = groupMap.get(groupKey)!;
            existing.superficies.push(diag.superficieId);
            existing.diagnosticoIds.push({
                id: diag.id,
                superficieId: diag.superficieId,
            });
        } else {
            // Crear nuevo grupo
            groupMap.set(groupKey, {
                groupId: groupKey,
                procedimientoId: diag.procedimientoId,
                nombre: diag.nombre,
                descripcion: diag.descripcion || '',
                colorHex: diag.colorHex,
                prioridadKey: diag.prioridadKey,
                areasafectadas: diag.areasafectadas || [],
                superficies: [diag.superficieId],
                diagnosticoIds: [{ id: diag.id, superficieId: diag.superficieId }],
                isCoronaCompleta: false,
                isRaizCompleta: false,
                isGeneral: diag.superficieId === 'general',
            });
        }
    });

    // Procesar grupos para detectar corona/raíz completa
    const result = Array.from(groupMap.values()).map((group) => {
        // Detectar si es general
        if (group.superficies.includes('general')) {
            return { ...group, isGeneral: true };
        }

        // Separar superficies de corona y raíz
        const coronaSurfaces = group.superficies.filter((s) =>
            s.startsWith('cara_')
        );
        const raizSurfaces = group.superficies.filter((s) =>
            s.startsWith('raiz:')
        );

        // Detectar corona completa (5 caras)
        const isCoronaCompleta = coronaSurfaces.length === 5;

        // Detectar raíz completa (depende del tipo de diente)
        // Por simplicidad, consideramos raíz completa si tiene 2+ raíces
        const isRaizCompleta = raizSurfaces.length >= 2;

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
